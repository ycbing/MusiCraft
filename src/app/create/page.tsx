'use client'

import { Suspense, useState, useRef, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CoverImage } from '@/components/AlbumCover'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  Wand2, Sparkles, Loader2, Play, ArrowLeft, Music,
} from 'lucide-react'
import type { MusicStyle, MusicMood } from '@/types'

/* ── Constants ── */
const STYLES: { value: MusicStyle; label: string; emoji: string }[] = [
  { value: 'pop', label: '流行', emoji: '🎤' },
  { value: 'rock', label: '摇滚', emoji: '🎸' },
  { value: 'rap', label: '说唱', emoji: '🎙️' },
  { value: 'rnb', label: 'R&B', emoji: '🎵' },
  { value: 'electronic', label: '电子', emoji: '🎛️' },
  { value: 'classical', label: '古典', emoji: '🎻' },
  { value: 'jazz', label: '爵士', emoji: '🎷' },
  { value: 'folk', label: '民谣', emoji: '🪕' },
  { value: 'hiphop', label: '嘻哈', emoji: '🎧' },
  { value: 'country', label: '乡村', emoji: '🤠' },
  { value: 'lofi', label: '轻音', emoji: '☕' },
  { value: 'acoustic', label: '原声', emoji: '🎶' },
  { value: 'ambient', label: '氛围', emoji: '🌊' },
]

const MOODS: { value: MusicMood; label: string; emoji: string }[] = [
  { value: 'happy', label: '欢快', emoji: '😊' },
  { value: 'sad', label: '忧伤', emoji: '😢' },
  { value: 'energetic', label: '动感', emoji: '⚡' },
  { value: 'calm', label: '平静', emoji: '😌' },
  { value: 'romantic', label: '浪漫', emoji: '💕' },
  { value: 'melancholy', label: '忧郁', emoji: '🌧️' },
  { value: 'uplifting', label: '励志', emoji: '🌈' },
  { value: 'dark', label: '黑暗', emoji: '🌑' },
  { value: 'dreamy', label: '梦幻', emoji: '✨' },
  { value: 'dramatic', label: '戏剧', emoji: '🎭' },
  { value: 'peaceful', label: '宁静', emoji: '🕊️' },
]

/* ── Static waveform visualization (no playback) ── */
function StaticWaveform() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height
    const bars = 48
    const gap = 3
    const barWidth = (W - gap * (bars - 1)) / bars

    ctx.clearRect(0, 0, W, H)

    for (let i = 0; i < bars; i++) {
      const percent = 0.15 + Math.sin((i / bars) * Math.PI * 4) * 0.3 + Math.random() * 0.15
      const barHeight = Math.max(6, percent * H * 0.7)
      const x = i * (barWidth + gap)
      const y = (H - barHeight) / 2

      const hue = 260 + percent * 100
      ctx.fillStyle = `hsla(${hue}, 70%, 50%, 0.3)`
      const r = 2
      ctx.beginPath()
      ctx.moveTo(x + r, y)
      ctx.lineTo(x + barWidth - r, y)
      ctx.arcTo(x + barWidth, y, x + barWidth, y + r, r)
      ctx.lineTo(x + barWidth, y + barHeight)
      ctx.lineTo(x, y + barHeight)
      ctx.lineTo(x, y + r)
      ctx.arcTo(x, y, x + r, y, r)
      ctx.closePath()
      ctx.fill()
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect()
      if (rect) {
        canvas.width = rect.width * 2
        canvas.height = rect.height * 2
        canvas.style.width = rect.width + 'px'
        canvas.style.height = rect.height + 'px'
      }
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  return (
    <div className="h-20 rounded-xl overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}

/* ── Lyrics skeleton ── */
function LyricsSkeleton() {
  return (
    <div className="space-y-3 p-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  )
}

/* ── Typewriter lyrics display ── */
function TypewriterDisplay({
  lines,
  active,
  onComplete,
}: {
  lines: string[]
  active: boolean
  onComplete: () => void
}) {
  const [visibleCount, setVisibleCount] = useState(0)

  useEffect(() => {
    if (!active || lines.length === 0) {
      setVisibleCount(0)
      return
    }
    setVisibleCount(0)
    const interval = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= lines.length) {
          clearInterval(interval)
          return prev
        }
        return prev + 1
      })
    }, 200)
    return () => clearInterval(interval)
  }, [active, lines])

  useEffect(() => {
    if (active && visibleCount >= lines.length && lines.length > 0) {
      const t = setTimeout(onComplete, 400)
      return () => clearTimeout(t)
    }
  }, [active, visibleCount, lines.length, onComplete])

  if (!active) return null

  const visibleLines = lines.slice(0, visibleCount)
  const isComplete = visibleCount >= lines.length

  return (
    <div className="glass rounded-xl p-4 min-h-[100px]">
      <div className="text-sm font-mono-cn leading-relaxed whitespace-pre-wrap space-y-0.5">
        {visibleLines.map((line, i) => (
          <div key={i} className="animate-type-line-in" style={{ animationDelay: '0ms' }}>
            {line || '\u00A0'}
          </div>
        ))}
        {!isComplete && (
          <span className="inline-block w-2 h-4 bg-purple-400 ml-0.5 animate-type-cursor" />
        )}
        {isComplete && (
          <div className="text-xs text-gray-500 mt-2 italic">✓ 歌词已就绪 — 你可以编辑修改</div>
        )}
      </div>
    </div>
  )
}

/* ── Tag selector (horizontal scroll) ── */
function TagSelector<T extends string>({
  items,
  selected,
  onChange,
}: {
  items: { value: T; label: string; emoji?: string }[]
  selected: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => onChange(item.value)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 whitespace-nowrap
            hover:scale-105 active:scale-95
            ${
              selected === item.value
                ? 'bg-purple-500/20 border-purple-500/50 text-purple-200 shadow-[0_0_16px_rgba(139,92,246,0.25)]'
                : 'bg-white/[0.03] border-white/10 text-gray-400 hover:text-gray-200 hover:border-white/20 hover:bg-white/[0.05]'
            }`}
        >
          {item.emoji && <span className="mr-1">{item.emoji}</span>}
          {item.label}
        </button>
      ))}
    </div>
  )
}

function CreatePageInner() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [topic, setTopic] = useState('')
  const [style, setStyle] = useState<MusicStyle>('pop')
  const [mood, setMood] = useState<MusicMood>('happy')
  const [language, setLanguage] = useState<'zh' | 'en'>('zh')
  const [title, setTitle] = useState('')

  const [lyrics, setLyrics] = useState('')
  const [generatingLyrics, setGeneratingLyrics] = useState(false)

  const [generating, setGenerating] = useState(false)
  const [buttonState, setButtonState] = useState<'idle' | 'creating' | 'generating'>('idle')

  // Typewriter state
  const [typewriterLines, setTypewriterLines] = useState<string[]>([])
  const [typewriterActive, setTypewriterActive] = useState(false)

  // Auto-fill topic from URL param
  useEffect(() => {
    const t = searchParams?.get('topic')
    if (t) setTopic(t)
  }, [searchParams])

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  const handleGenerateLyrics = useCallback(async () => {
    if (!topic.trim()) {
      toast.error('请输入主题')
      return
    }
    setGeneratingLyrics(true)
    setTypewriterActive(false)
    setTypewriterLines([])
    try {
      const res = await fetch('/api/generate/lyrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          topic: topic,
          style,
          mood,
          language,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      const lines = data.lyrics.split('\n').filter(Boolean)
      const displayLines = lines.slice(0, 24)
      setTypewriterLines(displayLines)
      setTypewriterActive(true)
      setLyrics(data.lyrics)
      toast.success('歌词生成成功！')
    } catch (err: any) {
      toast.error(err.message || '歌词生成失败')
    } finally {
      setGeneratingLyrics(false)
    }
  }, [topic, style, mood, language])

  const handleTypewriterComplete = useCallback(() => {
    setTypewriterActive(false)
  }, [])

  const handleCreateSong = useCallback(async (e?: React.MouseEvent) => {
    if (e) {
      const target = e.currentTarget as HTMLElement
      const rect = target.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height) * 2
      const ripple = document.createElement('span')
      ripple.className = 'ripple-effect'
      ripple.style.width = ripple.style.height = `${size}px`
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`
      target.appendChild(ripple)
      setTimeout(() => ripple.remove(), 600)
    }

    if (!lyrics.trim()) {
      toast.error('请先输入或生成歌词')
      return
    }

    setButtonState('creating')
    setGenerating(true)

    try {
      // Step 1: Create song
      const createRes = await fetch('/api/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || topic || '未命名歌曲',
          lyrics,
          style,
          mood,
          language,
        }),
      })
      const data = await createRes.json()
      const song = data.song
      if (!createRes.ok) throw new Error(song?.message || '创建歌曲失败')

      setButtonState('generating')

      // Step 2: Start music generation
      const genRes = await fetch('/api/generate/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          songId: song.id,
          lyrics,
          style,
          mood,
          language,
          title: title || topic || '未命名歌曲',
          duration: 30,
        }),
      })
      const genData = await genRes.json()
      if (!genRes.ok) throw new Error(genData.error)

      toast.success('歌曲创建成功！正在生成音乐...')
      router.push(`/song/${song.id}`)
    } catch (err: any) {
      toast.error(err.message)
      setButtonState('idle')
      setGenerating(false)
    }
  }, [lyrics, title, topic, style, mood, language, router])

  const credits = (session?.user as any)?.credits ?? 0
  const canCreate = !generating && lyrics.trim().length > 0

  if (status === 'loading') {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
          <span className="text-sm text-gray-500">加载中...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-20 relative">
      {/* ── Floating top bar (sticky + backdrop-blur) ── */}
      <div className="sticky top-16 z-40 -mt-12 pt-4 pb-4 mb-6 backdrop-blur-xl bg-black/30 border-b border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="group flex items-center gap-1.5 text-sm text-[color:var(--text-tertiary)] hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            返回
          </button>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[color:var(--text-muted)]">
              <Music className="w-3.5 h-3.5" />
              <span>创作新歌</span>
            </div>
            <h1 className="font-title text-base sm:text-lg text-white">创作新歌</h1>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs text-purple-300 font-medium">{credits} 积分</span>
          </div>
        </div>
      </div>

      {/* ── Main area: left input + right preview ── */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── Left: input area ── */}
          <div className="flex-1 space-y-5">
            {/* Topic — focus indicator via editor-focus-indicator class */}
            <div className="editor-focus-indicator rounded-xl pt-3">
              <label className="text-sm font-medium mb-2 block text-[color:var(--text-secondary)]">
                歌曲主题
                <span className="ml-2 text-xs text-[color:var(--text-muted)] font-normal">描述你想写的歌</span>
              </label>
              <textarea
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="例如:夏日海边的青春回忆、城市夜晚的孤独、给远方朋友的歌…"
                rows={2}
                className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3 text-sm text-white
                  focus:outline-none focus:border-purple-500/40 focus:bg-white/[0.05] resize-none
                  transition-all duration-300
                  placeholder:text-[color:var(--text-muted)]
                  focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)]"
              />
            </div>

            {/* Lyrics */}
            <div className="editor-focus-indicator rounded-xl pt-3">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-[color:var(--text-secondary)]">
                  歌词
                  <span className="ml-2 text-xs text-[color:var(--text-muted)] font-normal">
                    {lyrics.length > 0 ? `${lyrics.length} 字` : 'AI 可帮你写'}
                  </span>
                </label>
                <button
                  onClick={handleGenerateLyrics}
                  disabled={generatingLyrics || typewriterActive || !topic.trim()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20
                    text-xs text-purple-300 font-medium
                    hover:bg-purple-500/20 hover:border-purple-500/30
                    hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/15
                    active:scale-95
                    transition-all duration-200
                    disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  {generatingLyrics ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Wand2 className="w-3 h-3" />
                  )}
                  AI 生成
                </button>
              </div>

              {/* Skeleton while generating */}
              {generatingLyrics && !typewriterActive && (
                <div className="glass rounded-xl p-4 mb-3 fade-in">
                  <div className="flex items-center gap-2 mb-3">
                    <Loader2 className="w-3 h-3 animate-spin text-purple-400" />
                    <span className="text-xs text-gray-500">AI 正在创作歌词...</span>
                  </div>
                  <LyricsSkeleton />
                </div>
              )}

              {/* Typewriter */}
              <TypewriterDisplay
                lines={typewriterLines}
                active={typewriterActive}
                onComplete={handleTypewriterComplete}
              />

              {/* Editor */}
              <textarea
                value={lyrics}
                onChange={e => {
                  if (typewriterActive) setTypewriterActive(false)
                  setLyrics(e.target.value)
                }}
                placeholder="歌词将在这里显示…"
                rows={8}
                className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3 text-sm font-mono-cn leading-relaxed text-white
                  focus:outline-none focus:border-purple-500/40 focus:bg-white/[0.05] resize-none
                  transition-all duration-300
                  placeholder:text-[color:var(--text-muted)]
                  focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)]"
              />
            </div>

            {/* Config: Style + Mood + Language */}
            <div className="editor-focus-indicator rounded-xl pt-3 space-y-4">
              {/* Style */}
              <div>
                <label className="text-xs font-medium text-[color:var(--text-tertiary)] mb-2.5 block uppercase tracking-wider">
                  风格 · Style
                </label>
                <TagSelector items={STYLES} selected={style} onChange={v => setStyle(v)} />
              </div>

              {/* Mood */}
              <div>
                <label className="text-xs font-medium text-[color:var(--text-tertiary)] mb-2.5 block uppercase tracking-wider">
                  情绪 · Mood
                </label>
                <TagSelector items={MOODS} selected={mood} onChange={v => setMood(v)} />
              </div>

              {/* Language toggle */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-[color:var(--text-tertiary)] uppercase tracking-wider">
                  语言 · Language
                </label>
                <div className="flex gap-1 p-0.5 rounded-full bg-white/[0.03] border border-white/10">
                  <button
                    onClick={() => setLanguage('zh')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                      language === 'zh'
                        ? 'bg-purple-500/20 text-purple-200 shadow-[inset_0_0_0_1px_rgba(139,92,246,0.3)]'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    🇨🇳 中文
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                      language === 'en'
                        ? 'bg-purple-500/20 text-purple-200 shadow-[inset_0_0_0_1px_rgba(139,92,246,0.3)]'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    🇬🇧 EN
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: preview area ── */}
          <div className="w-full lg:w-96 shrink-0 space-y-4">
            {/* Cover preview with cover-glow */}
            <div className="flex justify-center">
              <div className="p-1 rounded-2xl bg-gradient-to-br from-purple-500/20 via-transparent to-blue-500/20">
                <CoverImage
                  style={style}
                  mood={mood}
                  size={240}
                  className="rounded-2xl ring-1 ring-white/10
                    shadow-2xl shadow-purple-500/20
                    hover:shadow-purple-500/40 hover:ring-purple-500/30
                    transition-all duration-500 hover:-translate-y-1"
                />
              </div>
            </div>

            {/* Static waveform */}
            <div className="glass rounded-xl p-4 card-hover">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[color:var(--text-tertiary)]">预览波形</span>
                <span className="text-[10px] text-[color:var(--text-muted)] font-mono">~30s</span>
              </div>
              <StaticWaveform />
            </div>

            {/* Song info — meta */}
            <div className="glass rounded-xl p-4 text-center space-y-2">
              <div className="text-xs text-[color:var(--text-tertiary)] space-x-2 flex items-center justify-center flex-wrap gap-y-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300">
                  {STYLES.find(s => s.value === style)?.label || style}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-300">
                  {MOODS.find(m => m.value === mood)?.label || mood}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300">
                  {language === 'zh' ? '中文' : 'EN'}
                </span>
              </div>
            </div>

            {/* Create button — breathe glow when ready */}
            <button
              onClick={handleCreateSong}
              disabled={!canCreate}
              className={`ripple w-full h-12 rounded-xl text-white font-medium text-sm
                flex items-center justify-center gap-2
                transition-all duration-300
                ${
                  canCreate
                    ? 'bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] shadow-lg shadow-purple-500/30 breathe-glow hover:shadow-2xl hover:shadow-purple-500/50 hover:-translate-y-0.5 active:scale-[0.97]'
                    : 'bg-gradient-to-r from-gray-700 to-gray-800 opacity-50 cursor-not-allowed'
                }`}
            >
              {buttonState === 'creating' ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> 创建中...</>
              ) : buttonState === 'generating' ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> 生成中...</>
              ) : (
                <><Play className="w-4 h-4 fill-current" /> 🎵 开始创作</>
              )}
            </button>

            {/* Credit cost */}
            <div className="text-center">
              <span className="text-xs text-[color:var(--text-muted)] inline-flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-purple-400/60" />
                消耗 5 积分
                <span className="text-[color:var(--text-muted)]">·</span>
                剩余 {credits}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CreatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
          <span className="text-sm text-gray-500">加载中...</span>
        </div>
      </div>
    }>
      <CreatePageInner />
    </Suspense>
  )
}
