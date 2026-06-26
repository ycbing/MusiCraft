'use client'

import { useState } from 'react'

/**
 * VinylLogo — A spinning vinyl record SVG that accelerates on click.
 * Used in NavBar and Footer as the MusiCraft brand mark.
 */
export function VinylLogo({
  size = 28,
  className,
  showLabel = true,
}: {
  size?: number
  className?: string
  showLabel?: boolean
}) {
  const [spinning, setSpinning] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSpinning(true)
    setTimeout(() => setSpinning(false), 1200)
  }

  return (
    <div
      onClick={handleClick}
      className={`relative inline-flex items-center justify-center cursor-pointer ${className || ''}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label="MusiCraft"
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={spinning ? 'vinyl-fast' : 'vinyl-normal'}
      >
        <defs>
          <radialGradient id="vinylGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="30%" stopColor="rgba(0,0,0,0.4)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.85)" />
          </radialGradient>
          <linearGradient id="vinylRing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <radialGradient id="vinylCenter" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#7c3aed" />
          </radialGradient>
        </defs>

        {/* Vinyl body */}
        <circle cx="50" cy="50" r="48" fill="url(#vinylGradient)" />
        <circle cx="50" cy="50" r="48" fill="none" stroke="url(#vinylRing)" strokeWidth="1.5" opacity="0.6" />

        {/* Concentric grooves */}
        {[42, 36, 30, 24].map((r, i) => (
          <circle
            key={r}
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="0.6"
            opacity={1 - i * 0.15}
          />
        ))}

        {/* Center label */}
        {showLabel && (
          <>
            <circle cx="50" cy="50" r="14" fill="url(#vinylCenter)" />
            <circle cx="50" cy="50" r="14" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
            <circle cx="50" cy="50" r="3" fill="#000" />
            <circle cx="50" cy="50" r="1.2" fill="rgba(255,255,255,0.7)" />
          </>
        )}

        {/* Small decorative sheen */}
        <ellipse
          cx="35"
          cy="30"
          rx="14"
          ry="6"
          fill="rgba(255,255,255,0.06)"
          transform="rotate(-25 35 30)"
        />
      </svg>
    </div>
  )
}