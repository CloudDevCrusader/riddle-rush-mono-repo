/**
 * Pure validation functions for form and data validation.
 * These functions are framework-agnostic and can be used anywhere.
 */

import type { ValidationRule } from '~/composables/useForm'

/**
 * Creates a required field validation rule.
 * Handles strings (trimmed), arrays, and null/undefined values.
 */
export function required<T>(message = 'This field is required'): ValidationRule<T> {
  return {
    validate: (value: T) => {
      if (typeof value === 'string') return value.trim().length > 0
      if (Array.isArray(value)) return value.length > 0
      return value !== null && value !== undefined
    },
    message,
  }
}

/**
 * Creates a minimum length validation rule for strings.
 */
export function minLength(
  length: number,
  message = `Must be at least ${length} characters`
): ValidationRule<string> {
  return {
    validate: (value: string) => value.length >= length,
    message,
  }
}

/**
 * Creates a maximum length validation rule for strings.
 */
export function maxLength(
  length: number,
  message = `Must be at most ${length} characters`
): ValidationRule<string> {
  return {
    validate: (value: string) => value.length <= length,
    message,
  }
}

/**
 * Creates a pattern (regex) validation rule for strings.
 */
export function pattern(regex: RegExp, message = 'Invalid format'): ValidationRule<string> {
  return {
    validate: (value: string) => regex.test(value),
    message,
  }
}

/**
 * Creates an email validation rule.
 * Uses a simplified regex to avoid backtracking issues.
 */
export function email(message = 'Invalid email address'): ValidationRule<string> {
  return {
    validate: (value: string) =>
      // Simplified email regex to avoid backtracking issues
      /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(value),
    message,
  }
}

/**
 * Creates a minimum value validation rule for numbers.
 */
export function min(
  minValue: number,
  message = `Must be at least ${minValue}`
): ValidationRule<number> {
  return {
    validate: (value: number) => value >= minValue,
    message,
  }
}

/**
 * Creates a maximum value validation rule for numbers.
 */
export function max(
  maxValue: number,
  message = `Must be at most ${maxValue}`
): ValidationRule<number> {
  return {
    validate: (value: number) => value <= maxValue,
    message,
  }
}

/**
 * Collection of all validation rules for convenience.
 * Can be imported as a single object for compatibility with existing code.
 */
export const validationRules = {
  required,
  minLength,
  maxLength,
  pattern,
  email,
  min,
  max,
}
