/**
 * Composable for form handling with Vue 3 Composition API
 * Provides validation, submission, and error handling
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ValidationRule<T = unknown> {
  validate: (value: T) => boolean
  message: string
}

export interface FieldConfig<T = unknown> {
  initialValue: T
  rules?: ValidationRule<T>[]
}

export function useForm<T extends Record<string, unknown>>(fields: Record<keyof T, FieldConfig>) {
  // Form state - use any for reactive to avoid type issues
  const values = reactive({} as any) as T
  const errors = reactive({} as Record<string, string>)
  const touched = reactive({} as Record<string, boolean>)
  const isSubmitting = ref(false)

  // Initialize values
  Object.keys(fields).forEach((key) => {
    ;(values as any)[key] = fields[key as keyof T].initialValue
    ;(touched as any)[key] = false
  })

  /**
   * Validate a single field
   */
  const validateField = (fieldName: keyof T): boolean => {
    const field = fields[fieldName]
    const value = (values as any)[fieldName]

    if (!field.rules || field.rules.length === 0) {
      return true
    }

    for (const rule of field.rules) {
      if (!rule.validate(value)) {
        errors[fieldName as string] = rule.message
        return false
      }
    }

    // Use undefined instead of delete to avoid dynamic delete
    errors[fieldName as string] = undefined as any
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
    ;(values as any)[fieldName] = value
    ;(touched as any)[fieldName] = true

    // Validate on change if already touched
    if ((touched as any)[fieldName]) {
      validateField(fieldName)
    }
  }

  /**
   * Handle field blur
   */
  const handleBlur = (fieldName: keyof T) => {
    ;(touched as any)[fieldName] = true
    validateField(fieldName)
  }

  /**
   * Submit form
   */
  const handleSubmit = async (onSubmit: (values: T) => Promise<void> | void): Promise<boolean> => {
    // Mark all fields as touched
    Object.keys(fields).forEach((key) => {
      ;(touched as any)[key] = true
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
      ;(values as any)[fieldKey] = fields[fieldKey].initialValue
      ;(touched as any)[fieldKey] = false
      errors[fieldKey as string] = undefined as any
    })
    isSubmitting.value = false
  }

  /**
   * Set field value programmatically
   */
  const setValue = (fieldName: keyof T, value: unknown) => {
    ;(values as any)[fieldName] = value
  }

  /**
   * Set field error programmatically
   */
  const setError = (fieldName: keyof T, message: string) => {
    errors[fieldName as string] = message
  }

  // Computed properties
  const isValid = computed(() => Object.keys(errors).length === 0)
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
