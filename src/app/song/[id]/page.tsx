'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { WaveformPlayer } from '@/components/WaveformPlayer'
import { generateCoverSvg, CoverImage } from '@/components/AlbumCover'
import { MusicVisualElement } from '@/components/MusicVisualElement'
import { useReveal } from '@/lib/use-reveal'
import { toast } from 'sonner'
import {
  Music, Download, Share2, Trash2, RefreshCw,
  ArrowLeft, Loader2, Clock, Mic2,
} from 'lucide-react'
import type { Song, MusicStyle, MusicMood } from '@/types'

const MAX_POLL_COUNT = 60
const POLL_INTERVAL = 3000

export default function SongPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [song, setSong] = useState<Song | null>(null)
  const [loading, setLoading] = useState(true)
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollCountRef = useRef(0)

  const contentRef = useReveal<HTMLDivElement>()

  const fetchSongOnce = useCallback(async () => {
    try {
      const res = await fetch(`/api/songs/${id}`)
      const data = await res.json()
      return data.song as Song | null
    } catch {
      return null
    }
  }, [id])

  const startPolling = useCallback(() => {
    pollCountRef.current = 0
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)

    pollIntervalRef.current = setInterval(async () => {
      pollCountRef.current++
      const updated = await fetchSongOnce()
      if (!updated) return

      setSong(updated)

      if (updated.status === 'completed' || updated.status === 'failed') {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
        return
      }

      if (pollCountRef.current >= MAX_POLL_COUNT) {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
        toast.error('生成超时，请稍后刷新查看')
      }
    }, POLL_INTERVAL)
  }, [fetchSongOnce])

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    }
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated' && id) {
      fetchSongOnce().then(fetched => {
        if (fetched) {
          setSong(fetched)
          if (fetched.status === 'generating') startPolling()
        }
        setLoading(false)
      })
    }
  }, [status, id, router, fetchSongOnce, startPolling])

  async function handleDelete() {
    if (!confirm('确定删除这首歌？')) return
    try {
      await fetch(`/api/songs/${id}`, { method: 'DELETE' })
      toast.success('歌曲已删除')
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  async function handleRegenerate() {
    if (!song) return
    toast.info('重新生成中...')
    try {
      const res = await fetch('/api/generate/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          songId: song.id,
          lyrics: song.lyrics,
          style: song.style,
          mood: song.mood,
          language: song.language,
          title: song.title,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSong({ ...song, status: 'generating', audioUrl: null })
      startPolling()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  async function handleShare() {
    if (!song) return
    try {
      // Check if song already has a share_token
      const res = await fetch(`/api/songs/${id}`)
      const data = await res.json()
      let token = data.song?.shareToken

      // Generate share token if not exists
      if (!token) {
        const putRes = await fetch(`/api/songs/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ share_token: crypto.randomUUID() }),
        })
        const putData = await putRes.json()
        token = putData.song?.share_token
      }

      if (token) {
        const shareUrl = `${window.location.origin}/share/${token}`
        await navigator.clipboard.writeText(shareUrl)
        toast.success('分享链接已复制！')
      } else {
        throw new Error('无法生成分享链接')
      }
    } catch (err: any) {
      toast.error(err.message || '分享失败')
    }
  }

  async function handleDownload() {
    if (!song?.audioUrl) return
    try {
      const res = await fetch(song.audioUrl)
      const blob = await res.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `${song.title || 'song'}.mp3`
      a.click()
      URL.revokeObjectURL(a.href)
    } catch {
      window.open(song.audioUrl, '_blank')
    }
  }

  // Loading state
  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
          <span className="text-sm text-gray-500">加载歌曲中...</span>
        </div>
      </div>
    )
  }

  // Not found
  if (!song) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center ring-1 ring-purple-500/20">
            <Music className="w-10 h-10 text-purple-400" />
          </div>
          <h2 className="font-title text-2xl text-white mb-2">歌曲未找到</h2>
          <p className="text-[color:var(--text-tertiary)] mb-6">这首歌可能已被删除或链接无效。</p>
          <Button variant="outline" onClick={() => router.push('/dashboard')} className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 active:scale-[0.97]">
            <ArrowLeft className="w-4 h-4 mr-1" /> 返回首页
          </Button>
        </div>
      </div>
    )
  }

  const coverSvg = generateCoverSvg((song.style || 'pop') as MusicStyle, (song.mood || 'happy') as MusicMood, 400)
  const encodedCover = encodeURIComponent(coverSvg)

  return (
    <div className="min-h-screen pb-24 relative">
      {/* ── Hero Cover Section ── */}
      <div className="relative w-full h-[50vh] min-h-[420px] max-h-[580px] overflow-hidden">
        <img
          src={`data:image/svg+xml;utf8,${encodedCover}`}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: 'scale(1.15)', filter: 'blur(2px)' }}
        />
        {/* Sharp foreground cover (focused) */}
        <img
          src={`data:image/svg+xml;utf8,${encodedCover}`}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-70"
          style={{ transform: 'scale(1.05)' }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />

        {/* Decorative floating elements */}
        <div className="absolute top-1/4 right-[8%] hidden lg:block animate-float-y opacity-50 pointer-events-none">
          <MusicVisualElement variant="spectrum" opacity={0.25} />
        </div>
        <div className="absolute bottom-1/3 left-[5%] hidden lg:block animate-float-y pointer-events-none" style={{ animationDelay: '-2s' }}>
          <MusicVisualElement variant="note" opacity={0.2} />
        </div>

        {/* Back button */}
        <div className="absolute top-6 left-6 z-10">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-xl border border-white/10 text-sm text-gray-300 hover:text-white hover:bg-black/70 hover:-translate-x-0.5 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" /> 返回
          </button>
        </div>

        {/* Song info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 z-10">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Badge className="capitalize bg-white/10 text-white border-white/20 backdrop-blur-md">
                {song.style}
              </Badge>
              <Badge className="capitalize bg-white/10 text-white border-white/20 backdrop-blur-md">
                {song.mood}
              </Badge>
              <Badge className="bg-white/10 text-white border-white/20 backdrop-blur-md">
                {song.language === 'zh' ? '中文' : 'EN'}
              </Badge>
              {song.status === 'generating' && (
                <Badge className="bg-yellow-500/20 text-yellow-200 border-yellow-500/30 backdrop-blur-md animate-pulse">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" /> 生成中
                </Badge>
              )}
              {song.status === 'completed' && (
                <Badge className="bg-green-500/20 text-green-200 border-green-500/30 backdrop-blur-md">
                  已完成
                </Badge>
              )}
              {song.status === 'failed' && (
                <Badge className="bg-red-500/20 text-red-200 border-red-500/30 backdrop-blur-md">
                  失败
                </Badge>
              )}
              {song.status === 'draft' && (
                <Badge className="bg-gray-500/20 text-gray-200 border-gray-500/30 backdrop-blur-md">
                  草稿
                </Badge>
              )}
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-white mb-2">
              {song.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-[color:var(--text-tertiary)]">
              {song.duration && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> {song.duration}s
                </span>
              )}
              {song.status === 'completed' && (
                <span className="flex items-center gap-1.5 text-green-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  可播放
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 -mt-16 relative z-10" ref={contentRef}>
        {/* Generating State */}
        {song.status === 'generating' && (
          <Card className="glass-strong p-8 text-center mb-6 card-hover" data-reveal>
            <div className="flex items-center justify-center gap-1 mb-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-1.5 bg-gradient-to-t from-purple-400 to-pink-400 rounded-full wave-bar"
                  style={{ height: '20px' }}
                />
              ))}
            </div>
            <p className="font-title text-lg text-white mb-2">正在创作你的歌曲...</p>
            <p className="text-sm text-[color:var(--text-tertiary)]">预计需要 30-60 秒</p>
          </Card>
        )}

        {/* Failed State */}
        {song.status === 'failed' && (
          <Card className="glass-strong p-8 text-center mb-6 border-red-500/20" data-reveal>
            <p className="text-red-300 mb-4">生成失败,请重新尝试。</p>
            <Button onClick={handleRegenerate} variant="brand">
              <RefreshCw className="w-4 h-4 mr-2" /> 重新尝试
            </Button>
          </Card>
        )}

        {/* Draft State */}
        {song.status === 'draft' && (
          <Card className="glass-strong p-8 text-center mb-6" data-reveal>
            <p className="text-[color:var(--text-tertiary)] mb-4">这首歌已准备好生成音乐。</p>
            <Button onClick={handleRegenerate} variant="brand" className="breathe-glow">
              <Music className="w-4 h-4 mr-2" /> 开始生成
            </Button>
          </Card>
        )}

        {/* Player (completed songs) — enhanced glass */}
        {song.status === 'completed' && song.audioUrl && (
          <Card
            className="glass-strong p-6 mb-6 relative overflow-hidden"
            data-reveal
          >
            {/* Subtle inner gradient glow */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative flex items-center gap-3 mb-5">
              <div className="shrink-0 ring-1 ring-white/10 rounded-lg overflow-hidden shadow-lg shadow-purple-500/20">
                <CoverImage
                  style={(song.style || 'pop') as MusicStyle}
                  mood={(song.mood || 'happy') as MusicMood}
                  size={48}
                  className="w-12 h-12"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-title text-sm text-white truncate">{song.title}</h3>
                <p className="text-xs text-[color:var(--text-tertiary)] capitalize">{song.style} · {song.mood}</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-green-300 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span>Live</span>
              </div>
            </div>
            <WaveformPlayer
              src={song.audioUrl}
              title={song.title}
              duration={song.duration}
            />
          </Card>
        )}

        {/* Action Buttons — enhanced micro-interactions */}
        {song.status === 'completed' && song.audioUrl && (
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6 flex-wrap" data-reveal data-reveal-delay="1">
            <Button
              onClick={handleDownload}
              variant="outline"
              className="gap-2 flex-1 max-w-[130px] hover:border-purple-500/40 hover:bg-purple-500/10 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/15 active:scale-[0.97] transition-all duration-200"
            >
              <Download className="w-4 h-4" /> 下载
            </Button>
            <Button
              onClick={handleShare}
              variant="outline"
              className="gap-2 flex-1 max-w-[130px] hover:border-purple-500/40 hover:bg-purple-500/10 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/15 active:scale-[0.97] transition-all duration-200"
            >
              <Share2 className="w-4 h-4" /> 分享
            </Button>
            <Button
              onClick={handleRegenerate}
              variant="outline"
              className="gap-2 flex-1 max-w-[160px] hover:border-purple-500/40 hover:bg-purple-500/10 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/15 active:scale-[0.97] transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4" /> 重新生成
            </Button>
            <Button
              onClick={handleDelete}
              variant="outline"
              className="gap-2 text-red-400 hover:text-red-300 border-red-500/20 hover:border-red-500/30 hover:bg-red-500/10 hover:-translate-y-0.5 active:scale-[0.97] flex-1 max-w-[100px] transition-all duration-200"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">删除</span>
            </Button>
          </div>
        )}

        {/* Lyrics — monospace with decorative music note bullets */}
        {song.lyrics && (
          <Card className="glass-strong p-6 mt-6 relative overflow-hidden" data-reveal data-reveal-delay="2">
            <div className="absolute top-4 right-4 opacity-10">
              <MusicVisualElement variant="note" opacity={0.4} />
            </div>

            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
              <div className="w-7 h-7 rounded-lg bg-purple-500/15 flex items-center justify-center">
                <Mic2 className="w-3.5 h-3.5 text-purple-300" />
              </div>
              <span className="text-sm font-medium text-white">歌词</span>
              <span className="text-xs text-[color:var(--text-muted)] ml-auto font-mono-cn">
                {song.lyrics.split('\n').filter(Boolean).length} 行
              </span>
            </div>
            <div className="text-sm text-[color:var(--text-secondary)] leading-relaxed font-mono-cn">
              {song.lyrics.split('\n').filter(Boolean).map((line, i) => (
                <div
                  key={i}
                  className="group flex items-start gap-2 py-0.5 hover:text-white transition-colors duration-200"
                >
                  <span className="text-purple-400/40 group-hover:text-purple-400/80 transition-colors text-xs mt-1 select-none shrink-0">
                    ♪
                  </span>
                  <span className="flex-1 whitespace-pre-wrap">{line}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
