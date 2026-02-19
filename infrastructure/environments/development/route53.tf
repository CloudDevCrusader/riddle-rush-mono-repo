# Route53 records for the development environment

data "aws_route53_zone" "main" {
  name         = "riddlerush.de"
  private_zone = false
}

locals {
  create_dns_records = length(var.domain_names) > 0
}

resource "aws_route53_record" "cloudfront_a" {
  count   = local.create_dns_records ? length(var.domain_names) : 0
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.domain_names[count.index]
  type    = "A"

  alias {
    name                   = module.cloudfront.distribution_domain_name
    zone_id                = module.cloudfront.distribution_hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "cloudfront_aaaa" {
  count   = local.create_dns_records ? length(var.domain_names) : 0
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.domain_names[count.index]
  type    = "AAAA"

  alias {
    name                   = module.cloudfront.distribution_domain_name
    zone_id                = module.cloudfront.distribution_hosted_zone_id
    evaluate_target_health = false
  }
}

# Vercel Preview CNAME Record
resource "aws_route53_record" "vercel_preview" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "preview.riddlerush.de"
  type    = "CNAME"
  ttl     = 300

  records = ["50acc2bfd3cce33f.vercel-dns-017.com"]
}
