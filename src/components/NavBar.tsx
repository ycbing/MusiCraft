'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Music, LogOut, Plus, Sparkles } from 'lucide-react'

export function NavBar() {
  const { data: session } = useSession()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 group-hover:scale-105 transition-transform">
              <Music className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">
              Musi<span className="gradient-text">Craft</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {session?.user ? (
              <>
                <Link href="/create">
                  <Button size="sm" variant="brand">
                    <Plus className="w-4 h-4 mr-1" /> 创作新歌
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">我的歌曲</Button>
                </Link>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-xs text-purple-300 font-medium">
                    {(session.user as any).credits ?? '?'} 积分
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">登录</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" variant="brand">
                    开始使用
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
