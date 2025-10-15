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

resource "aws_iam_role" "codedeploy" {
  name = "${var.name}-${var.environment}-codedeploy"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "codedeploy.amazonaws.com" }
    }]
  })

  tags = merge(var.tags, {
    Environment = var.environment
  })
}

resource "aws_iam_role_policy_attachment" "codedeploy" {
  role       = aws_iam_role.codedeploy.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSCodeDeployRoleForECS"
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

  ingress {
    description = "Blue/green canary"
    from_port   = 9001
    to_port     = 9002
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

resource "aws_lb_target_group" "api_blue" {
  name        = "${var.name}-${var.environment}-api-blue"
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
    Variant     = "blue"
  })
}

resource "aws_lb_target_group" "api_green" {
  name        = "${var.name}-${var.environment}-api-green"
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
    Variant     = "green"
  })
}

resource "aws_lb_target_group" "web_blue" {
  name        = "${var.name}-${var.environment}-web-blue"
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
    Variant     = "blue"
  })
}

resource "aws_lb_target_group" "web_green" {
  name        = "${var.name}-${var.environment}-web-green"
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
    Variant     = "green"
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
    target_group_arn = aws_lb_target_group.web_blue.arn
  }
}

resource "aws_lb_listener_rule" "api" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 10

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api_blue.arn
  }

  condition {
    path_pattern {
      values = var.api_listener_paths
    }
  }
}

resource "aws_lb_listener" "api_test" {
  load_balancer_arn = aws_lb.this.arn
  port              = 9001
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api_blue.arn
  }
}

resource "aws_lb_listener" "web_test" {
  load_balancer_arn = aws_lb.this.arn
  port              = 9002
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.web_blue.arn
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

  deployment_controller {
    type = "CODE_DEPLOY"
  }

  network_configuration {
    subnets         = var.private_subnet_ids
    security_groups = [aws_security_group.services["api"].id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api_blue.arn
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

  deployment_controller {
    type = "CODE_DEPLOY"
  }

  network_configuration {
    subnets         = var.private_subnet_ids
    security_groups = [aws_security_group.services["web"].id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.web_blue.arn
    container_name   = "web"
    container_port   = var.web_container_port
  }

  lifecycle {
    ignore_changes = [task_definition]
  }

  depends_on = [aws_lb_listener.https]
}

resource "aws_codedeploy_app" "api" {
  name             = "${var.name}-${var.environment}-api"
  compute_platform = "ECS"
}

resource "aws_codedeploy_app" "web" {
  name             = "${var.name}-${var.environment}-web"
  compute_platform = "ECS"
}

resource "aws_codedeploy_deployment_group" "api" {
  app_name              = aws_codedeploy_app.api.name
  deployment_group_name = "${var.name}-${var.environment}-api"
  service_role_arn      = aws_iam_role.codedeploy.arn

  auto_rollback_configuration {
    enabled = true
    events  = ["DEPLOYMENT_FAILURE", "DEPLOYMENT_STOP_ON_ALARM"]
  }

  deployment_style {
    deployment_option = "WITH_TRAFFIC_CONTROL"
    deployment_type   = "BLUE_GREEN"
  }

  blue_green_deployment_config {
    deployment_ready_option {
      action_on_timeout = "STOP_DEPLOYMENT"
      wait_time_in_minutes = var.deployment_ready_wait_time_minutes
    }

    terminate_blue_instances_on_deployment_success {
      action = "TERMINATE"
      termination_wait_time_in_minutes = var.green_termination_wait_time_minutes
    }
  }

  ecs_service {
    cluster_name = aws_ecs_cluster.this.name
    service_name = aws_ecs_service.api.name
  }

  load_balancer_info {
    target_group_pair_info {
      prod_target_group {
        name = aws_lb_target_group.api_blue.name
      }

      test_target_group {
        name = aws_lb_target_group.api_green.name
      }

      prod_traffic_route {
        listener_arns = [aws_lb_listener.https.arn]
      }

      test_traffic_route {
        listener_arns = [aws_lb_listener.api_test.arn]
      }
    }
  }

  dynamic "alarm_configuration" {
    for_each = length(var.codedeploy_alarm_names) > 0 ? [1] : []
    content {
      enabled = true
      alarms  = var.codedeploy_alarm_names
    }
  }

  depends_on = [aws_ecs_service.api]
}

resource "aws_codedeploy_deployment_group" "web" {
  app_name              = aws_codedeploy_app.web.name
  deployment_group_name = "${var.name}-${var.environment}-web"
  service_role_arn      = aws_iam_role.codedeploy.arn

  auto_rollback_configuration {
    enabled = true
    events  = ["DEPLOYMENT_FAILURE", "DEPLOYMENT_STOP_ON_ALARM"]
  }

  deployment_style {
    deployment_option = "WITH_TRAFFIC_CONTROL"
    deployment_type   = "BLUE_GREEN"
  }

  blue_green_deployment_config {
    deployment_ready_option {
      action_on_timeout    = "STOP_DEPLOYMENT"
      wait_time_in_minutes = var.deployment_ready_wait_time_minutes
    }

    terminate_blue_instances_on_deployment_success {
      action = "TERMINATE"
      termination_wait_time_in_minutes = var.green_termination_wait_time_minutes
    }
  }

  ecs_service {
    cluster_name = aws_ecs_cluster.this.name
    service_name = aws_ecs_service.web.name
  }

  load_balancer_info {
    target_group_pair_info {
      prod_target_group {
        name = aws_lb_target_group.web_blue.name
      }

      test_target_group {
        name = aws_lb_target_group.web_green.name
      }

      prod_traffic_route {
        listener_arns = [aws_lb_listener.https.arn]
      }

      test_traffic_route {
        listener_arns = [aws_lb_listener.web_test.arn]
      }
    }
  }

  dynamic "alarm_configuration" {
    for_each = length(var.codedeploy_alarm_names) > 0 ? [1] : []
    content {
      enabled = true
      alarms  = var.codedeploy_alarm_names
    }
  }

  depends_on = [aws_ecs_service.web]
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
