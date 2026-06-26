import type { MusicStyle, MusicMood } from '@/types'

const STYLE_GRADIENTS: Record<MusicStyle, { from: string; to: string; accent: string }> = {
  pop: { from: '#ec4899', to: '#8b5cf6', accent: '#f472b6' },
  rock: { from: '#dc2626', to: '#1f2937', accent: '#ef4444' },
  rap: { from: '#f59e0b', to: '#7c3aed', accent: '#fbbf24' },
  rnb: { from: '#6b21a8', to: '#1e1b4b', accent: '#a855f7' },
  electronic: { from: '#06b6d4', to: '#3b82f6', accent: '#22d3ee' },
  classical: { from: '#d97706', to: '#713f12', accent: '#fbbf24' },
  jazz: { from: '#92400e', to: '#451a03', accent: '#d97706' },
  folk: { from: '#65a30d', to: '#166534', accent: '#84cc16' },
  hiphop: { from: '#dc2626', to: '#7c3aed', accent: '#ef4444' },
  country: { from: '#b45309', to: '#422006', accent: '#d97706' },
  lofi: { from: '#a16207', to: '#292524', accent: '#d4a373' },
  acoustic: { from: '#d6d3d1', to: '#78716c', accent: '#a8a29e' },
  ambient: { from: '#6366f1', to: '#0f172a', accent: '#818cf8' },
}

const MOOD_PATTERNS: Record<MusicMood, (g: ReturnType<typeof generateSvgElements>) => string> = {
  happy: (g) => g.waves({ count: 8, color: 'rgba(255,255,255,0.08)', amplitude: 40 }),
  sad: (g) => g.raindrops({ count: 30, color: 'rgba(255,255,255,0.06)' }),
  energetic: (g) => g.burstLines({ count: 24, color: 'rgba(255,255,255,0.1)' }),
  calm: (g) => g.moon({ color: 'rgba(255,255,255,0.1)' }),
  romantic: (g) => g.hearts({ count: 12, color: 'rgba(255,255,255,0.08)' }),
  melancholy: (g) => g.fallingLeaves({ count: 15, color: 'rgba(255,255,255,0.05)' }),
  uplifting: (g) => g.sunburst({ rays: 16, color: 'rgba(255,255,255,0.08)' }),
  dark: (g) => g.shards({ count: 20, color: 'rgba(255,0,0,0.05)' }),
  dreamy: (g) => g.stars({ count: 40, color: 'rgba(255,255,255,0.08)' }),
  dramatic: (g) => g.lightning({ color: 'rgba(255,255,255,0.07)' }),
  peaceful: (g) => g.mountains({ peaks: 5, color: 'rgba(255,255,255,0.05)' }),
}

function generateSvgElements(viewBox = 400) {
  const cx = viewBox / 2
  const cy = viewBox / 2

  return {
    waves: ({ count, color, amplitude }: { count: number; color: string; amplitude: number }) => {
      const bars: string[] = []
      for (let i = 0; i < count; i++) {
        const x = (viewBox / (count + 1)) * (i + 1)
        const h = amplitude + Math.random() * amplitude * 1.5
        const y = cy - h / 2
        bars.push(`<rect x="${x - 2}" y="${y}" width="4" height="${h}" rx="2" fill="${color}" />`)
      }
      return bars.join('\n')
    },
    raindrops: ({ count, color }: { count: number; color: string }) => {
      const drops: string[] = []
      for (let i = 0; i < count; i++) {
        const x = Math.random() * viewBox
        const y = Math.random() * viewBox
        const r = 1 + Math.random() * 2
        drops.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" />`)
        drops.push(`<line x1="${x}" y1="${y + r}" x2="${x - r}" y2="${y + r * 3}" stroke="${color}" stroke-width="0.5" />`)
      }
      return drops.join('\n')
    },
    burstLines: ({ count, color }: { count: number; color: string }) => {
      const lines: string[] = []
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i
        const len = 60 + Math.random() * 100
        const x2 = cx + Math.cos(angle) * len
        const y2 = cy + Math.sin(angle) * len
        lines.push(`<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2" />`)
      }
      return lines.join('\n')
    },
    moon: ({ color }: { color: string }) => {
      return `
        <circle cx="${cx}" cy="${cy - 60}" r="50" fill="${color}" />
        <circle cx="${cx + 15}" cy="${cy - 70}" r="45" fill="currentColor" opacity="0.3" />
      `
    },
    hearts: ({ count, color }: { count: number; color: string }) => {
      const heartsArr: string[] = []
      for (let i = 0; i < count; i++) {
        const x = 50 + Math.random() * (viewBox - 100)
        const y = 50 + Math.random() * (viewBox - 100)
        const s = 6 + Math.random() * 10
        const path = `M ${x} ${y + s / 4} A ${s / 4} ${s / 4} 0 0 0 ${x - s / 2} ${y + s / 4} A ${s / 4} ${s / 4} 0 0 0 ${x} ${y + s} A ${s / 4} ${s / 4} 0 0 0 ${x + s / 2} ${y + s / 4} A ${s / 4} ${s / 4} 0 0 0 ${x} ${y + s / 4} Z`
        heartsArr.push(`<path d="${path}" fill="${color}" transform="rotate(${Math.random() * 30 - 15}, ${x}, ${y})" />`)
      }
      return heartsArr.join('\n')
    },
    fallingLeaves: ({ count, color }: { count: number; color: string }) => {
      const leaves: string[] = []
      for (let i = 0; i < count; i++) {
        const x = Math.random() * viewBox
        const y = Math.random() * viewBox
        const s = 4 + Math.random() * 8
        const r = Math.random() * 360
        leaves.push(`<ellipse cx="${x}" cy="${y}" rx="${s}" ry="${s / 2}" fill="${color}" transform="rotate(${r}, ${x}, ${y})" />`)
      }
      return leaves.join('\n')
    },
    sunburst: ({ rays, color }: { rays: number; color: string }) => {
      const elements: string[] = []
      const r1 = 40
      const r2 = 120
      for (let i = 0; i < rays; i++) {
        const a = (Math.PI * 2 / rays) * i
        const x1 = cx + Math.cos(a) * r1
        const y1 = cy + Math.sin(a) * r1
        const x2 = cx + Math.cos(a) * r2
        const y2 = cy + Math.sin(a) * r2
        elements.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2" />`)
      }
      for (let i = 0; i < 3; i++) {
        const r = (r1 / 3) * (i + 1)
        elements.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="1" />`)
      }
      return elements.join('\n')
    },
    shards: ({ count, color }: { count: number; color: string }) => {
      const shards: string[] = []
      for (let i = 0; i < count; i++) {
        const x = Math.random() * viewBox
        const y = Math.random() * viewBox
        const s = 5 + Math.random() * 20
        const r = Math.random() * 360
        shards.push(`<polygon points="${x},${y} ${x + s},${y - s / 2} ${x + s * 1.5},${y + s / 2} ${x + s / 2},${y + s}" fill="${color}" transform="rotate(${r}, ${x}, ${y})" />`)
      }
      return shards.join('\n')
    },
    stars: ({ count, color }: { count: number; color: string }) => {
      const starsArr: string[] = []
      for (let i = 0; i < count; i++) {
        const x = Math.random() * viewBox
        const y = Math.random() * viewBox
        const r = 0.5 + Math.random() * 2
        starsArr.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" />`)
      }
      return starsArr.join('\n')
    },
    lightning: ({ color }: { color: string }) => {
      const bolts: string[] = []
      for (let b = 0; b < 3; b++) {
        let path = `M ${100 + Math.random() * 200} 0`
        let y = 0
        while (y < viewBox) {
          const dx = (Math.random() - 0.5) * 40
          const dy = 30 + Math.random() * 50
          y += dy
          const prev = path.split(' ').pop()!
          const [px] = prev.split(',').map(Number)
          path += ` L ${Number(px) + dx} ${y}`
        }
        bolts.push(`<path d="${path}" stroke="${color}" stroke-width="3" fill="none" stroke-linejoin="round" />`)
      }
      return bolts.join('\n')
    },
    mountains: ({ peaks, color }: { peaks: number; color: string }) => {
      const layers: string[] = []
      for (let p = 0; p < peaks; p++) {
        const yBase = cy + 80 + p * 20
        let path = `M 0 ${viewBox} L 0 ${yBase}`
        for (let x = 0; x < viewBox; x += 10) {
          const peakY = yBase - 30 - Math.sin((x / viewBox) * Math.PI * (2 + p)) * (40 + p * 10) - Math.random() * 10
          path += ` L ${x} ${peakY}`
        }
        path += ` L ${viewBox} ${yBase} L ${viewBox} ${viewBox} Z`
        const opacity = 0.08 + p * 0.02
        layers.push(`<path d="${path}" fill="${color.replace(/[\d.]+\)$/, `${opacity})`)}" />`)
      }
      return layers.join('\n')
    },
  }
}

export function generateCoverSvg(style: MusicStyle, mood: MusicMood, size = 400): string {
  const gradient = STYLE_GRADIENTS[style] || STYLE_GRADIENTS.pop
  const patternFn = MOOD_PATTERNS[mood] || MOOD_PATTERNS.happy
  const g = generateSvgElements(size)
  const pattern = patternFn(g)

  // Add a geometric overlay based on style
  const overlay = generateOverlay(style, size)

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <defs>
    <radialGradient id="coverBg" cx="30%" cy="30%" r="80%">
      <stop offset="0%" stop-color="${gradient.from}" />
      <stop offset="100%" stop-color="${gradient.to}" />
    </radialGradient>
    <linearGradient id="shine" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.15)" />
      <stop offset="50%" stop-color="rgba(255,255,255,0)" />
      <stop offset="100%" stop-color="rgba(0,0,0,0.2)" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#coverBg)" rx="${size * 0.1}" />
  ${overlay}
  ${pattern}
  <rect width="${size}" height="${size}" fill="url(#shine)" rx="${size * 0.1}" />
  <!-- Music note decoration -->
  <text x="${size * 0.8}" y="${size * 0.25}" font-size="60" fill="rgba(255,255,255,0.06)" font-family="sans-serif">♫</text>
  <text x="${size * 0.15}" y="${size * 0.85}" font-size="40" fill="rgba(255,255,255,0.04)" font-family="sans-serif">♪</text>
</svg>`
}

function generateOverlay(style: MusicStyle, size: number): string {
  const cx = size / 2
  const cy = size / 2

  switch (style) {
    case 'pop':
    case 'rock':
    case 'electronic':
    case 'rap':
    case 'hiphop':
      // Concentric circles
      return [0.85, 0.65, 0.45, 0.25].map((r, i) =>
        `<circle cx="${cx}" cy="${cy}" r="${size * r / 2}" fill="none" stroke="rgba(255,255,255,${0.03 + i * 0.015})" stroke-width="${2 - i * 0.3}" />`
      ).join('\n')
    case 'classical':
    case 'jazz':
    case 'folk':
    case 'country':
      // Vertical bars (EQ-like)
      return Array.from({ length: 20 }, (_, i) => {
        const x = (size / 21) * (i + 1)
        const h = 20 + Math.sin(i * 1.2) * 30 + 20
        const y = (size - h) / 2
        return `<rect x="${x - 3}" y="${y}" width="6" height="${h}" rx="3" fill="rgba(255,255,255,0.04)" />`
      }).join('\n')
    case 'lofi':
    case 'acoustic':
    case 'ambient':
      // Soft circles
      return `
        <circle cx="${cx - 40}" cy="${cy - 20}" r="80" fill="rgba(255,255,255,0.03)" />
        <circle cx="${cx + 50}" cy="${cy + 30}" r="60" fill="rgba(255,255,255,0.02)" />
      `
    default:
      return ''
  }
}

export function CoverImage({ style, mood, size = 80, className }: { style?: MusicStyle | null; mood?: MusicMood | null; size?: number; className?: string }) {
  const svg = generateCoverSvg(style || 'pop', mood || 'happy', size)
  const encoded = encodeURIComponent(svg)
  return (
    <img
      src={`data:image/svg+xml;utf8,${encoded}`}
      alt={`${style || 'pop'} ${mood || 'happy'} cover`}
      width={size}
      height={size}
      className={className || ''}
      style={{ borderRadius: size >= 200 ? '1rem' : '9999px' }}
    />
  )
}
