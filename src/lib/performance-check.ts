/**
 * Performance verification script
 * This script demonstrates the performance optimizations implemented
 */

import { debounce, throttle, prefersReducedMotion } from './performance'

// Demonstrate performance optimizations
export function runPerformanceCheck() {
  console.log('🚀 Performance Optimizations Check')
  console.log('=====================================')

  // 1. Check reduced motion preference
  const reducedMotion = prefersReducedMotion()
  console.log(`✅ Reduced motion preference: ${reducedMotion ? 'Enabled' : 'Disabled'}`)

  // 2. Demonstrate debounce optimization
  let debounceCallCount = 0
  const debouncedFunction = debounce(() => {
    debounceCallCount++
    console.log(`✅ Debounced function called (${debounceCallCount} times)`)
  }, 100)

  // Simulate rapid calls
  for (let i = 0; i < 10; i++) {
    debouncedFunction()
  }

  // 3. Demonstrate throttle optimization
  let throttleCallCount = 0
  const throttledFunction = throttle(() => {
    throttleCallCount++
    console.log(`✅ Throttled function called (${throttleCallCount} times)`)
  }, 100)

  // Simulate rapid calls
  for (let i = 0; i < 10; i++) {
    throttledFunction()
  }

  // 4. Check font loading optimization
  const fontFaces = document.fonts
  if (fontFaces) {
    console.log(`✅ Font loading API available: ${fontFaces.size} fonts loaded`)
    fontFaces.ready.then(() => {
      console.log('✅ All fonts loaded successfully')
    })
  }

  // 5. Check preload hints
  const preloadLinks = document.querySelectorAll('link[rel="preload"]')
  console.log(`✅ Preload hints found: ${preloadLinks.length}`)

  // 6. Check CSS optimizations
  const stylesheets = document.styleSheets
  console.log(`✅ Stylesheets loaded: ${stylesheets.length}`)

  // 7. Performance timing
  if (performance.timing) {
    const timing = performance.timing
    const loadTime = timing.loadEventEnd - timing.navigationStart
    const domReady = timing.domContentLoadedEventEnd - timing.navigationStart
    
    console.log(`✅ Page load time: ${loadTime}ms`)
    console.log(`✅ DOM ready time: ${domReady}ms`)
  }

  // 8. Check for performance observer support
  if ('PerformanceObserver' in window) {
    console.log('✅ Performance Observer API available')
  } else {
    console.log('⚠️ Performance Observer API not available')
  }

  // 9. Check for intersection observer support
  if ('IntersectionObserver' in window) {
    console.log('✅ Intersection Observer API available')
  } else {
    console.log('⚠️ Intersection Observer API not available')
  }

  // 10. Memory usage (if available)
  if ('memory' in performance) {
    const memory = (performance as any).memory
    console.log(`✅ Memory usage: ${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`)
  }

  console.log('=====================================')
  console.log('🎉 Performance check completed!')
}

// Auto-run in development
if (import.meta.env.DEV) {
  // Run after a short delay to ensure DOM is ready
  setTimeout(runPerformanceCheck, 1000)
}