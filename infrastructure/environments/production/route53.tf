# Route53 records for the production environment

data "aws_route53_zone" "main" {
  name         = "riddlerush.de"
  private_zone = false
}

locals {
  create_dns_records = var.domain_name != ""
}

resource "aws_route53_record" "cloudfront_a" {
  count   = local.create_dns_records ? 1 : 0
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = module.blue_green.cloudfront_domain_name
    zone_id                = module.blue_green.cloudfront_hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "cloudfront_aaaa" {
  count   = local.create_dns_records ? 1 : 0
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "AAAA"

  alias {
    name                   = module.blue_green.cloudfront_domain_name
    zone_id                = module.blue_green.cloudfront_hosted_zone_id
    evaluate_target_health = false
  }
}