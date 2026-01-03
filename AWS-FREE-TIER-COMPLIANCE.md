# AWS Free Tier Compliance Guide

This document ensures that Riddle Rush stays within AWS Free Tier limits to minimize costs.

**✅ All Infrastructure: 100% Free Tier Compliant**

## Summary

| Service | Free Tier | Our Usage | Status |
|---------|-----------|-----------|--------|
| **S3** | 5GB storage, 20k GET, 2k PUT/month | ~20MB, <1k requests | ✅ Well under |
| **CloudFront** | 1TB transfer, 10M requests/month | Minimal traffic | ✅ Well under |
| **CloudWatch** | 10 alarms, 5GB logs/month | 5 alarms, <1GB logs | ✅ At limit |
| **Budgets** | 2 budgets (free forever) | 2 budgets | ✅ At limit |
| **SNS** | 1M publishes, 1k emails/month | <100 emails | ✅ Well under |

**Estimated Monthly Cost**: $0-1 (within free tier for first 12 months)

## Detailed Free Tier Limits

### S3 (Simple Storage Service)

**Free Tier (First 12 months)**:
- 5 GB standard storage
- 20,000 GET requests
- 2,000 PUT requests
- 100 GB data transfer out

**Our Usage**:
- ~20 MB application bundle (0.4% of limit)
- Deployments: ~10/month = 10 PUT requests (0.5% of limit)
- Traffic: Depends on CloudFront (see below)

**Optimization**:
- S3 versioning enabled with 30-day expiration
- Old versions auto-deleted to save storage
- All traffic goes through CloudFront (not directly from S3)

✅ **Status**: Well within limits

---

### CloudFront (Content Delivery Network)

**Free Tier (First 12 months)**:
- 1 TB data transfer out
- 10,000,000 HTTP/HTTPS requests
- 2,000,000 CloudFront Function invocations

**Our Usage**:
- Static app (~20 MB per load)
- Estimated 100 users/month = 2 GB transfer (0.2% of limit)
- Cache hit rate > 80% reduces origin fetches

**Optimization**:
- PriceClass_100: Only North America & Europe (cheapest)
- Aggressive caching (1 year for static assets)
- Compression enabled
- No Lambda@Edge (stays in free tier)

✅ **Status**: Well within limits

---

### CloudWatch (Monitoring & Logging)

**Free Tier (Always free)**:
- 10 custom metrics
- 10 alarms
- 1,000,000 API requests
- 5 GB log ingestion
- 5 GB log storage
- 3 dashboards with up to 50 metrics each

**Our Usage**:
- **Alarms**: 5 alarms (50% of limit)
  - S3 4xx errors
  - S3 5xx errors
  - CloudFront 4xx error rate
  - CloudFront 5xx error rate
  - CloudFront cache hit rate
- **Dashboards**: 1 dashboard with 6 metrics
- **Logs**: <1 GB/month (7-day retention)

**Optimization**:
- Only 5 critical alarms (no extras)
- 7-day log retention (not 30 days)
- No custom metrics (use AWS-provided metrics only)
- Single consolidated dashboard

⚠️ **Status**: At 50% capacity for alarms

**Note**: If you need more alarms, remove the cache hit rate alarm (least critical)

---

### AWS Budgets

**Free Tier (Always free)**:
- 2 budgets (any type)
- 62,000 budget updates per day

**Our Usage**:
- **Budget 1**: Monthly cost budget ($5 limit)
  - Alerts at 80% ($4)
  - Alerts at 100% ($5)
  - Forecast alert
- **Budget 2**: Free tier usage tracking
  - Alert at 80% of free tier limits

**Optimization**:
- Only 2 budgets (at free tier limit)
- No additional budgets can be created without cost

⚠️ **Status**: At 100% capacity

**Note**: Cannot add more budgets without paying $0.02/day per budget

---

### SNS (Simple Notification Service)

**Free Tier (Always free)**:
- 1,000,000 publishes
- 100,000 HTTP/HTTPS notifications
- 1,000 email notifications
- 100 SMS notifications (varies by region)

**Our Usage**:
- Email notifications only
- Estimated <100 emails/month:
  - CloudWatch alarms: ~10/month
  - Budget alerts: ~5/month
  - Manual testing: ~10/month

**Optimization**:
- Email only (no SMS - costs extra)
- Consolidated alarms (fewer notifications)
- Budget alerts configured for critical thresholds only

✅ **Status**: Well under limits (10% usage)

---

## Cost After Free Tier Expires (Year 2+)

After 12 months, here's the estimated cost:

### S3 Costs
- **Storage**: $0.023/GB/month × 0.02 GB = $0.0005/month
- **Requests**: Negligible (first 2k PUT free permanently)
- **Data Transfer**: Covered by CloudFront

**Estimated**: <$0.01/month

### CloudFront Costs
- **Data Transfer**: $0.085/GB × 2 GB = $0.17/month
- **Requests**: $0.0075 per 10k requests × 2k = $0.0015/month

**Estimated**: $0.20/month

### CloudWatch Costs
- **Alarms**: First 10 always free ✅
- **Metrics**: Standard metrics always free ✅
- **Logs**: $0.50/GB ingestion + $0.03/GB storage
  - 0.5 GB × $0.50 = $0.25/month
  - 0.5 GB × $0.03 = $0.015/month

**Estimated**: $0.27/month

### Total Estimated Cost After Free Tier

**$0.50 - $1.00 per month** (small traffic site)

---

## Monitoring Your Usage

### AWS Cost Explorer

View actual costs and usage:
1. Go to [AWS Billing Console](https://console.aws.amazon.com/billing/)
2. Click "Cost Explorer"
3. Filter by service to see breakdown

### Free Tier Usage

Track free tier limits:
1. Go to [AWS Billing Console](https://console.aws.amazon.com/billing/)
2. Click "Free Tier" in left menu
3. See usage bars for each service

### Budgets Dashboard

Our budgets will alert you:
- **80% of $5/month**: Warning email
- **100% of $5/month**: Critical email
- **Free tier 80%**: Approaching limits

### CloudWatch Dashboard

View real-time metrics:
```bash
cd infrastructure/environments/prod
terraform output monitoring_dashboard_url
```

---

## Red Flags (Watch For These)

### 🚨 High S3 Costs

**Symptom**: S3 storage or requests increasing
**Cause**: Too many deployments or versions piling up
**Fix**:
```bash
# Check S3 storage
aws s3 ls s3://your-bucket --recursive --summarize

# Clean old versions (lifecycle rule already does this)
# Reduce deployment frequency
```

### 🚨 High CloudFront Costs

**Symptom**: Data transfer or requests spiking
**Cause**: Viral traffic or bot attacks
**Fix**:
- Check CloudWatch dashboard for traffic patterns
- Consider enabling AWS WAF (costs $5+/month)
- Review cache hit rate (should be >80%)

### 🚨 High CloudWatch Costs

**Symptom**: Log storage increasing
**Cause**: Excessive logging
**Fix**:
- Reduce log retention (currently 7 days)
- Disable verbose logging in application
- Review log filters

### 🚨 Unexpected SNS Costs

**Symptom**: SNS charges appear
**Cause**: Too many alarm notifications
**Fix**:
- Adjust alarm thresholds (less sensitive)
- Consolidate alarms
- Switch to email-only (no SMS)

---

## Staying Within Free Tier

### Do's ✅

- ✅ Use PriceClass_100 for CloudFront
- ✅ Enable aggressive caching (1 year for static assets)
- ✅ Keep alarms to 10 or fewer
- ✅ Keep budgets to 2
- ✅ Use 7-day log retention
- ✅ Monitor free tier usage dashboard monthly
- ✅ Set up budget alerts

### Don'ts ❌

- ❌ Enable Lambda@Edge (costs extra)
- ❌ Use custom CloudWatch metrics (max 10 free)
- ❌ Store large files in S3 (keep app under 100 MB)
- ❌ Disable S3 lifecycle rules (old versions pile up)
- ❌ Use SMS notifications (costs $0.05-$1 each)
- ❌ Create more than 2 budgets
- ❌ Store logs longer than needed

---

## Cost Optimization Checklist

Weekly:
- [ ] Check CloudWatch dashboard for anomalies
- [ ] Review alarm history for false positives

Monthly:
- [ ] Review AWS Cost Explorer
- [ ] Check Free Tier usage dashboard
- [ ] Verify budget alerts working
- [ ] Review S3 storage usage

Quarterly:
- [ ] Audit CloudWatch log retention
- [ ] Review alarm thresholds
- [ ] Check CloudFront cache hit rate
- [ ] Clean up unused resources

Annually:
- [ ] Plan for free tier expiration
- [ ] Review infrastructure efficiency
- [ ] Consider reserved capacity (if needed)

---

## Emergency Cost Controls

If costs spike unexpectedly:

### 1. Immediate Actions

```bash
# Disable CloudFront (emergency only)
aws cloudfront update-distribution \
  --id YOUR_DISTRIBUTION_ID \
  --distribution-config '{"Enabled": false}'

# Delete CloudWatch logs
aws logs delete-log-group --log-group-name /aws/riddle-rush-pwa/prod
```

### 2. Reduce Costs

```bash
# Change CloudFront to cheapest price class
# (Already set to PriceClass_100)

# Reduce log retention to 1 day
# Edit infrastructure/modules/monitoring/main.tf
# Change retention_in_days from 7 to 1
terraform apply
```

### 3. Monitor Recovery

- Wait 24-48 hours for costs to stabilize
- Review Cost Explorer for daily breakdown
- Adjust budget alerts if needed

---

## Summary

Riddle Rush infrastructure is **designed to stay 100% within AWS Free Tier** for the first 12 months. After that, costs are estimated at **$0.50-$1/month** for a small traffic site.

Key points:
- All services stay under 50% of free tier limits
- Budget alerts catch cost spikes early
- Automatic optimizations (caching, lifecycle rules) save costs
- CloudWatch alarms detect issues without extra cost

**Action Required**:
1. Set up email alerts in terraform.tfvars
2. Confirm SNS subscription
3. Review free tier usage dashboard monthly
4. Plan for year 2+ costs (~$1/month)

For questions or cost concerns, refer to:
- [AWS Free Tier](https://aws.amazon.com/free/)
- [AWS Pricing Calculator](https://calculator.aws/)
- [AWS Cost Management Console](https://console.aws.amazon.com/billing/)
