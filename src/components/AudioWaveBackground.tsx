'use client'

/**
 * AudioWaveBackground — Static decorative spectrum waveform in the page background.
 * Renders many bars at low opacity to give a music-app vibe without being intrusive.
 * Different from MusicVisualElement: this is positioned absolutely and stays as a band.
 */
export function AudioWaveBackground({
  opacity = 0.05,
  height = 160,
  position = 'bottom',
}: {
  opacity?: number
  height?: number
  position?: 'top' | 'bottom' | 'center'
}) {
  // Generate a deterministic but interesting pattern based on sine + curve
  const bars = 80
  const barWidth = 3
  const gap = 4

  const items = Array.from({ length: bars }).map((_, i) => {
    const t = i / bars
    // Combine two sine waves + a slow rise in the middle
    const h =
      14 +
      Math.abs(Math.sin(t * Math.PI * 6) * 30) +
      Math.abs(Math.sin(t * Math.PI * 14 + 1.3) * 14) +
      Math.abs(Math.sin(t * Math.PI)) * 18
    return { x: i * (barWidth + gap), height: h }
  })

  const positionClass =
    position === 'top' ? 'top-0' : position === 'bottom' ? 'bottom-0' : 'top-1/2 -translate-y-1/2'

  return (
    <div
      className={`pointer-events-none absolute left-0 right-0 ${positionClass} overflow-hidden`}
      style={{ height, opacity }}
      aria-hidden="true"
    >
      <svg
        viewBox={`0 0 ${bars * (barWidth + gap)} ${height}`}
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="awBg" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.2" />
            <stop offset="35%" stopColor="#8b5cf6" stopOpacity="1" />
            <stop offset="65%" stopColor="#3b82f6" stopOpacity="1" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        {items.map((bar, i) => (
          <rect
            key={i}
            x={bar.x}
            y={(height - bar.height) / 2}
            width={barWidth}
            height={bar.height}
            rx={barWidth / 2}
            fill="url(#awBg)"
          />
        ))}
      </svg>
    </div>
  )
}