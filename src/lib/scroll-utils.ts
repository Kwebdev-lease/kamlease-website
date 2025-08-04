/**
 * Scrolls to an element with offset to account for fixed header
 * @param elementId - The ID of the element to scroll to
 * @param offset - Additional offset in pixels (default: 80px for header height)
 */
export const scrollToElement = (elementId: string, offset: number = 80) => {
  const element = document.getElementById(elementId)
  if (element) {
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - offset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
  }
}

/**
 * Scrolls to an element using the standard scrollIntoView with block: 'start' and offset
 * @param elementId - The ID of the element to scroll to
 * @param offset - Additional offset in pixels (default: 80px for header height)
 */
export const scrollToElementWithOffset = (elementId: string, offset: number = 80) => {
  const element = document.getElementById(elementId)
  if (element) {
    // First scroll to element
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    
    // Then adjust for header offset after a small delay
    setTimeout(() => {
      const currentScrollY = window.pageYOffset
      window.scrollTo({
        top: currentScrollY - offset,
        behavior: 'smooth'
      })
    }, 100)
  }
}