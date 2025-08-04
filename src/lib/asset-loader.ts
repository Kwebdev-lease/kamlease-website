/**
 * Asset loading utilities with error handling and fallbacks
 */

export interface AssetConfig {
  primary: string
  fallback?: string
  type?: 'image' | 'font' | 'generic'
}

export class AssetLoadError extends Error {
  constructor(
    message: string,
    public assetUrl: string,
    public assetType: string = 'generic'
  ) {
    super(message)
    this.name = 'AssetLoadError'
  }
}

/**
 * Preload an image and return a promise that resolves when loaded
 */
export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => resolve(img)
    img.onerror = () => reject(new AssetLoadError(
      `Failed to load image: ${src}`,
      src,
      'image'
    ))
    
    img.src = src
  })
}

/**
 * Load an asset with fallback support
 */
export async function loadAssetWithFallback(config: AssetConfig): Promise<string> {
  try {
    if (config.type === 'image') {
      await preloadImage(config.primary)
    }
    return config.primary
  } catch (error) {
    console.warn(`Primary asset failed to load: ${config.primary}`, error)
    
    if (config.fallback) {
      try {
        if (config.type === 'image') {
          await preloadImage(config.fallback)
        }
        console.info(`Using fallback asset: ${config.fallback}`)
        return config.fallback
      } catch (fallbackError) {
        console.error(`Fallback asset also failed: ${config.fallback}`, fallbackError)
        throw new AssetLoadError(
          `Both primary and fallback assets failed to load`,
          config.primary,
          config.type
        )
      }
    }
    
    throw error
  }
}

/**
 * Hook for managing asset loading state
 */
export function useAssetLoader() {
  const loadAsset = async (config: AssetConfig) => {
    try {
      return await loadAssetWithFallback(config)
    } catch (error) {
      if (error instanceof AssetLoadError) {
        // Log to monitoring service in production
        console.error('Asset loading failed:', {
          url: error.assetUrl,
          type: error.assetType,
          message: error.message
        })
      }
      throw error
    }
  }

  return { loadAsset }
}