# Deployment Verification

## Overview

This document explains how deployment failures are detected and how E2E tests verify deployments.

## E2E Test Integration

The `aws-deploy.sh` script now includes automatic E2E test verification for local deployments.

### How It Works

1. **After successful deployment**, the script automatically:
   - Verifies the site is reachable (HTTP 200/301/302)
   - Waits 15 seconds for CloudFront cache invalidation
   - Runs Playwright E2E tests against the deployed CloudFront URL
   - Exits with error if tests fail

2. **Only runs for local deployments** (not CI):
   - CI pipelines use separate `verify:e2e:aws:*` jobs
   - Local deployments automatically verify with E2E tests

### Usage

```bash
# Deploy with E2E test verification (default)
./aws-deploy.sh development
./aws-deploy.sh production

# Skip E2E tests (if needed)
SKIP_E2E_TESTS=true ./aws-deploy.sh production
```

### Requirements

- Playwright must be installed (`pnpm install`)
- CloudFront ID must be provided (`AWS_CLOUDFRONT_ID`)
- Site must be accessible (HTTP 200/301/302)

### Failure Detection

The script will fail if:
1. Site returns non-200/301/302 HTTP status code
2. E2E tests fail
3. Playwright is not available (warning only)

### CI/CD Integration

In GitLab CI/CD, E2E tests are run separately via:
- `verify:e2e:aws:dev` - Tests development deployment
- `verify:e2e:aws:prod` - Tests production deployment

These jobs are manual and can be triggered after deployment.

## Deployment Failure Detection

### Common Failure Scenarios

1. **HTTP 403 (Access Denied)**
   - **Cause**: CloudFront Origin Access Control misconfiguration
   - **Detection**: Script checks HTTP status before running E2E tests
   - **Fix**: Verify OAC is correctly configured in Terraform

2. **HTTP 404 (Not Found)**
   - **Cause**: Missing `index.html` or incorrect default root object
   - **Detection**: HTTP status check catches this
   - **Fix**: Ensure build output includes `index.html`

3. **E2E Test Failures**
   - **Cause**: Application bugs, broken functionality
   - **Detection**: Playwright tests fail
   - **Fix**: Fix application issues before deploying

### Verification Flow

```
Deployment → Upload to S3 → Invalidate CloudFront → Wait 15s → 
Check HTTP Status → Run E2E Tests → Report Results
```

If any step fails, the deployment script exits with error code 1.

## Troubleshooting

### 403 Access Denied

If you see 403 errors after deployment:

1. **Check CloudFront Origin Access Control**:
   ```bash
   aws cloudfront get-distribution-config --id $CLOUDFRONT_ID \
     --query 'DistributionConfig.Origins.Items[0].OriginAccessControlId'
   ```

2. **Verify S3 Bucket Policy**:
   ```bash
   aws s3api get-bucket-policy --bucket $BUCKET_NAME
   ```
   
   Should allow `cloudfront.amazonaws.com` service principal.

3. **Check OAC exists**:
   ```bash
   terraform state show aws_cloudfront_origin_access_control.website
   ```

### Skip E2E Tests

If you need to deploy without running E2E tests:

```bash
SKIP_E2E_TESTS=true ./aws-deploy.sh production
```

This is useful for:
- Emergency deployments
- When E2E tests are flaky
- When testing infrastructure changes
