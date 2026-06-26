'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { WaveformPlayer } from '@/components/WaveformPlayer'
import { generateCoverSvg, CoverImage } from '@/components/AlbumCover'
import { AudioWaveBackground } from '@/components/AudioWaveBackground'
import { VinylLogo } from '@/components/VinylLogo'
import {
  Music, Loader2, Sparkles, ArrowRight,
} from 'lucide-react'
import type { MusicStyle, MusicMood } from '@/types'

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

interface SharedSong {
  title: string
  style: string
  mood: string
  language: string
  audioUrl: string | null
  coverUrl: string | null
  duration: number | null
  status: string
  userName: string
}

export default function SharePage() {
  const params = useParams()
  const token = params?.token as string

  const [song, setSong] = useState<SharedSong | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!token) return
    fetch(`/api/songs/share/${token}`)
      .then(res => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then(data => setSong(data.song))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    )
  }

  if (error || !song) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center ring-1 ring-purple-500/20">
            <Music className="w-10 h-10 text-purple-400" />
          </div>
          <h2 className="font-title text-2xl text-white mb-2">歌曲未找到</h2>
          <p className="text-[color:var(--text-tertiary)] mb-6 text-sm">
            这首歌可能已被删除或链接已过期。
          </p>
          <Link href="/">
            <Button variant="outline" className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10">
              返回首页
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const coverSvg = generateCoverSvg((song.style || 'pop') as MusicStyle, (song.mood || 'happy') as MusicMood, 400)
  const encodedCover = encodeURIComponent(coverSvg)

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a001a] to-black" />
      <AudioWaveBackground opacity={0.03} height={120} position="bottom" />

      {/* Hero Cover */}
      <div className="relative w-full h-[45vh] min-h-[380px] max-h-[500px] overflow-hidden">
        <img
          src={`data:image/svg+xml;utf8,${encodedCover}`}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: 'scale(1.15)', filter: 'blur(2px)' }}
        />
        <img
          src={`data:image/svg+xml;utf8,${encodedCover}`}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-70"
          style={{ transform: 'scale(1.05)' }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

        {/* Logo */}
        <div className="absolute top-6 left-6 flex items-center gap-2">
          <VinylLogo size={28} />
          <span className="font-bold text-lg text-white/80">
            Musi<span className="text-purple-400">Craft</span>
          </span>
        </div>

        {/* Song info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 z-10">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Badge className="capitalize bg-white/10 text-white border-white/20 backdrop-blur-md">
                {STYLE_LABELS[song.style] || song.style}
              </Badge>
              <Badge className="capitalize bg-white/10 text-white border-white/20 backdrop-blur-md">
                {MOOD_LABELS[song.mood] || song.mood}
              </Badge>
              <Badge className="bg-white/10 text-white border-white/20 backdrop-blur-md">
                {song.language === 'zh' ? '中文' : 'EN'}
              </Badge>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-white mb-2">
              {song.title}
            </h1>
            <p className="text-sm text-[color:var(--text-tertiary)]">
              由 {song.userName} 创作
              {song.duration && <span className="ml-2">· {song.duration}s</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Player */}
      <div className="max-w-2xl mx-auto px-4 -mt-16 relative z-10 pb-16">
        {song.audioUrl && (
          <Card className="glass-strong p-6 mb-8 relative overflow-hidden">
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
                <p className="text-xs text-[color:var(--text-tertiary)] capitalize">
                  {STYLE_LABELS[song.style] || song.style} · {MOOD_LABELS[song.mood] || song.mood}
                </p>
              </div>
            </div>
            <WaveformPlayer
              src={song.audioUrl}
              title={song.title}
              duration={song.duration}
            />
          </Card>
        )}

        {/* CTA */}
        <div className="text-center mt-8">
          <p className="text-sm text-[color:var(--text-tertiary)] mb-4">
            喜欢这首歌？用 MusiCraft 创作你自己的音乐吧！
          </p>
          <Link href="/">
            <Button variant="brand" size="lg" className="breathe-glow gap-2">
              <Sparkles className="w-4 h-4" /> 用 MusiCraft 创作 <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
