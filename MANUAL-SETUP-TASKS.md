# Manual Setup Tasks

This document lists all tasks that need to be completed manually to finish the infrastructure setup.

**Status**: ✅ All automated work is complete. Follow the steps below to activate monitoring and deployment.

---

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] AWS Account with admin access
- [ ] AWS CLI installed and configured (`aws configure`)
- [ ] Terraform installed (≥ 1.5.0) - See `infrastructure/README.md`
- [ ] Git repository is clean (commit any changes)
- [ ] Email address for receiving AWS alerts

---

## Part 1: AWS Monitoring Setup (5-10 minutes)

### Step 1: Configure Terraform Variables

```bash
cd infrastructure/environments/prod

# Copy example configuration
cp terraform.tfvars.example terraform.tfvars

# Edit with your values
nano terraform.tfvars  # or use your preferred editor
```

**Required Configuration**:

```terraform
# Set your email for alerts
alert_email = "your-email@example.com"

# Set budget limit (defaults to $5/month)
monthly_budget_limit = "5.00"

# Enable free tier tracking
track_free_tier = true

# Optional: If you have an existing S3 bucket from aws-deploy.sh
bucket_name = ""  # Leave empty to auto-generate
```

**Important**: Replace `"your-email@example.com"` with your actual email!

### Step 2: Initialize Terraform

**Option A: With Remote State (Recommended for Production)**

Create `backend.hcl`:
```bash
nano backend.hcl
```

Add (replace with your values):
```hcl
bucket         = "your-terraform-state-bucket"
key            = "riddle-rush-pwa/prod/terraform.tfstate"
region         = "eu-central-1"
dynamodb_table = "terraform-state-locks"
encrypt        = true
```

Initialize:
```bash
terraform init -backend-config=backend.hcl
```

**Option B: With Local State (Testing/Development)**

```bash
terraform init -backend=false
```

⚠️ **Note**: Local state is NOT recommended for production. Use remote state for team collaboration.

### Step 3: Review and Apply

```bash
# Review what will be created
terraform plan

# Apply the infrastructure
terraform apply
```

**Expected Resources**:
- 5 CloudWatch alarms
- 1 SNS topic (email notifications)
- 1 CloudWatch dashboard
- 1 CloudWatch log group
- 2 AWS Budgets
- S3 bucket (if not existing)
- CloudFront distribution
- Origin Access Control

**Estimated Apply Time**: 3-5 minutes

### Step 4: Confirm Email Subscription

**CRITICAL**: You won't receive alerts until you confirm!

1. Check your email inbox (including spam folder)
2. Look for email from: `AWS Notifications <no-reply@sns.amazonaws.com>`
3. Subject: "AWS Notification - Subscription Confirmation"
4. Click the **"Confirm subscription"** link

✅ You should see: "Subscription confirmed!"

### Step 5: Verify Setup

```bash
# Get dashboard URL
terraform output monitoring_dashboard_url

# Get SNS topic ARN (for verification)
terraform output sns_topic_arn

# Get all setup instructions
terraform output setup_instructions
```

Open the dashboard URL in your browser to view metrics.

---

## Part 2: Application Deployment (5 minutes)

### Step 6: Deploy Application to AWS

```bash
# Navigate to project root
cd /home/cloudcrusader/projects/riddle-rush-nuxt-pwa

# Export Terraform outputs
export AWS_S3_BUCKET=$(cd infrastructure/environments/prod && terraform output -raw bucket_name)
export AWS_CLOUDFRONT_ID=$(cd infrastructure/environments/prod && terraform output -raw cloudfront_distribution_id)
export AWS_REGION=eu-central-1

# Build and deploy
./aws-deploy.sh production
```

**Expected Output**:
- Nuxt static site generated
- Files uploaded to S3
- CloudFront cache invalidated
- Deployment summary with URL

### Step 7: Verify Deployment

```bash
# Get website URL
cd infrastructure/environments/prod
terraform output website_url
```

Open the URL in a browser and verify the app loads correctly.

---

## Part 3: Post-Deployment Verification (5 minutes)

### Step 8: Check CloudWatch Dashboard

1. Open the dashboard URL from `terraform output monitoring_dashboard_url`
2. Verify metrics are appearing:
   - CloudFront requests
   - S3 operations
   - Error rates (should be low or zero)
   - Cache hit rate (will build up over time)

**Note**: Some metrics may show "No data" initially. Wait 5-10 minutes after deployment for data to appear.

### Step 9: Test Alert System

**Option A: Manual Test (Recommended)**

```bash
# Send a test notification
aws sns publish \
  --topic-arn $(cd infrastructure/environments/prod && terraform output -raw sns_topic_arn) \
  --subject "Test Alert - Riddle Rush Monitoring" \
  --message "This is a test notification to verify your alert system is working correctly."
```

Check your email for the test message.

**Option B: Trigger a Real Alarm (Advanced)**

Temporarily set alarm threshold very low, wait for alarm to trigger, then reset.

### Step 10: Review Budget Alerts

1. Go to [AWS Budgets Console](https://console.aws.amazon.com/billing/home#/budgets)
2. Verify two budgets are created:
   - Monthly cost budget ($5 limit)
   - Free tier tracking budget
3. Check alert configuration (80% and 100% thresholds)

---

## Part 4: Environment-Specific Setups (Optional)

### For Staging Environment

```bash
cd infrastructure/environments/staging

# Create terraform.tfvars with staging email
cp ../../environments/prod/terraform.tfvars.example terraform.tfvars
nano terraform.tfvars  # Set staging-specific values

# Initialize and apply
terraform init -backend-config=backend.hcl  # or -backend=false
terraform plan
terraform apply
```

### For Development Environment

```bash
cd infrastructure/environments/development

# Similar process as staging
cp ../../environments/prod/terraform.tfvars.example terraform.tfvars
nano terraform.tfvars

terraform init -backend-config=backend.hcl  # or -backend=false
terraform plan
terraform apply
```

---

## Troubleshooting

### Email Not Received

**Problem**: Didn't receive SNS subscription email

**Solutions**:
1. Check spam/junk folder
2. Verify email in `terraform.tfvars` is correct
3. Re-run `terraform apply` to re-send
4. Check AWS SNS Console → Topics → Subscriptions

### Alarms in INSUFFICIENT_DATA State

**Problem**: Alarms show "INSUFFICIENT_DATA"

**Solution**: This is normal! Alarms need traffic to evaluate.
- Deploy the application
- Wait 5-10 minutes for metrics to populate
- Alarms will transition to "OK" or "ALARM" based on data

### Budget Alerts Not Working

**Problem**: Not receiving budget alerts

**Solutions**:
1. Confirm SNS subscription first (see Email Not Received)
2. Wait 24 hours - budgets take time to activate
3. Verify budget thresholds in AWS Console

### Terraform State Conflicts

**Problem**: "Error acquiring the state lock"

**Solutions**:
1. Wait for other operations to complete
2. Check DynamoDB for stuck locks
3. Force unlock (last resort): `terraform force-unlock <LOCK_ID>`

### High AWS Costs

**Problem**: Costs exceeding free tier

**Solutions**:
1. Check CloudWatch dashboard for traffic spikes
2. Review S3 storage usage
3. Check CloudFront data transfer
4. See `AWS-FREE-TIER-COMPLIANCE.md` for emergency controls

---

## Maintenance Schedule

### Weekly
- [ ] Check CloudWatch dashboard for anomalies
- [ ] Review alarm history in AWS Console

### Monthly
- [ ] Review AWS Cost Explorer
- [ ] Check Free Tier usage dashboard
- [ ] Verify budget alerts are working
- [ ] Review S3 storage usage

### Quarterly
- [ ] Audit CloudWatch log retention
- [ ] Review alarm thresholds (adjust if needed)
- [ ] Check CloudFront cache hit rate
- [ ] Clean up unused resources

### Annually
- [ ] Plan for free tier expiration (after 12 months)
- [ ] Review infrastructure efficiency
- [ ] Consider reserved capacity if traffic grows

---

## Quick Reference

### Useful Commands

```bash
# View all outputs
cd infrastructure/environments/prod
terraform output

# Get specific output
terraform output -raw bucket_name
terraform output -raw cloudfront_distribution_id
terraform output monitoring_dashboard_url

# Deploy application
export AWS_S3_BUCKET=$(terraform output -raw bucket_name)
export AWS_CLOUDFRONT_ID=$(terraform output -raw cloudfront_distribution_id)
cd ../../..
./aws-deploy.sh production

# Check AWS account
aws sts get-caller-identity

# List S3 buckets
aws s3 ls

# Check CloudFront distributions
aws cloudfront list-distributions --query "DistributionList.Items[].{ID:Id,Status:Status,DomainName:DomainName}" --output table
```

### Important URLs

- **CloudWatch Console**: https://console.aws.amazon.com/cloudwatch/home?region=eu-central-1
- **S3 Console**: https://s3.console.aws.amazon.com/s3/buckets/
- **CloudFront Console**: https://console.aws.amazon.com/cloudfront/v3/home
- **Budgets Console**: https://console.aws.amazon.com/billing/home#/budgets
- **Free Tier Dashboard**: https://console.aws.amazon.com/billing/home#/freetier

---

## Security Checklist

- [ ] `terraform.tfvars` is git-ignored (contains email)
- [ ] `backend.hcl` is git-ignored (contains state bucket)
- [ ] AWS credentials are not committed to git
- [ ] S3 bucket has public access blocked
- [ ] CloudFront uses HTTPS only
- [ ] SNS email subscription is confirmed
- [ ] Budget alerts are configured correctly

---

## Cost Summary

### First 12 Months (Free Tier)
- **S3**: $0 (well under 5GB limit)
- **CloudFront**: $0 (well under 1TB limit)
- **CloudWatch**: $0 (using 5 of 10 free alarms)
- **Budgets**: $0 (2 budgets are always free)
- **SNS**: $0 (well under 1000 emails/month)

**Total**: $0-1/month

### After Free Tier Expires (Year 2+)
- **S3**: ~$0.01/month
- **CloudFront**: ~$0.20/month
- **CloudWatch**: ~$0.27/month (logs)
- **Budgets**: $0 (always free)
- **SNS**: $0 (well under limits)

**Total**: ~$0.50-1.00/month

See `AWS-FREE-TIER-COMPLIANCE.md` for detailed breakdown.

---

## Next Steps After Setup

1. ✅ **Monitor for 1 week**
   - Check dashboard daily
   - Verify alarms work correctly
   - Watch for cost increases

2. ✅ **Set up staging environment** (optional)
   - Copy prod configuration
   - Lower budget limits ($2/month)
   - Test before production changes

3. ✅ **Document custom domain setup** (if needed)
   - Request ACM certificate
   - Update `terraform.tfvars` with domain
   - Configure DNS (Route53 or external)

4. ✅ **Set up GitLab CI/CD** (optional)
   - Automate Terraform deployments
   - Add E2E tests to pipeline
   - Integrate with deployment scripts

5. ✅ **Review documentation**
   - Read `CLEANUP-SUMMARY.md` for full context
   - Read `AWS-FREE-TIER-COMPLIANCE.md` for cost details
   - Read `infrastructure/README.md` for infrastructure guide

---

## Support Resources

- **Terraform AWS Provider Docs**: https://registry.terraform.io/providers/hashicorp/aws/latest/docs
- **AWS Free Tier**: https://aws.amazon.com/free/
- **CloudWatch Pricing**: https://aws.amazon.com/cloudwatch/pricing/
- **Project Documentation**: See `docs/` directory
- **Cleanup Summary**: See `CLEANUP-SUMMARY.md`

---

## Summary

**What You Need to Do**:

1. **Configure** `terraform.tfvars` with your email (2 min)
2. **Apply** Terraform infrastructure (5 min)
3. **Confirm** SNS email subscription (1 min)
4. **Deploy** application to AWS (3 min)
5. **Verify** dashboard and alerts (2 min)

**Total Time**: ~15 minutes

**After Completion**:
- ✅ Monitoring active with 5 CloudWatch alarms
- ✅ Budget alerts preventing surprise costs
- ✅ Email notifications for all critical events
- ✅ Real-time dashboard for metrics
- ✅ 100% free tier compliant infrastructure
- ✅ Application deployed and accessible

**Questions?** Review the documentation or check the troubleshooting section above.
