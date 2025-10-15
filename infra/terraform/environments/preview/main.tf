terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.39"
    }
  }
}

provider "aws" {
  region = var.region
}

locals {
  environment = "pr-${var.pr_number}"
  name        = "${var.project}-${local.environment}"
  tags = merge(var.default_tags, {
    Project     = var.project,
    Environment = local.environment,
    PR          = local.environment,
  })

  api_log_group = "/${var.project}/${local.environment}/api"
  web_log_group = "/${var.project}/${local.environment}/web"
}

module "networking" {
  source = "../../modules/networking"

  name                 = local.name
  region               = var.region
  vpc_cidr             = var.vpc_cidr
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  availability_zones   = var.availability_zones
  enable_nat_gateway   = false
  enable_vpn_gateway   = false
  single_nat_gateway   = true
  enable_ssm_endpoints = true
  tags                 = local.tags
}

module "observability" {
  source = "../../modules/observability"

  name                    = var.project
  environment             = local.environment
  log_groups              = [local.api_log_group, local.web_log_group]
  log_retention_days      = var.log_retention_days
  alert_webhook_endpoint  = var.alert_webhook_endpoint
  alert_email_addresses   = var.alert_email_addresses
  additional_alarm_actions = []
  tags                    = local.tags
}

module "ecs" {
  source = "../../modules/ecs"

  name                = var.project
  environment         = local.environment
  region              = var.region
  vpc_id              = module.networking.vpc_id
  public_subnet_ids   = module.networking.public_subnet_ids
  private_subnet_ids  = module.networking.private_subnet_ids
  alb_certificate_arn = var.alb_certificate_arn
  api_image           = var.api_image
  web_image           = var.web_image
  api_container_port  = var.api_container_port
  web_container_port  = var.web_container_port
  api_healthcheck_path = var.api_healthcheck_path
  web_healthcheck_path = var.web_healthcheck_path
  api_cpu             = var.api_cpu
  api_memory          = var.api_memory
  web_cpu             = var.web_cpu
  web_memory          = var.web_memory
  api_desired_count   = var.api_desired_count
  web_desired_count   = var.web_desired_count
  api_log_group       = local.api_log_group
  web_log_group       = local.web_log_group
  log_retention_days  = var.log_retention_days
  api_secrets         = var.api_secrets
  web_secrets         = var.web_secrets
  api_environment     = merge(var.shared_environment, var.api_environment)
  web_environment     = merge(var.shared_environment, var.web_environment)
  api_listener_paths  = var.api_listener_paths
  tags                = local.tags
  codedeploy_alarm_names            = var.codedeploy_alarm_names
  deployment_ready_wait_time_minutes = var.deployment_ready_wait_time_minutes
  green_termination_wait_time_minutes = var.green_termination_wait_time_minutes
}
