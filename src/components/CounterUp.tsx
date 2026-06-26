'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * CounterUp — animates a number from 0 to `target` once the element enters
 * the viewport. Supports decimal numbers and a duration in ms.
 */
export function CounterUp({
  target,
  duration = 1500,
  format = (v: number) => v.toLocaleString('zh-CN'),
  className,
}: {
  target: number
  duration?: number
  format?: (v: number) => string
  className?: string
}) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const startedRef = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (startedRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !startedRef.current) {
            startedRef.current = true
            const startTime = performance.now()
            const tick = (now: number) => {
              const elapsed = now - startTime
              const t = Math.min(1, elapsed / duration)
              // easeOutCubic
              const eased = 1 - Math.pow(1 - t, 3)
              setValue(target * eased)
              if (t < 1) requestAnimationFrame(tick)
              else setValue(target)
            }
            requestAnimationFrame(tick)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])

  return (
    <span ref={ref} className={className}>
      {format(value)}
    </span>
  )
}