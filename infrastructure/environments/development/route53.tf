# Route53 records for the development environment

data "aws_route53_zone" "main" {
  name         = "riddlerush.de"
  private_zone = false
}

locals {
  # Support both domain_name (backward compatibility) and domain_names
  domain_names_list = length(var.domain_names) > 0 ? var.domain_names : (var.domain_name != "" ? [var.domain_name] : [])
  create_dns_records = length(local.domain_names_list) > 0
}

resource "aws_route53_record" "cloudfront_a" {
  count   = local.create_dns_records ? length(local.domain_names_list) : 0
  zone_id = data.aws_route53_zone.main.zone_id
  name    = local.domain_names_list[count.index]
  type    = "A"

  alias {
    name                   = module.cloudfront.distribution_domain_name
    zone_id                = module.cloudfront.distribution_hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "cloudfront_aaaa" {
  count   = local.create_dns_records ? length(local.domain_names_list) : 0
  zone_id = data.aws_route53_zone.main.zone_id
  name    = local.domain_names_list[count.index]
  type    = "AAAA"

  alias {
    name                   = module.cloudfront.distribution_domain_name
    zone_id                = module.cloudfront.distribution_hosted_zone_id
    evaluate_target_health = false
  }
}
