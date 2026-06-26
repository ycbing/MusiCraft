'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import {
  User, Lock, BarChart3, ArrowLeft, Loader2, Sparkles,
} from 'lucide-react'
import type { MusicStyle, MusicMood } from '@/types'

const STYLE_LABELS: Record<string, string> = {
  pop: '流行', rock: '摇滚', rap: '说唱', rnb: 'R&B',
  electronic: '电子', classical: '古典', jazz: '爵士',
  folk: '民谣', hiphop: '嘻哈', country: '乡村',
  lofi: '轻音', acoustic: '原声', ambient: '氛围',
}

type TabType = 'profile' | 'password' | 'stats'

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<TabType>('profile')

  // Profile state
  const [name, setName] = useState('')
  const [savingName, setSavingName] = useState(false)

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  // Stats state
  const [stats, setStats] = useState<{
    totalSongs: number
    totalDuration: number
    stylesBreakdown: { style: string; count: number }[]
    statusBreakdown: { status: string; count: number }[]
  } | null>(null)
  const [loadingStats, setLoadingStats] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (session?.user) {
      setName((session.user as any).name || '')
    }
  }, [status, session, router])

  useEffect(() => {
    if (activeTab === 'stats') {
      setLoadingStats(true)
      fetch('/api/user/stats')
        .then(r => r.json())
        .then(d => setStats(d))
        .catch(() => toast.error('加载统计数据失败'))
        .finally(() => setLoadingStats(false))
    }
  }, [activeTab])

  const handleSaveName = async () => {
    if (!name.trim()) { toast.error('名称不能为空'); return }
    setSavingName(true)
    try {
      const res = await fetch('/api/user/name', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('名称已更新')
      // Update session
      if ((window as any).__NEXTAUTH) {
        ;(window as any).__NEXTAUTH.session = await (window as any).__NEXTAUTH.session()
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSavingName(false)
    }
  }

  const handleSavePassword = async () => {
    if (!currentPassword || !newPassword) { toast.error('请填写所有字段'); return }
    if (newPassword.length < 6) { toast.error('新密码至少 6 位'); return }
    setSavingPassword(true)
    try {
      const res = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('密码已更新')
      setCurrentPassword('')
      setNewPassword('')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSavingPassword(false)
    }
  }

  const tabs: { value: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { value: 'profile', label: '个人信息', icon: User },
    { value: 'password', label: '修改密码', icon: Lock },
    { value: 'stats', label: '使用统计', icon: BarChart3 },
  ]

  const credits = (session?.user as any)?.credits ?? 0
  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || '创作者'

  if (status === 'loading') {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-1.5 text-sm text-[color:var(--text-tertiary)] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> 返回
          </button>
          <h1 className="font-title text-xl text-white">账户设置</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Tabs */}
          <div className="md:w-48 shrink-0">
            <div className="glass rounded-xl p-1.5 flex md:flex-col gap-1">
              {tabs.map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap
                    ${
                      activeTab === tab.value
                        ? 'bg-purple-500/15 text-purple-300 border border-purple-500/20'
                        : 'text-[color:var(--text-tertiary)] hover:text-white hover:bg-white/[0.03]'
                    }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden md:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Credits display */}
            <div className="mt-4 glass rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="font-display text-2xl text-white">{credits}</span>
              </div>
              <div className="text-xs text-[color:var(--text-muted)]">剩余积分</div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <Card className="glass-strong p-6 space-y-4">
                <h2 className="font-title text-lg text-white">个人信息</h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-[color:var(--text-tertiary)] mb-1.5 block">邮箱</label>
                    <Input
                      value={session?.user?.email || ''}
                      disabled
                      className="bg-white/[0.03] border-white/10 opacity-60"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[color:var(--text-tertiary)] mb-1.5 block">名称</label>
                    <Input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="你的显示名称"
                      className="bg-white/[0.03] border-white/10 focus:border-purple-500/40"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleSaveName}
                  disabled={savingName}
                  variant="brand"
                  size="sm"
                  className="gap-2"
                >
                  {savingName ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  保存修改
                </Button>
              </Card>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <Card className="glass-strong p-6 space-y-4">
                <h2 className="font-title text-lg text-white">修改密码</h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-[color:var(--text-tertiary)] mb-1.5 block">当前密码</label>
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="输入当前密码"
                      className="bg-white/[0.03] border-white/10 focus:border-purple-500/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[color:var(--text-tertiary)] mb-1.5 block">新密码</label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="至少 6 位字符"
                      className="bg-white/[0.03] border-white/10 focus:border-purple-500/40"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleSavePassword}
                  disabled={savingPassword}
                  variant="brand"
                  size="sm"
                  className="gap-2"
                >
                  {savingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  更新密码
                </Button>
              </Card>
            )}

            {/* Stats Tab */}
            {activeTab === 'stats' && (
              <div className="space-y-4">
                {loadingStats ? (
                  <Card className="glass-strong p-6 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                  </Card>
                ) : stats ? (
                  <>
                    {/* Overview */}
                    <Card className="glass-strong p-6">
                      <h2 className="font-title text-lg text-white mb-4">创作概览</h2>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="glass rounded-xl p-4 text-center">
                          <div className="font-display text-3xl text-white">{stats.totalSongs}</div>
                          <div className="text-xs text-[color:var(--text-muted)] mt-1">总创作数</div>
                        </div>
                        <div className="glass rounded-xl p-4 text-center">
                          <div className="font-display text-3xl text-white">{stats.totalDuration}s</div>
                          <div className="text-xs text-[color:var(--text-muted)] mt-1">总时长</div>
                        </div>
                      </div>
                    </Card>

                    {/* Status breakdown */}
                    {stats.statusBreakdown.length > 0 && (
                      <Card className="glass-strong p-6">
                        <h2 className="font-title text-sm text-white mb-3">状态分布</h2>
                        <div className="space-y-2">
                          {stats.statusBreakdown.map(s => (
                            <div key={s.status} className="flex items-center gap-3">
                              <span className="text-xs text-[color:var(--text-tertiary)] w-16 text-right capitalize">{s.status}</span>
                              <div className="flex-1 h-4 bg-white/[0.03] rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                                  style={{ width: `${stats.totalSongs > 0 ? (s.count / stats.totalSongs) * 100 : 0}%` }}
                                />
                              </div>
                              <span className="text-xs text-[color:var(--text-muted)] w-8 text-right">{s.count}</span>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}

                    {/* Style breakdown */}
                    {stats.stylesBreakdown.length > 0 && (
                      <Card className="glass-strong p-6">
                        <h2 className="font-title text-sm text-white mb-3">风格分布</h2>
                        <div className="space-y-2">
                          {stats.stylesBreakdown.map(s => (
                            <div key={s.style} className="flex items-center gap-3">
                              <span className="text-xs text-[color:var(--text-tertiary)] w-16 text-right">
                                {STYLE_LABELS[s.style] || s.style}
                              </span>
                              <div className="flex-1 h-4 bg-white/[0.03] rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500"
                                  style={{ width: `${stats.totalSongs > 0 ? (s.count / stats.totalSongs) * 100 : 0}%` }}
                                />
                              </div>
                              <span className="text-xs text-[color:var(--text-muted)] w-8 text-right">{s.count}</span>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}
                  </>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
