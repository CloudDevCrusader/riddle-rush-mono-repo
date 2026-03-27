config {
  call_module_type = "all"
}

rule "terraform_unused_declarations" {
  enabled = false
}

rule "terraform_required_providers" {
  enabled = false
}
