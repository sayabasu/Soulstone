# Preview Environment

This Terraform stack provisions an ephemeral preview environment for a pull request. Each preview includes:

- An isolated VPC with public/private subnets.
- CloudWatch log groups for the API and web services.
- A dedicated ECS cluster, Fargate services, and Application Load Balancer.
- CodeDeploy blue/green deployment wiring to ensure safe rollouts in the preview stack.

## Usage

The stack is parameterised by the pull request number (`var.pr_number`). Automation can instantiate the stack with unique workspaces or state keys per PR. A typical workflow:

1. Set the required variables via a `terraform.tfvars` file or CLI variables. Provide container images that should be deployed to the preview services.
2. Run `terraform init` and `terraform apply` when a PR is opened or updated.
3. Destroy the stack with `terraform destroy` once the PR is closed.

See `.github/workflows/preview.yml` for an example GitHub Actions automation.

> **Tip:** When sourcing variables from GitHub Actions, encode complex values (maps/lists) as JSON strings in repository variables (for example `[{"name":"10.0.1.0/24"}]`). The workflow will pass them through directly to Terraform via `TF_VAR_` environment variables.
