# GitLab Feature Flags Integration

## Overview

Riddle Rush uses GitLab Feature Flags to control the Fortune Wheel feature remotely. GitLab Feature Flags uses the Unleash protocol, making it compatible with existing Unleash tooling.

## Setup Guide

### 1. Enable Feature Flags in GitLab

1. Navigate to your GitLab project
2. Go to **Settings** → **Operations** → **Feature Flags**
3. Enable Feature Flags for your project

### 2. Create the Feature Flag

1. Click **New Feature Flag**
2. **Name**: `fortune-wheel`
3. **Description**: "Enable the fortune wheel animation for category and letter selection"
4. **Type**: Boolean (percentage rollout or on/off)
5. **Environments**: Configure for each environment (production, staging, etc.)

### 3. Get Configuration Details

You'll need two values:

**Project ID**:

- Found in your GitLab project's **Settings** → **General**
- Or in the URL: `gitlab.com/your-group/your-project` → Project ID

**Instance ID (Token)**:

- Go to **Settings** → **Operations** → **Feature Flags**
- Copy the **Instance ID** (this acts as your token)

### 4. Configure Environment Variables

Add to your `.env` or deployment configuration:

```bash
# GitLab Feature Flags Configuration
GITLAB_FEATURE_FLAGS_URL=https://gitlab.com/api/v4/feature_flags/unleash/YOUR_PROJECT_ID
GITLAB_FEATURE_FLAGS_TOKEN=your-instance-id-here
```

**For Self-Hosted GitLab:**

```bash
GITLAB_FEATURE_FLAGS_URL=https://your-gitlab.com/api/v4/feature_flags/unleash/YOUR_PROJECT_ID
GITLAB_FEATURE_FLAGS_TOKEN=your-instance-id-here
```

## Feature Flag Configuration

### Flag Name

**`fortune-wheel`**

Must match exactly (case-sensitive, use kebab-case).

### Strategies

GitLab supports multiple rollout strategies:

#### 1. **All Users** (On/Off)

- Simple boolean toggle
- All users get the same experience
- Best for: Simple enable/disable

#### 2. **Percent of Time**

- Rollout to X% of requests
- Example: 25% rollout = 25% of page loads show wheel
- Best for: Gradual rollout, A/B testing

#### 3. **User IDs**

- Target specific user IDs
- Example: Beta testers, internal team
- Best for: Beta testing, internal previews

#### 4. **User List**

- Target list of user identifiers
- Best for: Specific user cohorts

### Environment-Specific Configuration

Configure different values per environment:

- **Production**: `false` (disabled by default)
- **Staging**: `true` (enabled for testing)
- **Development**: `true` (enabled locally)

## Usage in Code

### Check Feature Flag

```typescript
import { useFeatureFlags } from '~/composables/useFeatureFlags'

const { isFortuneWheelEnabled } = useFeatureFlags()

// Use in template
<template>
  <div v-if="isFortuneWheelEnabled">
    <!-- Fortune Wheel UI -->
  </div>
  <div v-else>
    <!-- Skip directly to game -->
  </div>
</template>

// Use in script
if (isFortuneWheelEnabled.value) {
  // Show fortune wheel animation
} else {
  // Skip to game immediately
}
```

### Generic Flag Check

```typescript
const { isEnabled } = useFeatureFlags()

if (isEnabled('my-feature', false)) {
  // Feature is enabled
}
```

### With Variants

```typescript
const { getVariant } = useFeatureFlags()

const variant = getVariant('fortune-wheel')
if (variant.name === 'animation-v2') {
  // Show new animation style
} else {
  // Show default animation
}
```

## Priority Order

Feature flag resolution follows this hierarchy:

1. **GitLab Feature Flags** (if configured) ← Highest priority
2. **Local Settings Store** (fallback)
3. **Default Value** (`false`) ← Ultimate fallback

This ensures the app works even without GitLab configuration.

## Monitoring & Analytics

### GitLab Dashboard

Monitor in GitLab:

- **Settings** → **Operations** → **Feature Flags**
- View current status per environment
- See rollout percentages
- Track changes history

### Application Metrics

Monitor these metrics when toggling:

```javascript
// Track feature flag usage
analytics.track('feature_flag_checked', {
  flag_name: 'fortune-wheel',
  value: isFortuneWheelEnabled.value,
  source: 'gitlab', // or 'local_settings'
})
```

## Rollout Strategy

### Phase 1: Internal Testing (Week 1)

```
Environment: Staging
Strategy: All Users
Status: Enabled
```

### Phase 2: Canary Release (Week 2)

```
Environment: Production
Strategy: Percent of Time
Percentage: 5%
```

### Phase 3: Gradual Rollout (Week 3-4)

```
Week 3: 25%
Week 4: 50%
```

### Phase 4: Full Release (Week 5)

```
Strategy: All Users
Status: Enabled
```

## Troubleshooting

### Issue: Feature flag not updating

**Check:**

```bash
# 1. Verify environment variables are set
echo $GITLAB_FEATURE_FLAGS_URL
echo $GITLAB_FEATURE_FLAGS_TOKEN

# 2. Check GitLab API is accessible
curl -H "Instance-Id: your-token" \
  "https://gitlab.com/api/v4/feature_flags/unleash/YOUR_PROJECT_ID/client/features"

# 3. Check browser console for errors
# Refresh interval is 30 seconds
```

**Solutions:**

- Verify Project ID is correct
- Check Instance ID hasn't expired
- Ensure API endpoint is accessible from your network
- Check CORS settings if running locally

### Issue: Flag always returns false

**Check:**

- Flag name matches exactly: `fortune-wheel` (not `fortune_wheel`)
- Flag is enabled in GitLab dashboard for your environment
- Environment name matches (production, staging, etc.)

### Issue: Fallback not working

**Check:**

```javascript
// Verify settings store
const settingsStore = useSettingsStore()
console.log('Local setting:', settingsStore.fortuneWheelEnabled)

// Toggle manually
settingsStore.toggleFortuneWheel()
```

### Issue: CORS errors

**For self-hosted GitLab:**
Configure CORS in GitLab:

```ruby
# /etc/gitlab/gitlab.rb
gitlab_rails['gitlab_default_projects_features_operations'] = true
```

## CI/CD Integration

### Update Feature Flags via CLI

```bash
# Install GitLab CLI
brew install glab

# Enable feature flag
glab api -X PUT "/projects/:id/feature_flags/:name" \
  -f "active=true" \
  -f "environment=production"

# Disable feature flag
glab api -X PUT "/projects/:id/feature_flags/:name" \
  -f "active=false"
```

### Automate Rollouts

```yaml
# .gitlab-ci.yml
rollout_feature:
  stage: deploy
  script:
    - glab api -X PUT "/projects/$CI_PROJECT_ID/feature_flags/fortune-wheel" \
      -f "active=true" \
      -f "environment=production" \
      -f "strategies[][name]=gradualRolloutUserId" \
      -f "strategies[][parameters][percentage]=25"
  only:
    - main
```

## Testing

### Unit Tests

```bash
pnpm --filter @riddle-rush/game test:unit -- use-feature-flags.spec.ts
```

### Manual Testing

1. **Without GitLab**:

   ```bash
   # Don't set GITLAB_FEATURE_FLAGS_* variables
   pnpm run dev
   # Should use local settings (default: false)
   ```

2. **With GitLab Enabled**:

   ```bash
   # Set environment variables
   export GITLAB_FEATURE_FLAGS_URL="https://gitlab.com/api/v4/feature_flags/unleash/YOUR_PROJECT_ID"
   export GITLAB_FEATURE_FLAGS_TOKEN="your-instance-id"
   pnpm run dev
   # Should reflect GitLab flag state
   ```

3. **Test Rollout Percentage**:
   - Set to 50% in GitLab
   - Reload page multiple times
   - Should see wheel ~50% of the time

## Best Practices

### 1. Use Descriptive Names

✅ `fortune-wheel`
❌ `fw`, `feature1`

### 2. Document in GitLab

Add descriptions explaining:

- What the flag controls
- When it was created
- Planned rollout schedule

### 3. Clean Up Old Flags

Remove flags after full rollout:

```bash
glab api -X DELETE "/projects/:id/feature_flags/:name"
```

### 4. Use Environments

- Don't enable directly in production
- Test in staging first
- Use gradual rollout in production

### 5. Monitor Impact

Track before and after metrics:

- User engagement
- Page load times
- Error rates
- User feedback

## Security Considerations

### Instance ID Protection

- **DON'T** commit Instance ID to git
- **DO** use environment variables
- **DO** rotate regularly (every 90 days)
- **DO** use different IDs per environment

### API Access

- Instance ID is read-only
- Can't modify flags via client
- All changes must go through GitLab UI or API

## Links & Resources

- [GitLab Feature Flags Documentation](https://docs.gitlab.com/ee/operations/feature_flags.html)
- [Unleash Protocol](https://docs.getunleash.io/reference/api/unleash)
- [Feature Toggle Best Practices](https://martinfowler.com/articles/feature-toggles.html)

## Support

- **GitLab Issues**: Create issue in your project
- **Configuration Help**: Check GitLab documentation
- **App Issues**: Create issue in repository with GitLab flag state included
