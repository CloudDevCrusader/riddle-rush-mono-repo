import { describe, it, expect } from 'vitest'
import { useForm, validationRules } from '../../composables/useForm'

describe('useForm', () => {
  describe('initialization', () => {
    it('should initialize with field values', () => {
      const form = useForm({
        username: { initialValue: '' },
        age: { initialValue: 0 },
      })

      expect(form.values.username).toBe('')
      expect(form.values.age).toBe(0)
    })

    it('should initialize with untouched fields', () => {
      const form = useForm({
        username: { initialValue: '' },
      })

      expect(form.touched.username).toBe(false)
    })

    it('should start as valid', () => {
      const form = useForm({
        username: { initialValue: 'test' },
      })

      expect(form.isValid.value).toBe(true)
    })

    it('should start as not dirty', () => {
      const form = useForm({
        username: { initialValue: '' },
      })

      expect(form.isDirty.value).toBe(false)
    })

    it('should not be submitting initially', () => {
      const form = useForm({
        username: { initialValue: '' },
      })

      expect(form.isSubmitting.value).toBe(false)
    })
  })

  describe('handleChange', () => {
    it('should update field value', () => {
      const form = useForm({
        username: { initialValue: '' },
      })

      form.handleChange('username', 'alice')
      expect(form.values.username).toBe('alice')
    })

    it('should mark field as touched', () => {
      const form = useForm({
        username: { initialValue: '' },
      })

      form.handleChange('username', 'alice')
      expect(form.touched.username).toBe(true)
    })

    it('should make form dirty', () => {
      const form = useForm({
        username: { initialValue: '' },
      })

      form.handleChange('username', 'alice')
      expect(form.isDirty.value).toBe(true)
    })

    it('should validate if field is touched', () => {
      const form = useForm({
        username: {
          initialValue: '',
          rules: [validationRules.required()],
        },
      })

      form.handleChange('username', 'test')
      form.handleChange('username', '')

      expect(form.errors.username).toBeDefined()
    })
  })

  describe('handleBlur', () => {
    it('should mark field as touched', () => {
      const form = useForm({
        username: { initialValue: '' },
      })

      form.handleBlur('username')
      expect(form.touched.username).toBe(true)
    })

    it('should validate field', () => {
      const form = useForm({
        username: {
          initialValue: '',
          rules: [validationRules.required()],
        },
      })

      form.handleBlur('username')
      expect(form.errors.username).toBeDefined()
    })
  })

  describe('validateField', () => {
    it('should return true for valid field', () => {
      const form = useForm({
        username: {
          initialValue: 'alice',
          rules: [validationRules.required()],
        },
      })

      expect(form.validateField('username')).toBe(true)
    })

    it('should return false for invalid field', () => {
      const form = useForm({
        username: {
          initialValue: '',
          rules: [validationRules.required()],
        },
      })

      expect(form.validateField('username')).toBe(false)
    })

    it('should set error message for invalid field', () => {
      const form = useForm({
        username: {
          initialValue: '',
          rules: [validationRules.required('Username is required')],
        },
      })

      form.validateField('username')
      expect(form.errors.username).toBe('Username is required')
    })

    it('should clear error for valid field', () => {
      const form = useForm({
        username: {
          initialValue: '',
          rules: [validationRules.required()],
        },
      })

      form.validateField('username')
      form.handleChange('username', 'alice')
      form.validateField('username')

      expect(form.errors.username).toBeUndefined()
    })

    it('should return true for field without rules', () => {
      const form = useForm({
        username: { initialValue: '' },
      })

      expect(form.validateField('username')).toBe(true)
    })
  })

  describe('validateAll', () => {
    it('should validate all fields', () => {
      const form = useForm({
        username: {
          initialValue: '',
          rules: [validationRules.required()],
        },
        email: {
          initialValue: '',
          rules: [validationRules.email()],
        },
      })

      expect(form.validateAll()).toBe(false)
    })

    it('should return true when all fields are valid', () => {
      const form = useForm({
        username: {
          initialValue: 'alice',
          rules: [validationRules.required()],
        },
        email: {
          initialValue: 'alice@example.com',
          rules: [validationRules.email()],
        },
      })

      expect(form.validateAll()).toBe(true)
    })

    it('should set errors for all invalid fields', () => {
      const form = useForm({
        username: {
          initialValue: '',
          rules: [validationRules.required()],
        },
        email: {
          initialValue: 'invalid',
          rules: [validationRules.email()],
        },
      })

      form.validateAll()
      expect(form.errors.username).toBeDefined()
      expect(form.errors.email).toBeDefined()
    })
  })

  describe('handleSubmit', () => {
    it('should call onSubmit when valid', async () => {
      const form = useForm({
        username: {
          initialValue: 'alice',
          rules: [validationRules.required()],
        },
      })

      let called = false
      const result = await form.handleSubmit(async () => {
        called = true
      })

      expect(result).toBe(true)
      expect(called).toBe(true)
    })

    it('should not call onSubmit when invalid', async () => {
      const form = useForm({
        username: {
          initialValue: '',
          rules: [validationRules.required()],
        },
      })

      let called = false
      const result = await form.handleSubmit(async () => {
        called = true
      })

      expect(result).toBe(false)
      expect(called).toBe(false)
    })

    it('should mark all fields as touched', async () => {
      const form = useForm({
        username: { initialValue: 'alice' },
        email: { initialValue: 'alice@example.com' },
      })

      await form.handleSubmit(async () => {})

      expect(form.touched.username).toBe(true)
      expect(form.touched.email).toBe(true)
    })

    it('should set isSubmitting during submission', async () => {
      const form = useForm({
        username: { initialValue: 'alice' },
      })

      let wasSubmitting = false
      await form.handleSubmit(async () => {
        wasSubmitting = form.isSubmitting.value
      })

      expect(wasSubmitting).toBe(true)
      expect(form.isSubmitting.value).toBe(false)
    })

    it('should handle sync onSubmit', async () => {
      const form = useForm({
        username: { initialValue: 'alice' },
      })

      let called = false
      const result = await form.handleSubmit(() => {
        called = true
      })

      expect(result).toBe(true)
      expect(called).toBe(true)
    })

    it('should return false on error', async () => {
      const form = useForm({
        username: { initialValue: 'alice' },
      })

      const result = await form.handleSubmit(async () => {
        throw new Error('Submission failed')
      })

      expect(result).toBe(false)
    })
  })

  describe('reset', () => {
    it('should reset values to initial', () => {
      const form = useForm({
        username: { initialValue: '' },
        age: { initialValue: 0 },
      })

      form.handleChange('username', 'alice')
      form.handleChange('age', 25)
      form.reset()

      expect(form.values.username).toBe('')
      expect(form.values.age).toBe(0)
    })

    it('should reset touched state', () => {
      const form = useForm({
        username: { initialValue: '' },
      })

      form.handleChange('username', 'alice')
      form.reset()

      expect(form.touched.username).toBe(false)
    })

    it('should clear errors', () => {
      const form = useForm({
        username: {
          initialValue: '',
          rules: [validationRules.required()],
        },
      })

      form.validateField('username')
      form.reset()

      expect(form.errors.username).toBeUndefined()
    })

    it('should reset isSubmitting', () => {
      const form = useForm({
        username: { initialValue: '' },
      })

      form.handleSubmit(async () => {
        form.reset()
        expect(form.isSubmitting.value).toBe(false)
      })
    })
  })

  describe('setValue', () => {
    it('should set field value programmatically', () => {
      const form = useForm({
        username: { initialValue: '' },
      })

      form.setValue('username', 'bob')
      expect(form.values.username).toBe('bob')
    })

    it('should not mark field as touched', () => {
      const form = useForm({
        username: { initialValue: '' },
      })

      form.setValue('username', 'bob')
      expect(form.touched.username).toBe(false)
    })
  })

  describe('setError', () => {
    it('should set field error programmatically', () => {
      const form = useForm({
        username: { initialValue: 'alice' },
      })

      form.setError('username', 'Username is taken')
      expect(form.errors.username).toBe('Username is taken')
    })
  })
})

describe('validationRules', () => {
  describe('required', () => {
    const rule = validationRules.required()

    it('should validate non-empty string', () => {
      expect(rule.validate('test')).toBe(true)
    })

    it('should reject empty string', () => {
      expect(rule.validate('')).toBe(false)
    })

    it('should reject whitespace-only string', () => {
      expect(rule.validate('   ')).toBe(false)
    })

    it('should validate non-empty array', () => {
      expect(rule.validate([1, 2, 3])).toBe(true)
    })

    it('should reject empty array', () => {
      expect(rule.validate([])).toBe(false)
    })

    it('should reject null', () => {
      expect(rule.validate(null)).toBe(false)
    })

    it('should reject undefined', () => {
      expect(rule.validate(undefined)).toBe(false)
    })

    it('should have default message', () => {
      expect(rule.message).toBe('This field is required')
    })

    it('should accept custom message', () => {
      const customRule = validationRules.required('Custom message')
      expect(customRule.message).toBe('Custom message')
    })
  })

  describe('minLength', () => {
    const rule = validationRules.minLength(5)

    it('should validate string meeting minimum', () => {
      expect(rule.validate('hello')).toBe(true)
    })

    it('should validate string exceeding minimum', () => {
      expect(rule.validate('hello world')).toBe(true)
    })

    it('should reject string below minimum', () => {
      expect(rule.validate('hi')).toBe(false)
    })

    it('should have default message', () => {
      expect(rule.message).toBe('Must be at least 5 characters')
    })
  })

  describe('maxLength', () => {
    const rule = validationRules.maxLength(10)

    it('should validate string meeting maximum', () => {
      expect(rule.validate('hello')).toBe(true)
    })

    it('should validate string at maximum', () => {
      expect(rule.validate('1234567890')).toBe(true)
    })

    it('should reject string exceeding maximum', () => {
      expect(rule.validate('12345678901')).toBe(false)
    })
  })

  describe('pattern', () => {
    const rule = validationRules.pattern(/^[A-Z]/)

    it('should validate matching pattern', () => {
      expect(rule.validate('Alice')).toBe(true)
    })

    it('should reject non-matching pattern', () => {
      expect(rule.validate('alice')).toBe(false)
    })
  })

  describe('email', () => {
    const rule = validationRules.email()

    it('should validate valid email', () => {
      expect(rule.validate('alice@example.com')).toBe(true)
    })

    it('should validate email with subdomain', () => {
      expect(rule.validate('alice@mail.example.com')).toBe(true)
    })

    it('should reject email without @', () => {
      expect(rule.validate('alice.example.com')).toBe(false)
    })

    it('should reject email without domain', () => {
      expect(rule.validate('alice@')).toBe(false)
    })

    it('should reject email without local part', () => {
      expect(rule.validate('@example.com')).toBe(false)
    })

    it('should reject email with spaces', () => {
      expect(rule.validate('alice @example.com')).toBe(false)
    })
  })

  describe('min', () => {
    const rule = validationRules.min(10)

    it('should validate number at minimum', () => {
      expect(rule.validate(10)).toBe(true)
    })

    it('should validate number above minimum', () => {
      expect(rule.validate(20)).toBe(true)
    })

    it('should reject number below minimum', () => {
      expect(rule.validate(5)).toBe(false)
    })
  })

  describe('max', () => {
    const rule = validationRules.max(100)

    it('should validate number at maximum', () => {
      expect(rule.validate(100)).toBe(true)
    })

    it('should validate number below maximum', () => {
      expect(rule.validate(50)).toBe(true)
    })

    it('should reject number above maximum', () => {
      expect(rule.validate(150)).toBe(false)
    })
  })
})
