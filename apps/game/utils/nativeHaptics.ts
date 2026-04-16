import { Capacitor } from '@capacitor/core'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

/** Short native tap feedback for UI buttons (no-op on web / SSR). */
export function fireNativeClickHaptic(): void {
  if (import.meta.server || typeof window === 'undefined') {
    return
  }
  if (!Capacitor.isNativePlatform()) {
    return
  }
  void Haptics.impact({ style: ImpactStyle.Light }).catch(() => {})
}
