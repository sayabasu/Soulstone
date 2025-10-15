terraform {
  required_version = ">= 1.5.0"
}

locals {
  secrets = { for secret in var.secrets : secret.name => secret }
  parameters = var.parameters
}

resource "aws_secretsmanager_secret" "this" {
  for_each = local.secrets

  name        = "${var.environment}/${each.value.name}"
  description = each.value.description
  kms_key_id  = coalesce(each.value.kms_key_arn, var.default_kms_key_arn)

  tags = merge(var.tags, {
    Environment = var.environment
    Scope       = "secrets"
  })
}

resource "aws_secretsmanager_secret_version" "this" {
  for_each = { for k, v in local.secrets : k => v if try(v.secret_string, null) != null }

  secret_id     = aws_secretsmanager_secret.this[each.key].id
  secret_string = each.value.secret_string
}

resource "aws_secretsmanager_secret_rotation" "this" {
  for_each = { for k, v in local.secrets : k => v if try(v.rotation_lambda_arn, null) != null }

  secret_id = aws_secretsmanager_secret.this[each.key].id

  rotation_lambda_arn = each.value.rotation_lambda_arn

  rotation_rules {
    automatically_after_days = each.value.rotation_days
  }
}

resource "aws_ssm_parameter" "this" {
  for_each = local.parameters

  name        = "/${var.environment}/${each.key}"
  type        = each.value.type
  value       = each.value.value
  description = each.value.description
  key_id      = coalesce(each.value.kms_key_arn, var.default_kms_key_arn)
  tier        = "Advanced"

  tags = merge(var.tags, {
    Environment = var.environment
    Scope       = "parameters"
  })
}

resource "aws_iam_policy" "read_only" {
  name        = "${var.environment}-${var.name}-secrets-read"
  description = "Read access to environment secrets and parameters"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["secretsmanager:GetSecretValue", "secretsmanager:DescribeSecret"],
        Resource = [for secret in aws_secretsmanager_secret.this : secret.arn]
      },
      {
        Effect   = "Allow"
        Action   = ["ssm:GetParameter", "ssm:GetParameters", "ssm:GetParameterHistory"],
        Resource = [for param in aws_ssm_parameter.this : param.arn]
      }
    ]
  })
}

output "secret_arns" {
  value = { for name, secret in aws_secretsmanager_secret.this : name => secret.arn }
}

output "parameter_arns" {
  value = { for name, parameter in aws_ssm_parameter.this : name => parameter.arn }
}

output "read_policy_arn" {
  value = aws_iam_policy.read_only.arn
}
