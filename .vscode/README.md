# VSCode Configuration Fix for Volar Errors

## Problem
You're experiencing Volar errors:
```
[Error] Request textDocument/documentSymbol failed.
Message: host.fileExists is not a function
Code: -32603
```

## Root Cause
You have **TWO Volar extensions** installed:
1. ❌ `johnsoncodehk.volar@0.30.1` (deprecated, causing errors)
2. ✅ `vue.volar@3.2.1` (current official version)

The old extension conflicts with the new one.

## Fix Instructions

### 1. Uninstall the Old Volar Extension

**Open VSCode Extensions** (Ctrl+Shift+X), then:

1. Search for `@installed volar`
2. Find **"Volar" by johnsoncodehk** (v0.30.1)
3. Click **Uninstall**
4. Keep **"Vue - Official" by Vue** (v3.2.1) - this is the correct one

**OR use Command Palette:**
1. Press `Ctrl+Shift+P`
2. Type: `Extensions: Show Installed Extensions`
3. Find and uninstall `johnsoncodehk.volar`

**OR use CLI:**
```bash
code --uninstall-extension johnsoncodehk.volar
```

### 2. Reload VSCode

After uninstalling:
- Press `Ctrl+Shift+P` → "Developer: Reload Window"
- Or restart VSCode completely

### 3. Verify

Open any `.vue` file and check:
- ✅ No more "host.fileExists" errors in Output → Volar
- ✅ IntelliSense works for auto-imports
- ✅ Go to definition works
- ✅ Type checking active

## What We've Already Fixed

The following files have been updated with correct configuration:

### `.vscode/settings.json`
- ✅ `nuxt.isNuxtApp: true` (was incorrectly false)
- ✅ `volar.tsconfig` points to Nuxt's generated config
- ✅ `volar.takeOverMode.enabled: false` (prevents conflicts)
- ✅ TypeScript workspace SDK configured
- ✅ Auto-fix ESLint on save

### `.vscode/extensions.json`
- ✅ Recommends `vue.volar` (official extension)
- ✅ Blocks `octref.vetur` (old Vue 2 extension)

## Expected Behavior After Fix

- **Auto-imports**: `useRuntimeConfig`, `useState`, `usePinia`, etc. auto-complete
- **Type checking**: Real-time TypeScript errors in Vue files
- **Navigation**: F12 (Go to Definition) works for components, composables, stores
- **No errors**: Volar output should be clean

## Troubleshooting

If errors persist after uninstalling old Volar:

1. **Clear VSCode cache:**
   ```bash
   rm -rf ~/.config/Code/User/workspaceStorage/*
   ```

2. **Regenerate Nuxt types:**
   ```bash
   rm -rf .nuxt
   pnpm install
   pnpm run dev  # Let it generate .nuxt/
   ```

3. **Check TypeScript version:**
   ```bash
   pnpm list typescript
   # Should show ~5.9.x
   ```

4. **Verify Volar is using workspace TypeScript:**
   - Click TypeScript version in VSCode status bar (bottom right)
   - Should show "Use Workspace Version (5.9.x)"

## Reference

- Vue Official Extension: https://github.com/vuejs/language-tools
- Nuxt TypeScript: https://nuxt.com/docs/guide/concepts/typescript
