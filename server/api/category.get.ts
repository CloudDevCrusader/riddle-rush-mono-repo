import type { Category } from '../utils/petScanService'

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'

export default defineEventHandler(async () => {
  const categories = await $fetch<Category[]>('/data/categories.json')
  const category = categories[Math.floor(Math.random() * categories.length)]
  const letter = ALPHABET[Math.floor(Math.random() * ALPHABET.length)]

  return { ...category, letter }
})
