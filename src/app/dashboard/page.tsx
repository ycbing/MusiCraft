'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CoverImage } from '@/components/AlbumCover'
import { useReveal } from '@/lib/use-reveal'
import { MusicVisualElement } from '@/components/MusicVisualElement'
import StatsCards from '@/components/StatsCards'
import { EmptyState } from '@/components/EmptyState'
import { toast } from 'sonner'
import {
  Music, Plus, Clock, Play, Sparkles, Search, X, SlidersHorizontal, ChevronRight, Wand2, Mic,
  MoreHorizontal, Copy, Trash2, Pause,
} from 'lucide-react'
import type { Song, MusicStyle, MusicMood } from '@/types'

/* ── Label maps ── */
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

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: '草稿', color: 'bg-gray-500/20 text-gray-300 border border-gray-500/20' },
  generating: { label: '生成中...', color: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/20 animate-pulse' },
  completed: { label: '已完成', color: 'bg-green-500/20 text-green-300 border border-green-500/20' },
  failed: { label: '失败', color: 'bg-red-500/20 text-red-300 border border-red-500/20' },
}

/* ── Filter options ── */
const STYLE_OPTIONS = [
  { value: 'all', label: '全部风格' },
  ...Object.entries(STYLE_LABELS).map(([value, label]) => ({ value, label })),
]

const MOOD_OPTIONS = [
  { value: 'all', label: '全部情绪' },
  ...Object.entries(MOOD_LABELS).map(([value, label]) => ({ value, label })),
]

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: '全部状态' },
  { value: 'draft', label: '草稿' },
  { value: 'generating', label: '生成中' },
  { value: 'completed', label: '已完成' },
  { value: 'failed', label: '失败' },
]

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'newest', label: '最新优先' },
  { value: 'oldest', label: '最早优先' },
  { value: 'longest', label: '最长时长' },
  { value: 'shortest', label: '最短时长' },
]

/* ── Helper: format date for grouping ── */
function formatGroupDate(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate())

  if (target.getTime() === today.getTime()) return '今天'
  if (target.getTime() === yesterday.getTime()) return '昨天'
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [songs, setSongs] = useState<Song[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [styleFilter, setStyleFilter] = useState('all')
  const [moodFilter, setMoodFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [filtersVisible, setFiltersVisible] = useState(true)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const timelineRef = useReveal<HTMLDivElement>()

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated') {
      fetch('/api/songs')
        .then(r => r.json())
        .then(d => setSongs(d.songs || []))
        .catch(console.error)
    }
  }, [status, router])

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const stats = useMemo(() => {
    const totalSongs = songs.length
    const completedSongs = songs.filter(s => s.status === 'completed').length
    const totalDuration = songs.reduce((acc, s) => acc + (s.duration ?? 0), 0)
    const credits = (session?.user as any)?.credits ?? 0
    return { totalSongs, completedSongs, totalDuration, credits }
  }, [songs, session])

  const filteredAndSorted = useMemo(() => {
    let result = [...songs]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        s => s.title.toLowerCase().includes(q) ||
             STYLE_LABELS[s.style]?.toLowerCase().includes(q) ||
             MOOD_LABELS[s.mood]?.toLowerCase().includes(q)
      )
    }

    if (statusFilter !== 'all') result = result.filter(s => s.status === statusFilter)
    if (styleFilter !== 'all') result = result.filter(s => s.style === styleFilter)
    if (moodFilter !== 'all') result = result.filter(s => s.mood === moodFilter)

    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'longest': return (b.duration ?? 0) - (a.duration ?? 0)
        case 'shortest': return (a.duration ?? 0) - (b.duration ?? 0)
        default: return 0
      }
    })

    return result
  }, [songs, searchQuery, statusFilter, styleFilter, moodFilter, sortBy])

  /* ── Group by date ── */
  const grouped = useMemo(() => {
    const groups: Record<string, Song[]> = {}
    for (const s of filteredAndSorted) {
      const key = formatGroupDate(s.createdAt)
      if (!groups[key]) groups[key] = []
      groups[key].push(s)
    }
    // Order: 今天 > 昨天 > other dates descending
    const order = ['今天', '昨天']
    const otherKeys = Object.keys(groups).filter(k => !order.includes(k))
    otherKeys.sort((a, b) => {
      const da = new Date(a.replace('月', '/').replace('日', ''))
      const db = new Date(b.replace('月', '/').replace('日', ''))
      return db.getTime() - da.getTime()
    })
    return [...order, ...otherKeys].filter(k => groups[k]).map(k => ({ date: k, songs: groups[k] }))
  }, [filteredAndSorted])

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || styleFilter !== 'all' || moodFilter !== 'all'

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setStyleFilter('all')
    setMoodFilter('all')
  }

  const handleTogglePlay = useCallback((song: Song) => {
    if (!song.audioUrl) return
    const songId = String(song.id)
    if (playingId === songId) {
      audioRef.current?.pause()
      setPlayingId(null)
    } else {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      const audio = new Audio(song.audioUrl)
      audioRef.current = audio
      audio.play().catch(() => {})
      audio.onended = () => setPlayingId(null)
      setPlayingId(songId)
    }
  }, [playingId])

  const handleDeleteSong = async (e: React.MouseEvent, songId: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('确定删除这首歌？')) return
    try {
      const res = await fetch(`/api/songs/${songId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setSongs(prev => prev.filter(s => String(s.id) !== songId))
      setMenuOpenId(null)
      toast.success('歌曲已删除')
    } catch {
      toast.error('删除失败')
    }
  }

  const handleCopyTitle = async (e: React.MouseEvent, title: string) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(title)
      setMenuOpenId(null)
      toast.success('标题已复制')
    } catch {
      toast.info(title)
    }
  }

  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || '创作者'
  const userEmail = session?.user?.email || ''
  const firstInitial = userName.charAt(0).toUpperCase()

  if (status === 'loading') {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          <span className="text-sm text-gray-500">加载中...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-20 relative">
      {/* Decorative background element — top right corner */}
      <div className="absolute top-32 right-4 hidden xl:block pointer-events-none">
        <MusicVisualElement variant="orbit" opacity={0.05} />
      </div>
      <div className="absolute bottom-32 left-4 hidden xl:block pointer-events-none">
        <MusicVisualElement variant="waveform" opacity={0.05} />
      </div>

      <div className="max-w-5xl mx-auto px-4 relative">
        {/* ── Creator Header (with gradient ring avatar) ── */}
        <div
          className="glass-strong rounded-2xl p-6 mb-8 card-hover relative overflow-hidden"
          data-reveal="fade"
        >
          {/* Subtle decorative gradient corner */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

          <div className="relative flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              {/* Avatar with gradient ring */}
              <div className="avatar-ring shrink-0" style={{ width: 56, height: 56 }}>
                <div className="avatar-ring-inner">
                  <span className="text-xl font-display text-white">{firstInitial}</span>
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h1 className="font-title text-lg text-white truncate">{userName}</h1>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-medium text-green-400">
                    <span className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
                    在线
                  </span>
                </div>
                {userEmail && (
                  <p className="text-xs text-[color:var(--text-tertiary)] truncate">{userEmail}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-300">{stats.credits}</span>
                <span className="text-xs text-purple-300/70">积分</span>
              </div>
              <Link href="/create">
                <Button variant="brand" size="sm" className="gap-1.5">
                  <Plus className="w-4 h-4" /> 创作新歌
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Stats Cards ── */}
        {songs.length > 0 && <StatsCards {...stats} />}

        {/* ── Style Distribution Bar Chart ── */}
        {songs.length > 0 && (
          <div className="glass rounded-xl p-5 mb-6" data-reveal data-reveal-delay="2">
            <h3 className="font-title text-sm text-white mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-gradient-to-b from-purple-400 to-blue-400 rounded-full" />
              我的风格
            </h3>
            <div className="space-y-2.5">
              {(() => {
                const styleCount: Record<string, number> = {}
                let total = 0
                for (const s of songs) {
                  const label = STYLE_LABELS[s.style] || s.style
                  styleCount[label] = (styleCount[label] || 0) + 1
                  total++
                }
                const entries = Object.entries(styleCount)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 8)
                const colors = [
                  'from-purple-500 to-pink-500',
                  'from-blue-500 to-cyan-500',
                  'from-pink-500 to-purple-500',
                  'from-amber-500 to-orange-500',
                  'from-green-500 to-emerald-500',
                  'from-indigo-500 to-blue-500',
                  'from-red-500 to-rose-500',
                  'from-teal-500 to-cyan-500',
                ]
                return entries.map(([label, count], i) => {
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0
                  return (
                    <div key={label} className="flex items-center gap-3 group">
                      <span className="text-xs text-[color:var(--text-tertiary)] w-16 text-right shrink-0 group-hover:text-white transition-colors">
                        {label}
                      </span>
                      <div className="flex-1 h-6 bg-white/[0.03] rounded-full overflow-hidden relative">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${colors[i % colors.length]} transition-all duration-700 ease-out`}
                          style={{ width: `${Math.max(pct, 4)}%` }}
                        />
                      </div>
                      <span className="text-xs text-[color:var(--text-muted)] w-10 text-right tabular-nums group-hover:text-white transition-colors">
                        {count}
                      </span>
                      <span className="text-[10px] text-[color:var(--text-muted)] w-8 text-right tabular-nums">
                        {pct}%
                      </span>
                    </div>
                  )
                })
              })()}
            </div>
          </div>
        )}

        {/* ── Search & Filter ── */}
        {songs.length > 0 && (
          <div
            className="glass rounded-xl p-3 mb-6 space-y-3 card-hover"
            data-reveal
            data-reveal-delay="1"
          >
            {/* Search Row */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                <Input
                  placeholder="搜索歌曲、风格、情绪…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-sm bg-black/30 border-white/[0.06] focus:border-purple-500/40 focus:bg-black/50 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setFiltersVisible(!filtersVisible)}
                className={`h-9 px-3 rounded-lg border flex items-center gap-1.5 text-sm transition-all duration-200 active:scale-95 ${
                  filtersVisible
                    ? 'bg-purple-500/10 border-purple-500/30 text-purple-300 shadow-[0_0_12px_rgba(139,92,246,0.15)]'
                    : 'bg-transparent border-white/10 text-gray-400 hover:text-gray-300 hover:border-white/20'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">筛选</span>
              </button>
              <Select value={sortBy} onValueChange={v => v && setSortBy(v)}>
                <SelectTrigger className="w-[140px] shrink-0 bg-black/30 border-white/[0.06]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filter Row */}
            <div className={`flex flex-wrap items-center gap-2 transition-all duration-300 ${
              filtersVisible ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 overflow-hidden'
            }`}>
              <Select value={statusFilter} onValueChange={v => v && setStatusFilter(v)}>
                <SelectTrigger className="w-[130px] bg-black/30 border-white/[0.06]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={styleFilter} onValueChange={v => v && setStyleFilter(v)}>
                <SelectTrigger className="w-[130px] bg-black/30 border-white/[0.06]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STYLE_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={moodFilter} onValueChange={v => v && setMoodFilter(v)}>
                <SelectTrigger className="w-[130px] bg-black/30 border-white/[0.06]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MOOD_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-[color:var(--text-tertiary)] hover:text-purple-400 transition-colors duration-200 ml-1 whitespace-nowrap px-2 py-1 rounded-md hover:bg-purple-500/10"
                >
                  清除筛选
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Empty State ── */}
        {songs.length === 0 && (
          <EmptyState type="no-songs" />
        )}

        {/* ── Filtered Empty ── */}
        {songs.length > 0 && filteredAndSorted.length === 0 && (
          <EmptyState type="no-results" actionLabel="清除筛选" onAction={clearFilters} />
        )}

        {/* ── Timeline (grouped by date) ── */}
        {songs.length > 0 && filteredAndSorted.length > 0 && (
          <div className="space-y-10" ref={timelineRef}>
            {grouped.map((group, gIdx) => (
              <div key={group.date} data-reveal data-reveal-delay={Math.min(gIdx + 1, 4)}>
                {/* Group header with decorative bar */}
                <div className="group-header flex items-center gap-3 mb-4">
                  <h3 className="font-title text-sm text-[color:var(--text-secondary)]">{group.date}</h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
                  <span className="text-xs text-[color:var(--text-muted)] tabular-nums">
                    {group.songs.length} 首
                  </span>
                </div>

                <div className="space-y-1">
                  {group.songs.map((song, sIdx) => {
                    const statusInfo = STATUS_LABELS[song.status] || STATUS_LABELS.draft
                    const songId = String(song.id)
                    const isPlaying = playingId === songId
                    return (
                      <div
                        key={song.id}
                        className="timeline-row flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/[0.03] hover:translate-x-1 transition-all duration-200 group relative"
                        data-reveal="fade"
                        data-reveal-delay={Math.min(sIdx + 1, 6)}
                      >
                        <Link href={`/song/${song.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Tiny cover */}
                          <div className="shrink-0 rounded-lg ring-1 ring-white/10 overflow-hidden shadow-md shadow-black/30">
                            <CoverImage
                              style={(song.style || 'pop') as MusicStyle}
                              mood={(song.mood || 'happy') as MusicMood}
                              size={40}
                              className="w-10 h-10 group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>

                          {/* Title + meta */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-white truncate">{song.title || '无标题'}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap ${statusInfo.color}`}>
                                {statusInfo.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-[color:var(--text-tertiary)] mt-0.5">
                              <span>{STYLE_LABELS[song.style] || song.style}</span>
                              <span className="text-[color:var(--text-muted)]">·</span>
                              <span>{MOOD_LABELS[song.mood] || song.mood}</span>
                              {song.duration && (
                                <>
                                  <span className="text-[color:var(--text-muted)]">·</span>
                                  <span className="flex items-center gap-0.5">
                                    <Clock className="w-3 h-3" />{song.duration}s
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Time */}
                          <span className="text-xs text-[color:var(--text-muted)] tabular-nums shrink-0">{formatTime(song.createdAt)}</span>
                          <ChevronRight className="w-4 h-4 text-[color:var(--text-muted)] group-hover:text-white transition-all duration-200 group-hover:translate-x-0.5 shrink-0" />
                        </Link>

                        {/* Quick play button */}
                        {song.status === 'completed' && song.audioUrl && (
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleTogglePlay(song); }}
                            className="shrink-0 w-8 h-8 rounded-full bg-purple-500/15 border border-purple-500/20 flex items-center justify-center
                              opacity-0 group-hover:opacity-100 hover:bg-purple-500/30 transition-all duration-200 active:scale-90"
                            title={isPlaying ? '暂停' : '试听'}
                          >
                            {isPlaying ? (
                              <Pause className="w-3.5 h-3.5 text-purple-300" />
                            ) : (
                              <Play className="w-3.5 h-3.5 text-purple-300 fill-current" />
                            )}
                          </button>
                        )}

                        {/* More menu */}
                        <div className="relative shrink-0">
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpenId(menuOpenId === songId ? null : songId); }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center
                              opacity-0 group-hover:opacity-100 hover:bg-white/[0.06] transition-all duration-200"
                            title="更多"
                          >
                            <MoreHorizontal className="w-4 h-4 text-gray-400" />
                          </button>

                          {menuOpenId === songId && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpenId(null); }}
                              />
                              <div className="absolute right-0 top-full mt-1 z-20 w-36 rounded-xl glass-strong border border-white/10 shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in zoom-in-95 origin-top-right">
                                <button
                                  onClick={(e) => handleCopyTitle(e, song.title || '无标题')}
                                  className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-gray-300 hover:bg-white/[0.05] hover:text-white transition-colors"
                                >
                                  <Copy className="w-3.5 h-3.5" /> 复制标题
                                </button>
                                <button
                                  onClick={(e) => handleDeleteSong(e, songId)}
                                  className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors border-t border-white/[0.04]"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> 删除
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
