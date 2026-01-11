import { describe, it, expect, beforeEach, vi } from 'vitest'

const { useLodash, useLodashSync } = await import('../../composables/useLodash')

describe('useLodash', () => {
  let lodash: ReturnType<typeof useLodash>

  beforeEach(() => {
    lodash = useLodash()
  })

  describe('debounce and throttle', () => {
    it('should debounce function calls', async () => {
      const fn = vi.fn()
      const debounceModule = await lodash.debounce
      const debounced = debounceModule(fn, 100)

      debounced()
      debounced()
      debounced()

      expect(fn).not.toHaveBeenCalled()

      await new Promise((resolve) => setTimeout(resolve, 150))
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should throttle function calls', async () => {
      const fn = vi.fn()
      const throttleModule = await lodash.throttle
      const throttled = throttleModule(fn, 100)

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
      it('should randomize array order', async () => {
        const arr = [1, 2, 3, 4, 5]
        const shuffleModule = await lodash.shuffle
        const shuffled = shuffleModule(arr)

        expect(shuffled).toHaveLength(5)
        expect(shuffled).toEqual(expect.arrayContaining(arr))
        // Original array should not be modified
        expect(arr).toEqual([1, 2, 3, 4, 5])
      })

      it('should handle empty arrays', async () => {
        const shuffleModule = await lodash.shuffle
        const result = shuffleModule([])
        expect(result).toEqual([])
      })
    })

    describe('sample', () => {
      it('should return random item from array', async () => {
        const arr = [1, 2, 3, 4, 5]
        const sampleModule = await lodash.sample
        const item = sampleModule(arr)

        expect(arr).toContain(item)
      })

      it('should return undefined for empty array', async () => {
        const sampleModule = await lodash.sample
        const result = sampleModule([])
        expect(result).toBeUndefined()
      })
    })

    describe('sampleSize', () => {
      it('should return N random items', async () => {
        const arr = [1, 2, 3, 4, 5]
        const sampleSizeModule = await lodash.sampleSize
        const items = sampleSizeModule(arr, 3)

        expect(items).toHaveLength(3)
        items.forEach((item) => {
          expect(arr).toContain(item)
        })
      })

      it('should handle size larger than array', async () => {
        const arr = [1, 2, 3]
        const sampleSizeModule = await lodash.sampleSize
        const items = sampleSizeModule(arr, 10)

        expect(items).toHaveLength(3)
      })
    })

    describe('uniq', () => {
      it('should remove duplicate values', async () => {
        const arr = [1, 2, 2, 3, 3, 3, 4]
        const uniqModule = await lodash.uniq
        const result = uniqModule(arr)

        expect(result).toEqual([1, 2, 3, 4])
      })

      it('should handle empty arrays', async () => {
        const uniqModule = await lodash.uniq
        expect(uniqModule([])).toEqual([])
      })
    })

    describe('uniqBy', () => {
      it('should remove duplicates by property', async () => {
        const arr = [
          { id: 1, name: 'a' },
          { id: 2, name: 'b' },
          { id: 1, name: 'c' },
        ]
        const uniqByModule = await lodash.uniqBy
        const result = uniqByModule(arr, 'id')

        expect(result).toHaveLength(2)
        expect(result[0]!.id).toBe(1)
        expect(result[1]!.id).toBe(2)
      })

      it('should work with function iteratee', async () => {
        const arr = [1.2, 1.5, 2.1, 2.8]
        const uniqByModule = await lodash.uniqBy
        const result = uniqByModule(arr, Math.floor)

        expect(result).toEqual([1.2, 2.1])
      })
    })

    describe('groupBy', () => {
      it('should group items by property', async () => {
        const arr = [
          { type: 'fruit', name: 'apple' },
          { type: 'fruit', name: 'banana' },
          { type: 'vegetable', name: 'carrot' },
        ]
        const groupByModule = await lodash.groupBy
        const result = groupByModule(arr, 'type')

        expect(result.fruit).toHaveLength(2)
        expect(result.vegetable).toHaveLength(1)
      })

      it('should work with function iteratee', async () => {
        const arr = [1.2, 1.8, 2.1, 2.9]
        const groupByModule = await lodash.groupBy
        const result = groupByModule(arr, Math.floor)

        expect(result['1']).toEqual([1.2, 1.8])
        expect(result['2']).toEqual([2.1, 2.9])
      })
    })

    describe('orderBy', () => {
      it('should sort by single property', async () => {
        const arr = [
          { name: 'charlie', age: 30 },
          { name: 'alice', age: 25 },
          { name: 'bob', age: 35 },
        ]
        const orderByModule = await lodash.orderBy
        const result = orderByModule(arr, ['name'], ['asc'])

        expect(result[0]!.name).toBe('alice')
        expect(result[1]!.name).toBe('bob')
        expect(result[2]!.name).toBe('charlie')
      })

      it('should sort by multiple properties', async () => {
        const arr = [
          { name: 'alice', age: 30 },
          { name: 'bob', age: 25 },
          { name: 'alice', age: 25 },
        ]
        const orderByModule = await lodash.orderBy
        const result = orderByModule(arr, ['name', 'age'], ['asc', 'desc'])

        expect(result[0]!.name).toBe('alice')
        expect(result[0]!.age).toBe(30)
        expect(result[1]!.name).toBe('alice')
        expect(result[1]!.age).toBe(25)
      })
    })

    describe('chunk', () => {
      it('should split array into chunks', async () => {
        const arr = [1, 2, 3, 4, 5, 6, 7]
        const chunkModule = await lodash.chunk
        const result = chunkModule(arr, 3)

        expect(result).toEqual([[1, 2, 3], [4, 5, 6], [7]])
      })

      it('should handle exact divisions', async () => {
        const arr = [1, 2, 3, 4]
        const chunkModule = await lodash.chunk
        const result = chunkModule(arr, 2)

        expect(result).toEqual([
          [1, 2],
          [3, 4],
        ])
      })
    })

    describe('flatten', () => {
      it('should flatten nested arrays one level', async () => {
        const arr = [1, [2, 3], [4, [5, 6]]]
        const flattenModule = await lodash.flatten
        const result = flattenModule(arr)

        expect(result).toEqual([1, 2, 3, 4, [5, 6]])
      })

      it('should handle already flat arrays', async () => {
        const arr = [1, 2, 3]
        const flattenModule = await lodash.flatten
        const result = flattenModule(arr)

        expect(result).toEqual([1, 2, 3])
      })
    })
  })

  describe('object utilities', () => {
    describe('cloneDeep', () => {
      it('should deep clone objects', async () => {
        const obj = { a: 1, b: { c: 2 } }
        const cloneDeepModule = await lodash.cloneDeep
        const clone = cloneDeepModule(obj)

        expect(clone).toEqual(obj)
        expect(clone).not.toBe(obj)
        expect(clone.b).not.toBe(obj.b)
      })

      it('should clone arrays', async () => {
        const arr = [1, [2, 3]]
        const cloneDeepModule = await lodash.cloneDeep
        const clone = cloneDeepModule(arr)

        expect(clone).toEqual(arr)
        expect(clone).not.toBe(arr)
        expect(clone[1]).not.toBe(arr[1])
      })
    })

    describe('isEqual', () => {
      it('should compare objects deeply', async () => {
        const obj1 = { a: 1, b: { c: 2 } }
        const obj2 = { a: 1, b: { c: 2 } }
        const obj3 = { a: 1, b: { c: 3 } }
        const isEqualModule = await lodash.isEqual

        expect(isEqualModule(obj1, obj2)).toBe(true)
        expect(isEqualModule(obj1, obj3)).toBe(false)
      })

      it('should compare arrays', async () => {
        const isEqualModule = await lodash.isEqual
        expect(isEqualModule([1, 2, 3], [1, 2, 3])).toBe(true)
        expect(isEqualModule([1, 2, 3], [1, 2, 4])).toBe(false)
      })
    })

    describe('isEmpty', () => {
      it('should check if value is empty', async () => {
        const isEmptyModule = await lodash.isEmpty
        expect(isEmptyModule({})).toBe(true)
        expect(isEmptyModule([])).toBe(true)
        expect(isEmptyModule('')).toBe(true)
        expect(isEmptyModule({ a: 1 })).toBe(false)
        expect(isEmptyModule([1])).toBe(false)
        expect(isEmptyModule('hello')).toBe(false)
      })

      it('should handle null and undefined', async () => {
        const isEmptyModule = await lodash.isEmpty
        expect(isEmptyModule(null)).toBe(true)
        expect(isEmptyModule(undefined)).toBe(true)
      })
    })

    describe('get', () => {
      it('should safely access nested properties', async () => {
        const obj = { a: { b: { c: 42 } } }
        const getModule = await lodash.get

        expect(getModule(obj, 'a.b.c')).toBe(42)
        expect(getModule(obj, 'a.b.d')).toBeUndefined()
        expect(getModule(obj, 'a.b.d', 'default')).toBe('default')
      })

      it('should handle array paths', async () => {
        const obj = { a: [{ b: 1 }, { b: 2 }] }
        const getModule = await lodash.get

        expect(getModule(obj, 'a[0].b')).toBe(1)
        expect(getModule(obj, 'a[1].b')).toBe(2)
      })
    })

    describe('set', () => {
      it('should set nested properties', async () => {
        const obj = { a: { b: 1 } }
        const setModule = await lodash.set
        setModule(obj, 'a.b', 2)

        expect(obj.a.b).toBe(2)
      })

      it('should create missing paths', async () => {
        const obj = {}
        const setModule = await lodash.set
        setModule(obj, 'a.b.c', 42)

        const getModule = await lodash.get
        expect(getModule(obj, 'a.b.c')).toBe(42)
      })
    })

    describe('has', () => {
      it('should check if property exists', async () => {
        const obj = { a: { b: { c: 1 } } }
        const hasModule = await lodash.has

        expect(hasModule(obj, 'a.b.c')).toBe(true)
        expect(hasModule(obj, 'a.b.d')).toBe(false)
        expect(hasModule(obj, 'a.x.y')).toBe(false)
      })

      it('should work with array indices', async () => {
        const obj = { a: [1, 2, 3] }
        const hasModule = await lodash.has

        expect(hasModule(obj, 'a[0]')).toBe(true)
        expect(hasModule(obj, 'a[5]')).toBe(false)
      })
    })

    describe('omit', () => {
      it('should remove specified properties', async () => {
        const obj = { a: 1, b: 2, c: 3 }
        const omitModule = await lodash.omit
        const result = omitModule(obj, ['a', 'c'])

        expect(result).toEqual({ b: 2 })
      })

      it('should not modify original object', async () => {
        const obj = { a: 1, b: 2 }
        const omitModule = await lodash.omit
        omitModule(obj, ['a'])

        expect(obj).toEqual({ a: 1, b: 2 })
      })
    })

    describe('pick', () => {
      it('should select specified properties', async () => {
        const obj = { a: 1, b: 2, c: 3 }
        const pickModule = await lodash.pick
        const result = pickModule(obj, ['a', 'c'])

        expect(result).toEqual({ a: 1, c: 3 })
      })

      it('should handle non-existent properties', async () => {
        const obj = { a: 1, b: 2 }
        const pickModule = await lodash.pick
        const result = pickModule(obj, ['a', 'c'])

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

    it('should expose getters that return promises', () => {
      expect(typeof lodash.debounce).toBe('object') // Getter returns object
      expect(typeof lodash.shuffle).toBe('object')
      expect(typeof lodash.cloneDeep).toBe('object')
      expect(typeof lodash.get).toBe('object')
    })

    it('should resolve to actual functions', async () => {
      const debounceFunc = await lodash.debounce
      const shuffleFunc = await lodash.shuffle
      const cloneDeepFunc = await lodash.cloneDeep
      const getFunc = await lodash.get

      expect(typeof debounceFunc).toBe('function')
      expect(typeof shuffleFunc).toBe('function')
      expect(typeof cloneDeepFunc).toBe('function')
      expect(typeof getFunc).toBe('function')
    })
  })

  describe('synchronous utilities', () => {
    let syncLodash: ReturnType<typeof useLodashSync>

    beforeEach(() => {
      syncLodash = useLodashSync()
    })

    describe('isEmpty', () => {
      it('should check if value is empty', () => {
        expect(syncLodash.isEmpty({})).toBe(true)
        expect(syncLodash.isEmpty([])).toBe(true)
        expect(syncLodash.isEmpty('')).toBe(true)
        expect(syncLodash.isEmpty(null)).toBe(true)
        expect(syncLodash.isEmpty(undefined)).toBe(true)
        expect(syncLodash.isEmpty({ a: 1 })).toBe(false)
        expect(syncLodash.isEmpty([1])).toBe(false)
        expect(syncLodash.isEmpty('hello')).toBe(false)
      })
    })

    describe('clone', () => {
      it('should clone simple objects', () => {
        const obj = { a: 1, b: 2 }
        const clone = syncLodash.clone(obj)

        expect(clone).toEqual(obj)
        expect(clone).not.toBe(obj)
      })

      it('should clone arrays', () => {
        const arr = [1, 2, 3]
        const clone = syncLodash.clone(arr)

        expect(clone).toEqual(arr)
        expect(clone).not.toBe(arr)
      })

      it('should handle primitive values', () => {
        expect(syncLodash.clone(42)).toBe(42)
        expect(syncLodash.clone('hello')).toBe('hello')
        expect(syncLodash.clone(null)).toBe(null)
      })
    })
  })

  describe('real-world scenarios', () => {
    it('should handle game state management', async () => {
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
      const cloneDeepModule = await lodash.cloneDeep
      const backup = cloneDeepModule(gameState)
      expect(backup).toEqual(gameState)
      expect(backup).not.toBe(gameState)

      // Sort players by score
      const orderByModule = await lodash.orderBy
      const sorted = orderByModule(gameState.players, ['score'], ['desc'])
      expect(sorted[0]!.name).toBe('Bob')

      // Get top 2 players
      const sampleSizeModule = await lodash.sampleSize
      const topPlayers = sampleSizeModule(sorted, 2)
      expect(topPlayers).toHaveLength(2)

      // Check if setting exists
      const hasModule = await lodash.has
      expect(hasModule(gameState, 'settings.sound')).toBe(true)

      // Get setting with default
      const getModule = await lodash.get
      expect(getModule(gameState, 'settings.volume', 50)).toBe(50)
    })

    it('should handle array operations for game logic', async () => {
      const categories = ['Animals', 'Cities', 'Food', 'Sports', 'Movies']

      // Shuffle categories
      const shuffleModule = await lodash.shuffle
      const shuffled = shuffleModule(categories)
      expect(shuffled).toHaveLength(5)

      // Pick random category
      const sampleModule = await lodash.sample
      const random = sampleModule(categories)
      expect(categories).toContain(random)

      // Split into rounds
      const chunkModule = await lodash.chunk
      const rounds = chunkModule(categories, 2)
      expect(rounds).toHaveLength(3)
      expect(rounds[2]).toHaveLength(1)
    })

    it('should manage player answers efficiently', async () => {
      const answers = [
        { player: 'Alice', answer: 'Apple', points: 10 },
        { player: 'Bob', answer: 'Banana', points: 10 },
        { player: 'Alice', answer: 'Avocado', points: 15 },
        { player: 'Bob', answer: 'Blueberry', points: 15 },
      ]

      // Group by player
      const groupByModule = await lodash.groupBy
      const byPlayer = groupByModule(answers, 'player')
      expect(byPlayer.Alice).toHaveLength(2)
      expect(byPlayer.Bob).toHaveLength(2)

      // Remove duplicate players
      const uniqByModule = await lodash.uniqBy
      const uniquePlayers = uniqByModule(answers, 'player')
      expect(uniquePlayers).toHaveLength(2)

      // Pick only relevant fields
      const pickModule = await lodash.pick
      const simplified = answers.map((a) => pickModule(a, ['answer', 'points']))
      expect(simplified[0]).toEqual({ answer: 'Apple', points: 10 })
    })
  })
})
