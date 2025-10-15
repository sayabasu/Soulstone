variable "name" {
  description = "Application name prefix"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "log_groups" {
  description = "List of log group names to manage"
  type        = list(string)
}

variable "log_retention_days" {
  description = "Retention for CloudWatch Logs"
  type        = number
  default     = 30
}

variable "metric_namespace" {
  description = "Namespace used for custom metrics"
  type        = string
  default     = "Soulstone/Application"
}

variable "alert_webhook_endpoint" {
  description = "HTTPS endpoint for SNS webhook notifications"
  type        = string
  default     = null
}

variable "alert_email_addresses" {
  description = "Email recipients for alerts"
  type        = list(string)
  default     = []
}

variable "additional_alarm_actions" {
  description = "Additional ARNs invoked when alarms trigger"
  type        = list(string)
  default     = []
}

variable "tags" {
  description = "Tags to apply"
  type        = map(string)
  default     = {}
}
