# Terraform Infrastructure

This directory now contains reusable Terraform modules and example environment compositions for provisioning Soulstone's AWS foundations. Modules are organized by component (networking, compute, data, observability, etc.) and can be mixed-and-matched by environments under `environments/`.

## Structure

- `modules/networking` – VPC, subnets, routing, NAT, interface endpoints.
- `modules/dns` – Route53 hosted zone, wildcard ACM certificate (us-east-1), optional CloudFront + WAF.
- `modules/ecr` – Immutable ECR repositories with on-push scanning and lifecycle policies.
- `modules/ecs` – ECS Fargate cluster, ALB, task definitions for API and Web workloads.
- `modules/rds` – Multi-AZ PostgreSQL instance with encryption, parameter group, and alarms.
- `modules/redis` – Encrypted ElastiCache Redis replication group for cache/session data.
- `modules/secrets` – Secrets Manager + SSM parameter scaffolding with IAM access policy.
- `modules/observability` – CloudWatch log groups, metric filters, SNS alerting fan-out.
- `environments/dev` – Opinionated composition of the modules to stand up the dev footprint.

Refer to `docs/onboarding.md` for instructions on authenticating to AWS before running Terraform commands.
