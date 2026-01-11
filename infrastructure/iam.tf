# IAM Configuration for Developer Roles and Admin Users

# Developer IAM Role with appropriate permissions
resource "aws_iam_role" "developer" {
  name = "${var.project_name}-developer-role"
  path = "/"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
        Action = "sts:AssumeRole"
        Condition = {
          Bool = {
            "aws:MultiFactorAuthPresent" = "true"
          }
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-developer-role"
  }
}

# Developer IAM Policy with least privilege access
resource "aws_iam_role_policy" "developer" {
  name = "${var.project_name}-developer-policy"
  role = aws_iam_role.developer.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:ListBucket",
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = [
          aws_s3_bucket.website.arn,
          "${aws_s3_bucket.website.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "cloudfront:GetDistribution",
          "cloudfront:ListDistributions",
          "cloudfront:CreateInvalidation"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogStreams"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          aws_dynamodb_table.users.arn,
          aws_dynamodb_table.leaderboard.arn,
          aws_dynamodb_table.performance_metrics.arn,
          aws_dynamodb_table.websocket_connections.arn,
          "${aws_dynamodb_table.users.arn}/index/*",
          "${aws_dynamodb_table.leaderboard.arn}/index/*",
          "${aws_dynamodb_table.performance_metrics.arn}/index/*",
          "${aws_dynamodb_table.websocket_connections.arn}/index/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "lambda:ListFunctions",
          "lambda:GetFunction",
          "lambda:InvokeFunction"
        ]
        Resource = [
          aws_lambda_function.error_logs_handler.arn,
          aws_lambda_function.websocket_connect.arn,
          aws_lambda_function.websocket_disconnect.arn,
          aws_lambda_function.websocket_message.arn,
          aws_lambda_function.cache_control.arn
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "apigateway:GET",
          "apigateway:POST"
        ]
        Resource = [
          aws_apigatewayv2_api.websocket.arn,
          aws_api_gateway_rest_api.error_logs.execution_arn
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "cloudwatch:GetMetricData",
          "cloudwatch:ListMetrics",
          "cloudwatch:GetDashboard"
        ]
        Resource = "*"
      }
    ]
  })
}

# Admin IAM Role with broader permissions
resource "aws_iam_role" "admin" {
  name = "${var.project_name}-admin-role"
  path = "/"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
        Action = "sts:AssumeRole"
        Condition = {
          Bool = {
            "aws:MultiFactorAuthPresent" = "true"
          }
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-admin-role"
  }
}

# Admin IAM Policy with broader access
resource "aws_iam_role_policy" "admin" {
  name = "${var.project_name}-admin-policy"
  role = aws_iam_role.admin.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:*"
        ]
        Resource = [
          aws_s3_bucket.website.arn,
          "${aws_s3_bucket.website.arn}/*",
          aws_s3_bucket.logs.arn,
          "${aws_s3_bucket.logs.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "cloudfront:*"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "logs:*"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:*"
        ]
        Resource = [
          aws_dynamodb_table.users.arn,
          aws_dynamodb_table.leaderboard.arn,
          aws_dynamodb_table.performance_metrics.arn,
          aws_dynamodb_table.websocket_connections.arn,
          "${aws_dynamodb_table.users.arn}/index/*",
          "${aws_dynamodb_table.leaderboard.arn}/index/*",
          "${aws_dynamodb_table.performance_metrics.arn}/index/*",
          "${aws_dynamodb_table.websocket_connections.arn}/index/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "lambda:*"
        ]
        Resource = [
          aws_lambda_function.error_logs_handler.arn,
          aws_lambda_function.websocket_connect.arn,
          aws_lambda_function.websocket_disconnect.arn,
          aws_lambda_function.websocket_message.arn,
          aws_lambda_function.cache_control.arn
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "apigateway:*"
        ]
        Resource = [
          aws_apigatewayv2_api.websocket.arn,
          aws_api_gateway_rest_api.error_logs.execution_arn
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "cloudwatch:*",
          "sns:*"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "iam:GetRole",
          "iam:ListRoles",
          "iam:ListUsers",
          "iam:ListPolicies"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "route53:ListHostedZones",
          "route53:GetHostedZone",
          "route53:ChangeResourceRecordSets"
        ]
        Resource = "*"
      }
    ]
  })
}

# IAM User for additional admin (created via invitation)
resource "aws_iam_user" "additional_admin" {
  count = var.create_additional_admin ? 1 : 0
  name  = "${var.project_name}-admin-${var.additional_admin_username}"
  path  = "/"

  tags = {
    Name = "${var.project_name}-additional-admin"
  }
}

# IAM User Policy for additional admin
resource "aws_iam_user_policy" "additional_admin" {
  count  = var.create_additional_admin ? 1 : 0
  name   = "${var.project_name}-admin-policy"
  user   = aws_iam_user.additional_admin[0].name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "iam:CreateLoginProfile",
          "iam:UpdateLoginProfile",
          "iam:DeleteLoginProfile"
        ]
        Resource = aws_iam_user.additional_admin[0].arn
      },
      {
        Effect = "Allow"
        Action = [
          "iam:CreateAccessKey",
          "iam:DeleteAccessKey",
          "iam:ListAccessKeys",
          "iam:UpdateAccessKey"
        ]
        Resource = aws_iam_user.additional_admin[0].arn
      },
      {
        Effect = "Allow"
        Action = [
          "iam:AttachUserPolicy",
          "iam:DetachUserPolicy",
          "iam:ListAttachedUserPolicies"
        ]
        Resource = aws_iam_user.additional_admin[0].arn
      },
      {
        Effect = "Allow"
        Action = [
          "iam:PassRole"
        ]
        Resource = [
          aws_iam_role.admin.arn,
          aws_iam_role.developer.arn
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "sts:AssumeRole"
        ]
        Resource = [
          aws_iam_role.admin.arn,
          aws_iam_role.developer.arn
        ]
      }
    ]
  })
}

# IAM Group for developers
resource "aws_iam_group" "developers" {
  name = "${var.project_name}-developers"
  path = "/"
}

# IAM Group Policy for developers
resource "aws_iam_group_policy" "developers" {
  name  = "${var.project_name}-developers-policy"
  group = aws_iam_group.developers.name

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "iam:CreateLoginProfile",
        "iam:UpdateLoginProfile",
        "iam:DeleteLoginProfile"
      ],
      "Resource": "arn:aws:iam::${data.aws_caller_identity.current.account_id}:user/$${aws:username}"
    },
    {
      "Effect": "Allow",
      "Action": [
        "iam:CreateAccessKey",
        "iam:DeleteAccessKey",
        "iam:ListAccessKeys",
        "iam:UpdateAccessKey"
      ],
      "Resource": "arn:aws:iam::${data.aws_caller_identity.current.account_id}:user/$${aws:username}"
    },
    {
      "Effect": "Allow",
      "Action": [
        "iam:AttachUserPolicy",
        "iam:DetachUserPolicy",
        "iam:ListAttachedUserPolicies"
      ],
      "Resource": "arn:aws:iam::${data.aws_caller_identity.current.account_id}:user/$${aws:username}"
    },
    {
      "Effect": "Allow",
      "Action": [
        "sts:AssumeRole"
      ],
      "Resource": "${aws_iam_role.developer.arn}"
    }
  ]
}
EOF
}

# Outputs for IAM resources
output "developer_role_arn" {
  description = "ARN of the developer IAM role"
  value       = aws_iam_role.developer.arn
}

output "admin_role_arn" {
  description = "ARN of the admin IAM role"
  value       = aws_iam_role.admin.arn
}

output "additional_admin_user_arn" {
  description = "ARN of the additional admin user (if created)"
  value       = var.create_additional_admin ? aws_iam_user.additional_admin[0].arn : "Not created"
}

output "developers_group_arn" {
  description = "ARN of the developers IAM group"
  value       = aws_iam_group.developers.arn
}

output "developer_role_assume_command" {
  description = "Command to assume developer role"
  value       = "aws sts assume-role --role-arn ${aws_iam_role.developer.arn} --role-session-name developer-session"
}

output "admin_role_assume_command" {
  description = "Command to assume admin role"
  value       = "aws sts assume-role --role-arn ${aws_iam_role.admin.arn} --role-session-name admin-session"
}
