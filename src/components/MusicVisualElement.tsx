import { cn } from '@/lib/utils'

interface MusicVisualElementProps {
  variant?: 'waveform' | 'note' | 'orbit' | 'spectrum' | 'vinyl'
  className?: string
  opacity?: number
}

/**
 * MusicVisualElement — abstract decorative SVG for page corners.
 * Used at low opacity (5–10%) as visual anchor.
 */
export function MusicVisualElement({
  variant = 'waveform',
  className,
  opacity = 0.08,
}: MusicVisualElementProps) {
  return (
    <div
      className={cn('pointer-events-none select-none', className)}
      style={{ opacity }}
      aria-hidden="true"
    >
      {variant === 'waveform' && (
        <svg width="200" height="80" viewBox="0 0 200 80" fill="none">
          {Array.from({ length: 32 }).map((_, i) => {
            const h = 8 + Math.abs(Math.sin(i * 0.5) * 30) + Math.random() * 8
            return (
              <rect
                key={i}
                x={i * 6 + 4}
                y={(80 - h) / 2}
                width="3"
                height={h}
                rx="1.5"
                fill="url(#waveGrad)"
              />
            )
          })}
          <defs>
            <linearGradient id="waveGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="50%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#f472b6" />
            </linearGradient>
          </defs>
        </svg>
      )}

      {variant === 'note' && (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          <path
            d="M45 78V20L88 12V72"
            stroke="url(#noteGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <ellipse cx="42" cy="82" rx="12" ry="9" fill="url(#noteGrad)" />
          <ellipse cx="85" cy="76" rx="12" ry="9" fill="url(#noteGrad)" />
          <defs>
            <linearGradient id="noteGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
      )}

      {variant === 'orbit' && (
        <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
          <circle cx="80" cy="80" r="60" stroke="#a78bfa" strokeWidth="1" fill="none" />
          <circle cx="80" cy="80" r="40" stroke="#60a5fa" strokeWidth="1" fill="none" />
          <circle cx="80" cy="80" r="20" stroke="#f472b6" strokeWidth="1" fill="none" />
          <circle cx="140" cy="80" r="3" fill="#a78bfa" />
          <circle cx="80" cy="40" r="2.5" fill="#60a5fa" />
          <circle cx="60" cy="80" r="2" fill="#f472b6" />
        </svg>
      )}

      {variant === 'spectrum' && (
        <svg width="180" height="60" viewBox="0 0 180 60" fill="none">
          {Array.from({ length: 24 }).map((_, i) => {
            const h = 6 + Math.abs(Math.sin(i * 0.4) * 24)
            return (
              <rect
                key={i}
                x={i * 7 + 4}
                y={(60 - h) / 2}
                width="4"
                height={h}
                rx="2"
                fill="#a78bfa"
              />
            )
          })}
        </svg>
      )}

      {variant === 'vinyl' && (
        <svg width="140" height="140" viewBox="0 0 140 140" fill="none">
          <circle cx="70" cy="70" r="64" stroke="#a78bfa" strokeWidth="1" fill="none" />
          <circle cx="70" cy="70" r="52" stroke="#a78bfa" strokeWidth="1" fill="none" />
          <circle cx="70" cy="70" r="40" stroke="#60a5fa" strokeWidth="1" fill="none" />
          <circle cx="70" cy="70" r="28" stroke="#60a5fa" strokeWidth="1" fill="none" />
          <circle cx="70" cy="70" r="8" fill="#ec4899" />
          <circle cx="70" cy="70" r="3" fill="#fff" />
        </svg>
      )}
    </div>
  )
}
