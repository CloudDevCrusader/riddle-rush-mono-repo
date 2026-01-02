# Usersnap Integration Guide

**Date**: 2026-01-02
**Status**: Ready for Installation

---

## Why Usersnap?

Usersnap is a professional feedback and bug tracking tool that provides:
- 📸 Visual bug reporting with screenshots and annotations
- 💬 User feedback collection
- 🎯 Feature request management
- 🔧 Integration with Jira, Trello, Slack, etc.
- 📊 Analytics and insights

**Pricing**: Free tier available (50 feedback items/month)

---

## Installation Steps

### 1. Create Usersnap Account
1. Go to [https://usersnap.com](https://usersnap.com)
2. Sign up for free account
3. Create a new project for "Riddle Rush"
4. Get your Widget API Key from the dashboard

### 2. Install Usersnap for Nuxt

```bash
pnpm add @usersnap/browser
```

### 3. Create Usersnap Plugin

Create `plugins/usersnap.client.ts`:

```typescript
export default defineNuxtPlugin((nuxtApp) => {
  if (typeof window === 'undefined') return

  // Initialize Usersnap
  const script = document.createElement('script')
  script.onload = function () {
    window.Usersnap = window.Usersnap || {}
    window.Usersnap.on('load', function (api) {
      // Configure Usersnap
      api.init({
        // Your API key from Usersnap dashboard
        button: {
          text: 'Feedback geben',
          backgroundColor: '#FF6B35',
          position: 'bottomRight',
        },
        lang: 'de', // German language
        collect: {
          email: false,  // Don't collect email by default
        },
      })
    })

    // Load Usersnap widget
    const apiKey = 'YOUR_USERSNAP_API_KEY' // Replace with your key
    window.Usersnap.load(apiKey)
  }

  script.src = 'https://widget.usersnap.com/global/load/YOUR_API_KEY.js'
  script.async = true
  document.head.appendChild(script)
})
```

### 4. Add API Key to Environment Variables

Create `.env` file (add to `.gitignore`):

```env
NUXT_PUBLIC_USERSNAP_API_KEY=your_api_key_here
```

Update `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      usersnapApiKey: process.env.NUXT_PUBLIC_USERSNAP_API_KEY || '',
      // ... existing config
    },
  },
})
```

Update plugin to use environment variable:

```typescript
export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const apiKey = config.public.usersnapApiKey

  if (!apiKey || typeof window === 'undefined') return

  // ... rest of the plugin code
  script.src = `https://widget.usersnap.com/global/load/${apiKey}.js`
  document.head.appendChild(script)
})
```

### 5. Customize Widget Appearance (Optional)

Match your game's design:

```typescript
api.init({
  button: {
    text: 'Feedback geben', // German for "Give Feedback"
    backgroundColor: '#FF6B35', // Match your primary color
    textColor: '#FFFFFF',
    borderRadius: '50%',
    position: 'bottomRight',
    size: 'medium',
  },
  widget: {
    color: '#FF6B35',
    buttonText: 'Senden', // German for "Send"
  },
  lang: 'de',
  collect: {
    email: false,
    name: false,
  },
})
```

---

## Alternative: Using Nuxt Module

There's an unofficial Nuxt module for easier integration:

### Install Module

```bash
pnpm add -D @nuxtjs/usersnap
```

### Configure in nuxt.config.ts

```typescript
export default defineNuxtConfig({
  modules: ['@nuxtjs/usersnap'],

  usersnap: {
    apiKey: process.env.NUXT_PUBLIC_USERSNAP_API_KEY,
    button: {
      text: 'Feedback geben',
      backgroundColor: '#FF6B35',
      position: 'bottomRight',
    },
    lang: 'de',
  },
})
```

---

## Features You Get

### 1. Visual Bug Reporting
- Users can take screenshots with annotations
- Automatically captures browser info, URL, console logs
- Draw arrows, highlight areas, add text

### 2. Feedback Collection
- Simple feedback form
- Customizable fields
- Email notifications

### 3. Dashboard
- View all feedback in one place
- Categorize and prioritize
- Assign to team members
- Export to other tools

### 4. Integrations
- **Jira**: Auto-create tickets
- **Trello**: Add cards
- **Slack**: Get notifications
- **GitHub**: Create issues
- **Email**: Forward feedback

---

## Configuration Options

### Widget Position

```typescript
button: {
  position: 'bottomRight',  // or 'bottomLeft', 'topRight', 'topLeft'
}
```

### Custom Trigger

Hide default button and trigger programmatically:

```typescript
// In your component
const config = useRuntimeConfig()
const triggerFeedback = () => {
  if (window.Usersnap) {
    window.Usersnap.logEvent('open')
  }
}
```

### Localization

```typescript
lang: 'de',  // German
// Other options: 'en', 'es', 'fr', 'it', 'ja', 'pt', etc.
```

---

## Testing

### Test Locally

1. Start dev server: `pnpm run dev`
2. Look for feedback button in bottom-right corner
3. Click to test feedback submission
4. Check Usersnap dashboard for submitted feedback

### Test Production

After deploying:
```bash
pnpm run generate
pnpm run preview
```

Navigate to site and test feedback widget.

---

## Free Tier Limitations

- **50 feedback items/month**
- **1 project**
- **Basic integrations**
- **7-day data retention**

**Paid Plans**:
- Startup: €19/month (500 items)
- Company: €99/month (5000 items)
- Enterprise: Custom pricing

---

## TypeScript Types

Add global types for Usersnap:

Create `types/usersnap.d.ts`:

```typescript
interface Window {
  Usersnap?: {
    on: (event: string, callback: (api: any) => void) => void
    load: (apiKey: string) => void
    logEvent: (event: string) => void
  }
}
```

---

## Best Practices

### 1. Only Load on Client
```typescript
// Use .client.ts suffix for plugin
plugins/usersnap.client.ts
```

### 2. Lazy Load
Don't load until user interacts:

```typescript
let usersnapLoaded = false

export function loadUsersnap() {
  if (usersnapLoaded || typeof window === 'undefined') return

  const script = document.createElement('script')
  script.src = 'https://widget.usersnap.com/global/load/API_KEY.js'
  script.async = true
  document.head.appendChild(script)

  usersnapLoaded = true
}
```

### 3. Disable in Development (Optional)
```typescript
const isDev = process.env.NODE_ENV === 'development'
if (isDev) return  // Don't load Usersnap in dev
```

### 4. Track User Context
```typescript
api.init({
  custom: {
    gameVersion: '1.0.0',
    userLanguage: 'de',
    deviceType: 'mobile',
  },
})
```

---

## Cleanup Checklist

✅ **Removed**:
- `/components/FeedbackWidget.vue` (deleted)
- Reference in `/app.vue` (removed)
- Old localStorage feedback data (optional: `localStorage.removeItem('app-feedback')`)

**Ready for**:
- Usersnap integration
- Professional feedback collection
- Visual bug reporting

---

## Quick Start Commands

```bash
# 1. Install Usersnap
pnpm add @usersnap/browser

# 2. Create plugin file
touch plugins/usersnap.client.ts

# 3. Add environment variable
echo "NUXT_PUBLIC_USERSNAP_API_KEY=your_key_here" >> .env

# 4. Update .gitignore
echo ".env" >> .gitignore

# 5. Test
pnpm run dev
```

---

## Support

- **Documentation**: https://docs.usersnap.com
- **Support**: support@usersnap.com
- **Community**: https://community.usersnap.com

---

## Summary

✅ Old buggy feedback widget removed
✅ Ready for Usersnap integration
✅ Professional feedback solution
✅ Visual bug reporting
✅ Free tier available

**Next Step**: Sign up at usersnap.com and get your API key!
