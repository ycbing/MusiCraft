'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CoverImage } from '@/components/AlbumCover'
import StatsCards from '@/components/StatsCards'
import {
  Music,
  Plus,
  Clock,
  Play,
  Sparkles,
  Search,
  X,
  SlidersHorizontal,
} from 'lucide-react'
import type { Song, MusicStyle, MusicMood } from '@/types'

const STYLE_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: '全部风格' },
  { value: 'pop', label: '流行' },
  { value: 'rock', label: '摇滚' },
  { value: 'rap', label: '说唱' },
  { value: 'rnb', label: 'R&B' },
  { value: 'electronic', label: '电子' },
  { value: 'classical', label: '古典' },
  { value: 'jazz', label: '爵士' },
  { value: 'folk', label: '民谣' },
  { value: 'hiphop', label: '嘻哈' },
  { value: 'country', label: '乡村' },
  { value: 'lofi', label: '轻音' },
  { value: 'acoustic', label: '原声' },
  { value: 'ambient', label: '氛围' },
]

const MOOD_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: '全部情绪' },
  { value: 'happy', label: '欢快' },
  { value: 'sad', label: '忧伤' },
  { value: 'energetic', label: '动感' },
  { value: 'calm', label: '平静' },
  { value: 'romantic', label: '浪漫' },
  { value: 'melancholy', label: '忧郁' },
  { value: 'uplifting', label: '励志' },
  { value: 'dark', label: '黑暗' },
  { value: 'dreamy', label: '梦幻' },
  { value: 'dramatic', label: '戏剧' },
  { value: 'peaceful', label: '宁静' },
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

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated') {
      fetch('/api/songs')
        .then(r => r.json())
        .then(d => setSongs(d.songs || []))
        .catch(console.error)
    }
  }, [status, router])

  const stats = useMemo(() => {
    const totalSongs = songs.length
    const completedSongs = songs.filter(s => s.status === 'completed').length
    const totalDuration = songs.reduce((acc, s) => acc + (s.duration ?? 0), 0)
    const credits = (session?.user as any)?.credits ?? 0
    return { totalSongs, completedSongs, totalDuration, credits }
  }, [songs, session])

  const filteredAndSorted = useMemo(() => {
    let result = [...songs]

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        s =>
          s.title.toLowerCase().includes(q) ||
          s.style.toLowerCase().includes(q) ||
          s.mood.toLowerCase().includes(q)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(s => s.status === statusFilter)
    }

    // Style filter
    if (styleFilter !== 'all') {
      result = result.filter(s => s.style === styleFilter)
    }

    // Mood filter
    if (moodFilter !== 'all') {
      result = result.filter(s => s.mood === moodFilter)
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'longest':
          return (b.duration ?? 0) - (a.duration ?? 0)
        case 'shortest':
          return (a.duration ?? 0) - (b.duration ?? 0)
        default:
          return 0
      }
    })

    return result
  }, [songs, searchQuery, statusFilter, styleFilter, moodFilter, sortBy])

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || styleFilter !== 'all' || moodFilter !== 'all'

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setStyleFilter('all')
    setMoodFilter('all')
  }

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-500/20 text-gray-300',
      generating: 'bg-yellow-500/20 text-yellow-300 animate-pulse',
      completed: 'bg-green-500/20 text-green-300',
      failed: 'bg-red-500/20 text-red-300',
    }
    const labels: Record<string, string> = {
      draft: '草稿',
      generating: '生成中...',
      completed: '已完成',
      failed: '失败',
    }
    return <Badge className={colors[status] || ''}>{labels[status] || status}</Badge>
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">我的歌曲</h1>
            <p className="text-gray-400 mt-1">
              欢迎回来，{session?.user?.name || session?.user?.email}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">
                {(session?.user as any)?.credits ?? 0} 积分
              </span>
            </div>
            <Link href="/create">
              <Button variant="brand">
                <Plus className="w-4 h-4 mr-1" /> 创作新歌
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        {songs.length > 0 && <StatsCards {...stats} />}

        {/* Search & Filter Bar */}
        {songs.length > 0 && (
          <div className="glass rounded-xl p-3 mb-6 space-y-3">
            {/* Search Row */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                <Input
                  placeholder="搜索歌曲..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-sm"
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
                className={`h-9 px-3 rounded-lg border border-input flex items-center gap-1.5 text-sm transition-colors ${
                  filtersVisible
                    ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                    : 'bg-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">筛选</span>
              </button>
              <Select value={sortBy} onValueChange={(v) => v && setSortBy(v)}>
                <SelectTrigger className="w-[140px] shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filter Row (collapsible on mobile) */}
            <div
              className={`flex flex-wrap items-center gap-2 transition-all ${
                filtersVisible ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 overflow-hidden'
              }`}
            >
              <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={styleFilter} onValueChange={(v) => v && setStyleFilter(v)}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STYLE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={moodFilter} onValueChange={(v) => v && setMoodFilter(v)}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOOD_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-gray-500 hover:text-purple-400 transition-colors ml-1 whitespace-nowrap"
                >
                  清除筛选
                </button>
              )}
            </div>
          </div>
        )}

        {/* Songs Grid / Empty States */}
        {songs.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
              <Music className="w-8 h-8 text-purple-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">还没有歌曲</h2>
            <p className="text-gray-400 mb-6">创作你的第一首 AI 歌曲</p>
            <Link href="/create">
              <Button variant="brand">
                <Plus className="w-4 h-4 mr-1" /> 创作歌曲
              </Button>
            </Link>
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <div className="text-center py-20 fade-in">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-500/20 to-gray-600/20 flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2">没有符合条件的歌曲</h2>
            <p className="text-gray-400 mb-6">调整搜索条件试试</p>
            <Button
              variant="outline"
              onClick={clearFilters}
              className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
            >
              <X className="w-4 h-4 mr-1" /> 清除筛选
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSorted.map((song) => (
              <Link key={song.id} href={`/song/${song.id}`}>
                <Card className="glass p-5 card-glow group cursor-pointer h-full">
                  <div className="flex items-start justify-between mb-3">
                    <CoverImage
                      style={(song.style || 'pop') as MusicStyle}
                      mood={(song.mood || 'happy') as MusicMood}
                      size={40}
                      className="shrink-0 ring-2 ring-white/10 group-hover:ring-purple-500/30 transition-all"
                    />
                    {statusBadge(song.status)}
                  </div>
                  <h3 className="font-semibold mb-1 truncate">{song.title || '无标题'}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span className="capitalize">{song.style}</span>
                    <span>·</span>
                    <span className="capitalize">{song.mood}</span>
                    {song.duration && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-3 h-3" />{song.duration}s
                        </span>
                      </>
                    )}
                  </div>
                  {song.status === 'completed' && (
                    <div className="flex items-center gap-1 text-purple-400 text-sm">
                      <Play className="w-3 h-3" /> 试听
                    </div>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
