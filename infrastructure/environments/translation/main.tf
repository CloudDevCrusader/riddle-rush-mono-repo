# Riddle Rush Translation Environment
#
# Hosts the Tolgee translation management UI on a cost-efficient EC2 instance.
# This config manages all AWS resources for translation.riddlerush.de.
# State is stored in S3 with DynamoDB locking.

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "riddle-rush-terraform-state-dev"
    key            = "translation/terraform.tfstate"
    region         = "eu-central-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock-dev"
  }
}



provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "riddle-rush"
      Environment = "translation"
      ManagedBy   = "Terraform"
    }
  }
}

locals {
  name_prefix            = "riddle-rush-translation"
  docker_compose_version = "v2.24.6"
}

# Find the latest Amazon Linux 2023 ARM64 AMI
data "aws_ami" "amazon_linux_arm" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-kernel-6.1-arm64"]
  }

  filter {
    name   = "architecture"
    values = ["arm64"]
  }
}

# SSH Key Pair
resource "aws_key_pair" "main" {
  key_name   = "${local.name_prefix}-key"
  public_key = var.ssh_public_key
}

# Security Group
resource "aws_security_group" "main" {
  name        = "${local.name_prefix}-sg"
  description = "Allow HTTPS, HTTP, and SSH ingress for Tolgee instance"

  ingress {
    from_port        = 443
    to_port          = 443
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  ingress {
    from_port        = 80
    to_port          = 80
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.ssh_allowed_cidr
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Elastic IP for a stable public address
resource "aws_eip" "main" {
  domain = "vpc"

  tags = {
    Name = "${local.name_prefix}-eip"
  }
}

# IAM Role and Instance Profile for SSM Session Manager
resource "aws_iam_role" "ec2_role" {
  name = "${local.name_prefix}-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ssm_policy" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "${local.name_prefix}-instance-profile"
  role = aws_iam_role.ec2_role.name
}

# The EC2 Instance
resource "aws_instance" "main" {
  ami                    = data.aws_ami.amazon_linux_arm.id
  instance_type          = var.instance_type
  key_name               = aws_key_pair.main.key_name
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name
  vpc_security_group_ids = [aws_security_group.main.id]

  user_data = templatefile("${path.module}/user-data.sh", {
    domain_name            = var.domain_name,
    tolgee_admin_password  = var.tolgee_admin_password,
    docker_compose_version = local.docker_compose_version
  })

  root_block_device {
    volume_size           = var.volume_size
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
  }

  tags = {
    Name = "${local.name_prefix}-instance"
  }
}

# Associate Elastic IP with the instance
resource "aws_eip_association" "main" {
  instance_id   = aws_instance.main.id
  allocation_id = aws_eip.main.id
}
