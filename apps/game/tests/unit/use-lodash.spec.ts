import { describe, it, expect, beforeEach, vi } from 'vitest'

const { useLodash } = await import('../../composables/useLodash')

describe('useLodash', () => {
  let lodash: ReturnType<typeof useLodash>

  beforeEach(() => {
    lodash = useLodash()
  })

  describe('debounce and throttle', () => {
    it('should debounce function calls', async () => {
      const fn = vi.fn()
      const debounced = lodash.debounce(fn, 100)

      debounced()
      debounced()
      debounced()

      expect(fn).not.toHaveBeenCalled()

      await new Promise((resolve) => setTimeout(resolve, 150))
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should throttle function calls', async () => {
      const fn = vi.fn()
      const throttled = lodash.throttle(fn, 100)

      throttled()
      throttled()
      throttled()

      expect(fn).toHaveBeenCalledTimes(1)

      await new Promise((resolve) => setTimeout(resolve, 150))
      throttled()
      // Throttle may call on trailing edge, so we accept 2 or 3 calls
      expect(fn.mock.calls.length).toBeGreaterThanOrEqual(2)
      expect(fn.mock.calls.length).toBeLessThanOrEqual(3)
    })
  })

  describe('array utilities', () => {
    describe('shuffle', () => {
      it('should randomize array order', () => {
        const arr = [1, 2, 3, 4, 5]
        const shuffled = lodash.shuffle(arr)

        expect(shuffled).toHaveLength(5)
        expect(shuffled).toEqual(expect.arrayContaining(arr))
        // Original array should not be modified
        expect(arr).toEqual([1, 2, 3, 4, 5])
      })

      it('should handle empty arrays', () => {
        const result = lodash.shuffle([])
        expect(result).toEqual([])
      })
    })

    describe('sample', () => {
      it('should return random item from array', () => {
        const arr = [1, 2, 3, 4, 5]
        const item = lodash.sample(arr)

        expect(arr).toContain(item)
      })

      it('should return undefined for empty array', () => {
        const result = lodash.sample([])
        expect(result).toBeUndefined()
      })
    })

    describe('sampleSize', () => {
      it('should return N random items', () => {
        const arr = [1, 2, 3, 4, 5]
        const items = lodash.sampleSize(arr, 3)

        expect(items).toHaveLength(3)
        items.forEach((item) => {
          expect(arr).toContain(item)
        })
      })

      it('should handle size larger than array', () => {
        const arr = [1, 2, 3]
        const items = lodash.sampleSize(arr, 10)

        expect(items).toHaveLength(3)
      })
    })

    describe('uniq', () => {
      it('should remove duplicate values', () => {
        const arr = [1, 2, 2, 3, 3, 3, 4]
        const result = lodash.uniq(arr)

        expect(result).toEqual([1, 2, 3, 4])
      })

      it('should handle empty arrays', () => {
        expect(lodash.uniq([])).toEqual([])
      })
    })

    describe('uniqBy', () => {
      it('should remove duplicates by property', () => {
        const arr = [
          { id: 1, name: 'a' },
          { id: 2, name: 'b' },
          { id: 1, name: 'c' },
        ]
        const result = lodash.uniqBy(arr, 'id')

        expect(result).toHaveLength(2)
        expect(result[0]!.id).toBe(1)
        expect(result[1]!.id).toBe(2)
      })

      it('should work with function iteratee', () => {
        const arr = [1.2, 1.5, 2.1, 2.8]
        const result = lodash.uniqBy(arr, Math.floor)

        expect(result).toEqual([1.2, 2.1])
      })
    })

    describe('groupBy', () => {
      it('should group items by property', () => {
        const arr = [
          { type: 'fruit', name: 'apple' },
          { type: 'fruit', name: 'banana' },
          { type: 'vegetable', name: 'carrot' },
        ]
        const result = lodash.groupBy(arr, 'type')

        expect(result.fruit).toHaveLength(2)
        expect(result.vegetable).toHaveLength(1)
      })

      it('should work with function iteratee', () => {
        const arr = [1.2, 1.8, 2.1, 2.9]
        const result = lodash.groupBy(arr, Math.floor)

        expect(result['1']).toEqual([1.2, 1.8])
        expect(result['2']).toEqual([2.1, 2.9])
      })
    })

    describe('orderBy', () => {
      it('should sort by single property', () => {
        const arr = [
          { name: 'charlie', age: 30 },
          { name: 'alice', age: 25 },
          { name: 'bob', age: 35 },
        ]
        const result = lodash.orderBy(arr, ['name'], ['asc'])

        expect(result[0]!.name).toBe('alice')
        expect(result[1]!.name).toBe('bob')
        expect(result[2]!.name).toBe('charlie')
      })

      it('should sort by multiple properties', () => {
        const arr = [
          { name: 'alice', age: 30 },
          { name: 'bob', age: 25 },
          { name: 'alice', age: 25 },
        ]
        const result = lodash.orderBy(arr, ['name', 'age'], ['asc', 'desc'])

        expect(result[0]!.name).toBe('alice')
        expect(result[0]!.age).toBe(30)
        expect(result[1]!.name).toBe('alice')
        expect(result[1]!.age).toBe(25)
      })
    })

    describe('chunk', () => {
      it('should split array into chunks', () => {
        const arr = [1, 2, 3, 4, 5, 6, 7]
        const result = lodash.chunk(arr, 3)

        expect(result).toEqual([[1, 2, 3], [4, 5, 6], [7]])
      })

      it('should handle exact divisions', () => {
        const arr = [1, 2, 3, 4]
        const result = lodash.chunk(arr, 2)

        expect(result).toEqual([
          [1, 2],
          [3, 4],
        ])
      })
    })

    describe('flatten', () => {
      it('should flatten nested arrays one level', () => {
        const arr = [1, [2, 3], [4, [5, 6]]]
        const result = lodash.flatten(arr)

        expect(result).toEqual([1, 2, 3, 4, [5, 6]])
      })

      it('should handle already flat arrays', () => {
        const arr = [1, 2, 3]
        const result = lodash.flatten(arr)

        expect(result).toEqual([1, 2, 3])
      })
    })
  })

  describe('object utilities', () => {
    describe('cloneDeep', () => {
      it('should deep clone objects', () => {
        const obj = { a: 1, b: { c: 2 } }
        const clone = lodash.cloneDeep(obj)

        expect(clone).toEqual(obj)
        expect(clone).not.toBe(obj)
        expect(clone.b).not.toBe(obj.b)
      })

      it('should clone arrays', () => {
        const arr = [1, [2, 3]]
        const clone = lodash.cloneDeep(arr)

        expect(clone).toEqual(arr)
        expect(clone).not.toBe(arr)
        expect(clone[1]).not.toBe(arr[1])
      })
    })

    describe('isEqual', () => {
      it('should compare objects deeply', () => {
        const obj1 = { a: 1, b: { c: 2 } }
        const obj2 = { a: 1, b: { c: 2 } }
        const obj3 = { a: 1, b: { c: 3 } }

        expect(lodash.isEqual(obj1, obj2)).toBe(true)
        expect(lodash.isEqual(obj1, obj3)).toBe(false)
      })

      it('should compare arrays', () => {
        expect(lodash.isEqual([1, 2, 3], [1, 2, 3])).toBe(true)
        expect(lodash.isEqual([1, 2, 3], [1, 2, 4])).toBe(false)
      })
    })

    describe('isEmpty', () => {
      it('should check if value is empty', () => {
        expect(lodash.isEmpty({})).toBe(true)
        expect(lodash.isEmpty([])).toBe(true)
        expect(lodash.isEmpty('')).toBe(true)
        expect(lodash.isEmpty({ a: 1 })).toBe(false)
        expect(lodash.isEmpty([1])).toBe(false)
        expect(lodash.isEmpty('hello')).toBe(false)
      })

      it('should handle null and undefined', () => {
        expect(lodash.isEmpty(null)).toBe(true)
        expect(lodash.isEmpty(undefined)).toBe(true)
      })
    })

    describe('get', () => {
      it('should safely access nested properties', () => {
        const obj = { a: { b: { c: 42 } } }

        expect(lodash.get(obj, 'a.b.c')).toBe(42)
        expect(lodash.get(obj, 'a.b.d')).toBeUndefined()
        expect(lodash.get(obj, 'a.b.d', 'default')).toBe('default')
      })

      it('should handle array paths', () => {
        const obj = { a: [{ b: 1 }, { b: 2 }] }

        expect(lodash.get(obj, 'a[0].b')).toBe(1)
        expect(lodash.get(obj, 'a[1].b')).toBe(2)
      })
    })

    describe('set', () => {
      it('should set nested properties', () => {
        const obj = { a: { b: 1 } }
        lodash.set(obj, 'a.b', 2)

        expect(obj.a.b).toBe(2)
      })

      it('should create missing paths', () => {
        const obj = {}
        lodash.set(obj, 'a.b.c', 42)

        expect(lodash.get(obj, 'a.b.c')).toBe(42)
      })
    })

    describe('has', () => {
      it('should check if property exists', () => {
        const obj = { a: { b: { c: 1 } } }

        expect(lodash.has(obj, 'a.b.c')).toBe(true)
        expect(lodash.has(obj, 'a.b.d')).toBe(false)
        expect(lodash.has(obj, 'a.x.y')).toBe(false)
      })

      it('should work with array indices', () => {
        const obj = { a: [1, 2, 3] }

        expect(lodash.has(obj, 'a[0]')).toBe(true)
        expect(lodash.has(obj, 'a[5]')).toBe(false)
      })
    })

    describe('omit', () => {
      it('should remove specified properties', () => {
        const obj = { a: 1, b: 2, c: 3 }
        const result = lodash.omit(obj, ['a', 'c'])

        expect(result).toEqual({ b: 2 })
      })

      it('should not modify original object', () => {
        const obj = { a: 1, b: 2 }
        lodash.omit(obj, ['a'])

        expect(obj).toEqual({ a: 1, b: 2 })
      })
    })

    describe('pick', () => {
      it('should select specified properties', () => {
        const obj = { a: 1, b: 2, c: 3 }
        const result = lodash.pick(obj, ['a', 'c'])

        expect(result).toEqual({ a: 1, c: 3 })
      })

      it('should handle non-existent properties', () => {
        const obj = { a: 1, b: 2 }
        const result = lodash.pick(obj, ['a', 'c'])

        expect(result).toEqual({ a: 1 })
      })
    })
  })

  describe('return value', () => {
    it('should return all lodash utilities', () => {
      expect(lodash).toHaveProperty('debounce')
      expect(lodash).toHaveProperty('throttle')
      expect(lodash).toHaveProperty('shuffle')
      expect(lodash).toHaveProperty('sample')
      expect(lodash).toHaveProperty('sampleSize')
      expect(lodash).toHaveProperty('uniq')
      expect(lodash).toHaveProperty('uniqBy')
      expect(lodash).toHaveProperty('groupBy')
      expect(lodash).toHaveProperty('orderBy')
      expect(lodash).toHaveProperty('chunk')
      expect(lodash).toHaveProperty('flatten')
      expect(lodash).toHaveProperty('cloneDeep')
      expect(lodash).toHaveProperty('isEqual')
      expect(lodash).toHaveProperty('isEmpty')
      expect(lodash).toHaveProperty('get')
      expect(lodash).toHaveProperty('set')
      expect(lodash).toHaveProperty('has')
      expect(lodash).toHaveProperty('omit')
      expect(lodash).toHaveProperty('pick')
    })

    it('should expose functions', () => {
      expect(typeof lodash.debounce).toBe('function')
      expect(typeof lodash.shuffle).toBe('function')
      expect(typeof lodash.cloneDeep).toBe('function')
      expect(typeof lodash.get).toBe('function')
    })
  })

  describe('real-world scenarios', () => {
    it('should handle game state management', () => {
      const gameState = {
        players: [
          { id: 1, name: 'Alice', score: 100 },
          { id: 2, name: 'Bob', score: 150 },
          { id: 3, name: 'Charlie', score: 75 },
        ],
        settings: {
          difficulty: 'medium',
          sound: true,
        },
      }

      // Clone state for undo functionality
      const backup = lodash.cloneDeep(gameState)
      expect(backup).toEqual(gameState)
      expect(backup).not.toBe(gameState)

      // Sort players by score
      const sorted = lodash.orderBy(gameState.players, ['score'], ['desc'])
      expect(sorted[0]!.name).toBe('Bob')

      // Get top 2 players
      const topPlayers = lodash.sampleSize(sorted, 2)
      expect(topPlayers).toHaveLength(2)

      // Check if setting exists
      expect(lodash.has(gameState, 'settings.sound')).toBe(true)

      // Get setting with default
      expect(lodash.get(gameState, 'settings.volume', 50)).toBe(50)
    })

    it('should handle array operations for game logic', () => {
      const categories = ['Animals', 'Cities', 'Food', 'Sports', 'Movies']

      // Shuffle categories
      const shuffled = lodash.shuffle(categories)
      expect(shuffled).toHaveLength(5)

      // Pick random category
      const random = lodash.sample(categories)
      expect(categories).toContain(random)

      // Split into rounds
      const rounds = lodash.chunk(categories, 2)
      expect(rounds).toHaveLength(3)
      expect(rounds[2]).toHaveLength(1)
    })

    it('should manage player answers efficiently', () => {
      const answers = [
        { player: 'Alice', answer: 'Apple', points: 10 },
        { player: 'Bob', answer: 'Banana', points: 10 },
        { player: 'Alice', answer: 'Avocado', points: 15 },
        { player: 'Bob', answer: 'Blueberry', points: 15 },
      ]

      // Group by player
      const byPlayer = lodash.groupBy(answers, 'player')
      expect(byPlayer.Alice).toHaveLength(2)
      expect(byPlayer.Bob).toHaveLength(2)

      // Remove duplicate players
      const uniquePlayers = lodash.uniqBy(answers, 'player')
      expect(uniquePlayers).toHaveLength(2)

      // Pick only relevant fields
      const simplified = answers.map((a) => lodash.pick(a, ['answer', 'points']))
      expect(simplified[0]).toEqual({ answer: 'Apple', points: 10 })
    })
  })
})
