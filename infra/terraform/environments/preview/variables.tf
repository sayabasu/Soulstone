variable "project" {
  description = "Base project name"
  type        = string
}

variable "pr_number" {
  description = "GitHub pull request number used to namespace preview resources"
  type        = string
}

variable "region" {
  description = "AWS region"
  type        = string
}

variable "default_tags" {
  description = "Tags applied to all resources"
  type        = map(string)
  default     = {}
}

variable "vpc_cidr" {
  description = "CIDR for the preview VPC"
  type        = string
}

variable "public_subnet_cidrs" {
  description = "Public subnet CIDR blocks"
  type        = list(string)
}

variable "private_subnet_cidrs" {
  description = "Private subnet CIDR blocks"
  type        = list(string)
}

variable "availability_zones" {
  description = "Availability zones for subnets"
  type        = list(string)
}

variable "log_retention_days" {
  description = "CloudWatch log retention"
  type        = number
  default     = 14
}

variable "alert_webhook_endpoint" {
  description = "Webhook for preview alert notifications"
  type        = string
  default     = ""
}

variable "alert_email_addresses" {
  description = "Email recipients for preview alerts"
  type        = list(string)
  default     = []
}

variable "alb_certificate_arn" {
  description = "ACM certificate ARN for preview ALB"
  type        = string
}

variable "api_image" {
  description = "API container image"
  type        = string
}

variable "web_image" {
  description = "Web container image"
  type        = string
}

variable "api_container_port" {
  description = "API container port"
  type        = number
  default     = 4000
}

variable "web_container_port" {
  description = "Web container port"
  type        = number
  default     = 3000
}

variable "api_healthcheck_path" {
  description = "API healthcheck path"
  type        = string
  default     = "/health"
}

variable "web_healthcheck_path" {
  description = "Web healthcheck path"
  type        = string
  default     = "/"
}

variable "api_cpu" {
  description = "API CPU units"
  type        = number
  default     = 256
}

variable "api_memory" {
  description = "API memory"
  type        = number
  default     = 512
}

variable "web_cpu" {
  description = "Web CPU units"
  type        = number
  default     = 256
}

variable "web_memory" {
  description = "Web memory"
  type        = number
  default     = 512
}

variable "api_desired_count" {
  description = "API desired task count"
  type        = number
  default     = 1
}

variable "web_desired_count" {
  description = "Web desired task count"
  type        = number
  default     = 1
}

variable "api_secrets" {
  description = "Secrets injected into the API task"
  type = list(object({
    name = string
    arn  = string
  }))
  default = []
}

variable "web_secrets" {
  description = "Secrets injected into the web task"
  type = list(object({
    name = string
    arn  = string
  }))
  default = []
}

variable "shared_environment" {
  description = "Environment variables shared between API and web tasks"
  type        = map(string)
  default     = {}
}

variable "api_environment" {
  description = "API-specific environment variables"
  type        = map(string)
  default     = {}
}

variable "web_environment" {
  description = "Web-specific environment variables"
  type        = map(string)
  default     = {}
}

variable "api_listener_paths" {
  description = "Path patterns routed to the API"
  type        = list(string)
  default     = ["/api*", "/api/*"]
}

variable "codedeploy_alarm_names" {
  description = "Preview CodeDeploy alarms"
  type        = list(string)
  default     = []
}

variable "deployment_ready_wait_time_minutes" {
  description = "Preview deployment wait time for external validations"
  type        = number
  default     = 10
}

variable "green_termination_wait_time_minutes" {
  description = "Preview blue/green termination grace period"
  type        = number
  default     = 5
}
