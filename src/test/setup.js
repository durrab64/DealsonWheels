import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

// jsdom does not implement these browser APIs. The app only needs them to
// exist; animation and visibility callbacks are not part of the assertions.
if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

if (!window.scrollTo) {
  window.scrollTo = vi.fn()
} else {
  window.scrollTo = vi.fn()
}

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn()
}

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

class IntersectionObserverStub {
  constructor(callback) {
    this.callback = callback
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

globalThis.ResizeObserver = globalThis.ResizeObserver || ResizeObserverStub
globalThis.IntersectionObserver = globalThis.IntersectionObserver || IntersectionObserverStub
