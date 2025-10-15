terraform {
  required_version = ">= 1.5.0"
}

locals {
  origin_domain = var.create_web_bucket ? aws_s3_bucket.web[0].bucket_regional_domain_name : var.cloudfront_origin_domain
}

resource "aws_route53_zone" "primary" {
  name = var.root_domain

  comment       = "Primary hosted zone for ${var.environment}"
  force_destroy = false

  tags = merge(var.tags, {
    Environment = var.environment
    Name        = "${var.environment}.${var.root_domain}"
  })
}

resource "aws_acm_certificate" "wildcard" {
  provider = aws.us_east_1

  domain_name               = "*.${var.root_domain}"
  validation_method         = "DNS"
  subject_alternative_names = [var.root_domain]

  tags = merge(var.tags, {
    Environment = var.environment
    Name        = "${var.environment}-wildcard"
  })
}

resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.wildcard.domain_validation_options :
    dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  zone_id = aws_route53_zone.primary.zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = 60
  records = [each.value.record]
}

resource "aws_acm_certificate_validation" "wildcard" {
  provider = aws.us_east_1

  certificate_arn         = aws_acm_certificate.wildcard.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}

resource "aws_s3_bucket" "web" {
  count = var.create_web_bucket ? 1 : 0

  bucket        = var.web_bucket_name
  force_destroy = var.web_bucket_force_destroy

  tags = merge(var.tags, {
    Environment = var.environment
    Name        = var.web_bucket_name
  })
}

resource "aws_s3_bucket_policy" "web" {
  count = var.create_web_bucket ? 1 : 0

  bucket = aws_s3_bucket.web[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipal"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.web[0].arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.web[0].arn
          }
        }
      }
    ]
  })
}

resource "aws_cloudfront_origin_access_control" "s3" {
  count = var.create_web_bucket ? 1 : 0

  name                              = "${var.environment}-${var.web_bucket_name}-oac"
  description                       = "OAC for web bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "web" {
  count = var.enable_cloudfront ? 1 : 0

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "${var.environment} web distribution"
  default_root_object = "index.html"

  aliases = [var.web_domain]

  origin {
    domain_name              = local.origin_domain
    origin_id                = "web-origin"
    origin_access_control_id = var.create_web_bucket ? aws_cloudfront_origin_access_control.s3[0].id : null
    connection_attempts      = 3
    connection_timeout       = 10
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "web-origin"

    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    cache_policy_id            = "658327ea-f89d-4fab-a63d-7e88639e58f6" # CachingOptimized
    origin_request_policy_id   = "88a5eaf4-2fd4-4709-b370-b4c650ea3fcf" # CORS-S3Origin
  }

  price_class = var.cloudfront_price_class

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn            = aws_acm_certificate_validation.wildcard.certificate_arn
    ssl_support_method             = "sni-only"
    minimum_protocol_version       = "TLSv1.2_2021"
    cloudfront_default_certificate = false
  }

  web_acl_id = var.create_web_acl ? aws_wafv2_web_acl.this[0].arn : var.web_acl_arn

  tags = merge(var.tags, {
    Environment = var.environment
    Service     = "web"
  })

  depends_on = [aws_acm_certificate_validation.wildcard]
}

resource "aws_wafv2_web_acl" "this" {
  count = var.create_web_acl ? 1 : 0

  name        = "${var.environment}-web"
  description = "Baseline WAF for web distribution"
  scope       = "CLOUDFRONT"

  default_action {
    allow {}
  }

  rule {
    name     = "AWS-AWSManagedRulesCommonRuleSet"
    priority = 1

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      sampled_requests_enabled    = true
      cloudwatch_metrics_enabled  = true
      metric_name                 = "commonRuleSet"
    }
  }

  rule {
    name     = "AWS-AWSManagedRulesKnownBadInputsRuleSet"
    priority = 2

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesKnownBadInputsRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      sampled_requests_enabled    = true
      cloudwatch_metrics_enabled  = true
      metric_name                 = "knownBadInputs"
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${var.environment}-web"
    sampled_requests_enabled   = true
  }

  tags = merge(var.tags, {
    Environment = var.environment
  })
}

resource "aws_route53_record" "web" {
  zone_id = aws_route53_zone.primary.zone_id
  name    = var.web_domain
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.web[0].domain_name
    zone_id                = aws_cloudfront_distribution.web[0].hosted_zone_id
    evaluate_target_health = false
  }
}

output "hosted_zone_id" {
  value = aws_route53_zone.primary.zone_id
}

output "certificate_arn" {
  value = aws_acm_certificate_validation.wildcard.certificate_arn
}

output "distribution_domain_name" {
  value       = try(aws_cloudfront_distribution.web[0].domain_name, null)
  description = "CloudFront distribution domain name"
}

output "distribution_id" {
  value       = try(aws_cloudfront_distribution.web[0].id, null)
  description = "CloudFront distribution ID"
}

output "web_acl_arn" {
  value       = var.create_web_acl ? aws_wafv2_web_acl.this[0].arn : var.web_acl_arn
  description = "ARN for the associated WAF ACL"
}
