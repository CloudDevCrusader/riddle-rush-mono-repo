# Browser Extension Errors - Troubleshooting Guide

## Common Extension Errors

When developing or testing the Riddle Rush PWA, you may see errors like:

```
TypeError: Failed to fetch dynamically imported module:
chrome-extension://camppjleccjaphfdbohjdohecfnoikec/assets/chatIframe.tsx-51de96bf.js
```

## Understanding These Errors

### What Are These?

These errors occur when **browser extensions** (like Merlin AI, Grammarly, LastPass, etc.) try to inject scripts into your web application.

### Are They Harmful?

**No!** These errors are:

- ✅ **Completely harmless** to your application
- ✅ **Expected behavior** in development
- ✅ **Normal** for any web app with extensions installed
- ✅ **User-specific** (only affect developers with those extensions)

### Why Do They Happen?

1. Extensions inject content scripts into web pages
2. Some extensions use dynamic imports for lazy loading
3. Your app's Content Security Policy (CSP) may block extension scripts
4. Extension scripts may fail to load due to timing issues

## Common Extensions That Cause These Errors

| Extension      | ID                                 | Purpose              |
| -------------- | ---------------------------------- | -------------------- |
| Merlin AI      | `camppjleccjaphfdbohjdohecfnoikec` | AI writing assistant |
| Grammarly      | `kbfnbcaeplbcioakkpcpgfkobkghlhen` | Grammar checker      |
| LastPass       | `hdokiejnpimakedhajhdlcegeplioahd` | Password manager     |
| Honey          | `bmnlcjabgnpnenekpadlanbbkooimhnj` | Shopping assistant   |
| React DevTools | `fmkadmapgofadopljbjfkapdkoienihi` | Developer tools      |

## How to Fix/Ignore

### Option 1: Ignore the Errors (Recommended)

These errors don't affect your application functionality. Simply ignore them during development.

### Option 2: Disable Extensions During Development

**Chrome/Edge:**

1. Open `chrome://extensions/` or `edge://extensions/`
2. Toggle off extensions while developing
3. Or use **Incognito Mode** (extensions disabled by default)

**Create a Development Profile:**

1. Chrome menu → Settings → Manage profiles
2. Create "Development" profile
3. Don't install extensions in this profile
4. Use for testing only

### Option 3: Filter Console Errors

**In Chrome DevTools:**

1. Open Console
2. Click filter icon (funnel)
3. Add negative filter: `-chrome-extension://`
4. Or use regex: `/chrome-extension:/`

**Create a Console Filter:**

```javascript
// Add to your dev console snippets
console.defaultError = console.error.bind(console)
console.errors = []
console.error = function () {
  console.defaultError.apply(console, arguments)
  if (!arguments[0]?.message?.includes('chrome-extension://')) {
    console.errors.push(Array.from(arguments))
  }
}
```

### Option 4: Suppress in CI/CD

Already configured in `playwright.config.ts`:

```typescript
use: {
  ignoreHTTPSErrors: true,
  // Suppress extension errors in tests
  launchOptions: {
    args: [
      '--disable-extensions',
      '--disable-component-extensions-with-background-pages',
    ],
  },
},
```

## CSP and Extensions

Our app's Content Security Policy in `nuxt.config.ts` blocks some extension scripts:

```typescript
security: {
  headers: {
    contentSecurityPolicy: {
      'script-src': ["'self'", 'https:', "'unsafe-inline'", "'unsafe-eval'"],
      // This blocks unknown extension scripts
    },
  },
},
```

**This is intentional** for security. Extensions will still work, but may log errors.

## Real Issues vs Extension Errors

### Extension Error (Ignore):

```
Failed to fetch dynamically imported module:
chrome-extension://abc123/module.js
```

**Characteristics:**

- ❌ Contains `chrome-extension://`
- ❌ Not related to your code
- ❌ Only appears for some users
- ❌ Doesn't break functionality

### Real Application Error (Fix):

```
Failed to fetch dynamically imported module:
/assets/GameComponent-abc123.js
```

**Characteristics:**

- ✅ Uses your app's domain
- ✅ Breaks functionality
- ✅ Appears for all users
- ✅ Related to your code/build

## When to Worry

**Don't worry if:**

- Error is from `chrome-extension://`
- App works normally
- Only happens in development
- Only happens for you (not others)

**DO investigate if:**

- Error is from your app's domain
- App functionality breaks
- Happens in production
- Affects all users

## Testing Without Extensions

### Playwright (E2E Tests)

Extensions are automatically disabled:

```typescript
// playwright.config.ts
use: {
  launchOptions: {
    args: ['--disable-extensions'],
  },
},
```

### Manual Testing

**Quick Test:**

```bash
# Chrome without extensions
google-chrome --disable-extensions http://localhost:3000

# Or use Incognito
google-chrome --incognito http://localhost:3000
```

## Summary

| Question                      | Answer  |
| ----------------------------- | ------- |
| Are extension errors harmful? | **No**  |
| Should I fix them?            | **No**  |
| Will they affect users?       | **No**  |
| Can I ignore them?            | **Yes** |
| Should I report them?         | **No**  |

**Key Takeaway:** Extension errors are **normal, expected, and harmless**. Focus on errors from your own application domain.

---

**Last Updated:** January 2026
