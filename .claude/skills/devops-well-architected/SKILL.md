---
name: devops-well-architected
description: Ensure operational site readiness, cost efficiency, scalability, and AWS Well-Architected alignment. Use for DevOps reviews, production readiness checks, reliability/performance/security/cost audits, scaling plans, or Well-Architected framework assessments.
---

# DevOps Well-Architected Ops

## Goals

- Verify operational readiness for the target environment.
- Identify Well-Architected gaps and cost risks.
- Produce actionable, prioritized next steps.

## Workflow

1. Confirm scope and constraints.

- Target environment (dev/staging/prod), AWS account, region.
- Availability/SLO targets, budget limits, traffic expectations.
- Access method (read-only role preferred).

2. Collect evidence from repo and infra.

- Find infra as code: Terraform, CloudFormation, CDK, Serverless, Docker, K8s.
- Review deployment and validation scripts in `scripts/`.
- Identify monitoring/logging configs and alerting definitions.
- Prefer repo-provided scripts when safe (read-only):
  - `scripts/check-deployment-status.sh`
  - `scripts/terraform-plan.sh`
  - `scripts/check-secrets.sh`

## CDN Guidance

- Use Vercel as the CDN provider.
- Define CDN configuration in IaC (edge caching, headers, redirects).

## Terraform Review

- Locate root modules and workspaces.
- Review providers, backend state, and locking.
- Validate `terraform plan` for drift and unexpected changes.
- Check for hard-coded secrets or missing variable validation.
- Verify environment separation (dev/prod) and tagging standards.
- Require separate AWS accounts for dev and prod.
- Use named IAM roles (no root user) and role assumption for CI and humans.
- Prefer Terratest for module validation and environment smoke tests.

3. Evaluate AWS Well-Architected pillars.

- Operational Excellence: runbooks, alarms, dashboards, incident response.
- Security: IAM least privilege, secrets handling, encryption at rest/in transit.
- Reliability: health checks, multi-AZ, backups, DR, error budgets.
- Performance Efficiency: autoscaling, caching, load tests, right-sizing.
- Cost Optimization: idle resources, lifecycle policies, budgets/alerts.
- Sustainability: resource efficiency and elimination of waste.

4. Produce output.

- Risks with severity and evidence.
- Recommendations ordered by impact and effort.
- Concrete next actions (plan or execute).

## Decision Rules

- If infra drift is detected, prioritize reconciliation plan.
- If monitoring or alerting is absent, prioritize baseline alarms and dashboards.
- If costs are high or unknown, prioritize cost visibility and top spend analysis.

## Data Needed (ask only if missing)

- AWS account and region.
- Target environment and deployment model.
- Traffic profile and expected growth.
- Budget limits and SLA/SLO targets.
- Access method (read-only role, if available).
- Dev/prod account IDs and role names.

## AWS CLI Checks (if access is granted)

- `aws sts get-caller-identity`
- `aws cloudwatch describe-alarms`
- `aws budgets describe-budgets`
- `aws autoscaling describe-auto-scaling-groups`
- `aws elbv2 describe-load-balancers`
- `aws rds describe-db-instances`
- `aws s3api list-buckets`
- `aws ce get-cost-and-usage`

## Output Format

- Summary (1-2 lines)
- Risks (bullets, severity)
- Recommendations (ordered)
- Next actions (execute plan or create plan)
