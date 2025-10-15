terraform {
  required_version = ">= 1.5.0"
}

locals {
  log_groups = toset(var.log_groups)
  alarms     = var.alarms
}

resource "aws_cloudwatch_log_group" "this" {
  for_each = local.log_groups

  name              = each.value
  retention_in_days = var.log_retention_days

  tags = merge(var.tags, {
    Environment = var.environment
    Purpose     = "application-logs"
  })
}

resource "aws_cloudwatch_log_metric_filter" "errors" {
  for_each = local.log_groups

  name           = "${replace(each.value, "/", "_")}_errors"
  log_group_name = each.value
  pattern        = "?ERROR ?Error ?error ?\"level\"=?\"error\""

  metric_transformation {
    name      = "${replace(each.value, "/", "_")}_ErrorCount"
    namespace = var.metric_namespace
    value     = "1"
  }
}

resource "aws_cloudwatch_metric_alarm" "log_error_alarm" {
  for_each = local.log_groups

  alarm_name          = "${replace(each.value, "/", "-")}-errors"
  alarm_description   = "High error rate detected in log group ${each.value}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  datapoints_to_alarm = 1
  threshold           = 5
  metric_name         = aws_cloudwatch_log_metric_filter.errors[each.key].metric_transformation[0].name
  namespace           = var.metric_namespace
  statistic           = "Sum"
  period              = 300
  alarm_actions       = concat([aws_sns_topic.alerts.arn], var.additional_alarm_actions)
  ok_actions          = concat([aws_sns_topic.alerts.arn], var.additional_alarm_actions)
}

resource "aws_sns_topic" "alerts" {
  name = "${var.name}-${var.environment}-alerts"

  tags = merge(var.tags, {
    Environment = var.environment
    Purpose     = "alerts"
  })
}

resource "aws_sns_topic_subscription" "webhook" {
  count = var.alert_webhook_endpoint == null ? 0 : 1

  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "https"
  endpoint  = var.alert_webhook_endpoint
}

resource "aws_sns_topic_subscription" "email" {
  count = length(var.alert_email_addresses)

  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email_addresses[count.index]
}

output "log_group_names" {
  value = [for name in aws_cloudwatch_log_group.this : name.name]
}

output "sns_topic_arn" {
  value = aws_sns_topic.alerts.arn
}
