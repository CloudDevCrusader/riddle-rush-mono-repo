import { faker } from '@faker-js/faker'

/**
 * Faker helper utilities for E2E tests
 * Provides consistent, randomized test data generation
 */

/**
 * Generate a random player name
 * @returns A random first name
 */
export function generatePlayerName(): string {
  return faker.person.firstName()
}

/**
 * Generate multiple random player names
 * @param count Number of names to generate
 * @returns Array of random first names
 */
export function generatePlayerNames(count: number): string[] {
  return Array.from({ length: count }, () => generatePlayerName())
}

/**
 * Generate a random answer for game submissions
 * @returns A random word
 */
export function generateAnswer(): string {
  return faker.word.noun()
}

/**
 * Generate multiple random answers
 * @param count Number of answers to generate
 * @returns Array of random words
 */
export function generateAnswers(count: number): string[] {
  return Array.from({ length: count }, () => generateAnswer())
}

/**
 * Generate a unique seed for reproducible tests
 * Call this at the beginning of a test to make Faker deterministic
 * @param seed Optional seed value (default: test name hash)
 */
export function setFakerSeed(seed?: number): void {
  faker.seed(seed ?? Date.now())
}

/**
 * Reset Faker to random mode (non-deterministic)
 */
export function resetFaker(): void {
  faker.seed()
}
