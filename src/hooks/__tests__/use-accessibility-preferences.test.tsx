import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useAccessibilityPreferences } from '../use-accessibility-preferences'
import { ThemeProvider } from '@/components/ThemeProvider'

// Mock du ThemeProvider
const mockUseTheme = vi.fn()
vi.mock('@/components/ThemeProvider', async () => {
  const actual = await vi.importActual('@/components/ThemeProvider')
  return {
    ...actual,
    useTheme: () => mockUseTheme()
  }
})

// Mock de window.matchMedia
const createMockMatchMedia = (matches: boolean) => vi.fn(() => ({
  matches,
  media: '',
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}))

describe('useAccessibilityPreferences', () => {
  let mockMatchMedia: ReturnType<typeof createMockMatchMedia>

  beforeEach(() => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      resolvedTheme: 'light',
      setTheme: vi.fn()
    })

    mockMatchMedia = createMockMatchMedia(false)
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider defaultTheme="light">
      {children}
    </ThemeProvider>
  )

  it('returns initial accessibility preferences', () => {
    const { result } = renderHook(() => useAccessibilityPreferences(), { wrapper })

    expect(result.current).toEqual({
      prefersReducedMotion: false,
      theme: 'light',
      highContrast: false,
      prefersColorScheme: 'no-preference'
    })
  })

  it('detects prefers-reduced-motion', () => {
    // Mock matchMedia pour retourner true pour prefers-reduced-motion
    const mockReducedMotion = vi.fn((query) => {
      if (query === '(prefers-reduced-motion: reduce)') {
        return {
          matches: true,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }
      }
      return {
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }
    })

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockReducedMotion,
    })

    const { result } = renderHook(() => useAccessibilityPreferences(), { wrapper })

    expect(result.current.prefersReducedMotion).toBe(true)
  })

  it('detects high contrast preference', () => {
    const mockHighContrast = vi.fn((query) => {
      if (query === '(prefers-contrast: high)') {
        return {
          matches: true,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }
      }
      return {
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }
    })

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockHighContrast,
    })

    const { result } = renderHook(() => useAccessibilityPreferences(), { wrapper })

    expect(result.current.highContrast).toBe(true)
  })

  it('detects dark color scheme preference', () => {
    const mockDarkScheme = vi.fn((query) => {
      if (query === '(prefers-color-scheme: dark)') {
        return {
          matches: true,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }
      }
      return {
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }
    })

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockDarkScheme,
    })

    const { result } = renderHook(() => useAccessibilityPreferences(), { wrapper })

    expect(result.current.prefersColorScheme).toBe('dark')
  })

  it('detects light color scheme preference', () => {
    const mockLightScheme = vi.fn((query) => {
      if (query === '(prefers-color-scheme: light)') {
        return {
          matches: true,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }
      }
      return {
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }
    })

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockLightScheme,
    })

    const { result } = renderHook(() => useAccessibilityPreferences(), { wrapper })

    expect(result.current.prefersColorScheme).toBe('light')
  })

  it('updates theme when resolvedTheme changes', () => {
    const { result, rerender } = renderHook(() => useAccessibilityPreferences(), { wrapper })

    expect(result.current.theme).toBe('light')

    // Change le thème
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      resolvedTheme: 'dark',
      setTheme: vi.fn()
    })

    rerender()

    expect(result.current.theme).toBe('dark')
  })

  it('sets up and cleans up event listeners', () => {
    const mockAddEventListener = vi.fn()
    const mockRemoveEventListener = vi.fn()

    const mockMediaQuery = vi.fn(() => ({
      matches: false,
      media: '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
      dispatchEvent: vi.fn(),
    }))

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMediaQuery,
    })

    const { unmount } = renderHook(() => useAccessibilityPreferences(), { wrapper })

    // Vérifie que les event listeners sont ajoutés
    expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function))

    // Démonte le composant
    unmount()

    // Vérifie que les event listeners sont supprimés
    expect(mockRemoveEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })
})