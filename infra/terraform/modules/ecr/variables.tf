variable "name" {
  description = "Namespace prefix for repositories"
  type        = string
}

variable "environment" {
  description = "Environment name (e.g. dev, prod)"
  type        = string
}

variable "repositories" {
  description = "List of repository names to create"
  type        = list(string)
}

variable "tags" {
  description = "Tags to apply to repositories"
  type        = map(string)
  default     = {}
}
