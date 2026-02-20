---
phase: quick-003
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - infrastructure/environments/translation/main.tf
  - infrastructure/environments/translation/variables.tf
  - infrastructure/environments/translation/terraform.tfvars.example
  - infrastructure/environments/translation/outputs.tf
  - infrastructure/environments/translation/route53.tf
  - infrastructure/environments/translation/user-data.sh
  - infrastructure/environments/translation/README.md
  - apps/tolgee/README.md
  - package.json
autonomous: true

must_haves:
  truths:
    - 'Terraform config validates and plans without errors'
    - 'tflint passes without errors'
    - 'EC2 t4g.small instance with ARM/Graviton for cost efficiency'
    - "Caddy reverse proxy handles HTTPS via Let's Encrypt (no ACM/ALB needed)"
    - 'EBS gp3 20GB for persistent Tolgee/PostgreSQL data'
    - 'Route53 A record for translation.riddlerush.de pointing to Elastic IP'
    - 'Security group allows only 443, 80, 22 ingress'
    - 'User data script bootstraps Docker + Caddy + Tolgee automatically'
    - 'Estimated cost ~$14-16/month (EC2 + EBS + EIP)'
  artifacts:
    - path: 'infrastructure/environments/translation/main.tf'
      provides: 'EC2, EIP, Security Group, IAM instance profile'
    - path: 'infrastructure/environments/translation/route53.tf'
      provides: 'DNS A record for translation.riddlerush.de'
    - path: 'infrastructure/environments/translation/user-data.sh'
      provides: 'Bootstrap script for Docker + Caddy + Tolgee'
    - path: 'infrastructure/environments/translation/outputs.tf'
      provides: 'Instance IP, URL, SSH command outputs'
  key_links:
    - from: 'infrastructure/environments/translation/route53.tf'
      to: 'infrastructure/environments/development/route53.tf'
      via: 'Same Route53 zone (riddlerush.de)'
      pattern: 'aws_route53_zone.*riddlerush'
    - from: 'infrastructure/environments/translation/user-data.sh'
      to: 'apps/tolgee/docker-compose.yml'
      via: 'Same Tolgee Docker image and config pattern'
      pattern: 'tolgee/tolgee'
---

<objective>
Create Terraform infrastructure to host the Tolgee translation management UI on AWS.

Purpose: The Tolgee app (apps/tolgee/) currently only runs locally via Docker Compose. We need a
persistent, internet-accessible instance at https://translation.riddlerush.de so team members can
manage translations without running Docker locally.

Architecture:

- EC2 t4g.small (ARM/Graviton, 2 vCPU, 2GB RAM) — ~$14/mo
- Caddy reverse proxy with automatic Let's Encrypt HTTPS
- EBS gp3 20GB for persistent PostgreSQL data — ~$1.60/mo
- Elastic IP for stable DNS target
- Route53 A record: translation.riddlerush.de
- Security Group: 443 (HTTPS), 80 (HTTP/ACME), 22 (SSH)
- No ALB, no NAT Gateway, no ACM — simple and cost-efficient

State backend: Reuse the dev state bucket (riddle-rush-terraform-state-dev) with a
separate key path (translation/terraform.tfstate).

Output: Terraform config that validates, passes tflint, and is ready for `terraform apply`.
</objective>

<execution_context>
@./.opencode/get-shit-done/workflows/execute-plan.md
@./.opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@infrastructure/environments/development/main.tf
@infrastructure/environments/development/variables.tf
@infrastructure/environments/development/terraform.tfvars
@infrastructure/environments/development/route53.tf
@infrastructure/environments/development/outputs.tf
@infrastructure/environments/production/main.tf
@infrastructure/environments/production/variables.tf
@infrastructure/state-bucket/main.tf
@infrastructure/.gitignore
@infrastructure/.tflint.hcl
@apps/tolgee/docker-compose.yml
@apps/tolgee/config.yaml
@apps/tolgee/README.md
@package.json
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create Terraform config for translation environment</name>
  <files>
    infrastructure/environments/translation/main.tf,
    infrastructure/environments/translation/variables.tf,
    infrastructure/environments/translation/terraform.tfvars.example,
    infrastructure/environments/translation/outputs.tf,
    infrastructure/environments/translation/route53.tf,
    infrastructure/environments/translation/user-data.sh
  </files>
  <action>
  Create the full Terraform configuration under `infrastructure/environments/translation/`.

**main.tf** — Core infrastructure:

- terraform block: required_version >= 1.5.0, aws ~> 5.0 provider
- backend "s3": bucket = "riddle-rush-terraform-state-dev", key = "translation/terraform.tfstate",
  region = "eu-central-1", encrypt = true, dynamodb_table = "terraform-state-lock-dev"
- provider "aws" with default_tags: Project = "riddle-rush", Environment = "translation", ManagedBy = "Terraform"
- data "aws_caller_identity" for account ID
- locals block with name_prefix = "riddle-rush-translation"

Resources:

1. **aws_key_pair** — SSH key pair. Use a variable `ssh_public_key` for the public key content.
   Name: "${local.name_prefix}-key"

2. **aws_security_group** — Name: "${local.name_prefix}-sg"
   Ingress rules:
   - Port 443 (HTTPS) from 0.0.0.0/0 and ::/0
   - Port 80 (HTTP, for Let's Encrypt ACME + redirect) from 0.0.0.0/0 and ::/0
   - Port 22 (SSH) from var.ssh_allowed_cidr (default ["0.0.0.0/0"], user can restrict)
     Egress: all traffic (0.0.0.0/0)

3. **aws_eip** — Elastic IP for stable DNS. Name tag: "${local.name_prefix}-eip"

4. **aws_eip_association** — Associate EIP with EC2 instance.

5. **aws_iam_role** — Instance profile role for SSM Session Manager (optional SSH alternative).
   Name: "${local.name_prefix}-ec2-role"
   Attach AmazonSSMManagedInstanceCore policy.

6. **aws_iam_instance_profile** — Name: "${local.name_prefix}-profile"

7. **aws_instance** — The EC2 instance:
   - ami: Use data source `aws_ami` to find latest Amazon Linux 2023 ARM64 AMI
   - instance_type: var.instance_type (default "t4g.small")
   - key_name: aws_key_pair reference
   - vpc_security_group_ids: [security group]
   - iam_instance_profile: instance profile
   - user_data: file("${path.module}/user-data.sh") with templatefile for domain var
   - root_block_device: 20GB gp3, encrypted = true
   - Tags: Name = "${local.name_prefix}"
   - Associate public IP (or rely on EIP)

8. **data "aws_ami"** — Filter for Amazon Linux 2023 ARM64:
   - owners = ["amazon"]
   - filter: name = "al2023-ami-\*-arm64"
   - most_recent = true

**variables.tf** — All variables with descriptions, types, defaults:

- aws_region (default "eu-central-1")
- instance_type (default "t4g.small")
- domain_name (default "translation.riddlerush.de")
- ssh_public_key (sensitive, no default — required)
- ssh_allowed_cidr (default ["0.0.0.0/0"])
- tolgee_admin_password (sensitive, no default — required for user-data)
- volume_size (default 20)

**terraform.tfvars.example** — Example values (no secrets):

```
aws_region         = "eu-central-1"
instance_type      = "t4g.small"
domain_name        = "translation.riddlerush.de"
ssh_public_key     = "ssh-ed25519 AAAA... your-key"
ssh_allowed_cidr   = ["YOUR_IP/32"]
tolgee_admin_password = "change-me-to-a-strong-password"
```

**outputs.tf** — Useful outputs:

- instance_id, public_ip (EIP), url (https://translation.riddlerush.de)
- ssh_command ("ssh -i <key> ec2-user@<ip>")

**route53.tf** — DNS record:

- data "aws_route53_zone" for riddlerush.de (same pattern as dev/prod)
- aws_route53_record: A record, translation.riddlerush.de → EIP (NOT alias, just a plain A record with TTL 300)

**user-data.sh** — Bootstrap script (templated via templatefile):
The script should:

1. Update system packages (dnf update -y)
2. Install Docker (dnf install docker -y, systemctl enable/start docker)
3. Install Docker Compose plugin (mkdir -p /usr/local/lib/docker/cli-plugins, curl latest compose)
4. Install Caddy (copr repo + dnf install caddy)
5. Create /opt/tolgee directory structure
6. Create /opt/tolgee/docker-compose.yml with Tolgee container config:
   - Image: tolgee/tolgee:latest
   - Port: 127.0.0.1:8080:8080 (localhost only, Caddy fronts it)
   - Volume: /opt/tolgee/data:/data
   - Environment: tolgee.authentication.enabled=true,
     tolgee.authentication.initial-password=${tolgee_admin_password},
     tolgee.authentication.initial-username=admin
7. Create /etc/caddy/Caddyfile:
   ```
   translation.riddlerush.de {
     reverse_proxy localhost:8080
   }
   ```
8. Start Caddy (systemctl enable/start caddy)
9. Start Tolgee (docker compose -f /opt/tolgee/docker-compose.yml up -d)
10. Add ec2-user to docker group

Use `templatefile()` in main.tf to pass domain_name and tolgee_admin_password into the script.
</action>
<verify>

1. All .tf files have correct HCL syntax: `terraform fmt -check` passes
2. `terraform validate` passes (after `terraform init`)
3. `tflint` passes without errors
4. user-data.sh is a valid bash script (shellcheck if available, or manual review)
5. No hardcoded secrets in any committed file
   </verify>
   <done>
   All Terraform files exist, validate, pass fmt and tflint checks. No secrets in committed files.
   </done>
   </task>

<task type="auto">
  <name>Task 2: Add README and npm scripts for translation infrastructure</name>
  <files>
    infrastructure/environments/translation/README.md,
    apps/tolgee/README.md,
    package.json
  </files>
  <action>
  1. **Create infrastructure/environments/translation/README.md** with:
     - Purpose: Hosts Tolgee translation management at https://translation.riddlerush.de
     - Architecture diagram (text-based)
     - Prerequisites: AWS CLI configured, SSH key pair, Terraform >= 1.5
     - Setup steps: copy tfvars.example → terraform.tfvars, fill in values, terraform init, plan, apply
     - Post-deploy: SSH in, check logs, access URL
     - Cost breakdown (~$14-16/mo)
     - Maintenance: How to update Tolgee (SSH, docker compose pull, up -d)
     - Teardown: terraform destroy

2. **Update apps/tolgee/README.md**:
   - Add a "Production Instance" section noting https://translation.riddlerush.de
   - Mention the infrastructure lives at infrastructure/environments/translation/
   - Keep existing local development instructions

3. **Add npm scripts to root package.json**:
   - "infra:translation:init": "cd infrastructure/environments/translation && terraform init"
   - "infra:translation:plan": "cd infrastructure/environments/translation && terraform plan"
   - "infra:translation:apply": "cd infrastructure/environments/translation && terraform apply"
   - "infra:validate:translation": "cd infrastructure/environments/translation && terraform validate"
     </action>
     <verify>
4. README files are well-formatted markdown
5. npm scripts are valid JSON in package.json
6. `pnpm run infra:validate:translation` would work (correct path)
   </verify>
   <done>
   README created, Tolgee README updated with production URL, npm scripts added for translation infra.
   </done>
   </task>

<task type="auto">
  <name>Task 3: Validate Terraform config end-to-end</name>
  <files>infrastructure/environments/translation/</files>
  <action>
  Run full validation on the translation environment:

1. `terraform fmt -check infrastructure/environments/translation/` — formatting
2. `cd infrastructure/environments/translation && terraform init` — initialize providers
3. `cd infrastructure/environments/translation && terraform validate` — syntax/logic validation
4. `cd infrastructure/environments/translation && tflint` — linting

Fix any issues found during validation.
</action>
<verify>
All four commands pass with exit code 0 and no warnings.
</verify>
<done>
Terraform init, validate, fmt -check, and tflint all pass cleanly.
</done>
</task>

<task type="checkpoint:human-verify">
  <name>Task 4: Review Terraform config before committing</name>
  <action>
  Present the complete Terraform configuration for user review before committing.
  Show: file list, key architectural decisions, estimated cost, what happens on `terraform apply`.
  </action>
</task>

<task type="auto">
  <name>Task 5: Commit and push</name>
  <files>all modified files</files>
  <action>
  Stage all new/modified files and commit:

```
feat(infra): add Terraform config to host Tolgee on AWS EC2

- EC2 t4g.small (ARM) with Caddy reverse proxy + Let's Encrypt
- Route53 A record for translation.riddlerush.de
- EBS gp3 20GB for persistent Tolgee data
- User data script bootstraps Docker + Caddy + Tolgee
- Estimated cost: ~$14-16/month
```

Push to current branch.
</action>
<verify>
`git log -1 --oneline` shows the new commit.
`git status` shows clean working tree.
</verify>
<done>
All changes committed and pushed.
</done>
</task>

</tasks>

<verification>
1. All .tf files pass `terraform fmt -check`
2. `terraform init` succeeds
3. `terraform validate` passes
4. `tflint` passes
5. No secrets in committed files (terraform.tfvars is gitignored)
6. npm scripts reference correct paths
7. READMEs are accurate and complete
</verification>

<success_criteria>

- Terraform configuration validates and is ready for `terraform apply`
- tflint passes without errors
- Route53 record targets Elastic IP for translation.riddlerush.de
- User data script installs Docker + Caddy + Tolgee end-to-end
- Cost-efficient: no ALB, no NAT Gateway, no ACM (~$14-16/mo)
- npm scripts added for init/plan/apply
- READMEs updated with production instance info
- All changes committed and pushed
  </success_criteria>

<output>
After completion, create `.planning/quick/003-host-tolgee-on-aws-ec2/003-SUMMARY.md`
</output>
