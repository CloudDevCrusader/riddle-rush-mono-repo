import { useFeatureFlagsInit } from '~/composables/useFeatureFlags';

export default defineNuxtPlugin(() => {
  useFeatureFlagsInit();
});
