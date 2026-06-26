'use client'

import { useEffect, useRef } from 'react'

/**
 * useReveal
 *
 * Tiny IntersectionObserver hook that adds `revealed` class to elements with
 * `data-reveal` attribute once they enter the viewport.
 *
 * Usage:
 *   const ref = useReveal<HTMLDivElement>()
 *   ...
 *   <div ref={ref}>
 *     <p data-reveal>Hello</p>
 *     <p data-reveal data-reveal-delay="2">World</p>
 *     <img data-reveal="scale" />
 *   </div>
 *
 * Combine with the `[data-reveal]` / `[data-reveal].revealed` rules
 * defined in `globals.css`.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options: IntersectionObserverInit = {}
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return

    // Respect reduced motion preference
    if (typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
        el.classList.add('revealed')
      })
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
        ...options,
      }
    )

    const targets = root.querySelectorAll<HTMLElement>('[data-reveal]')
    targets.forEach((t) => observer.observe(t))

    return () => observer.disconnect()
  }, [options])

  return ref
}
