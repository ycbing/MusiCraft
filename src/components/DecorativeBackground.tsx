/**
 * DecorativeBackground
 *
 * Site-wide decorative layer. Renders:
 *  • Fixed radial gradient backdrop with animated gradient shift
 *  • Multiple floating colored orbs (slow drift, blur)
 *  • Abstract music symbols drifting slowly (decorative SVG)
 *  • The grid pattern is provided via globals.css body::after
 *  • Noise texture is provided via globals.css body::before
 *
 * The component is fixed-positioned and pointer-events-none so it
 * never intercepts clicks. It is decorative only.
 */
export function DecorativeBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* Deep gradient base */}
      <div
        className="absolute inset-0 gradient-shift"
        style={{
          background:
            'radial-gradient(ellipse at 20% 0%, rgba(139, 92, 246, 0.18) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(59, 130, 246, 0.12) 0%, transparent 50%), radial-gradient(ellipse at 50% 100%, rgba(236, 72, 153, 0.08) 0%, transparent 60%)',
        }}
      />

      {/* Floating orbs */}
      <div
        className="decor-orb animate-float-slow"
        style={{
          top: '-15%',
          left: '-10%',
          width: '520px',
          height: '520px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.35) 0%, transparent 70%)',
          animationDelay: '0s',
        }}
      />
      <div
        className="decor-orb animate-float-medium"
        style={{
          top: '30%',
          right: '-12%',
          width: '480px',
          height: '480px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
          animationDelay: '-4s',
        }}
      />
      <div
        className="decor-orb animate-float-fast"
        style={{
          bottom: '-15%',
          left: '30%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.22) 0%, transparent 70%)',
          animationDelay: '-2s',
        }}
      />
      <div
        className="decor-orb animate-float-slow"
        style={{
          top: '55%',
          left: '-8%',
          width: '380px',
          height: '380px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)',
          animationDelay: '-7s',
        }}
      />

      {/* Abstract music symbols — decorative, low opacity */}
      <div
        className="absolute animate-float-y"
        style={{ top: '12%', left: '6%', opacity: 0.06, animationDelay: '0s' }}
      >
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <path
            d="M30 50V20L55 15V45"
            stroke="#a78bfa"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="28" cy="52" r="6" fill="#a78bfa" />
          <circle cx="53" cy="47" r="6" fill="#a78bfa" />
        </svg>
      </div>

      <div
        className="absolute animate-float-y"
        style={{ top: '24%', right: '8%', opacity: 0.05, animationDelay: '-2s' }}
      >
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <path
            d="M15 30 Q22 12, 30 30 T 45 30"
            stroke="#60a5fa"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>

      <div
        className="absolute animate-float-y"
        style={{ bottom: '18%', left: '4%', opacity: 0.07, animationDelay: '-3.5s' }}
      >
        <svg width="100" height="40" viewBox="0 0 100 40" fill="none">
          {Array.from({ length: 18 }).map((_, i) => {
            const h = 6 + Math.abs(Math.sin(i * 0.6)) * 28
            return (
              <rect
                key={i}
                x={i * 5 + 2}
                y={(40 - h) / 2}
                width="2.5"
                height={h}
                rx="1.25"
                fill="#c084fc"
              />
            )
          })}
        </svg>
      </div>

      <div
        className="absolute animate-float-y"
        style={{ bottom: '8%', right: '12%', opacity: 0.05, animationDelay: '-1.5s' }}
      >
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <circle cx="30" cy="30" r="24" stroke="#ec4899" strokeWidth="1.5" fill="none" />
          <circle cx="30" cy="30" r="14" stroke="#ec4899" strokeWidth="1.5" fill="none" />
          <circle cx="30" cy="30" r="4" fill="#ec4899" />
        </svg>
      </div>

      <div
        className="absolute animate-spin-slow"
        style={{ top: '40%', right: '4%', opacity: 0.04 }}
      >
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          <path
            d="M60 12 L108 60 L60 108 L12 60 Z"
            stroke="#818cf8"
            strokeWidth="1.5"
            fill="none"
          />
          <circle cx="60" cy="60" r="3" fill="#818cf8" />
        </svg>
      </div>

      {/* Edge vignette to anchor content */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
        }}
      />

      {/* Faint audio-wave at very bottom — music-app vibe */}
      <div className="absolute bottom-0 left-0 right-0 h-32 opacity-[0.06] pointer-events-none">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <linearGradient id="dbWaveGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
          {Array.from({ length: 100 }).map((_, i) => {
            const t = i / 100
            const h =
              12 +
              Math.abs(Math.sin(t * Math.PI * 7) * 36) +
              Math.abs(Math.sin(t * Math.PI * 16 + 1.7) * 18) +
              Math.abs(Math.sin(t * Math.PI * 2)) * 14
            return (
              <rect
                key={i}
                x={i * 12}
                y={(120 - h) / 2}
                width={4}
                height={h}
                rx={2}
                fill="url(#dbWaveGrad)"
              />
            )
          })}
        </svg>
      </div>
    </div>
  )
}
