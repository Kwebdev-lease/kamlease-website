import { describe, it, expect, vi, beforeEach } from 'vitest'
import { preloadImage, loadAssetWithFallback, AssetLoadError } from '../asset-loader'

// Mock Image constructor
const mockImage = {
  onload: null as (() => void) | null,
  onerror: null as (() => void) | null,
  src: '',
}

global.Image = vi.fn(() => mockImage) as any

describe('asset-loader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockImage.onload = null
    mockImage.onerror = null
    mockImage.src = ''
  })

  describe('preloadImage', () => {
    it('should resolve when image loads successfully', async () => {
      const promise = preloadImage('/test-image.jpg')
      
      // Simulate successful load
      setTimeout(() => {
        if (mockImage.onload) mockImage.onload()
      }, 0)
      
      const result = await promise
      expect(result).toBe(mockImage)
    })

    it('should reject with AssetLoadError when image fails to load', async () => {
      const promise = preloadImage('/test-image.jpg')
      
      // Simulate load error
      setTimeout(() => {
        if (mockImage.onerror) mockImage.onerror()
      }, 0)
      
      await expect(promise).rejects.toThrow(AssetLoadError)
      await expect(promise).rejects.toThrow('Failed to load image: /test-image.jpg')
    })
  })

  describe('loadAssetWithFallback', () => {
    it('should return primary asset when it loads successfully', async () => {
      const config = {
        primary: '/primary.jpg',
        fallback: '/fallback.jpg',
        type: 'image' as const
      }
      
      const promise = loadAssetWithFallback(config)
      
      // Simulate successful primary load
      setTimeout(() => {
        if (mockImage.onload) mockImage.onload()
      }, 0)
      
      const result = await promise
      expect(result).toBe('/primary.jpg')
    })

    it('should return fallback asset when primary fails', async () => {
      const config = {
        primary: '/primary.jpg',
        fallback: '/fallback.jpg',
        type: 'image' as const
      }
      
      const promise = loadAssetWithFallback(config)
      
      let loadAttempts = 0
      const originalOnload = mockImage.onload
      const originalOnerror = mockImage.onerror
      
      // Mock the image loading behavior
      Object.defineProperty(mockImage, 'src', {
        set: (value: string) => {
          loadAttempts++
          setTimeout(() => {
            if (value === '/primary.jpg') {
              // Primary fails
              if (mockImage.onerror) mockImage.onerror()
            } else if (value === '/fallback.jpg') {
              // Fallback succeeds
              if (mockImage.onload) mockImage.onload()
            }
          }, 0)
        },
        configurable: true
      })
      
      const result = await promise
      expect(result).toBe('/fallback.jpg')
    })

    it('should throw AssetLoadError when both primary and fallback fail', async () => {
      const config = {
        primary: '/primary.jpg',
        fallback: '/fallback.jpg',
        type: 'image' as const
      }
      
      const promise = loadAssetWithFallback(config)
      
      // Mock both to fail
      Object.defineProperty(mockImage, 'src', {
        set: () => {
          setTimeout(() => {
            if (mockImage.onerror) mockImage.onerror()
          }, 0)
        },
        configurable: true
      })
      
      await expect(promise).rejects.toThrow(AssetLoadError)
      await expect(promise).rejects.toThrow('Both primary and fallback assets failed to load')
    })

    it('should work with non-image assets', async () => {
      const config = {
        primary: '/script.js',
        fallback: '/fallback-script.js',
        type: 'generic' as const
      }
      
      const result = await loadAssetWithFallback(config)
      expect(result).toBe('/script.js')
    })
  })
})