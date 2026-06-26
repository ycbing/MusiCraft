'use client'

import { useEffect, useState } from 'react'

/**
 * ScrollProgress — A thin purple gradient line at the very top of the page
 * that fills in as the user scrolls. 0-cost, all pages benefit.
 */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const update = () => {
      const h = document.documentElement
      const scrollTop = h.scrollTop || document.body.scrollTop
      const scrollHeight = h.scrollHeight - h.clientHeight
      const percent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0
      setProgress(Math.min(100, Math.max(0, percent)))
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[2px] z-[60] pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="h-full origin-left will-change-transform"
        style={{
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #8B5CF6 0%, #3B82F6 60%, #EC4899 100%)',
          boxShadow: '0 0 10px rgba(139, 92, 246, 0.6), 0 0 20px rgba(139, 92, 246, 0.3)',
          transition: 'width 0.1s ease-out',
        }}
      />
    </div>
  )
}