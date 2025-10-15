variable "environment" {
  description = "Environment name (e.g. dev, prod)"
  type        = string
}

variable "root_domain" {
  description = "Root domain name managed in Route53"
  type        = string
}

variable "web_domain" {
  description = "Domain used for the public web front-end"
  type        = string
}

variable "cloudfront_origin_domain" {
  description = "DNS name for the CloudFront origin (S3 bucket or ALB)"
  type        = string
}

variable "web_bucket_name" {
  description = "Optional S3 bucket name for static web assets"
  type        = string
  default     = null
}

variable "create_web_bucket" {
  description = "Whether to create an S3 bucket to back the web distribution"
  type        = bool
  default     = false
}

variable "enable_cloudfront" {
  description = "Whether to create a CloudFront distribution"
  type        = bool
  default     = true
}

variable "cloudfront_price_class" {
  description = "CloudFront price class"
  type        = string
  default     = "PriceClass_200"
}

variable "create_web_acl" {
  description = "Whether to create a WAFv2 Web ACL"
  type        = bool
  default     = true
}

variable "web_acl_arn" {
  description = "Existing Web ACL ARN to associate, if not creating a new one"
  type        = string
  default     = null
}

variable "tags" {
  description = "Tags to add to all resources"
  type        = map(string)
  default     = {}
}

variable "web_bucket_force_destroy" {
  description = "Whether to allow terraform to destroy the web bucket"
  type        = bool
  default     = false
}
