'use client'

import { Music, CheckCircle, Clock, Sparkles } from 'lucide-react'

interface StatsCardsProps {
  totalSongs: number
  completedSongs: number
  totalDuration: number
  credits: number
}

function formatDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) return '0s'
  const m = Math.floor(totalSeconds / 60)
  const s = Math.round(totalSeconds % 60)
  if (m > 0 && s > 0) return `${m}m ${s}s`
  if (m > 0) return `${m}m`
  return `${s}s`
}

const cards = [
  {
    label: '总歌曲',
    icon: Music,
    gradient: 'from-purple-500/20 to-blue-500/20',
    iconColor: 'text-purple-400',
    getValue: (p: StatsCardsProps) => p.totalSongs,
  },
  {
    label: '已完成',
    icon: CheckCircle,
    gradient: 'from-green-500/20 to-emerald-500/20',
    iconColor: 'text-green-400',
    getValue: (p: StatsCardsProps) => p.completedSongs,
  },
  {
    label: '总时长',
    icon: Clock,
    gradient: 'from-amber-500/20 to-orange-500/20',
    iconColor: 'text-amber-400',
    getValue: (p: StatsCardsProps) => formatDuration(p.totalDuration),
    raw: true,
  },
  {
    label: '积分',
    icon: Sparkles,
    gradient: 'from-purple-500/20 to-pink-500/20',
    iconColor: 'text-purple-400',
    getValue: (p: StatsCardsProps) => p.credits,
  },
]

export default function StatsCards(props: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card) => {
        const Icon = card.icon
        const value = card.getValue(props)
        return (
          <div
            key={card.label}
            className="glass rounded-xl p-4 flex items-center gap-4 card-glow"
          >
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shrink-0`}
            >
              <Icon className={`w-6 h-6 ${card.iconColor}`} />
            </div>
            <div className="min-w-0">
              <div className="text-2xl font-bold tabular-nums truncate">
                {value}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{card.label}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
