export interface Category {
  id: number
  name: string
  searchWord: string
  key: string
  searchProvider: string
  additionalData?: string[]
  letter?: string
}

export interface PetScanResult {
  found: boolean
  other: string[]
}

export async function searchPetScan(category: string): Promise<string[]> {
  try {
    const params = new URLSearchParams({
      max_sitelink_count: '9999',
      categories: category,
      project: 'wikipedia',
      language: 'de',
      cb_labels_yes_l: '1',
      'edits[flagged]': 'both',
      'edits[bots]': 'both',
      search_max_results: '9999995',
      cb_labels_any_l: '1',
      cb_labels_no_l: '1',
      format: 'json',
      interface_language: 'de',
      'edits[anons]': 'both',
      'ns[0]': '1',
      doit: '',
    })

    const url = `https://petscan.wmflabs.org/?${params.toString()}`
    // eslint-disable-next-line no-console
    console.log('Requesting PETScan', { category })

    const res = await fetch(url)
    const data = await res.json()
    const results = data?.['*']?.[0]?.['a']?.['*']

    if (!results) {
      return []
    }

    return results
      .map((e: { title: string }) => e.title.split('_')[0])
      .filter((e: string) => e !== category)
  } catch (error) {
    console.error('Error fetching from PetScan:', error)
    return []
  }
}

type OfflineAnswers = Record<string, Record<string, string[]>>

export async function searchOffline(
  category: string,
  letter: string,
): Promise<string[]> {
  try {
    const offlineAnswers = await $fetch<OfflineAnswers>('/data/offlineAnswers.json')
    const categoryAnswers = offlineAnswers[category]

    if (!categoryAnswers) {
      console.warn(`No offline data for category: ${category}`)
      return []
    }

    return categoryAnswers[letter.toLowerCase()] || []
  } catch (error) {
    console.error('Error loading offline answers:', error)
    return []
  }
}

export function generateResult(
  list: string[],
  letter: string,
  term: string,
  categoryItem: Category,
): PetScanResult {
  let items = list

  if (categoryItem.additionalData) {
    items = [...items, ...categoryItem.additionalData]
  }

  const results = items.filter((e) =>
    e.toUpperCase().startsWith(letter.toUpperCase()),
  )

  const found = results.includes(term)
  const other = results.filter((res) => res !== term).slice(0, 4)

  return { found, other }
}

export async function performSearch(
  category: string,
  letter: string,
  term: string,
  categories: Category[],
): Promise<PetScanResult> {
  const currentCategory = categories.find((e) => e.searchWord === category)

  if (!currentCategory) {
    throw new Error('Category not found')
  }

  const useOfflineMode = process.env.OFFLINE_MODE === 'true'

  let result: string[]
  switch (currentCategory.searchProvider) {
    case 'petscan':
      result = useOfflineMode
        ? await searchOffline(currentCategory.searchWord, letter)
        : await searchPetScan(currentCategory.searchWord)
      return generateResult(result, letter, term, currentCategory)
    case 'offline':
      result = await searchOffline(currentCategory.searchWord, letter)
      return generateResult(result, letter, term, currentCategory)
    case 'wikipedia':
      throw new Error('Wikipedia search provider not yet implemented')
    default:
      throw new Error('Unknown search provider')
  }
}
