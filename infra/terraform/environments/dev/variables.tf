variable "project" {
  description = "Project name prefix"
  type        = string
  default     = "soulstone"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "dev"
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-1"
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.10.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "List of public subnet CIDR blocks"
  type        = list(string)
  default     = ["10.10.0.0/24", "10.10.1.0/24"]
}

variable "private_subnet_cidrs" {
  description = "List of private subnet CIDR blocks"
  type        = list(string)
  default     = ["10.10.10.0/24", "10.10.11.0/24"]
}

variable "single_nat_gateway" {
  description = "Use a single shared NAT gateway"
  type        = bool
  default     = true
}

variable "root_domain" {
  description = "Root domain hosted in Route53"
  type        = string
}

variable "web_domain" {
  description = "Domain name used for the public web app"
  type        = string
}

variable "api_domain" {
  description = "Domain name used for the API load balancer"
  type        = string
}

variable "log_retention_days" {
  description = "CloudWatch log retention"
  type        = number
  default     = 30
}

variable "alert_webhook_endpoint" {
  description = "HTTPS endpoint for alert notifications"
  type        = string
  default     = null
}

variable "alert_email_addresses" {
  description = "Email recipients for alert notifications"
  type        = list(string)
  default     = []
}

variable "api_healthcheck_path" {
  description = "Healthcheck path for API service"
  type        = string
  default     = "/health"
}

variable "web_healthcheck_path" {
  description = "Healthcheck path for web service"
  type        = string
  default     = "/health"
}

variable "api_desired_count" {
  description = "Desired task count for API service"
  type        = number
  default     = 2
}

variable "web_desired_count" {
  description = "Desired task count for web service"
  type        = number
  default     = 2
}

variable "api_environment" {
  description = "Environment variables for API container"
  type        = map(string)
  default     = {}
}

variable "web_environment" {
  description = "Environment variables for web container"
  type        = map(string)
  default     = {}
}

variable "api_feature_flags" {
  description = "Feature flag configuration for API"
  type        = map(any)
  default     = {}
}

variable "default_tags" {
  description = "Default tags applied to all resources"
  type        = map(string)
  default     = {
    Owner = "platform-team"
  }
}
