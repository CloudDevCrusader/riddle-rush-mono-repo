# Route53 records for the translation environment

data "aws_route53_zone" "main" {
  name         = "riddlerush.de"
  private_zone = false
}

resource "aws_route53_record" "a_record" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "A"
  ttl     = 300
  records = [aws_eip.main.public_ip]
}
