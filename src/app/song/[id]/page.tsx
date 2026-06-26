'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { WaveformPlayer } from '@/components/WaveformPlayer'
import { generateCoverSvg, CoverImage } from '@/components/AlbumCover'
import { toast } from 'sonner'
import {
  Music, Download, Share2, Trash2, RefreshCw,
  ArrowLeft, Loader2, Clock, Mic2
} from 'lucide-react'
import type { Song, MusicStyle, MusicMood } from '@/types'

export default function SongPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [song, setSong] = useState<Song | null>(null)
  const [loading, setLoading] = useState(true)
  const [polling, setPolling] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated' && id) fetchSong()
  }, [status, id, router])

  async function fetchSong() {
    try {
      const res = await fetch(`/api/songs/${id}`)
      const data = await res.json()
      setSong(data.song)
      if (data.song?.status === 'generating') {
        setPolling(true)
        setTimeout(fetchSong, 5000)
      } else {
        setPolling(false)
      }
    } catch {
      // error silently
    } finally {
      setLoading(false)
    }
  }

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
      setPolling(true)
      setTimeout(fetchSong, 5000)
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  async function handleShare() {
    const url = `${window.location.origin}/song/${id}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success('链接已复制！')
    } catch {
      toast.info(url)
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
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
            <Music className="w-10 h-10 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">歌曲未找到</h2>
          <p className="text-gray-500 mb-6">这首歌可能已被删除或链接无效。</p>
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
    <div className="min-h-screen pb-24">
      {/* Hero Cover Section */}
      <div className="relative w-full h-[50vh] min-h-[400px] max-h-[560px] overflow-hidden">
        <img
          src={`data:image/svg+xml;utf8,${encodedCover}`}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

        {/* Status badge */}
        <div className="absolute top-6 left-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-sm text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> 首页
          </button>
        </div>

        {/* Song info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Badge className="capitalize bg-white/10 text-white border-white/20 backdrop-blur-sm">
                {song.style}
              </Badge>
              <Badge className="capitalize bg-white/10 text-white border-white/20 backdrop-blur-sm">
                {song.mood}
              </Badge>
              <Badge className="bg-white/10 text-white border-white/20 backdrop-blur-sm">
                {song.language === 'zh' ? '中文' : 'EN'}
              </Badge>
              {song.status === 'generating' && (
                <Badge className="bg-yellow-500/20 text-yellow-200 border-yellow-500/30 backdrop-blur-sm animate-pulse">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" /> 生成中
                </Badge>
              )}
              {song.status === 'completed' && (
                <Badge className="bg-green-500/20 text-green-200 border-green-500/30 backdrop-blur-sm">
                  已完成
                </Badge>
              )}
              {song.status === 'failed' && (
                <Badge className="bg-red-500/20 text-red-200 border-red-500/30 backdrop-blur-sm">
                  失败
                </Badge>
              )}
              {song.status === 'draft' && (
                <Badge className="bg-gray-500/20 text-gray-200 border-gray-500/30 backdrop-blur-sm">
                  草稿
                </Badge>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">
              {song.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              {song.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {song.duration}s
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 -mt-16 relative z-10">
        {/* Generating State */}
        {song.status === 'generating' && (
          <Card className="glass p-8 text-center mb-6 card-hover">
            <div className="flex items-center justify-center gap-1 mb-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-1.5 bg-purple-400 rounded-full wave-bar"
                  style={{ height: '20px' }}
                />
              ))}
            </div>
            <p className="text-lg font-medium mb-2">正在创作你的歌曲...</p>
            <p className="text-sm text-gray-500">预计需要 30-60 秒</p>
          </Card>
        )}

        {/* Failed State */}
        {song.status === 'failed' && (
          <Card className="glass p-8 text-center mb-6 border-red-500/20">
            <p className="text-red-400 mb-4">生成失败，请重新尝试。</p>
            <Button onClick={handleRegenerate} variant="brand">
              <RefreshCw className="w-4 h-4 mr-2" /> 重新尝试
            </Button>
          </Card>
        )}

        {/* Draft State */}
        {song.status === 'draft' && (
          <Card className="glass p-8 text-center mb-6">
            <p className="text-gray-400 mb-4">这首歌已准备好生成音乐。</p>
            <Button onClick={handleRegenerate} variant="brand">
              <Music className="w-4 h-4 mr-2" /> 开始生成
            </Button>
          </Card>
        )}

        {/* Player (completed songs) */}
        {song.status === 'completed' && song.audioUrl && (
          <Card className="glass p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <CoverImage
                style={(song.style || 'pop') as MusicStyle}
                mood={(song.mood || 'happy') as MusicMood}
                size={48}
                className="shrink-0"
              />
              <div className="min-w-0">
                <h3 className="font-semibold text-sm truncate">{song.title}</h3>
                <p className="text-xs text-gray-500 capitalize">{song.style} · {song.mood}</p>
              </div>
            </div>
            <WaveformPlayer
              src={song.audioUrl}
              title={song.title}
              duration={song.duration}
            />
          </Card>
        )}

        {/* Action Buttons */}
        {song.status === 'completed' && song.audioUrl && (
          <div className="flex items-center justify-center gap-3 mb-6">
            <Button onClick={handleDownload} variant="outline" className="gap-2 flex-1 max-w-[130px]">
              <Download className="w-4 h-4" /> 下载
            </Button>
            <Button onClick={handleShare} variant="outline" className="gap-2 flex-1 max-w-[130px]">
              <Share2 className="w-4 h-4" /> 分享
            </Button>
            <Button onClick={handleRegenerate} variant="outline" className="gap-2 flex-1 max-w-[160px]">
              <RefreshCw className="w-4 h-4" /> 重新生成
            </Button>
            <Button onClick={handleDelete} variant="outline" className="gap-2 text-red-400 hover:text-red-300 border-red-500/20 hover:border-red-500/30 flex-1 max-w-[100px]">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Lyrics */}
        {song.lyrics && (
          <Card className="glass p-6 mt-6">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
              <Mic2 className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium">歌词</span>
            </div>
            <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap font-mono">
              {song.lyrics}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
