'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CoverImage } from '@/components/AlbumCover'
import { MusicVisualElement } from '@/components/MusicVisualElement'
import { FloatingNotes } from '@/components/FloatingNotes'
import { AudioWaveBackground } from '@/components/AudioWaveBackground'
import { CounterUp } from '@/components/CounterUp'
import { useReveal } from '@/lib/use-reveal'
import {
  Sparkles, ArrowRight, Music, Wand2, Mic, Download, ChevronDown,
} from 'lucide-react'
import type { Song, MusicStyle, MusicMood } from '@/types'

const STYLE_LABELS: Record<string, string> = {
  pop: '流行', rock: '摇滚', rap: '说唱', rnb: 'R&B',
  electronic: '电子', classical: '古典', jazz: '爵士',
  folk: '民谣', hiphop: '嘻哈', country: '乡村',
  lofi: '轻音', acoustic: '原声', ambient: '氛围',
}

const MOOD_LABELS: Record<string, string> = {
  happy: '欢快', sad: '忧伤', energetic: '动感', calm: '平静',
  romantic: '浪漫', melancholy: '忧郁', uplifting: '励志',
  dark: '黑暗', dreamy: '梦幻', dramatic: '戏剧', peaceful: '宁静',
}

const FLOATING_TAGS = ['流行', '摇滚', '电子', '古典', '爵士', 'R&B', '民谣', '说唱']

// 示例作品（未登录或没有完成作品时显示）
const SAMPLE_SONGS: Song[] = [
  { id: 'sample-1', title: '夏日海边', lyrics: '', style: 'pop', mood: 'happy', language: 'zh', audioUrl: '/api/cos/sample-1.mp3', coverUrl: null, duration: 58, status: 'completed', createdAt: '2026-06-25T10:00:00Z', updatedAt: '2026-06-25T10:00:00Z' },
  { id: 'sample-2', title: '雨夜霓虹', lyrics: '', style: 'electronic', mood: 'dreamy', language: 'zh', audioUrl: '/api/cos/sample-2.mp3', coverUrl: null, duration: 52, status: 'completed', createdAt: '2026-06-24T20:00:00Z', updatedAt: '2026-06-24T20:00:00Z' },
  { id: 'sample-3', title: '初雪告白', lyrics: '', style: 'acoustic', mood: 'romantic', language: 'zh', audioUrl: '/api/cos/sample-3.mp3', coverUrl: null, duration: 45, status: 'completed', createdAt: '2026-06-23T18:00:00Z', updatedAt: '2026-06-23T18:00:00Z' },
  { id: 'sample-4', title: '夜行者', lyrics: '', style: 'jazz', mood: 'calm', language: 'zh', audioUrl: '/api/cos/sample-4.mp3', coverUrl: null, duration: 60, status: 'completed', createdAt: '2026-06-22T22:00:00Z', updatedAt: '2026-06-22T22:00:00Z' },
  { id: 'sample-5', title: '热血少年', lyrics: '', style: 'rock', mood: 'energetic', language: 'zh', audioUrl: '/api/cos/sample-5.mp3', coverUrl: null, duration: 48, status: 'completed', createdAt: '2026-06-21T16:00:00Z', updatedAt: '2026-06-21T16:00:00Z' },
  { id: 'sample-6', title: '星空下', lyrics: '', style: 'lofi', mood: 'peaceful', language: 'zh', audioUrl: '/api/cos/sample-6.mp3', coverUrl: null, duration: 55, status: 'completed', createdAt: '2026-06-20T23:00:00Z', updatedAt: '2026-06-20T23:00:00Z' },
]

export default function HomePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [topic, setTopic] = useState('')
  const [songs, setSongs] = useState<Song[]>(SAMPLE_SONGS)
  const [songsLoaded, setSongsLoaded] = useState(true)

  const heroRef = useReveal<HTMLDivElement>()
  const featuredRef = useReveal<HTMLDivElement>()
  const stepsRef = useReveal<HTMLDivElement>()
  const ctaRef = useReveal<HTMLDivElement>()

  useEffect(() => {
    if (session?.user) {
      fetch('/api/songs')
        .then(r => r.json())
        .then(d => {
          const all = (d.songs || []) as Song[]
          const completed = all.filter(s => s.status === 'completed').slice(0, 6)
          if (completed.length > 0) setSongs(completed)
        })
        .catch(() => {})
    }
  }, [session])

  const handleCreate = () => {
    const q = topic.trim()
    if (q) {
      router.push(`/create?topic=${encodeURIComponent(q)}`)
    } else {
      router.push('/create')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCreate()
  }

  const handleRipple = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.currentTarget
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

  return (
    <div className="min-h-screen relative">
      {/* ── Hero Section ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden" ref={heroRef}>
        {/* Deep gradient base */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a001a] via-[#0d0024] to-black" />
        {/* Floating music notes */}
        <FloatingNotes count={5} />
        {/* Audio wave at bottom of hero */}
        <AudioWaveBackground opacity={0.04} height={140} position="bottom" />

        {/* Hero gradient mask overlay */}
        <div className="absolute inset-0 hero-gradient" />

        {/* Floating orbs unique to hero (extra layered) */}
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none animate-float-slow" />
        <div className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] bg-blue-600/15 rounded-full blur-[100px] pointer-events-none animate-float-medium" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-pink-500/5 rounded-full blur-[150px] pointer-events-none animate-float-slow" />

        {/* Decorative music elements */}
        <div className="absolute top-[18%] left-[6%] hidden lg:block animate-float-y">
          <MusicVisualElement variant="note" opacity={0.08} />
        </div>
        <div className="absolute bottom-[20%] right-[8%] hidden lg:block animate-float-y" style={{ animationDelay: '-2s' }}>
          <MusicVisualElement variant="vinyl" opacity={0.07} />
        </div>
        <div className="absolute top-[35%] right-[12%] hidden xl:block animate-float-y" style={{ animationDelay: '-4s' }}>
          <MusicVisualElement variant="spectrum" opacity={0.07} />
        </div>
        <div className="absolute bottom-[28%] left-[10%] hidden xl:block animate-float-y" style={{ animationDelay: '-3s' }}>
          <MusicVisualElement variant="waveform" opacity={0.06} />
        </div>

        <div className="relative z-10 w-full max-w-3xl mx-auto px-4 text-center flex flex-col items-center gap-6 pt-16">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm"
            data-reveal="fade"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs text-purple-300 font-medium tracking-wide">AI 音乐创作平台</span>
            <span className="w-1 h-1 rounded-full bg-purple-400/50" />
            <span className="text-xs text-purple-300/70">30 秒出歌</span>
          </div>

          {/* Title */}
          <div data-reveal data-reveal-delay="1">
            <h1 className="font-display text-[2.75rem] sm:text-6xl lg:text-7xl leading-[1.05]">
              <span className="block text-white mb-2">🎵 AI 音乐创作</span>
              <span className="block text-clip-gradient">
                输入主题 → 30 秒出歌
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p
            className="text-base sm:text-lg text-[color:var(--text-tertiary)] max-w-xl font-body"
            data-reveal
            data-reveal-delay="2"
          >
            描述你的想法,AI 帮你写歌词、配乐、演唱
            <span className="text-[color:var(--text-muted)] mx-2">·</span>
            <span className="text-[color:var(--text-secondary)]">无需乐器 · 人人都是音乐人</span>
          </p>

          {/* Input + Button */}
          <div
            className="w-full max-w-lg flex items-center gap-2"
            data-reveal
            data-reveal-delay="3"
          >
            <div className="relative flex-1 group">
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="描述你的歌曲主题,比如「夏日海边」…"
                className="w-full h-12 px-5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white
                  placeholder:text-[color:var(--text-muted)]
                  focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.06]
                  transition-all duration-300
                  focus:shadow-[0_0_0_3px_rgba(139,92,246,0.15),0_0_24px_rgba(139,92,246,0.25)]
                  backdrop-blur-sm"
              />
              {/* Subtle inner gradient on focus */}
              <div className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.05) 0%, rgba(59,130,246,0.05) 100%)',
                }}
              />
            </div>
            <button
              onClick={(e) => { handleRipple(e); handleCreate() }}
              className="ripple relative h-12 px-6 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-medium text-sm
                shadow-lg shadow-purple-500/20
                hover:shadow-2xl hover:shadow-purple-500/40 hover:-translate-y-0.5
                active:scale-[0.96]
                transition-all duration-200
                whitespace-nowrap flex items-center gap-2
                before:absolute before:inset-0 before:rounded-xl before:opacity-0 hover:before:opacity-100
                before:bg-gradient-to-r hover:before:from-[#9F67FA] hover:before:to-[#4F92FF]
                before:transition-opacity before:duration-300
                before:-z-10"
            >
              <Music className="w-4 h-4" />
              创作
            </button>
          </div>

          {/* Footnote */}
          <p
            className="text-xs text-[color:var(--text-muted)] flex items-center gap-3"
            data-reveal
            data-reveal-delay="4"
          >
            <span className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
              3 步创作
            </span>
            <span>·</span>
            <span>无需乐器</span>
            <span>·</span>
            <span>免费生成</span>
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 animate-bounce-slow z-10">
          <ChevronDown className="w-6 h-6 text-[color:var(--text-muted)]" />
        </div>

        {/* Floating style tags at bottom of hero */}
        <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-2 sm:gap-3 flex-wrap px-4 z-10">
          {FLOATING_TAGS.map((tag, i) => (
            <span
              key={tag}
              className="gradient-border-chip px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm text-[color:var(--text-tertiary)] cursor-default hover:scale-105 transition-transform"
              style={{ animationDelay: `${i * 0.5}s` }}
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* ── Featured Songs ── */}
      {songs.length > 0 && songsLoaded && (
        <section className="py-24 max-w-6xl mx-auto px-4 relative" ref={featuredRef}>
          {/* Section header */}
          <div className="text-center mb-12" data-reveal>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-sm mb-4">
              <Music className="w-3 h-3 text-purple-400" />
              <span className="text-xs text-[color:var(--text-tertiary)] font-medium">精选作品</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl text-white mb-3">
              🎶 最新作品
            </h2>
            <p className="text-[color:var(--text-tertiary)] text-sm font-body">
              来自创作者们的近期灵感
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {songs.map((song, i) => (
              <Link
                key={song.id}
                href={song.id.startsWith('sample-') ? '/register' : `/song/${song.id}`}
                className="group block"
                data-reveal
                data-reveal-delay={Math.min(i + 1, 6)}
              >
                <div className="glass rounded-2xl p-4 card-glow transition-all duration-300 h-full flex flex-col">
                  <div className="aspect-square mb-3 overflow-hidden rounded-xl cover-glow-hover">
                    <CoverImage
                      style={(song.style || 'pop') as MusicStyle}
                      mood={(song.mood || 'happy') as MusicMood}
                      size={280}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="font-title text-sm text-white truncate">{song.title || '无标题'}</h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 font-medium">
                      {STYLE_LABELS[song.style] || song.style}
                    </span>
                    <span className="text-[10px] text-[color:var(--text-muted)]">
                      {MOOD_LABELS[song.mood] || song.mood}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Stats Section ── */}
      <section className="py-20 max-w-6xl mx-auto px-4 relative">
        <div className="text-center mb-12" data-reveal>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-sm mb-4">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span className="text-xs text-[color:var(--text-tertiary)] font-medium">实时数据</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl text-white mb-3">
            数字见证创作
          </h2>
        </div>

        <div className="glass-strong rounded-3xl p-8 sm:p-12" data-reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6">
            {[
              { target: 1234, label: '总生成歌曲', icon: Music, color: 'from-purple-500 to-pink-500' },
              { target: 56, label: '在线创作者', icon: Mic, color: 'from-blue-500 to-cyan-500' },
              { target: 13, label: '音乐风格', icon: Sparkles, color: 'from-pink-500 to-purple-500' },
              { target: 30, suffix: 's', label: '平均生成时长', icon: Download, color: 'from-amber-500 to-orange-500' },
            ].map((stat, i) => (
              <div key={i} className="text-center group" data-reveal data-reveal-delay={i + 1}>
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.color} mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div className={`font-display text-4xl sm:text-5xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                  <CounterUp target={stat.target} />
                  {'suffix' in stat ? stat.suffix : ''}
                </div>
                <div className="text-xs sm:text-sm text-[color:var(--text-tertiary)]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quick Start ── */}
      <section className="py-24 max-w-6xl mx-auto px-4 relative" ref={stepsRef}>
        <div className="text-center mb-14" data-reveal>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-sm mb-4">
            <Wand2 className="w-3 h-3 text-purple-400" />
            <span className="text-xs text-[color:var(--text-tertiary)] font-medium">简单三步</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl text-white mb-3">
            三步创作
          </h2>
          <p className="text-[color:var(--text-tertiary)] text-sm font-body">
            简单三步,创作你的专属歌曲
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {[
            { icon: Wand2, title: '输入主题', desc: '描述你的想法', emoji: '✍️', step: '01' },
            { icon: Mic, title: 'AI 生成', desc: '歌词 + 配乐一气呵成', emoji: '🤖', step: '02' },
            { icon: Download, title: '下载分享', desc: '发布到任何平台', emoji: '🎵', step: '03' },
          ].map((step, i) => (
            <div
              key={i}
              className="glass-strong rounded-2xl p-8 text-center card-glow group relative overflow-hidden"
              data-reveal
              data-reveal-delay={i + 1}
            >
              {/* Large step number — visual anchor */}
              <div className="absolute -top-2 -right-2 font-display text-[7rem] leading-none text-white/[0.03] group-hover:text-white/[0.06] transition-colors duration-500 select-none">
                {step.step}
              </div>

              <div className="relative z-10">
                <div className="text-5xl mb-5 inline-block animate-float-y" style={{ animationDelay: `${i * 0.4}s` }}>
                  {step.emoji}
                </div>
                <h3 className="font-title text-lg text-white mb-2">{step.title}</h3>
                <p className="text-sm text-[color:var(--text-tertiary)] font-body">{step.desc}</p>

                {/* Small step indicator line */}
                <div className="mt-5 mx-auto w-12 h-[2px] rounded-full bg-gradient-to-r from-purple-500/40 to-blue-500/40 group-hover:w-20 transition-all duration-500" />
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12" ref={ctaRef} data-reveal>
          <Link href={session ? '/create' : '/register'}>
            <Button
              size="lg"
              variant="brand"
              className="text-base px-8 py-6 breathe-glow rounded-2xl"
            >
              开始创作 <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <p className="text-xs text-[color:var(--text-muted)] mt-4">
            ✨ 注册即送 10 积分 · 无需信用卡
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-10 mt-12 relative">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg shadow-purple-500/20">
                <Music className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-display text-base">
                Musi<span className="text-clip-gradient">Craft</span>
              </span>
            </div>
            <p className="text-xs text-[color:var(--text-muted)]">
              AI 音乐创作 · 人人都是音乐人
            </p>
            <p className="text-[10px] text-[color:var(--text-muted)] opacity-60">
              © 2026 MusiCraft. 一切由 AI 想象。
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
