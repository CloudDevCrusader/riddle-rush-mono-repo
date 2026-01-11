import { faker } from '@faker-js/faker'
import type {
  Category,
  GameAttempt,
  GameSession,
  GameStatistics,
  Player,
} from '@riddle-rush/types/game'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const WORD_CHARACTERS = 'abcdefghijklmnopqrstuvwxyz'

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

const randomWord = (minLength = 4, maxLength = 12) => {
  const length = randomInt(minLength, maxLength)
  let word = ''

  for (let index = 0; index < length; index += 1) {
    const charIndex = randomInt(0, WORD_CHARACTERS.length - 1)
    word += WORD_CHARACTERS.charAt(charIndex)
  }

  return word
}

export const createRandomText = (minLength = 40, maxLength = 120) => {
  const targetLength = randomInt(minLength, maxLength)
  let text = ''

  while (text.length < targetLength) {
    text = `${text} ${randomWord(4, 12)}`.trim()
  }

  return text.charAt(0).toUpperCase() + text.slice(1)
}

// Enhanced category templates using Faker for more realistic data
const CATEGORY_TEMPLATES = [
  'Female Name',
  'Male Name',
  'City',
  'Country',
  'Animal',
  'Profession',
  'Plant',
  'Food',
  'Drink',
  'Sport',
]

export const randomLetter = (): string => {
  const letter = LETTERS.charAt(randomInt(0, LETTERS.length - 1))
  return letter.toLowerCase()
}

export const createCategory = (overrides: Partial<Category> = {}): Category => {
  const templateIndex = randomInt(0, CATEGORY_TEMPLATES.length - 1)
  const template = CATEGORY_TEMPLATES[templateIndex]
  const id = overrides.id ?? randomInt(1, 10_000)
  const letter = overrides.letter ?? randomLetter()

  // Generate realistic category data based on template
  let name, searchWord, additionalData

  switch (template) {
    case 'Female Name':
      name = overrides.name ?? faker.person.firstName('female')
      searchWord = 'female_name'
      additionalData = {
        examples: [faker.person.firstName('female'), faker.person.firstName('female')],
      }
      break
    case 'Male Name':
      name = overrides.name ?? faker.person.firstName('male')
      searchWord = 'male_name'
      additionalData = {
        examples: [faker.person.firstName('male'), faker.person.firstName('male')],
      }
      break
    case 'City':
      name = overrides.name ?? faker.location.city()
      searchWord = 'city'
      additionalData = { examples: [faker.location.city(), faker.location.city()] }
      break
    case 'Country':
      name = overrides.name ?? faker.location.country()
      searchWord = 'country'
      additionalData = { examples: [faker.location.country(), faker.location.country()] }
      break
    case 'Animal':
      name = overrides.name ?? faker.animal.type()
      searchWord = 'animal'
      additionalData = { examples: [faker.animal.type(), faker.animal.type()] }
      break
    case 'Profession':
      name = overrides.name ?? faker.person.jobTitle()
      searchWord = 'profession'
      additionalData = { examples: [faker.person.jobTitle(), faker.person.jobTitle()] }
      break
    case 'Plant':
      name =
        overrides.name ??
        faker.helpers.arrayElement(['Rose', 'Tulip', 'Oak', 'Pine', 'Palm', 'Cactus'])
      searchWord = 'plants'
      additionalData = { examples: ['Rose', 'Tulip', 'Oak'] }
      break
    case 'Food':
      name =
        overrides.name ?? faker.helpers.arrayElement(['Pizza', 'Burger', 'Pasta', 'Sushi', 'Taco'])
      searchWord = 'food'
      additionalData = { examples: ['Pizza', 'Burger', 'Pasta'] }
      break
    case 'Drink':
      name =
        overrides.name ?? faker.helpers.arrayElement(['Water', 'Coffee', 'Tea', 'Juice', 'Soda'])
      searchWord = 'drink'
      additionalData = { examples: ['Water', 'Coffee', 'Tea'] }
      break
    case 'Sport':
      name =
        overrides.name ??
        faker.helpers.arrayElement(['Soccer', 'Basketball', 'Tennis', 'Swimming', 'Running'])
      searchWord = 'sport'
      additionalData = { examples: ['Soccer', 'Basketball', 'Tennis'] }
      break
    default:
      name = overrides.name ?? template
      searchWord = overrides.searchWord ?? template.replace(/\s+/g, '_').toLowerCase()
  }

  return {
    id,
    name: overrides.name ?? name,
    searchWord: overrides.searchWord ?? searchWord,
    key: overrides.key ?? `key_${id}`,
    searchProvider: overrides.searchProvider ?? 'offline',
    additionalData: overrides.additionalData ?? additionalData,
    letter,
  }
}

export const createCategoryList = (
  count: number,
  overrides: Array<Partial<Category> | undefined> = []
): Category[] =>
  Array.from({ length: count }, (_, index) => {
    const override = overrides[index] ?? {}
    return createCategory({ id: index + 1, ...override })
  })

export const createGameAttempt = (overrides: Partial<GameAttempt> = {}): GameAttempt => ({
  term: overrides.term ?? faker.lorem.words({ min: 1, max: 3 }),
  found: overrides.found ?? Math.random() > 0.5,
  timestamp: overrides.timestamp ?? Date.now(),
})

export const createGameSession = (overrides: Partial<GameSession> = {}): GameSession => {
  const attempts =
    overrides.attempts ?? Array.from({ length: randomInt(1, 5) }, () => createGameAttempt())
  const category = overrides.category ?? createCategory()
  const score = overrides.score ?? attempts.filter((attempt) => attempt.found).length * 10

  return {
    id: overrides.id ?? faker.string.uuid(),
    userId: overrides.userId ?? faker.string.uuid(),
    category,
    letter: overrides.letter ?? category.letter ?? randomLetter(),
    startTime: overrides.startTime ?? Date.now() - randomInt(0, 60_000),
    endTime: overrides.endTime,
    score,
    attempts,
    // New multi-player fields
    players: overrides.players ?? [],
    currentRound: overrides.currentRound ?? 0,
    roundHistory: overrides.roundHistory ?? [],
    gameName: overrides.gameName ?? faker.lorem.words(2),
    status: overrides.status ?? 'active',
  }
}

export const createGameStatistics = (overrides: Partial<GameStatistics> = {}): GameStatistics => {
  const totalGames = overrides.totalGames ?? randomInt(0, 50)
  const totalAttempts = overrides.totalAttempts ?? randomInt(totalGames, totalGames * 5 + 1)
  const correctAttempts = overrides.correctAttempts ?? randomInt(0, totalAttempts)

  return {
    totalGames,
    totalAttempts,
    correctAttempts,
    totalScore: overrides.totalScore ?? correctAttempts * 10,
    totalPlayTime: overrides.totalPlayTime ?? randomInt(0, 3_600_000),
    categoriesPlayed: overrides.categoriesPlayed ?? {},
    lastPlayed: overrides.lastPlayed ?? Date.now(),
    bestScore: overrides.bestScore ?? randomInt(0, 200),
    averageScore:
      overrides.averageScore ??
      (totalGames === 0 ? 0 : Math.round((correctAttempts * 10) / totalGames)),
    streakCurrent: overrides.streakCurrent ?? randomInt(0, 5),
    streakBest: overrides.streakBest ?? randomInt(0, 10),
  }
}

export const createValidAnswer = (letter: string): string => {
  const word = randomWord(5, 10)
  return `${letter.toUpperCase()}${word.slice(1)}`
}

export const createInvalidAnswer = (letter: string): string => {
  const otherLetters = LETTERS.replace(letter.toUpperCase(), '')
  const newLetter = otherLetters.charAt(randomInt(0, otherLetters.length - 1))
  const word = randomWord(5, 10)
  return `${newLetter}${word.slice(1)}`
}

export const createOtherAnswers = (count = 4): string[] =>
  Array.from({ length: count }, () => createRandomText(10, 30))

/**
 * Creates realistic player data for testing
 */
export const createPlayer = (overrides: Partial<Player> = {}): Player => ({
  id: overrides.id ?? faker.string.uuid(),
  name: overrides.name ?? faker.person.firstName(),
  totalScore: overrides.totalScore ?? randomInt(0, 100),
  currentRoundScore: overrides.currentRoundScore ?? randomInt(0, 20),
  currentRoundAnswer: overrides.currentRoundAnswer ?? faker.lorem.word(),
  hasSubmitted: overrides.hasSubmitted ?? Math.random() > 0.5,
})

/**
 * Creates a list of realistic players for testing
 */
export const createPlayerList = (count: number): Player[] =>
  Array.from({ length: count }, (_, index) => createPlayer({ name: `Player ${index + 1}` }))
