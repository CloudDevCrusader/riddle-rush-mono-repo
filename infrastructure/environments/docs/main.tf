# Docs Environment (S3 + CloudFront)

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = "docs"
      ManagedBy   = "Terraform"
    }
  }
}

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = "docs"
      ManagedBy   = "Terraform"
    }
  }
}

data "aws_route53_zone" "main" {
  name         = "riddlerush.de"
  private_zone = false
}

module "s3_website" {
  source = "../../modules/s3-website"

  bucket_name = var.bucket_name
  environment = "docs"
}

resource "aws_acm_certificate" "docs" {
  provider          = aws.us_east_1
  domain_name       = var.domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "docs_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.docs.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      record = dvo.resource_record_value
    }
  }

  zone_id = data.aws_route53_zone.main.zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = 300
  records = [each.value.record]
}

resource "aws_acm_certificate_validation" "docs" {
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.docs.arn
  validation_record_fqdns = [for record in aws_route53_record.docs_cert_validation : record.fqdn]
}

module "cloudfront_enhanced" {
  source = "../../modules/cloudfront-enhanced"

  bucket_regional_domain_name = module.s3_website.bucket_regional_domain_name
  bucket_arn                  = module.s3_website.bucket_arn
  environment                 = "docs"
  domain_names                = [var.domain_name]
  certificate_arn             = aws_acm_certificate_validation.docs.certificate_arn
  price_class                 = var.cloudfront_price_class
}

resource "aws_route53_record" "docs_a" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = module.cloudfront_enhanced.distribution_domain_name
    zone_id                = module.cloudfront_enhanced.distribution_hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "docs_aaaa" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "AAAA"

  alias {
    name                   = module.cloudfront_enhanced.distribution_domain_name
    zone_id                = module.cloudfront_enhanced.distribution_hosted_zone_id
    evaluate_target_health = false
  }
}
