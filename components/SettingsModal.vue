<template>
  <Transition name="fade">
    <div
      v-if="modelValue"
      class="settings-overlay"
      @click="closeModal"
    >
      <div
        class="settings-card"
        @click.stop
      >
        <div class="settings-header">
          <h2 class="settings-title">
            {{ $t('settings.title') }}
          </h2>
          <button
            class="close-btn tap-highlight no-select"
            @click="closeModal"
          >
            ✕
          </button>
        </div>

        <div class="settings-content">
          <!-- Sound Toggle -->
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-icon">🔊</span>
              <span class="setting-label">{{ $t('settings.sound') }}</span>
            </div>
            <button
              class="toggle-btn tap-highlight no-select"
              :class="{ active: settingsStore.soundEnabled }"
              @click="toggleSound"
            >
              <span class="toggle-slider" />
            </button>
          </div>

          <!-- Leaderboard Toggle -->
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-icon">🏆</span>
              <span class="setting-label">{{ $t('settings.leaderboard') }}</span>
            </div>
            <button
              class="toggle-btn tap-highlight no-select"
              :class="{ active: settingsStore.leaderboardEnabled }"
              @click="toggleLeaderboard"
            >
              <span class="toggle-slider" />
            </button>
          </div>

          <!-- Debug Mode Toggle -->
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-icon">🐛</span>
              <span class="setting-label">{{ $t('settings.debug') }}</span>
            </div>
            <button
              class="toggle-btn tap-highlight no-select"
              :class="{ active: settingsStore.debugMode }"
              @click="toggleDebug"
            >
              <span class="toggle-slider" />
            </button>
          </div>

          <!-- Max Players -->
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-icon">👥</span>
              <span class="setting-label">{{ $t('settings.maxPlayers') }}</span>
            </div>
            <div class="number-control">
              <button
                class="number-btn tap-highlight no-select"
                @click="decreaseMaxPlayers"
              >
                −
              </button>
              <span class="number-value">{{ settingsStore.maxPlayersPerGame }}</span>
              <button
                class="number-btn tap-highlight no-select"
                @click="increaseMaxPlayers"
              >
                +
              </button>
            </div>
          </div>

          <!-- Language Selection -->
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-icon">🌐</span>
              <span class="setting-label">{{ $t('language.title') }}</span>
            </div>
            <select
              v-model="currentLocale"
              class="language-select tap-highlight"
              @change="changeLanguage"
            >
              <option value="de">
                Deutsch
              </option>
              <option value="en">
                English
              </option>
            </select>
          </div>
        </div>

        <div class="settings-footer">
          <button
            class="btn btn-outline tap-highlight no-select"
            @click="resetSettings"
          >
            {{ $t('settings.reset') }}
          </button>
          <button
            class="btn btn-primary tap-highlight no-select"
            @click="closeModal"
          >
            {{ $t('common.close') }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useSettingsStore } from '~/stores/settings'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const settingsStore = useSettingsStore()
const { locale } = useI18n()
const toast = useToast()
const { t } = useI18n()

const currentLocale = ref(locale.value)

const closeModal = () => {
  emit('update:modelValue', false)
}

const toggleSound = () => {
  settingsStore.toggleSound()
  toast.info(
    settingsStore.soundEnabled
      ? t('settings.sound_enabled', 'Sound enabled')
      : t('settings.sound_disabled', 'Sound disabled'),
  )
}

const toggleLeaderboard = () => {
  settingsStore.toggleLeaderboard()
  toast.info(
    settingsStore.leaderboardEnabled
      ? t('settings.leaderboard_enabled', 'Leaderboard enabled')
      : t('settings.leaderboard_disabled', 'Leaderboard disabled'),
  )
}

const toggleDebug = () => {
  settingsStore.toggleDebugMode()
}

const increaseMaxPlayers = () => {
  const newValue = Math.min(settingsStore.maxPlayersPerGame + 1, 10)
  settingsStore.updateSetting('maxPlayersPerGame', newValue)
}

const decreaseMaxPlayers = () => {
  const newValue = Math.max(settingsStore.maxPlayersPerGame - 1, 2)
  settingsStore.updateSetting('maxPlayersPerGame', newValue)
}

const changeLanguage = () => {
  locale.value = currentLocale.value
  toast.success(t('settings.language_changed', 'Language changed'))
}

const resetSettings = () => {
  settingsStore.resetToDefaults()
  currentLocale.value = 'de'
  locale.value = 'de'
  toast.success(t('settings.reset_success', 'Settings reset to defaults'))
}

// Load settings on mount
onMounted(() => {
  settingsStore.loadSettings()
})
</script>

<style scoped>
.settings-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-lg);
}

.settings-card {
  background: var(--color-white);
  border-radius: var(--radius-xl);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--color-gray-light);
}

.settings-title {
  font-family: var(--font-display);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  margin: 0;
}

.close-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: var(--color-gray-light);
  color: var(--color-text);
  font-size: var(--font-size-xl);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-base);
}

.close-btn:hover {
  background: var(--color-gray);
  transform: scale(1.05);
}

.close-btn:active {
  transform: scale(0.95);
}

.settings-content {
  padding: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  background: var(--color-background);
  border-radius: var(--radius-lg);
  transition: background var(--transition-base);
}

.setting-item:hover {
  background: var(--color-gray-light);
}

.setting-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
}

.setting-icon {
  font-size: 24px;
}

.setting-label {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
}

/* Toggle Button */
.toggle-btn {
  position: relative;
  width: 60px;
  height: 32px;
  border-radius: 16px;
  border: none;
  background: var(--color-gray);
  cursor: pointer;
  transition: background var(--transition-base);
  padding: 0;
}

.toggle-btn.active {
  background: var(--color-primary);
}

.toggle-slider {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-white);
  transition: transform var(--transition-base);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-btn.active .toggle-slider {
  transform: translateX(28px);
}

/* Number Control */
.number-control {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.number-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  border: 2px solid var(--color-primary);
  background: var(--color-white);
  color: var(--color-primary);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: all var(--transition-base);
  display: flex;
  align-items: center;
  justify-content: center;
}

.number-btn:hover {
  background: var(--color-primary);
  color: var(--color-white);
  transform: scale(1.05);
}

.number-btn:active {
  transform: scale(0.95);
}

.number-value {
  min-width: 40px;
  text-align: center;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

/* Language Select */
.language-select {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 2px solid var(--color-primary);
  border-radius: var(--radius-md);
  background: var(--color-white);
  color: var(--color-text);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-base);
}

.language-select:hover {
  background: var(--color-gray-light);
}

.language-select:focus {
  outline: none;
  border-color: var(--color-secondary);
}

/* Footer */
.settings-footer {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
  border-top: 1px solid var(--color-gray-light);
}

.settings-footer .btn {
  flex: 1;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .settings-card {
    max-height: 95vh;
  }

  .settings-header,
  .settings-content,
  .settings-footer {
    padding: var(--spacing-lg);
  }

  .settings-title {
    font-size: var(--font-size-xl);
  }

  .setting-label {
    font-size: var(--font-size-base);
  }
}
</style>
