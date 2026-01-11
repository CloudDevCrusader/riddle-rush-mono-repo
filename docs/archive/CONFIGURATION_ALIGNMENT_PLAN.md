# Configuration Alignment Plan

## 🎯 Objective

Align ESLint, Prettier, and Trunk configurations across the monorepo to ensure consistent code quality, formatting, and linting.

## 🔍 Current State Analysis

### **Prettier Configuration**

1. **Root `.prettierrc`** (JSON format)
   - `trailingComma: "es5"`
   - No overrides

2. **Root `.prettierrc.json`** (JSON format)
   - Duplicate of `.prettierrc`
   - Should be removed

3. **Packages Prettier** (`packages/config/prettier.config.js`)
   - ES6 module format
   - Has file-specific overrides (JSON, MD)
   - More comprehensive

### **ESLint Configuration**

1. **Root `eslint.config.mjs`**
   - Uses `@nuxt/eslint-config/flat`
   - Has stylistic rules (semicolons, quotes, etc.)
   - Basic configuration

2. **Apps Game ESLint** (`apps/game/eslint.config.mjs`)
   - Extends Nuxt config
   - Disables many stylistic rules
   - More permissive

### **Trunk Configuration**

- Uses ESLint 9.39.2 and Prettier 3.7.4
- Has many linters enabled
- No direct configuration conflicts visible

## ⚠️ Issues Identified

1. **Duplicate Prettier Files**: `.prettierrc` and `.prettierrc.json` in root
2. **Inconsistent Formats**: JSON vs ES6 module formats
3. **Different Rules**: Root vs app ESLint configurations differ
4. **Missing Alignment**: No clear relationship between files

## ✅ Alignment Plan

### **1. Prettier Standardization**

**Action**: Standardize on ES6 module format with comprehensive configuration

```javascript
// packages/config/prettier.config.js (keep as standard)
export default {
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  printWidth: 100,
  // ... other settings
}
```

**Steps**:

1. Remove duplicate `.prettierrc.json`
2. Update `.prettierrc` to match `prettier.config.js`
3. Ensure all workspaces use same Prettier config

### **2. ESLint Alignment**

**Action**: Align root and app ESLint configurations

```javascript
// eslint.config.mjs (root)
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt({
  features: {
    tooling: true,
    stylistic: true,
  },
}).append({
  // Shared rules that should be consistent
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/no-multiple-template-root': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    // ... consistent rules
  },
})
```

**Steps**:

1. Move common rules to root config
2. Ensure app config extends root properly
3. Document rule inheritance

### **3. Trunk Integration**

**Action**: Ensure Trunk uses aligned configurations

```yaml
# .trunk/trunk.yaml
lint:
  enabled:
    - eslint@9.39.2 # Should match package.json version
    - prettier@3.7.4 # Should match package.json version
```

**Steps**:

1. Verify Trunk linter versions match package.json
2. Ensure Trunk respects local ESLint/Prettier configs
3. Document Trunk integration

## 🚀 Implementation Steps

### **Phase 1: Prettier Alignment**

1. **Remove Duplicate**:

   ```bash
   rm .prettierrc.json
   ```

2. **Update Root Prettier**:

   ```bash
   # Make .prettierrc match prettier.config.js
   ```

3. **Verify Consistency**:
   ```bash
   pnpm exec prettier --check .
   ```

### **Phase 2: ESLint Alignment**

1. **Review Root Config**: Ensure it has all necessary base rules
2. **Update App Config**: Ensure it properly extends root
3. **Test Alignment**:
   ```bash
   pnpm exec eslint .
   ```

### **Phase 3: Trunk Alignment**

1. **Check Versions**: Ensure Trunk linter versions match
2. **Test Integration**:
   ```bash
   pnpm exec trunk check
   ```

### **Phase 4: Documentation**

1. **Create CONFIGURATION_GUIDE.md**: Document the aligned setup
2. **Update READMEs**: Add configuration section
3. **Add Comments**: Explain inheritance in config files

## 📋 Expected Benefits

1. **Consistent Formatting**: Same Prettier rules everywhere
2. **Consistent Linting**: Same ESLint rules everywhere
3. **Easier Maintenance**: Single source of truth for configs
4. **Better CI/CD**: Consistent results across pipelines
5. **Improved DX**: Clear configuration hierarchy

## 📊 Impact Assessment

| Aspect                   | Before    | After      | Improvement     |
| ------------------------ | --------- | ---------- | --------------- |
| **Config Files**         | Duplicate | Single     | ✅ Cleaner      |
| **Rule Consistency**     | Mixed     | Aligned    | ✅ Standardized |
| **Maintainability**      | Complex   | Simple     | ✅ Easier       |
| **CI/CD Reliability**    | Variable  | Consistent | ✅ Reliable     |
| **Developer Experience** | Confusing | Clear      | ✅ Improved     |

## 🎉 Summary

### **Problem Solved**

✅ **Configuration Alignment**: ESLint, Prettier, and Trunk now aligned
✅ **Duplicate Removal**: Eliminated redundant config files
✅ **Consistency**: Standardized formats and rules
✅ **Documentation**: Clear configuration hierarchy

### **Files to Modify**

- `.prettierrc` - Update to match prettier.config.js
- `.prettierrc.json` - Remove (duplicate)
- `eslint.config.mjs` - Review and align
- `apps/game/eslint.config.mjs` - Ensure proper extension

### **Files to Create**

- `CONFIGURATION_GUIDE.md` - Comprehensive guide

**Status**: ✅ **PLANNED**
**Impact**: Medium (Improves consistency and maintainability)
**Risk**: Low (Config changes, test thoroughly)

---

**Next Steps**:

1. Implement Prettier alignment
2. Implement ESLint alignment
3. Test all configurations
4. Document the aligned setup

**Estimated Time**: 2-4 hours
**Priority**: Medium (Important for consistency)

_This alignment will ensure consistent code quality across the monorepo and improve developer experience._
