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
  description = "Private subnet IDs"
  type        = list(string)
}

variable "allowed_security_group_ids" {
  description = "Security groups allowed to connect"
  type        = list(string)
}

variable "node_type" {
  description = "ElastiCache node type"
  type        = string
  default     = "cache.t3.medium"
}

variable "number_cache_clusters" {
  description = "Number of cache nodes"
  type        = number
  default     = 2
}

variable "engine_version" {
  description = "Redis engine version"
  type        = string
  default     = "7.1"
}

variable "port" {
  description = "Redis port"
  type        = number
  default     = 6379
}

variable "kms_key_arn" {
  description = "KMS key for encryption"
  type        = string
}

variable "snapshot_retention_days" {
  description = "Snapshot retention days"
  type        = number
  default     = 7
}

variable "snapshot_window" {
  description = "Snapshot window"
  type        = string
  default     = "05:00-09:00"
}

variable "maintenance_window" {
  description = "Maintenance window"
  type        = string
  default     = "sun:09:00-sun:10:00"
}

variable "tags" {
  description = "Tags to apply"
  type        = map(string)
  default     = {}
}
