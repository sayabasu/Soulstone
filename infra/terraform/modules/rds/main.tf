terraform {
  required_version = ">= 1.5.0"
}

resource "random_password" "master" {
  length  = 32
  special = true
}

resource "aws_db_subnet_group" "this" {
  name       = "${var.name}-${var.environment}-rds"
  subnet_ids = var.private_subnet_ids

  tags = merge(var.tags, {
    Environment = var.environment
    Name        = "${var.name}-${var.environment}-rds"
  })
}

resource "aws_security_group" "this" {
  name        = "${var.name}-${var.environment}-rds"
  description = "Security group for RDS"
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

resource "aws_db_parameter_group" "this" {
  name   = "${var.name}-${var.environment}-postgres"
  family = var.parameter_group_family

  description = "${var.environment} RDS parameter group"

  parameter {
    name  = "max_connections"
    value = tostring(var.max_connections)
  }

  parameter {
    name  = "rds.force_ssl"
    value = "1"
  }

  tags = merge(var.tags, {
    Environment = var.environment
  })
}

resource "aws_db_instance" "this" {
  identifier              = "${var.name}-${var.environment}"
  engine                  = "postgres"
  engine_version          = var.engine_version
  instance_class          = var.instance_class
  allocated_storage       = var.allocated_storage
  max_allocated_storage   = var.max_allocated_storage
  storage_encrypted       = true
  kms_key_id              = var.kms_key_arn
  db_subnet_group_name    = aws_db_subnet_group.this.name
  vpc_security_group_ids  = [aws_security_group.this.id]
  multi_az                = var.multi_az
  publicly_accessible     = false
  username                = var.username
  password                = random_password.master.result
  port                    = var.port
  backup_retention_period = var.backup_retention_days
  backup_window           = var.backup_window
  maintenance_window      = var.maintenance_window
  deletion_protection     = var.deletion_protection
  apply_immediately       = false
  copy_tags_to_snapshot   = true
  auto_minor_version_upgrade = true
  performance_insights_enabled = true
  performance_insights_retention_period = 7
  parameter_group_name    = aws_db_parameter_group.this.name

  monitoring_interval = 60
  monitoring_role_arn = var.enhanced_monitoring_role_arn

  tags = merge(var.tags, {
    Environment = var.environment
  })
}

resource "aws_cloudwatch_metric_alarm" "cpu" {
  alarm_name          = "${var.name}-${var.environment}-rds-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 5
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = 60
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "High CPU on RDS"
  alarm_actions       = var.alarm_topic_arns
  ok_actions          = var.alarm_topic_arns

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.this.id
  }
}

output "db_instance_identifier" {
  value = aws_db_instance.this.id
}

output "db_security_group_id" {
  value = aws_security_group.this.id
}

output "db_username" {
  value = var.username
}

output "db_password" {
  value       = random_password.master.result
  sensitive   = true
  description = "Generated master password"
}

output "db_endpoint" {
  value = aws_db_instance.this.address
}
