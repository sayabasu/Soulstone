terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.39"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }
}

provider "aws" {
  region = var.region
}

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

data "aws_caller_identity" "current" {}

data "aws_availability_zones" "available" {
  state = "available"
}

locals {
  project        = var.project
  environment    = var.environment
  azs            = slice(data.aws_availability_zones.available.names, 0, length(var.public_subnet_cidrs))
  tags = merge(var.default_tags, {
    Project     = local.project
    Environment = local.environment
  })
  log_groups = [
    "/${local.project}/${local.environment}/api",
    "/${local.project}/${local.environment}/web"
  ]
}

module "networking" {
  source = "../../modules/networking"

  name                 = local.project
  region               = var.region
  vpc_cidr             = var.vpc_cidr
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  availability_zones   = local.azs
  enable_nat_gateway   = true
  single_nat_gateway   = var.single_nat_gateway
  enable_ssm_endpoints = true
  tags                 = local.tags
}

module "observability" {
  source = "../../modules/observability"

  name                 = local.project
  environment          = local.environment
  log_groups           = local.log_groups
  log_retention_days   = var.log_retention_days
  alert_webhook_endpoint = var.alert_webhook_endpoint
  alert_email_addresses  = var.alert_email_addresses
  additional_alarm_actions = []
  tags                 = local.tags
}

module "ecr" {
  source = "../../modules/ecr"

  name         = local.project
  environment  = local.environment
  repositories = ["api", "web"]
  tags         = local.tags
}

module "dns" {
  source = "../../modules/dns"

  providers = {
    aws           = aws
    aws.us_east_1 = aws.us_east_1
  }

  environment             = local.environment
  root_domain             = var.root_domain
  web_domain              = var.web_domain
  cloudfront_origin_domain = ""
  enable_cloudfront       = false
  create_web_acl          = true
  create_web_bucket       = false
  tags                    = local.tags
}

resource "aws_acm_certificate" "alb" {
  domain_name       = var.api_domain
  validation_method = "DNS"
  tags              = local.tags
}

resource "aws_route53_record" "alb_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.alb.domain_validation_options :
    dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  zone_id = module.dns.hosted_zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = 60
  records = [each.value.record]
}

resource "aws_acm_certificate_validation" "alb" {
  certificate_arn         = aws_acm_certificate.alb.arn
  validation_record_fqdns = [for record in aws_route53_record.alb_cert_validation : record.fqdn]
}

resource "aws_kms_key" "primary" {
  description             = "Primary KMS key for ${local.project} ${local.environment}"
  deletion_window_in_days = 10
  enable_key_rotation     = true

  tags = local.tags
}

resource "aws_kms_alias" "primary" {
  name          = "alias/${local.project}-${local.environment}-primary"
  target_key_id = aws_kms_key.primary.key_id
}

resource "aws_iam_role" "enhanced_monitoring" {
  name = "${local.project}-${local.environment}-rds-monitoring"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "monitoring.rds.amazonaws.com" }
    }]
  })

  tags = local.tags
}

resource "aws_iam_role_policy_attachment" "enhanced_monitoring" {
  role       = aws_iam_role.enhanced_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

module "ecs" {
  source = "../../modules/ecs"

  name                 = local.project
  environment          = local.environment
  region               = var.region
  vpc_id               = module.networking.vpc_id
  public_subnet_ids    = module.networking.public_subnet_ids
  private_subnet_ids   = module.networking.private_subnet_ids
  alb_certificate_arn  = aws_acm_certificate_validation.alb.certificate_arn
  api_image            = "${module.ecr.repository_urls["api"]}:latest"
  web_image            = "${module.ecr.repository_urls["web"]}:latest"
  api_log_group        = local.log_groups[0]
  web_log_group        = local.log_groups[1]
  api_healthcheck_path = var.api_healthcheck_path
  web_healthcheck_path = var.web_healthcheck_path
  api_desired_count    = var.api_desired_count
  web_desired_count    = var.web_desired_count
  api_environment      = var.api_environment
  web_environment      = var.web_environment
  api_secrets          = []
  web_secrets          = []
  tags                 = local.tags

  depends_on = [aws_acm_certificate_validation.alb]
}

module "rds" {
  source = "../../modules/rds"

  name                          = local.project
  environment                   = local.environment
  vpc_id                        = module.networking.vpc_id
  private_subnet_ids            = module.networking.private_subnet_ids
  allowed_security_group_ids    = [module.ecs.service_security_group_ids["api"]]
  kms_key_arn                   = aws_kms_key.primary.arn
  enhanced_monitoring_role_arn  = aws_iam_role.enhanced_monitoring.arn
  alarm_topic_arns              = [module.observability.sns_topic_arn]
  tags                          = local.tags
}

module "redis" {
  source = "../../modules/redis"

  name                       = local.project
  environment                = local.environment
  vpc_id                     = module.networking.vpc_id
  private_subnet_ids         = module.networking.private_subnet_ids
  allowed_security_group_ids = [module.ecs.service_security_group_ids["api"], module.ecs.service_security_group_ids["web"]]
  kms_key_arn                = aws_kms_key.primary.arn
  tags                       = local.tags
}

module "secrets_env" {
  source = "../../modules/secrets"

  name        = local.project
  environment = local.environment
  default_kms_key_arn = aws_kms_key.primary.arn
  secrets = [
    {
      name          = "database/credentials"
      description   = "PostgreSQL credentials"
      secret_string = jsonencode({
        username = module.rds.db_username
        password = module.rds.db_password
        host     = module.rds.db_endpoint
        port     = 5432
      })
    },
    {
      name          = "redis/auth"
      description   = "ElastiCache auth token"
      secret_string = jsonencode({
        token     = module.redis.redis_auth_token
        endpoint  = module.redis.redis_primary_endpoint
        reader    = module.redis.redis_reader_endpoint
        port      = 6379
      })
    }
  ]
  parameters = {
    "api/feature-flags" = {
      value       = jsonencode(var.api_feature_flags)
      description = "API feature flags"
    }
  }
  tags = local.tags
}

resource "aws_iam_role_policy_attachment" "task_secrets" {
  role       = module.ecs.task_role_name
  policy_arn = module.secrets_env.read_policy_arn
}

resource "aws_cloudfront_distribution" "web" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "${local.environment} web distribution"
  default_root_object = "index.html"

  aliases = [var.web_domain]

  origin {
    domain_name = module.ecs.alb_dns_name
    origin_id   = "alb-origin"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "alb-origin"

    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    cache_policy_id          = "b2884449-2a1b-405c-9b4f-0b2f3b0ae5f6" # CachingDisabled
    origin_request_policy_id = "0885d816-3a55-46bb-9984-2cb98264b297" # AllViewerExceptHostHeader
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn            = module.dns.certificate_arn
    ssl_support_method             = "sni-only"
    minimum_protocol_version       = "TLSv1.2_2021"
    cloudfront_default_certificate = false
  }

  web_acl_id = module.dns.web_acl_arn

  depends_on = [module.ecs]

  tags = local.tags
}

resource "aws_route53_record" "api" {
  zone_id = module.dns.hosted_zone_id
  name    = var.api_domain
  type    = "A"

  alias {
    name                   = module.ecs.alb_dns_name
    zone_id                = module.ecs.alb_zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "web" {
  zone_id = module.dns.hosted_zone_id
  name    = var.web_domain
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.web.domain_name
    zone_id                = aws_cloudfront_distribution.web.hosted_zone_id
    evaluate_target_health = false
  }
}

output "vpc_id" {
  value = module.networking.vpc_id
}

output "alb_dns_name" {
  value = module.ecs.alb_dns_name
}

output "cloudfront_domain" {
  value = aws_cloudfront_distribution.web.domain_name
}
