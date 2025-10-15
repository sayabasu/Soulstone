variable "name" {
  description = "Application name prefix"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "default_kms_key_arn" {
  description = "Default KMS key for encrypting secrets"
  type        = string
  default     = null
}

variable "secrets" {
  description = "List of secrets to create"
  type = list(object({
    name               = string
    description        = optional(string, "Managed by Terraform")
    secret_string      = optional(string)
    kms_key_arn        = optional(string)
    rotation_lambda_arn = optional(string)
    rotation_days      = optional(number, 30)
  }))
  default = []
}

variable "parameters" {
  description = "Map of parameter store entries"
  type = map(object({
    value        = string
    type         = optional(string, "SecureString")
    description  = optional(string, "Managed by Terraform")
    kms_key_arn  = optional(string)
  }))
  default = {}
}

variable "tags" {
  description = "Tags to apply"
  type        = map(string)
  default     = {}
}
