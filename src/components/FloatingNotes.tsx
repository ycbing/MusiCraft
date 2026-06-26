'use client'

import { useEffect, useState } from 'react'

/**
 * FloatingNotes — Random musical note (♪ ♫ ♬ ♩) bubbles floating up
 * across a section. Generates ~1 note every 6s, each animates upward + fade.
 *
 * Used as a backdrop "music mood" element on the Landing & Create pages.
 * Pure CSS animations, no external deps.
 */
export function FloatingNotes({ count = 4 }: { count?: number }) {
  const [notes, setNotes] = useState<Array<{
    id: number
    char: string
    left: number
    delay: number
    duration: number
    scale: number
    drift: number
  }>>([])

  useEffect(() => {
    const chars = ['♪', '♫', '♬', '♩']
    const spawn = () => {
      const id = Date.now() + Math.random()
      const char = chars[Math.floor(Math.random() * chars.length)]
      const left = Math.random() * 100 // %
      const delay = Math.random() * 0.3
      const duration = 8 + Math.random() * 6 // 8-14s
      const scale = 0.7 + Math.random() * 0.9
      const drift = (Math.random() - 0.5) * 80 // -40 .. 40 px
      setNotes(prev => {
        const next = [...prev, { id, char, left, delay, duration, scale, drift }]
        // cap to count
        return next.slice(-count)
      })
      // remove after animation
      setTimeout(() => {
        setNotes(prev => prev.filter(n => n.id !== id))
      }, (delay + duration) * 1000 + 500)
    }

    // initial spawn
    spawn()
    const interval = setInterval(() => {
      if (Math.random() > 0.4) spawn()
    }, 3000 + Math.random() * 2500)

    return () => clearInterval(interval)
  }, [count])

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {notes.map(n => (
        <span
          key={n.id}
          className="absolute bottom-0 text-purple-300/40 select-none animate-floating-note"
          style={{
            left: `${n.left}%`,
            fontSize: `${1.2 * n.scale}rem`,
            animationDelay: `${n.delay}s`,
            animationDuration: `${n.duration}s`,
            // CSS variable used by keyframes
            ['--drift' as any]: `${n.drift}px`,
          } as React.CSSProperties}
        >
          {n.char}
        </span>
      ))}
    </div>
  )
}