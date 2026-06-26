'use client'

import { useEffect, useState } from 'react'
import { Sparkles, Music } from 'lucide-react'

/**
 * LiveGenerateCard — A small floating mock card showing that "someone is
 * generating music right now". Pure UI animation; does NOT hit any API.
 *
 * Cycles through fake user → topic combinations on a timer. Adds social
 * proof and music-app vibe to the landing page.
 */

const MOCK_USERS = [
  '小宇', 'Mira', '林一', 'Echo', '可可', 'Arlo', '七月', 'Nova', 'Sunny', 'Jin',
]
const MOCK_TOPICS = [
  '夏日海边', '凌晨 3 点的城市', '给外婆的歌', '雨夜咖啡馆', '北极的极光',
  '学生时代', '加班后的窗台', '江南烟雨', '日落公路', '失联多年的朋友',
  '凌晨便利店', '冬天的第一场雪', '海岛公路旅行', '城市霓虹',
]

export function LiveGenerateCard() {
  const [index, setIndex] = useState(0)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setIndex(i => (i + 1) % MOCK_USERS.length)
        setFade(true)
      }, 400)
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  const user = MOCK_USERS[index]
  const topic = MOCK_TOPICS[index % MOCK_TOPICS.length]

  return (
    <div className="hidden md:block fixed bottom-6 right-6 z-30 pointer-events-none">
      <div
        className="glass-strong rounded-2xl p-3 pr-4 shadow-2xl shadow-purple-900/30 max-w-xs
          border border-white/10 animate-fade-in
          transition-opacity duration-300"
        style={{ opacity: fade ? 1 : 0 }}
      >
        <div className="flex items-center gap-3">
          {/* Pulsing avatar */}
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <span className="text-xs font-bold text-white">{user.charAt(0)}</span>
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-[#0A0A0F] animate-pulse" />
          </div>

          {/* Text */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-xs text-[color:var(--text-tertiary)]">
              <Music className="w-3 h-3 text-purple-400 animate-pulse" />
              <span className="font-medium text-white">{user}</span>
              <span>正在创作</span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <Sparkles className="w-3 h-3 text-purple-300 shrink-0" />
              <span className="text-xs text-[color:var(--text-secondary)] truncate font-mono-cn">
                「{topic}」
              </span>
            </div>
          </div>

          {/* Animated bars */}
          <div className="flex items-end gap-[2px] h-6 shrink-0">
            {[0, 1, 2, 3].map(i => (
              <span
                key={i}
                className="w-[3px] rounded-full bg-gradient-to-t from-purple-500 to-pink-400 wave-bar"
                style={{ height: '6px', animationDelay: `${i * 0.12}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}