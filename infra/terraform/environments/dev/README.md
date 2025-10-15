# Dev Environment Infrastructure

This Terraform configuration composes the reusable modules under `infra/terraform/modules` to provision the core AWS footprint required by the Soulstone platform. It can be used as a reference implementation or starting point for additional environments.

## What gets provisioned?

- **Networking:** Highly-available VPC with public and private subnets, NAT gateway, and private interface endpoints for SSM and supporting services.
- **Compute:** ECS Fargate cluster with API and Web services behind an HTTPS Application Load Balancer.
- **Container registry:** Immutable ECR repositories for the API and Web images with lifecycle management.
- **Data stores:** Multi-AZ PostgreSQL RDS instance and encrypted ElastiCache Redis replication group.
- **Secrets:** Secrets Manager namespaces and SSM Parameters seeded with database and cache credentials, plus IAM policy for service access.
- **Observability:** CloudWatch log groups, log-based metric filters, and SNS alerting hooks.
- **Edge & DNS:** Route53 public hosted zone, validated ACM certificates, CloudFront distribution (with WAF) in front of the web workload, and Route53 aliases for API and Web endpoints.

## Usage

1. Copy `terraform.tfvars.example` (to be created by you) with environment-specific values for `root_domain`, `web_domain`, and `api_domain`.
2. Export AWS credentials with permissions to manage the referenced services (VPC, ECS, RDS, ElastiCache, Route53, ACM, CloudFront, IAM, KMS).
3. Initialise and plan:

   ```bash
   terraform init
   terraform plan -var-file=terraform.tfvars
   ```

4. Apply once the plan looks correct:

   ```bash
   terraform apply -var-file=terraform.tfvars
   ```

## Module composition

Each module is intentionally self-contained and can be reused independently:

- `modules/networking` – VPC, subnets, NAT, interface endpoints.
- `modules/ecr` – ECR repositories with immutability and scanning.
- `modules/ecs` – ECS cluster, task definitions, Fargate services, ALB.
- `modules/rds` – PostgreSQL instance, parameter group, alarms.
- `modules/redis` – Redis replication group with encryption and auth token.
- `modules/secrets` – Secrets Manager + SSM Parameter Store structure.
- `modules/observability` – CloudWatch log groups, metric filters, SNS alerts.
- `modules/dns` – Route53 hosted zone, ACM (us-east-1) wildcard cert, optional WAF.

Refer to the module `variables.tf` files for configurable inputs.
