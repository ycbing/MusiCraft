'use client'

import { Music, Search, Coins, AlertTriangle, FileQuestion, Plus, X, Wand2, Mic } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

type Variant = 'no-songs' | 'no-results' | 'no-credits' | 'error' | 'not-found'

interface EmptyStateProps {
  variant?: Variant
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
}

const VARIANTS: Record<Variant, {
  icon: React.ComponentType<{ className?: string }>
  iconBg: string
  iconColor: string
  defaultTitle: string
  defaultDescription: string
  defaultActionLabel?: string
  decorative?: 'note' | 'spectrum' | 'vinyl'
}> = {
  'no-songs': {
    icon: Music,
    iconBg: 'from-purple-500/20 to-blue-500/20',
    iconColor: 'text-purple-400',
    defaultTitle: '还没有歌曲',
    defaultDescription: '创作你的第一首 AI 歌曲',
    defaultActionLabel: '立即创作',
    decorative: 'spectrum',
  },
  'no-results': {
    icon: Search,
    iconBg: 'from-gray-500/20 to-gray-600/20',
    iconColor: 'text-gray-400',
    defaultTitle: '没有符合条件的歌曲',
    defaultDescription: '调整搜索条件试试',
    decorative: 'note',
  },
  'no-credits': {
    icon: Coins,
    iconBg: 'from-amber-500/20 to-orange-500/20',
    iconColor: 'text-amber-400',
    defaultTitle: '积分不足',
    defaultDescription: '当前积分无法创建新歌曲',
    defaultActionLabel: '获取积分',
    decorative: 'vinyl',
  },
  'error': {
    icon: AlertTriangle,
    iconBg: 'from-red-500/20 to-red-600/20',
    iconColor: 'text-red-400',
    defaultTitle: '出错了',
    defaultDescription: '页面加载失败,请稍后重试',
    defaultActionLabel: '重新加载',
  },
  'not-found': {
    icon: FileQuestion,
    iconBg: 'from-gray-500/20 to-gray-600/20',
    iconColor: 'text-gray-400',
    defaultTitle: '页面未找到',
    defaultDescription: '你访问的资源不存在或已被删除',
    defaultActionLabel: '返回首页',
  },
}

/**
 * EmptyState — unified empty/error component for musicraft.
 * 5 variants: no-songs / no-results / no-credits / error / not-found.
 * Decorative animated music icons per variant.
 */
export function EmptyState({
  variant = 'no-songs',
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  const v = VARIANTS[variant]
  const Icon = v.icon
  const finalTitle = title || v.defaultTitle
  const finalDesc = description || v.defaultDescription
  const finalAction = actionLabel || v.defaultActionLabel

  // Show hint cards only for no-songs variant
  const showHints = variant === 'no-songs'

  const ActionButton = (
    <Button
      variant={variant === 'error' || variant === 'not-found' ? 'outline' : 'brand'}
      size="lg"
      className={variant === 'no-songs' || variant === 'no-credits' ? 'breathe-glow' : ''}
      onClick={onAction}
    >
      {variant === 'no-songs' || variant === 'no-credits' ? (
        <Plus className="w-4 h-4 mr-1.5" />
      ) : variant === 'no-results' ? (
        <X className="w-4 h-4 mr-1" />
      ) : null}
      {finalAction}
    </Button>
  )

  return (
    <div className="text-center py-20 relative fade-in">
      {/* Decorative floating notes / elements */}
      {v.decorative === 'note' && (
        <div className="absolute top-12 left-1/4 text-5xl text-purple-400/20 animate-float-y select-none">
          ♪
        </div>
      )}
      {v.decorative === 'spectrum' && (
        <div className="absolute top-12 left-1/4 flex items-end gap-1 opacity-30 animate-float-y">
          {[8, 14, 20, 16, 12, 18, 10].map((h, i) => (
            <span
              key={i}
              className="w-1 bg-gradient-to-t from-purple-500 to-pink-400 rounded-full"
              style={{ height: `${h * 2}px` }}
            />
          ))}
        </div>
      )}
      {v.decorative === 'vinyl' && (
        <div className="absolute top-12 right-1/4 w-16 h-16 rounded-full border-2 border-purple-500/20 animate-spin-slow">
          <div className="absolute inset-2 rounded-full border border-purple-500/15" />
          <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-purple-500/30" />
        </div>
      )}

      <div className="relative">
        {/* Icon */}
        <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${v.iconBg} flex items-center justify-center ring-1 ring-white/10 shadow-2xl shadow-purple-500/10`}>
          <Icon className={`w-10 h-10 ${v.iconColor}`} />
        </div>

        {/* Title + desc */}
        <h2 className="font-title text-xl sm:text-2xl text-white mb-2">{finalTitle}</h2>
        <p className="text-[color:var(--text-tertiary)] mb-8 text-sm max-w-md mx-auto">{finalDesc}</p>

        {/* Quick-start hint cards for no-songs */}
        {showHints && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto mb-8">
            {[
              { icon: Wand2, label: '输入主题' },
              { icon: Mic, label: 'AI 生成' },
              { icon: Music, label: '下载分享' },
            ].map((step, i) => (
              <div
                key={i}
                className="glass rounded-xl p-3 flex items-center gap-3 card-hover"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                  <step.icon className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-left">
                  <div className="text-xs text-white font-medium">{step.label}</div>
                  <div className="text-[10px] text-[color:var(--text-muted)]">第 {i + 1} 步</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action */}
        {actionHref ? (
          <Link href={actionHref}>{ActionButton}</Link>
        ) : (
          ActionButton
        )}
      </div>
    </div>
  )
}