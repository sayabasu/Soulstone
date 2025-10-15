variable "name" {
  description = "Application name prefix"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vpc_id" {
  description = "VPC identifier"
  type        = string
}

variable "private_subnet_ids" {
  description = "Private subnet IDs for RDS"
  type        = list(string)
}

variable "allowed_security_group_ids" {
  description = "Security groups that can access the database"
  type        = list(string)
}

variable "username" {
  description = "Master username"
  type        = string
  default     = "app_admin"
}

variable "port" {
  description = "Database port"
  type        = number
  default     = 5432
}

variable "engine_version" {
  description = "PostgreSQL engine version"
  type        = string
  default     = "15.5"
}

variable "instance_class" {
  description = "Instance class"
  type        = string
  default     = "db.m6g.large"
}

variable "allocated_storage" {
  description = "Allocated storage in GiB"
  type        = number
  default     = 100
}

variable "max_allocated_storage" {
  description = "Maximum storage for autoscaling"
  type        = number
  default     = 200
}

variable "multi_az" {
  description = "Whether to enable Multi-AZ"
  type        = bool
  default     = true
}

variable "backup_retention_days" {
  description = "Backup retention period"
  type        = number
  default     = 7
}

variable "backup_window" {
  description = "Preferred backup window"
  type        = string
  default     = "04:00-06:00"
}

variable "maintenance_window" {
  description = "Preferred maintenance window"
  type        = string
  default     = "sun:06:00-sun:08:00"
}

variable "deletion_protection" {
  description = "Enable deletion protection"
  type        = bool
  default     = true
}

variable "kms_key_arn" {
  description = "KMS key ARN for encryption"
  type        = string
}

variable "enhanced_monitoring_role_arn" {
  description = "IAM role ARN for enhanced monitoring"
  type        = string
}

variable "max_connections" {
  description = "Maximum number of DB connections"
  type        = number
  default     = 500
}

variable "parameter_group_family" {
  description = "Parameter group family"
  type        = string
  default     = "postgres15"
}

variable "alarm_topic_arns" {
  description = "SNS topics for alarms"
  type        = list(string)
  default     = []
}

variable "tags" {
  description = "Tags to apply"
  type        = map(string)
  default     = {}
}
