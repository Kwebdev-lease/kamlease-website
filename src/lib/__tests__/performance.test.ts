import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { debounce, throttle, prefersReducedMotion, measureRenderTime } from '../performance'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock performance.now
Object.defineProperty(window, 'performance', {
  writable: true,
  value: {
    now: vi.fn(() => Date.now()),
  },
})

describe('Performance utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  describe('debounce', () => {
    it('should debounce function calls', async () => {
      const mockFn = vi.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn('test1')
      debouncedFn('test2')
      debouncedFn('test3')

      expect(mockFn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(100)

      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('test3')
    })

    it('should call function with latest arguments', async () => {
      const mockFn = vi.fn()
      const debouncedFn = debounce(mockFn, 50)

      debouncedFn('first')
      vi.advanceTimersByTime(25)
      debouncedFn('second')
      vi.advanceTimersByTime(50)

      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('second')
    })
  })

  describe('throttle', () => {
    it('should throttle function calls', () => {
      const mockFn = vi.fn()
      const throttledFn = throttle(mockFn, 100)

      throttledFn('test1')
      throttledFn('test2')
      throttledFn('test3')

      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('test1')

      vi.advanceTimersByTime(100)

      throttledFn('test4')
      expect(mockFn).toHaveBeenCalledTimes(2)
      expect(mockFn).toHaveBeenCalledWith('test4')
    })
  })

  describe('prefersReducedMotion', () => {
    it('should return false when reduced motion is not preferred', () => {
      vi.mocked(window.matchMedia).mockReturnValue({
        matches: false,
        media: '(prefers-reduced-motion: reduce)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })

      expect(prefersReducedMotion()).toBe(false)
    })

    it('should return true when reduced motion is preferred', () => {
      vi.mocked(window.matchMedia).mockReturnValue({
        matches: true,
        media: '(prefers-reduced-motion: reduce)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })

      expect(prefersReducedMotion()).toBe(true)
    })
  })

  describe('measureRenderTime', () => {
    it('should measure render time', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      let callCount = 0
      
      const mockPerformanceNow = vi.fn(() => {
        callCount++
        return callCount === 1 ? 0 : 10 // 10ms render time
      })
      
      Object.defineProperty(window, 'performance', {
        writable: true,
        value: { now: mockPerformanceNow },
      })

      const timer = measureRenderTime('TestComponent')
      timer.start()
      timer.end()

      expect(consoleSpy).toHaveBeenCalledWith('TestComponent render time:', '10.00', 'ms')
      
      consoleSpy.mockRestore()
    })

    it('should warn for slow renders', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      let callCount = 0
      
      const mockPerformanceNow = vi.fn(() => {
        callCount++
        return callCount === 1 ? 0 : 20 // 20ms render time (above 16ms threshold)
      })
      
      Object.defineProperty(window, 'performance', {
        writable: true,
        value: { now: mockPerformanceNow },
      })

      const timer = measureRenderTime('SlowComponent')
      timer.start()
      timer.end()

      expect(warnSpy).toHaveBeenCalledWith('SlowComponent render time exceeds 16ms:', '20.00', 'ms')
      
      consoleSpy.mockRestore()
      warnSpy.mockRestore()
    })
  })
})