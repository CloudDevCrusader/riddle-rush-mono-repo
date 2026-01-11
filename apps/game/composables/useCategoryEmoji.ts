/**
 * Category emoji mapping utility
 * Provides emoji icons for different game categories
 */

const CATEGORY_EMOJI_MAP: Record<string, string> = {
  'Weiblicher Vorname': '👩',
  'Männlicher Vorname': '👨',
  'Wasser Fahrzeug': '⛵',
  Blumen: '🌸',
  Pflanzen: '🌿',
  'Beruf oder Gewerbe': '💼',
  Insekt: '🐛',
  Tier: '🐾',
  Stadt: '🏙️',
  Land: '🌍',
  Essen: '🍽️',
  Getränk: '🥤',
  Sport: '⚽',
  Musik: '🎵',
  Film: '🎬',
  Berg: '⛰️',
  Mountains: '🏔️',
  Hills: '⛰️',
  Gewässer: '💧',
  See: '🌊',
  Maschine: '⚙️',
  Technik: '🔧',
  Raumfahrt: '🚀',
  '-heit': '📝',
  '-ung': '📝',
  '-keit': '📝',
  Farbe: '🎨',
  Erfinder: '💡',
  Entdecker: '🔍',
  Gelehrter: '👨‍🎓',
  Maler: '🎨',
  Bildhauer: '🗿',
  Komponist: '🎼',
  Sänger: '🎤',
}

/**
 * Composable for resolving category emojis
 */
export function useCategoryEmoji() {
  const resolve = (name?: string | null): string => {
    if (!name) return '🎯'

    for (const [key, emoji] of Object.entries(CATEGORY_EMOJI_MAP)) {
      if (name.toLowerCase().includes(key.toLowerCase())) {
        return emoji
      }
    }

    return '🎯'
  }

  return {
    resolve,
    emojiMap: CATEGORY_EMOJI_MAP,
  }
}
