import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock localStorage before importing the module
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

// Import after mocking
const { safeStorage } = await import('../storage')

describe('safeStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('get', () => {
    it('should return stored value when localStorage works', () => {
      mockLocalStorage.getItem.mockReturnValue('test-value')
      
      const result = safeStorage.get('test-key')
      
      expect(result).toBe('test-value')
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('test-key')
    })

    it('should return default value when key does not exist', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      
      const result = safeStorage.get('test-key', 'default')
      
      expect(result).toBe('default')
    })

    it('should return default value when localStorage throws', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })
      
      const result = safeStorage.get('test-key', 'default')
      
      expect(result).toBe('default')
    })
  })

  describe('set', () => {
    it('should return true when localStorage works', () => {
      mockLocalStorage.setItem.mockImplementation(() => {})
      
      const result = safeStorage.set('test-key', 'test-value')
      
      expect(result).toBe(true)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test-key', 'test-value')
    })

    it('should return false when localStorage throws', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })
      
      const result = safeStorage.set('test-key', 'test-value')
      
      expect(result).toBe(false)
    })
  })

  describe('remove', () => {
    it('should return true when localStorage works', () => {
      mockLocalStorage.removeItem.mockImplementation(() => {})
      
      const result = safeStorage.remove('test-key')
      
      expect(result).toBe(true)
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test-key')
    })

    it('should return false when localStorage throws', () => {
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })
      
      const result = safeStorage.remove('test-key')
      
      expect(result).toBe(false)
    })
  })
})