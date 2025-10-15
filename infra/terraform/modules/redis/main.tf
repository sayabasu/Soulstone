terraform {
  required_version = ">= 1.5.0"
}

resource "random_password" "auth" {
  length  = 32
  special = true
}

resource "aws_elasticache_subnet_group" "this" {
  name       = "${var.name}-${var.environment}-redis"
  subnet_ids = var.private_subnet_ids

  tags = merge(var.tags, {
    Environment = var.environment
  })
}

resource "aws_security_group" "this" {
  name        = "${var.name}-${var.environment}-redis"
  description = "Security group for Redis"
  vpc_id      = var.vpc_id

  dynamic "ingress" {
    for_each = var.allowed_security_group_ids
    content {
      from_port       = var.port
      to_port         = var.port
      protocol        = "tcp"
      security_groups = [ingress.value]
      description     = "Allow from application security group ${ingress.value}"
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, {
    Environment = var.environment
  })
}

resource "aws_elasticache_replication_group" "this" {
  replication_group_id          = "${var.name}-${var.environment}-redis"
  description                   = "${var.environment} Redis for sessions/cache"
  engine                        = "redis"
  engine_version                = var.engine_version
  node_type                     = var.node_type
  number_cache_clusters         = var.number_cache_clusters
  port                          = var.port
  automatic_failover_enabled    = true
  multi_az_enabled              = true
  at_rest_encryption_enabled    = true
  transit_encryption_enabled    = true
  auth_token                    = random_password.auth.result
  kms_key_id                    = var.kms_key_arn
  snapshot_retention_limit      = var.snapshot_retention_days
  maintenance_window            = var.maintenance_window
  snapshot_window               = var.snapshot_window
  security_group_ids            = [aws_security_group.this.id]
  subnet_group_name             = aws_elasticache_subnet_group.this.name

  tags = merge(var.tags, {
    Environment = var.environment
  })
}

output "redis_primary_endpoint" {
  value = aws_elasticache_replication_group.this.primary_endpoint_address
}

output "redis_reader_endpoint" {
  value = aws_elasticache_replication_group.this.reader_endpoint_address
}

output "redis_auth_token" {
  value     = random_password.auth.result
  sensitive = true
}

output "redis_security_group_id" {
  value = aws_security_group.this.id
}
