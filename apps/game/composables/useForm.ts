import { ref, reactive, readonly, computed } from 'vue'

/**
 * Composable for form handling with Vue 3 Composition API
 * Provides validation, submission, and error handling
 */

export interface ValidationRule<T = unknown> {
  validate: (value: T) => boolean
  message: string
}

export interface FieldConfig<T = unknown> {
  initialValue: T
  rules?: ValidationRule<T>[]
}

export function useForm<T extends Record<string, unknown>>(fields: Record<keyof T, FieldConfig>) {
  // Form state with proper typing
  const values = reactive({} as T)
  const errors = reactive({} as Record<string, string | undefined>)
  const touched = reactive({} as Record<string, boolean>)
  const isSubmitting = ref(false)

  // Initialize values
  Object.keys(fields).forEach((key) => {
    const fieldKey = key as keyof T
    ;(values as Record<string, unknown>)[key] = fields[fieldKey].initialValue
    ;(touched as Record<string, boolean>)[key] = false
  })

  /**
   * Validate a single field
   */
  const validateField = (fieldName: keyof T): boolean => {
    const field = fields[fieldName]
    const value = (values as Record<string, unknown>)[fieldName as string]

    if (!field.rules || field.rules.length === 0) {
      return true
    }

    for (const rule of field.rules) {
      if (!rule.validate(value as never)) {
        ;(errors as Record<string, string | undefined>)[fieldName as string] = rule.message
        return false
      }
    }

    // Clear error by setting to undefined
    const errorsObj = errors as Record<string, string | undefined>
    const key = fieldName as string
    errorsObj[key] = undefined
    return true
  }

  /**
   * Validate all fields
   */
  const validateAll = (): boolean => {
    let isValid = true

    Object.keys(fields).forEach((key) => {
      const fieldKey = key as keyof T
      if (!validateField(fieldKey)) {
        isValid = false
      }
    })

    return isValid
  }

  /**
   * Handle field change
   */
  const handleChange = (fieldName: keyof T, value: unknown) => {
    const key = fieldName as string
    ;(values as Record<string, unknown>)[key] = value
    ;(touched as Record<string, boolean>)[key] = true

    // Validate on change if already touched
    if ((touched as Record<string, boolean>)[key]) {
      validateField(fieldName)
    }
  }

  /**
   * Handle field blur
   */
  const handleBlur = (fieldName: keyof T) => {
    ;(touched as Record<string, boolean>)[fieldName as string] = true
    validateField(fieldName)
  }

  /**
   * Submit form
   */
  const handleSubmit = async (onSubmit: (values: T) => Promise<void> | void): Promise<boolean> => {
    // Mark all fields as touched
    Object.keys(fields).forEach((key) => {
      ;(touched as Record<string, boolean>)[key] = true
    })

    // Validate all fields
    if (!validateAll()) {
      return false
    }

    isSubmitting.value = true

    try {
      await onSubmit(values as T)
      return true
    } catch {
      // Form errors are handled by the caller
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  /**
   * Reset form to initial values
   */
  const reset = () => {
    Object.keys(fields).forEach((key) => {
      const fieldKey = key as keyof T
      const errorsRecord = errors as Record<string, string | undefined>
      ;(values as Record<string, unknown>)[key] = fields[fieldKey].initialValue
      ;(touched as Record<string, boolean>)[key] = false
      errorsRecord[key] = undefined
    })
    isSubmitting.value = false
  }

  /**
   * Set field value programmatically
   */
  const setValue = (fieldName: keyof T, value: unknown) => {
    ;(values as Record<string, unknown>)[fieldName as string] = value
  }

  /**
   * Set field error programmatically
   */
  const setError = (fieldName: keyof T, message: string) => {
    ;(errors as Record<string, string | undefined>)[fieldName as string] = message
  }

  // Computed properties
  const isValid = computed(() => {
    return Object.values(errors as Record<string, string | undefined>).every(
      (error) => error === undefined
    )
  })
  const isDirty = computed(() => Object.values(touched).some(Boolean))

  return {
    values: readonly(values),
    errors: readonly(errors),
    touched: readonly(touched),
    isSubmitting: readonly(isSubmitting),
    isValid,
    isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    validateField,
    validateAll,
    reset,
    setValue,
    setError,
  }
}

/**
 * Common validation rules
 */
export const validationRules = {
  required: <T>(message = 'This field is required'): ValidationRule<T> => ({
    validate: (value: T) => {
      if (typeof value === 'string') return value.trim().length > 0
      if (Array.isArray(value)) return value.length > 0
      return value !== null && value !== undefined
    },
    message,
  }),

  minLength: (
    length: number,
    message = `Must be at least ${length} characters`
  ): ValidationRule<string> => ({
    validate: (value: string) => value.length >= length,
    message,
  }),

  maxLength: (
    length: number,
    message = `Must be at most ${length} characters`
  ): ValidationRule<string> => ({
    validate: (value: string) => value.length <= length,
    message,
  }),

  pattern: (regex: RegExp, message = 'Invalid format'): ValidationRule<string> => ({
    validate: (value: string) => regex.test(value),
    message,
  }),

  email: (message = 'Invalid email address'): ValidationRule<string> => ({
    validate: (value: string) =>
      // Simplified email regex to avoid backtracking issues
      /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(value),
    message,
  }),

  min: (minValue: number, message = `Must be at least ${minValue}`): ValidationRule<number> => ({
    validate: (value: number) => value >= minValue,
    message,
  }),

  max: (maxValue: number, message = `Must be at most ${maxValue}`): ValidationRule<number> => ({
    validate: (value: number) => value <= maxValue,
    message,
  }),
}
