variable "name" {
  description = "Application name prefix"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "region" {
  description = "AWS region"
  type        = string
}

variable "vpc_id" {
  description = "VPC where services run"
  type        = string
}

variable "public_subnet_ids" {
  description = "Public subnet IDs for ALB"
  type        = list(string)
}

variable "private_subnet_ids" {
  description = "Private subnet IDs for services"
  type        = list(string)
}

variable "alb_certificate_arn" {
  description = "ACM certificate ARN for the ALB"
  type        = string
}

variable "api_image" {
  description = "Container image for the API"
  type        = string
}

variable "web_image" {
  description = "Container image for the web app"
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
  description = "Path for API health checks"
  type        = string
  default     = "/health"
}

variable "web_healthcheck_path" {
  description = "Path for web health checks"
  type        = string
  default     = "/"
}

variable "api_cpu" {
  description = "CPU units for API task"
  type        = number
  default     = 512
}

variable "api_memory" {
  description = "Memory in MiB for API task"
  type        = number
  default     = 1024
}

variable "web_cpu" {
  description = "CPU units for web task"
  type        = number
  default     = 512
}

variable "web_memory" {
  description = "Memory in MiB for web task"
  type        = number
  default     = 1024
}

variable "api_desired_count" {
  description = "Desired count for API service"
  type        = number
  default     = 2
}

variable "web_desired_count" {
  description = "Desired count for web service"
  type        = number
  default     = 2
}

variable "api_log_group" {
  description = "CloudWatch log group for API"
  type        = string
}

variable "web_log_group" {
  description = "CloudWatch log group for web"
  type        = string
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 30
}

variable "execution_role_policy_arns" {
  description = "Additional policy ARNs attached to execution role"
  type        = list(string)
  default     = [
    "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy",
    "arn:aws:iam::aws:policy/AmazonSSMReadOnlyAccess"
  ]
}

variable "api_secrets" {
  description = "List of secrets for API container"
  type = list(object({
    name = string
    arn  = string
  }))
  default = []
}

variable "web_secrets" {
  description = "List of secrets for web container"
  type = list(object({
    name = string
    arn  = string
  }))
  default = []
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

variable "api_listener_paths" {
  description = "Path patterns forwarded to API"
  type        = list(string)
  default     = ["/api*", "/api/*"]
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}

variable "codedeploy_alarm_names" {
  description = "CloudWatch alarms that trigger automatic CodeDeploy rollbacks"
  type        = list(string)
  default     = []
}

variable "deployment_ready_wait_time_minutes" {
  description = "Minutes CodeDeploy waits for external validations (like migrations) before shifting traffic"
  type        = number
  default     = 15
}

variable "green_termination_wait_time_minutes" {
  description = "Minutes to wait before terminating the blue tasks after a successful deployment"
  type        = number
  default     = 5
}
