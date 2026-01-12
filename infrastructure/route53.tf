# Route53 Hosted Zone for riddlerush.de
resource "aws_route53_zone" "main" {
  name = "riddlerush.de"

  tags = {
    Name        = "riddlerush.de"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# CloudFront A Record (IPv4)
resource "aws_route53_record" "cloudfront_a" {
  count   = var.domain_name != "" ? 1 : 0
  zone_id = aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.website.domain_name
    zone_id                = aws_cloudfront_distribution.website.hosted_zone_id
    evaluate_target_health = false
  }
}

# CloudFront AAAA Record (IPv6)
resource "aws_route53_record" "cloudfront_aaaa" {
  count   = var.domain_name != "" ? 1 : 0
  zone_id = aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.website.domain_name
    zone_id                = aws_cloudfront_distribution.website.hosted_zone_id
    evaluate_target_health = false
  }
}
