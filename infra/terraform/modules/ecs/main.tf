terraform {
  required_version = ">= 1.5.0"
}

resource "aws_ecs_cluster" "this" {
  name = "${var.name}-${var.environment}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = merge(var.tags, {
    Environment = var.environment
    Name        = "${var.name}-${var.environment}"
  })
}

resource "aws_cloudwatch_log_group" "this" {
  for_each = {
    api = var.api_log_group
    web = var.web_log_group
  }

  name              = each.value
  retention_in_days = var.log_retention_days

  tags = merge(var.tags, {
    Environment = var.environment
    Service     = each.key
  })
}

resource "aws_iam_role" "execution" {
  name = "${var.name}-${var.environment}-ecs-execution"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })

  tags = merge(var.tags, {
    Environment = var.environment
  })
}

resource "aws_iam_role_policy_attachment" "execution" {
  count      = length(var.execution_role_policy_arns)
  role       = aws_iam_role.execution.name
  policy_arn = var.execution_role_policy_arns[count.index]
}

resource "aws_iam_role" "task" {
  name = "${var.name}-${var.environment}-ecs-task"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })

  tags = merge(var.tags, {
    Environment = var.environment
  })
}

resource "aws_security_group" "alb" {
  name        = "${var.name}-${var.environment}-alb"
  description = "ALB security group"
  vpc_id      = var.vpc_id

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, {
    Environment = var.environment
    Service     = "alb"
  })
}

resource "aws_security_group" "services" {
  for_each = {
    api = {
      port = var.api_container_port
    }
    web = {
      port = var.web_container_port
    }
  }

  name        = "${var.name}-${var.environment}-${each.key}"
  description = "Security group for ${each.key} service"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = each.value.port
    to_port         = each.value.port
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
    description     = "Allow traffic from ALB"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, {
    Environment = var.environment
    Service     = each.key
  })
}

resource "aws_lb" "this" {
  name               = "${var.name}-${var.environment}"
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = var.public_subnet_ids

  tags = merge(var.tags, {
    Environment = var.environment
  })
}

resource "aws_lb_target_group" "api" {
  name        = "${var.name}-${var.environment}-api"
  port        = var.api_container_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    healthy_threshold   = 3
    unhealthy_threshold = 3
    interval            = 30
    timeout             = 5
    matcher             = "200-399"
    path                = var.api_healthcheck_path
  }

  tags = merge(var.tags, {
    Environment = var.environment
    Service     = "api"
  })
}

resource "aws_lb_target_group" "web" {
  name        = "${var.name}-${var.environment}-web"
  port        = var.web_container_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    healthy_threshold   = 3
    unhealthy_threshold = 3
    interval            = 30
    timeout             = 5
    matcher             = "200-399"
    path                = var.web_healthcheck_path
  }

  tags = merge(var.tags, {
    Environment = var.environment
    Service     = "web"
  })
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.this.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.this.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = var.alb_certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.web.arn
  }
}

resource "aws_lb_listener_rule" "api" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 10

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }

  condition {
    path_pattern {
      values = var.api_listener_paths
    }
  }
}

locals {
  api_secrets = [for s in var.api_secrets : {
    name      = s.name
    valueFrom = s.arn
  }]
  web_secrets = [for s in var.web_secrets : {
    name      = s.name
    valueFrom = s.arn
  }]
}

resource "aws_ecs_task_definition" "api" {
  family                   = "${var.name}-${var.environment}-api"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.api_cpu
  memory                   = var.api_memory
  execution_role_arn       = aws_iam_role.execution.arn
  task_role_arn            = aws_iam_role.task.arn

  container_definitions = jsonencode([
    {
      name      = "api"
      image     = var.api_image
      essential = true
      portMappings = [{
        containerPort = var.api_container_port
        hostPort      = var.api_container_port
        protocol      = "tcp"
      }]
      healthCheck = {
        command  = ["CMD-SHELL", "curl -f http://localhost:${var.api_container_port}${var.api_healthcheck_path} || exit 1"]
        interval = 30
        timeout  = 5
        retries  = 3
      }
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.this["api"].name
          awslogs-region        = var.region
          awslogs-stream-prefix = "api"
        }
      }
      secrets = local.api_secrets
      environment = [for k, v in var.api_environment : {
        name  = k
        value = v
      }]
    }
  ])

  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "X86_64"
  }
}

resource "aws_ecs_task_definition" "web" {
  family                   = "${var.name}-${var.environment}-web"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.web_cpu
  memory                   = var.web_memory
  execution_role_arn       = aws_iam_role.execution.arn
  task_role_arn            = aws_iam_role.task.arn

  container_definitions = jsonencode([
    {
      name      = "web"
      image     = var.web_image
      essential = true
      portMappings = [{
        containerPort = var.web_container_port
        hostPort      = var.web_container_port
        protocol      = "tcp"
      }]
      healthCheck = {
        command  = ["CMD-SHELL", "curl -f http://localhost:${var.web_container_port}${var.web_healthcheck_path} || exit 1"]
        interval = 30
        timeout  = 5
        retries  = 3
      }
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.this["web"].name
          awslogs-region        = var.region
          awslogs-stream-prefix = "web"
        }
      }
      secrets = local.web_secrets
      environment = [for k, v in var.web_environment : {
        name  = k
        value = v
      }]
    }
  ])

  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "X86_64"
  }
}

resource "aws_ecs_service" "api" {
  name            = "${var.name}-${var.environment}-api"
  cluster         = aws_ecs_cluster.this.arn
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = var.api_desired_count
  launch_type     = "FARGATE"
  propagate_tags  = "SERVICE"

  network_configuration {
    subnets         = var.private_subnet_ids
    security_groups = [aws_security_group.services["api"].id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "api"
    container_port   = var.api_container_port
  }

  lifecycle {
    ignore_changes = [task_definition]
  }

  depends_on = [aws_lb_listener.https]
}

resource "aws_ecs_service" "web" {
  name            = "${var.name}-${var.environment}-web"
  cluster         = aws_ecs_cluster.this.arn
  task_definition = aws_ecs_task_definition.web.arn
  desired_count   = var.web_desired_count
  launch_type     = "FARGATE"
  propagate_tags  = "SERVICE"

  network_configuration {
    subnets         = var.private_subnet_ids
    security_groups = [aws_security_group.services["web"].id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.web.arn
    container_name   = "web"
    container_port   = var.web_container_port
  }

  lifecycle {
    ignore_changes = [task_definition]
  }

  depends_on = [aws_lb_listener.https]
}

output "cluster_name" {
  value = aws_ecs_cluster.this.name
}

output "alb_dns_name" {
  value = aws_lb.this.dns_name
}

output "api_service_name" {
  value = aws_ecs_service.api.name
}

output "web_service_name" {
  value = aws_ecs_service.web.name
}

output "alb_security_group_id" {
  value = aws_security_group.alb.id
}

output "service_security_group_ids" {
  value = { for k, v in aws_security_group.services : k => v.id }
}

output "alb_zone_id" {
  value = aws_lb.this.zone_id
}

output "task_role_arn" {
  value = aws_iam_role.task.arn
}

output "execution_role_arn" {
  value = aws_iam_role.execution.arn
}

output "task_role_name" {
  value = aws_iam_role.task.name
}

output "execution_role_name" {
  value = aws_iam_role.execution.name
}
