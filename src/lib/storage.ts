/**
 * Robust localStorage utilities with fallbacks and error handling
 */

export class StorageError extends Error {
  constructor(
    message: string,
    public operation: 'get' | 'set' | 'remove',
    public key: string,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'StorageError'
  }
}

/**
 * In-memory fallback storage for when localStorage is unavailable
 */
class MemoryStorage {
  private storage = new Map<string, string>()

  getItem(key: string): string | null {
    return this.storage.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.storage.set(key, value)
  }

  removeItem(key: string): void {
    this.storage.delete(key)
  }

  clear(): void {
    this.storage.clear()
  }
}

/**
 * Check if localStorage is available and working
 */
function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false
    }
    
    const testKey = '__localStorage_test__'
    window.localStorage.setItem(testKey, 'test')
    window.localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

/**
 * Robust storage interface that falls back to memory storage
 */
class RobustStorage {
  private storage: Storage | MemoryStorage
  private isLocalStorageWorking: boolean

  constructor() {
    this.isLocalStorageWorking = isLocalStorageAvailable()
    this.storage = this.isLocalStorageWorking 
      ? window.localStorage 
      : new MemoryStorage()
    
    if (!this.isLocalStorageWorking) {
      console.warn('localStorage is not available, using memory storage fallback')
    }
  }

  getItem(key: string): string | null {
    try {
      return this.storage.getItem(key)
    } catch (error) {
      console.error(`Failed to get item from storage: ${key}`, error)
      throw new StorageError(
        `Failed to retrieve item: ${key}`,
        'get',
        key,
        error instanceof Error ? error : new Error(String(error))
      )
    }
  }

  setItem(key: string, value: string): void {
    try {
      this.storage.setItem(key, value)
    } catch (error) {
      console.error(`Failed to set item in storage: ${key}`, error)
      
      // If localStorage fails, try to fall back to memory storage
      if (this.isLocalStorageWorking && !(this.storage instanceof MemoryStorage)) {
        console.warn('localStorage failed, falling back to memory storage')
        this.storage = new MemoryStorage()
        this.isLocalStorageWorking = false
        
        try {
          this.storage.setItem(key, value)
          return
        } catch (fallbackError) {
          console.error('Memory storage fallback also failed', fallbackError)
        }
      }
      
      throw new StorageError(
        `Failed to store item: ${key}`,
        'set',
        key,
        error instanceof Error ? error : new Error(String(error))
      )
    }
  }

  removeItem(key: string): void {
    try {
      this.storage.removeItem(key)
    } catch (error) {
      console.error(`Failed to remove item from storage: ${key}`, error)
      throw new StorageError(
        `Failed to remove item: ${key}`,
        'remove',
        key,
        error instanceof Error ? error : new Error(String(error))
      )
    }
  }

  isUsingMemoryFallback(): boolean {
    return !this.isLocalStorageWorking
  }
}

// Singleton instance
export const robustStorage = new RobustStorage()

/**
 * Safe storage operations with error handling
 */
export const safeStorage = {
  get: (key: string, defaultValue: string | null = null): string | null => {
    try {
      return robustStorage.getItem(key) ?? defaultValue
    } catch (error) {
      console.warn(`Storage get failed for key: ${key}, using default value`, error)
      return defaultValue
    }
  },

  set: (key: string, value: string): boolean => {
    try {
      robustStorage.setItem(key, value)
      return true
    } catch (error) {
      console.warn(`Storage set failed for key: ${key}`, error)
      return false
    }
  },

  remove: (key: string): boolean => {
    try {
      robustStorage.removeItem(key)
      return true
    } catch (error) {
      console.warn(`Storage remove failed for key: ${key}`, error)
      return false
    }
  },

  isAvailable: (): boolean => {
    return !robustStorage.isUsingMemoryFallback()
  }
}