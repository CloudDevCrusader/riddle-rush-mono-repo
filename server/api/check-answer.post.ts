import { performSearch, type Category } from '../utils/petScanService'

interface CheckAnswerRequest {
  searchWord: string
  letter: string
  term: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<CheckAnswerRequest>(event)
  const { searchWord, letter, term } = body

  if (!searchWord || !letter || !term) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields: searchWord, letter, term',
    })
  }

  const categories = await $fetch<Category[]>('/data/categories.json')
  return performSearch(searchWord, letter, term, categories)
})
