# Refactoring Guide

This guide documents the code refactoring and abstractions implemented to improve code quality, reusability, and maintainability using Vue 3 Composition API and Nuxt features.

## Table of Contents

1. [Overview](#overview)
2. [Base Components](#base-components)
3. [Composables](#composables)
4. [Services](#services)
5. [Layouts](#layouts)
6. [Auto-Import Configuration](#auto-import-configuration)
7. [Migration Examples](#migration-examples)
8. [Best Practices](#best-practices)

---

## Overview

The refactoring introduces a layered architecture:

```
┌─────────────────────────────────────┐
│         Pages (UI Logic)            │
├─────────────────────────────────────┤
│   Layouts (Common Page Structure)  │
├─────────────────────────────────────┤
│   Base Components (UI Building)    │
├─────────────────────────────────────┤
│   Composables (Reactive Logic)     │
├─────────────────────────────────────┤
│   Services (Business Logic)        │
└─────────────────────────────────────┘
```

**Key Benefits:**

- Reusable UI components reduce code duplication
- Composables provide reactive, testable logic
- Services abstract business logic from UI concerns
- Layouts standardize page structure
- Auto-imports eliminate boilerplate

---

## Base Components

Location: `components/Base/`

### BaseButton

A versatile button component with variants, sizes, and loading states.

**Props:**

```typescript
{
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
}
```

**Usage:**

```vue
<template>
  <BaseButton variant="primary" size="lg" :loading="isSubmitting" @click="handleSubmit">
    Submit
  </BaseButton>
</template>
```

**Slots:**

- `default` - Button content
- `icon` - Optional icon (prepended to content)

**When to use:**

- Any clickable action requiring consistent styling
- Forms with submit buttons
- Action buttons in modals or pages

---

### BaseImageButton

A button component that uses an image with hover states.

**Props:**

```typescript
{
  src: string           // Main image source
  hoverSrc?: string    // Optional hover state image
  alt: string          // Accessibility label
  disabled?: boolean
  width?: string       // CSS width value
  height?: string      // CSS height value
}
```

**Usage:**

```vue
<template>
  <BaseImageButton
    :src="`${baseUrl}assets/main-menu/PLAY.png`"
    :hover-src="`${baseUrl}assets/main-menu/PLAY-1.png`"
    alt="Play"
    @click="handlePlay"
  />
</template>
```

**When to use:**

- Menu buttons with custom graphics
- Icon-based navigation
- Game UI elements

---

### BaseModal

A full-featured modal component with teleport, transitions, keyboard handling, and scroll locking.

**Props:**

```typescript
{
  modelValue: boolean      // v-model binding for open/close
  title?: string          // Optional modal title
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showClose?: boolean     // Show close button (default: true)
  closeOnOverlay?: boolean // Close on backdrop click (default: true)
  persistent?: boolean    // Prevent closing (default: false)
}
```

**Usage:**

```vue
<template>
  <BaseModal v-model="isOpen" title="Settings" size="lg" @close="handleClose">
    <template #default>
      <!-- Modal content -->
    </template>

    <template #footer>
      <BaseButton @click="save">Save</BaseButton>
      <BaseButton variant="secondary" @click="isOpen = false">Cancel</BaseButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
const isOpen = ref(false)
</script>
```

**Slots:**

- `default` - Modal body content
- `header` - Custom header (overrides title)
- `footer` - Modal footer actions

**Features:**

- Automatic focus trap
- Escape key to close
- Scroll lock when open
- Smooth transitions
- Teleport to body for z-index isolation

**When to use:**

- Settings dialogs
- Confirmation prompts
- Forms requiring user input
- Any overlay content

---

## Composables

Location: `composables/`

### useMenu

Manages menu state with automatic cleanup on route changes.

**API:**

```typescript
{
  isOpen: Readonly<Ref<boolean>>
  activeItem: Readonly<Ref<string | null>>
  open: () => void
  close: () => void
  toggle: () => void
  setActiveItem: (item: string | null) => void
}
```

**Usage:**

```vue
<script setup lang="ts">
const menu = useMenu()
</script>

<template>
  <button @click="menu.toggle">Menu</button>
  <div v-if="menu.isOpen.value">
    <!-- Menu content -->
  </div>
</template>
```

**Features:**

- Automatic close on route navigation
- Active item tracking
- Readonly state exposure

---

### useAssets

Manages asset paths with baseURL prefix handling.

**API:**

```typescript
{
  baseUrl: string
  getAssetPath: (path: string) => string
  getMenuAsset: (filename: string) => string
  getGameAsset: (filename: string) => string
  getSettingsAsset: (filename: string) => string
  getIconAsset: (filename: string) => string
  preloadImage: (src: string) => Promise<void>
  preloadImages: (paths: string[]) => Promise<void>
}
```

**Usage:**

```vue
<script setup lang="ts">
const assets = useAssets()

// Preload critical images
onMounted(async () => {
  await assets.preloadImages([
    assets.getMenuAsset('LOGO.png'),
    assets.getMenuAsset('BACKGROUND.png'),
  ])
})
</script>

<template>
  <img :src="assets.getMenuAsset('LOGO.png')" alt="Logo" />
</template>
```

**When to use:**

- Loading any asset (images, sounds, etc.)
- Preloading critical resources
- Ensuring correct paths across environments (dev/staging/prod)

---

### useModal

Manages modal state with data passing capabilities.

**API:**

```typescript
{
  isOpen: Readonly<Ref<boolean>>
  data: Readonly<Ref<any>>
  open: (data?: any) => void
  close: () => void
  toggle: () => void
}
```

**Usage:**

```vue
<script setup lang="ts">
const confirmModal = useModal()

function confirmDelete(item: Item) {
  confirmModal.open(item)
}

async function handleConfirm() {
  const item = confirmModal.data.value
  await deleteItem(item.id)
  confirmModal.close()
}
</script>

<template>
  <BaseModal v-model="confirmModal.isOpen.value">
    Delete {{ confirmModal.data.value?.name }}?
    <BaseButton @click="handleConfirm">Confirm</BaseButton>
  </BaseModal>
</template>
```

**Multi-Modal Management:**

```typescript
const { modals, openModal, closeModal, closeAll } = useModals(['settings', 'confirm', 'help'])

// Usage
openModal('settings', { userId: 123 })
closeModal('confirm')
closeAll()
```

---

### useForm

Comprehensive form handling with validation, submission, and error management.

**API:**

```typescript
{
  values: Readonly<T>
  errors: Readonly<Record<keyof T, string>>
  touched: Readonly<Record<keyof T, boolean>>
  isSubmitting: Readonly<Ref<boolean>>
  isValid: ComputedRef<boolean>
  isDirty: ComputedRef<boolean>
  handleChange: (field: keyof T, value: any) => void
  handleBlur: (field: keyof T) => void
  handleSubmit: (onSubmit: (values: T) => void | Promise<void>) => Promise<boolean>
  validateField: (field: keyof T) => boolean
  validateAll: () => boolean
  reset: () => void
  setValue: (field: keyof T, value: any) => void
  setError: (field: keyof T, message: string) => void
}
```

**Usage:**

```vue
<script setup lang="ts">
import { validationRules } from '~/composables/useForm'

const form = useForm({
  name: {
    initialValue: '',
    rules: [
      validationRules.required(),
      validationRules.minLength(2),
      validationRules.maxLength(20),
    ],
  },
  email: {
    initialValue: '',
    rules: [validationRules.required(), validationRules.email()],
  },
})

async function submit() {
  await form.handleSubmit(async (values) => {
    await api.createUser(values)
    toast.success('User created!')
  })
}
</script>

<template>
  <form @submit.prevent="submit">
    <input
      :value="form.values.name"
      @input="form.handleChange('name', $event.target.value)"
      @blur="form.handleBlur('name')"
    />
    <span v-if="form.errors.name">{{ form.errors.name }}</span>

    <BaseButton type="submit" :disabled="!form.isValid.value" :loading="form.isSubmitting.value">
      Submit
    </BaseButton>
  </form>
</template>
```

**Built-in Validation Rules:**

- `required(message?)`
- `minLength(length, message?)`
- `maxLength(length, message?)`
- `pattern(regex, message?)`
- `email(message?)`
- `min(minValue, message?)`
- `max(maxValue, message?)`

**Custom Validation:**

```typescript
const customRule: ValidationRule<string> = {
  validate: (value) => value.includes('@'),
  message: 'Must contain @ symbol',
}
```

---

### useAudio

Audio management with Howler.js integration (existing composable).

---

## Services

Location: `services/`

### GameService

Business logic for game operations - pure functions with no side effects.

**Methods:**

**Letter Generation:**

```typescript
GameService.generateRandomLetter(alphabet: string): string
```

**Score Calculation:**

```typescript
GameService.calculateScore(baseScore: number, timeBonus = 0): number
```

**Session Management:**

```typescript
GameService.createSession(
  category: Category,
  letter: string,
  players: Player[],
  gameName?: string
): GameSession
```

**Player Management:**

```typescript
GameService.createPlayer(name: string, avatar?: string): Player

GameService.validatePlayerName(
  name: string,
  existingPlayers: Player[]
): { valid: boolean, error?: string }

GameService.allPlayersSubmitted(players: Player[]): boolean

GameService.getCurrentTurnPlayer(players: Player[]): Player | null
```

**Utilities:**

```typescript
GameService.formatDuration(milliseconds: number): string

GameService.normalizeAnswer(answer: string): string

GameService.areSimilarAnswers(
  answer1: string,
  answer2: string,
  threshold = 0.8
): boolean

GameService.shuffle<T>(array: T[]): T[]

GameService.getRandomCategories(
  categories: Category[],
  count: number
): Category[]
```

**Usage:**

```vue
<script setup lang="ts">
// In a Pinia store or component
const newPlayer = GameService.createPlayer('Alice', avatarUrl)

const validation = GameService.validatePlayerName('Alice', existingPlayers)
if (!validation.valid) {
  toast.error(validation.error)
}

const allSubmitted = GameService.allPlayersSubmitted(players)
if (allSubmitted) {
  proceedToNextRound()
}

const normalizedAnswer = GameService.normalizeAnswer(userInput)
const isCorrect = GameService.areSimilarAnswers(normalizedAnswer, correctAnswer, 0.85)
</script>
```

**When to use:**

- Game logic calculations
- Player validation
- Answer comparison
- Session creation
- Any game-related business logic

**Benefits:**

- Pure functions - easy to test
- No dependencies on stores or composables
- Reusable across different contexts
- Type-safe with TypeScript

---

### StorageService

LocalStorage abstraction with prefix and error handling.

**Methods:**

**Availability Check:**

```typescript
StorageService.isStorageAvailable(type: 'localStorage' | 'sessionStorage' = 'localStorage'): boolean
```

**CRUD Operations:**

```typescript
StorageService.getItem<T>(key: string, defaultValue?: T): T | null

StorageService.setItem<T>(key: string, value: T): boolean

StorageService.removeItem(key: string): boolean

StorageService.clear(): boolean
```

**Utilities:**

```typescript
StorageService.getStorageSize(): number

StorageService.exportData(): Record<string, any>

StorageService.importData(data: Record<string, any>): boolean
```

**Usage:**

```typescript
// Save user preferences
const saved = StorageService.setItem('user_prefs', {
  theme: 'dark',
  volume: 0.7,
})

// Retrieve with default
const prefs = StorageService.getItem('user_prefs', { theme: 'light', volume: 1.0 })

// Export all data
const backup = StorageService.exportData()
console.log('Storage size:', StorageService.getStorageSize(), 'bytes')

// Import data
StorageService.importData(backup)
```

**Features:**

- Automatic prefixing (`riddle_rush_`)
- JSON serialization/deserialization
- Error handling with fallback
- Type-safe with generics
- Export/import for backups

---

### IndexedDBService

IndexedDB wrapper with promises.

**Methods:**

```typescript
static isAvailable(): boolean

async getSize(): Promise<number>

async clearAll(): Promise<boolean>
```

**Usage:**

```typescript
const db = new IndexedDBService('riddle-rush-db', 1)

if (IndexedDBService.isAvailable()) {
  const size = await db.getSize()
  console.log('Database size:', size, 'bytes')

  // Clear all data
  await db.clearAll()
}
```

---

## Layouts

Location: `layouts/`

### default.vue

Basic layout with optional background image support.

**Usage:**

```vue
<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const setBackground = inject<(src: string) => void>('setBackground')

onMounted(() => {
  setBackground?.(`${baseUrl}assets/background.png`)
})
</script>
```

---

### game.vue

Game pages layout with back button and centered container.

**Usage:**

```vue
<script setup lang="ts">
definePageMeta({
  layout: 'game',
})

const { baseUrl } = useRuntimeConfig().public
const setBackground = inject<(src: string) => void>('setBackground')
const setBackButton = inject<(config: any) => void>('setBackButton')

onMounted(() => {
  setBackground?.(`${baseUrl}assets/players/BACKGROUND.png`)
  setBackButton?.({
    visible: true,
    image: `${baseUrl}assets/players/back.png`,
    onBack: () => navigateTo('/'),
  })
})
</script>

<template>
  <!-- Layout automatically provides container and back button -->
  <div class="title-container">
    <h1>My Game Page</h1>
  </div>

  <div class="content">
    <!-- Your content here -->
  </div>
</template>
```

---

### menu.vue

Menu layout with menu toggle button and panel support.

**Usage:**

```vue
<script setup lang="ts">
definePageMeta({
  layout: 'menu',
})

const { baseUrl } = useRuntimeConfig().public
const setBackground = inject<(src: string) => void>('setBackground')
const menuState = inject<any>('menuState')

onMounted(() => {
  setBackground?.(`${baseUrl}assets/main-menu/BACKGROUND.png`)
})
</script>

<template>
  <!-- Main content -->
  <div class="logo-container">
    <img :src="`${baseUrl}assets/main-menu/LOGO.png`" alt="Logo" />
  </div>

  <!-- Menu panel (shown when menu is open) -->
  <template #menu="{ closeMenu }">
    <div class="menu-panel">
      <button @click="closeMenu">Close</button>
      <!-- Menu items -->
    </div>
  </template>
</template>
```

---

## Auto-Import Configuration

Auto-imports are configured in `nuxt.config.ts`:

```typescript
{
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
    {
      path: '~/components/Base',
      prefix: 'Base',
      pathPrefix: false,
    },
  ],

  imports: {
    dirs: [
      'composables',
      'composables/**',
      'services',
      'utils',
    ],
  },
}
```

**What's Auto-Imported:**

- All components in `components/` directory
- All Base components with `Base` prefix
- All composables in `composables/` directory
- All services in `services/` directory
- All utilities in `utils/` directory

**No Import Statements Needed:**

```vue
<!-- Before refactoring -->
<script setup lang="ts">
import BaseButton from '~/components/Base/Button.vue'
import { useForm } from '~/composables/useForm'
import { GameService } from '~/services/GameService'

// ...
</script>

<!-- After refactoring -->
<script setup lang="ts">
// Everything is auto-imported!
const form = useForm({ ... })
const player = GameService.createPlayer('Alice')
</script>

<template>
  <BaseButton>Click me</BaseButton>
</template>
```

---

## Migration Examples

### Example 1: Refactoring a Page to Use Base Components

**Before:**

```vue
<template>
  <button class="menu-btn play-btn tap-highlight no-select" @click="handlePlay">
    <img :src="`${baseUrl}assets/main-menu/PLAY.png`" alt="Play" />
    <img :src="`${baseUrl}assets/main-menu/PLAY-1.png`" alt="Play hover" />
  </button>
</template>

<style scoped>
.menu-btn {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: transform var(--transition-base);
}
/* ... more styles ... */
</style>
```

**After:**

```vue
<template>
  <BaseImageButton
    :src="`${baseUrl}assets/main-menu/PLAY.png`"
    :hover-src="`${baseUrl}assets/main-menu/PLAY-1.png`"
    alt="Play"
    @click="handlePlay"
  />
</template>
```

**Savings:**

- 30+ lines of CSS removed
- Consistent styling automatically applied
- Hover state handled automatically

---

### Example 2: Using GameService in a Store

**Before (in store):**

```typescript
// Pinia store
export const useGameStore = defineStore('game', {
  actions: {
    createPlayer(name: string) {
      // Validation logic duplicated
      if (!name || name.trim().length === 0) {
        throw new Error('Name required')
      }
      if (name.length > 20) {
        throw new Error('Name too long')
      }

      // Player creation logic
      const player = {
        id: crypto.randomUUID(),
        name: name.trim(),
        totalScore: 0,
        // ...
      }

      this.currentSession?.players.push(player)
    },
  },
})
```

**After (in store):**

```typescript
export const useGameStore = defineStore('game', {
  actions: {
    createPlayer(name: string) {
      // Use GameService for validation
      const validation = GameService.validatePlayerName(name, this.currentSession?.players || [])
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      // Use GameService for player creation
      const player = GameService.createPlayer(name)
      this.currentSession?.players.push(player)
    },
  },
})
```

**Benefits:**

- Business logic extracted to testable service
- Validation centralized and reusable
- Store remains focused on state management

---

### Example 3: Form with Validation

**Before:**

```vue
<script setup lang="ts">
const playerName = ref('')
const nameError = ref('')
const isSubmitting = ref(false)

function validateName() {
  if (!playerName.value.trim()) {
    nameError.value = 'Name required'
    return false
  }
  if (playerName.value.length > 20) {
    nameError.value = 'Name too long'
    return false
  }
  nameError.value = ''
  return true
}

async function submit() {
  if (!validateName()) return

  isSubmitting.value = true
  try {
    await createPlayer(playerName.value)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <input v-model="playerName" @blur="validateName" />
  <span v-if="nameError">{{ nameError }}</span>
  <button :disabled="isSubmitting" @click="submit">Submit</button>
</template>
```

**After:**

```vue
<script setup lang="ts">
import { validationRules } from '~/composables/useForm'

const form = useForm({
  playerName: {
    initialValue: '',
    rules: [
      validationRules.required('Name required'),
      validationRules.maxLength(20, 'Name too long'),
    ],
  },
})

async function submit() {
  await form.handleSubmit(async (values) => {
    await createPlayer(values.playerName)
  })
}
</script>

<template>
  <input
    :value="form.values.playerName"
    @input="form.handleChange('playerName', $event.target.value)"
    @blur="form.handleBlur('playerName')"
  />
  <span v-if="form.errors.playerName">{{ form.errors.playerName }}</span>
  <BaseButton :disabled="!form.isValid.value" :loading="form.isSubmitting.value" @click="submit">
    Submit
  </BaseButton>
</template>
```

**Benefits:**

- Declarative validation rules
- Built-in touched/dirty state
- Automatic loading state
- Reusable validation logic

---

### Example 4: Converting to Layout

**Before (players.vue):**

```vue
<template>
  <div class="players-page">
    <img :src="`${baseUrl}assets/players/BACKGROUND.png`" class="page-bg" />

    <button class="back-btn" @click="goBack">
      <img :src="`${baseUrl}assets/players/back.png`" alt="Back" />
    </button>

    <div class="container">
      <!-- Page content -->
    </div>
  </div>
</template>

<style scoped>
.players-page {
  /* ... */
}
.page-bg {
  /* ... */
}
.back-btn {
  /* ... */
}
.container {
  /* ... */
}
/* 100+ lines of layout styles */
</style>
```

**After (players.vue):**

```vue
<script setup lang="ts">
definePageMeta({
  layout: 'game',
})

const { baseUrl } = useRuntimeConfig().public
const setBackground = inject<(src: string) => void>('setBackground')
const setBackButton = inject<(config: any) => void>('setBackButton')

onMounted(() => {
  setBackground?.(`${baseUrl}assets/players/BACKGROUND.png`)
  setBackButton?.({
    visible: true,
    image: `${baseUrl}assets/players/back.png`,
    onBack: () => navigateTo('/'),
  })
})
</script>

<template>
  <!-- Layout provides background, back button, and container -->
  <div class="title-container">
    <!-- Title -->
  </div>

  <div class="players-list">
    <!-- Content -->
  </div>
</template>

<style scoped>
/* Only page-specific styles, layout styles handled by layout */
.title-container {
  /* ... */
}
.players-list {
  /* ... */
}
</style>
```

**Savings:**

- 100+ lines of layout CSS eliminated
- Consistent page structure
- Centralized layout logic

---

## Best Practices

### Component Organization

**Do:**

```
components/
├── Base/           # Reusable primitives
│   ├── Button.vue
│   ├── Modal.vue
│   └── ImageButton.vue
├── Game/           # Game-specific components
│   ├── ScoreBoard.vue
│   └── PlayerCard.vue
└── Layout/         # Layout components
    ├── Header.vue
    └── Footer.vue
```

**Don't:**

```
components/
├── button.vue      # Not descriptive
├── Modal.vue       # Mixed casing
└── player-card.vue # Inconsistent naming
```

### Composable Best Practices

1. **Return Readonly State:**

```typescript
// ✅ Good - prevents external mutations
export function useCounter() {
  const count = ref(0)
  return {
    count: readonly(count),
    increment: () => count.value++,
  }
}

// ❌ Bad - allows external mutations
export function useCounter() {
  const count = ref(0)
  return { count }
}
```

2. **Provide Clear API:**

```typescript
// ✅ Good - clear method names
export function useModal() {
  return {
    isOpen: readonly(isOpen),
    open: (data?: any) => {
      /* ... */
    },
    close: () => {
      /* ... */
    },
    toggle: () => {
      /* ... */
    },
  }
}

// ❌ Bad - unclear API
export function useModal() {
  return {
    state: isOpen,
    set: (val: boolean) => {
      isOpen.value = val
    },
  }
}
```

3. **Cleanup Side Effects:**

```typescript
export function useEventListener(target: EventTarget, event: string, handler: Function) {
  onMounted(() => {
    target.addEventListener(event, handler)
  })

  // ✅ Good - cleanup on unmount
  onUnmounted(() => {
    target.removeEventListener(event, handler)
  })
}
```

### Service Best Practices

1. **Keep Services Pure:**

```typescript
// ✅ Good - pure function
export class GameService {
  static calculateScore(base: number, bonus: number): number {
    return base + bonus
  }
}

// ❌ Bad - side effects
export class GameService {
  static score = 0

  static addScore(points: number) {
    this.score += points // Mutates global state
  }
}
```

2. **Validate Inputs:**

```typescript
// ✅ Good - validates inputs
static validatePlayerName(name: string, players: Player[]): ValidationResult {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Name required' }
  }
  // ... more validation
  return { valid: true }
}

// ❌ Bad - assumes valid inputs
static validatePlayerName(name: string) {
  return name.length > 0
}
```

3. **Return Descriptive Objects:**

```typescript
// ✅ Good - descriptive return value
static validatePlayerName(name: string): { valid: boolean, error?: string } {
  // ...
}

// ❌ Bad - boolean doesn't explain why
static isValidPlayerName(name: string): boolean {
  // ...
}
```

### TypeScript Best Practices

1. **Use Type Inference:**

```typescript
// ✅ Good
const count = ref(0) // Inferred as Ref<number>

// ❌ Unnecessary
const count: Ref<number> = ref(0)
```

2. **Define Interfaces for Props:**

```typescript
// ✅ Good
interface Props {
  title: string
  count?: number
}

const props = defineProps<Props>()

// ❌ Bad - runtime props
const props = defineProps({
  title: String,
  count: Number,
})
```

3. **Use Generics for Reusability:**

```typescript
// ✅ Good
export class StorageService {
  static getItem<T>(key: string, defaultValue?: T): T | null {
    // ...
  }
}

// ❌ Bad - loses type information
export class StorageService {
  static getItem(key: string): any {
    // ...
  }
}
```

### Testing Recommendations

1. **Test Services in Isolation:**

```typescript
import { describe, it, expect } from 'vitest'
import { GameService } from '~/services/GameService'

describe('GameService', () => {
  it('validates player names correctly', () => {
    const result = GameService.validatePlayerName('', [])
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Player name cannot be empty')
  })
})
```

2. **Test Composables with Mounting:**

```typescript
import { mount } from '@vue/test-utils'
import { useForm } from '~/composables/useForm'

it('validates required fields', async () => {
  const wrapper = mount({
    setup() {
      return useForm({
        name: {
          initialValue: '',
          rules: [
            /* ... */
          ],
        },
      })
    },
  })
  // Test implementation
})
```

---

## Migration Checklist

When refactoring existing code:

- [ ] Replace inline buttons with `BaseButton` or `BaseImageButton`
- [ ] Extract form logic to `useForm` composable
- [ ] Move business logic from stores to appropriate services
- [ ] Use `useAssets` for all asset path handling
- [ ] Convert repeated modal patterns to `BaseModal` + `useModal`
- [ ] Apply appropriate layout (`default`, `game`, `menu`)
- [ ] Remove duplicated CSS that's now in base components
- [ ] Update tests to use new abstractions
- [ ] Add TypeScript types where missing
- [ ] Document any custom components or composables

---

## Summary

The refactoring introduces:

✅ **3 Base Components** - Reusable UI building blocks
✅ **4 New Composables** - Reactive logic patterns
✅ **2 Service Classes** - Business logic abstraction
✅ **3 Layouts** - Standardized page structures
✅ **Auto-imports** - Zero-boilerplate development

**Result:**

- Less code duplication
- Better separation of concerns
- Improved testability
- Consistent user experience
- Faster development

**Next Steps:**

1. Gradually migrate existing pages to use new abstractions
2. Write unit tests for services and composables
3. Consider adding more base components (BaseInput, BaseCard, etc.)
4. Document any new patterns or components added

---

**Questions or Issues?**

Check the [CLAUDE.md](../CLAUDE.md) for project-specific patterns or open an issue for clarification.
