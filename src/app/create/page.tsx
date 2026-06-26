'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  Wand2, Music, Sparkles, Loader2, Globe, Play,
  ArrowLeft, ArrowRight, Check
} from 'lucide-react'
import type { MusicStyle, MusicMood } from '@/types'

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

/* ── Step transition wrapper ── */
function StepTransition({ step, children }: { step: number; children: React.ReactNode }) {
  return (
    <div key={step} className="animate-fade-slide-in">
      {children}
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

/* ── Music generation skeleton ── */
function MusicSkeleton() {
  return (
    <div className="space-y-6">
      {/* Cover art skeleton */}
      <Skeleton className="w-64 h-64 mx-auto rounded-xl" />
      {/* Player skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-3 w-full rounded-full" />
        <div className="flex justify-between">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
      {/* Lyrics skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-1/2" />
      </div>
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

    // Reset then animate
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

  // Notify parent when typewriter finishes
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
    <div className="glass rounded-xl p-4 mb-4 min-h-[120px]">
      <div className="text-sm font-mono leading-relaxed whitespace-pre-wrap space-y-0.5">
        {visibleLines.map((line, i) => (
          <div
            key={i}
            className="animate-type-line-in"
            style={{ animationDelay: '0ms' }}
          >
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

export default function CreatePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [topic, setTopic] = useState('')
  const [style, setStyle] = useState<MusicStyle>('pop')
  const [mood, setMood] = useState<MusicMood>('happy')
  const [language, setLanguage] = useState<'zh' | 'en'>('zh')
  const [title, setTitle] = useState('')

  const [lyrics, setLyrics] = useState('')
  const [generatingLyrics, setGeneratingLyrics] = useState(false)

  const [generating, setGenerating] = useState(false)

  // ── Typewriter state ──
  const [typewriterLines, setTypewriterLines] = useState<string[]>([])
  const [typewriterActive, setTypewriterActive] = useState(false)
  const userEditingRef = useRef(false)

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  const handleGenerateLyrics = useCallback(async () => {
    if (!topic.trim()) {
      toast.error('请输入主题')
      return
    }
    setGeneratingLyrics(true)
    setTypewriterActive(false)
    setTypewriterLines([])
    userEditingRef.current = false
    try {
      const res = await fetch('/api/generate/lyrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          topic: language === 'zh' ? topic : topic,
          style,
          mood,
          language,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      // Split lyrics into lines for typewriter
      const lines = data.lyrics.split('\n').filter(Boolean)
      // Only show first ~16 lines via typewriter
      const displayLines = lines.slice(0, 24)
      setTypewriterLines(displayLines)
      setTypewriterActive(true)
      // Store full lyrics data
      setLyrics(data.lyrics)
      toast.success('歌词生成成功！')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setGeneratingLyrics(false)
    }
  }, [topic, language, style, mood])

  const handleTypewriterComplete = useCallback(() => {
    setTypewriterActive(false)
  }, [])

  // Stop typewriter if user starts editing
  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (typewriterActive) {
      setTypewriterActive(false)
      userEditingRef.current = true
    }
    setLyrics(e.target.value)
  }, [typewriterActive])

  async function handleCreateSong() {
    if (!lyrics.trim()) {
      toast.error('请先生成或输入歌词')
      return
    }
    setGenerating(true)
    try {
      // Create song
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
      const { song } = await createRes.json()
      if (!createRes.ok) throw new Error((song as any)?.message || '创建歌曲失败')

      // Start music generation
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
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {[{ n: 1, label: '主题与风格' }, { n: 2, label: '歌词' }, { n: 3, label: '生成' }].map((s) => (
            <div key={s.n} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                step >= s.n
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white'
                  : 'bg-gray-800 text-gray-500'
              } ${step === s.n ? 'animate-pulse shadow-[0_0_12px_rgba(139,92,246,0.5)]' : ''}`}>
                {step > s.n ? <Check className="w-4 h-4" /> : s.n}
              </div>
              <span className={`text-sm hidden sm:inline ${step >= s.n ? 'text-white' : 'text-gray-600'}`}>
                {s.label}
              </span>
              {s.n < 3 && <div className={`w-12 h-0.5 transition-colors duration-300 ${step > s.n ? 'bg-purple-500' : 'bg-gray-800'}`} />}
            </div>
          ))}
        </div>

        {/* Step content with transition */}
        <StepTransition step={step}>
          {/* Step 1: Topic, Style, Mood */}
          {step === 1 && (
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">你的歌曲主题是什么？</h1>
                <p className="text-gray-400">描述主题，选择风格</p>
              </div>

              <Card className="glass p-6 space-y-6">
                {/* Title */}
                <div>
                  <label className="text-sm font-medium mb-2 block">歌名（选填）</label>
                  <Input
                    placeholder="例如：夏日海边、勇敢的心..."
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="bg-black/50"
                  />
                </div>

                {/* Topic */}
                <div>
                  <label className="text-sm font-medium mb-2 block">主题</label>
                  <textarea
                    placeholder={language === 'zh' ? '描述你的歌曲主题，比如：夏天的海边、奋斗的青春、失恋的心情...' : 'Describe your song theme...'}
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50 resize-none"
                  />
                </div>

                {/* Language */}
                <div>
                  <label className="text-sm font-medium mb-2 block">语言</label>
                  <div className="flex gap-3">
                    {[
                      { value: 'zh', label: '中文', flag: '🇨🇳' },
                      { value: 'en', label: 'English', flag: '🇬🇧' },
                    ].map(l => (
                      <button
                        key={l.value}
                        onClick={() => setLanguage(l.value as 'zh' | 'en')}
                        className={`flex-1 p-3 rounded-xl border text-center transition-all ${
                          language === l.value
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-white/10 bg-black/30 hover:border-white/20'
                        }`}
                      >
                        <span className="text-lg">{l.flag}</span>
                        <div className="text-sm mt-1">{l.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Style - Large cards */}
                <div>
                  <label className="text-sm font-medium mb-2 block">音乐风格</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {STYLES.map(s => (
                      <button
                        key={s.value}
                        onClick={() => setStyle(s.value)}
                        className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 min-h-[76px] ${
                          style === s.value
                            ? 'border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/30'
                            : 'border-white/5 glass card-hover hover:border-white/20'
                        }`}
                      >
                        <span className="text-2xl shrink-0">{s.emoji}</span>
                        <span className="text-sm font-medium">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mood - Large cards */}
                <div>
                  <label className="text-sm font-medium mb-2 block">情绪</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {MOODS.map(m => (
                      <button
                        key={m.value}
                        onClick={() => setMood(m.value)}
                        className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 min-h-[76px] ${
                          mood === m.value
                            ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/30'
                            : 'border-white/5 glass card-hover hover:border-white/20'
                        }`}
                      >
                        <span className="text-2xl shrink-0">{m.emoji}</span>
                        <span className="text-sm font-medium">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </Card>

              <div className="flex justify-end">
                <Button onClick={() => setStep(2)} variant="brand">
                  下一步：歌词 <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Lyrics */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">写歌词或 AI 生成</h1>
                <p className="text-gray-400">让 AI 为你写歌词，或自己动手</p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={handleGenerateLyrics}
                  disabled={generatingLyrics || !topic.trim()}
                  variant="brand"
                >
                  {generatingLyrics ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> 生成中...</>
                  ) : (
                    <><Wand2 className="w-4 h-4 mr-2" /> 生成歌词</>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> 返回
                </Button>
              </div>

              {/* Skeleton while generating lyrics */}
              {generatingLyrics && !typewriterActive && (
                <Card className="glass p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                    <span className="text-sm text-gray-400">AI 正在创作歌词...</span>
                  </div>
                  <LyricsSkeleton />
                </Card>
              )}

              {/* Typewriter display */}
              <TypewriterDisplay
                lines={typewriterLines}
                active={typewriterActive}
                onComplete={handleTypewriterComplete}
              />

              {/* Lyrics editor */}
              <Card className="glass">
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    {language === 'zh' ? '歌词' : 'Lyrics'}
                  </span>
                  <span className="text-xs text-gray-600">
                    {lyrics.split('\n').filter(l => l.trim()).length} 行
                  </span>
                </div>
                <textarea
                  placeholder={language === 'zh'
                    ? '点击「生成歌词」或手动输入...\n\n格式示例：\n[Verse 1]\n你的歌词...\n[Chorus]\n副歌...'
                    : 'Click "Generate Lyrics" or write your own...\n\nFormat:\n[Verse 1]\nYour lyrics...\n[Chorus]\nYour chorus...'}
                  value={lyrics}
                  onChange={handleTextareaChange}
                  rows={16}
                  className="w-full bg-transparent border-0 p-4 text-sm font-mono leading-relaxed focus:outline-none resize-none"
                />
              </Card>

              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Music className="w-4 h-4" />
                  {lyrics.trim() ? '歌词已就绪！' : '需要歌词才能继续'}
                </p>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!lyrics.trim()}
                  variant="brand"
                >
                  下一步：生成音乐 <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Generate */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">准备就绪</h1>
                <p className="text-gray-400">确认设置并生成</p>
              </div>

              {/* Music generation skeleton */}
              {generating && (
                <Card className="glass p-8">
                  <MusicSkeleton />
                </Card>
              )}

              {!generating && (
                <>
                  <Card className="glass p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wider">风格</span>
                        <div className="font-medium mt-1 capitalize">{style}</div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wider">情绪</span>
                        <div className="font-medium mt-1 capitalize">{mood}</div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wider">语言</span>
                        <div className="font-medium mt-1">{language === 'zh' ? '中文' : 'English'}</div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wider">时长</span>
                        <div className="font-medium mt-1">约 30 秒</div>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wider">消耗</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span className="font-medium">5 积分</span>
                        <span className="text-gray-500 text-sm">
                          （可用：{(session?.user as any)?.credits ?? 0}）
                        </span>
                      </div>
                    </div>
                  </Card>

                  {/* Lyrics Preview */}
                  <Card className="glass">
                    <div className="p-3 border-b border-white/5 flex items-center gap-2">
                      <Music className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-medium">{title || topic || '未命名歌曲'}</span>
                    </div>
                    <pre className="p-4 text-sm text-gray-300 font-mono leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                      {lyrics}
                    </pre>
                  </Card>
                </>
              )}

              <div className="flex justify-between items-center">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ArrowLeft className="w-4 h-4 mr-1" /> 编辑歌词
                </Button>
                <Button
                  onClick={handleCreateSong}
                  disabled={generating}
                  size="lg"
                  variant="brand"
                >
                  {generating ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> 创作中...</>
                  ) : (
                    <><Play className="w-5 h-5 mr-2" /> 生成音乐</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </StepTransition>
      </div>
    </div>
  )
}
