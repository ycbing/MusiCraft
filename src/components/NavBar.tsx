'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Music, LogOut, Plus, Sparkles, Library, Search } from 'lucide-react'
import { VinylLogo } from '@/components/VinylLogo'

export function NavBar() {
  const { data: session } = useSession()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <VinylLogo size={30} />
            <span className="font-bold text-lg">
              Musi<span className="gradient-text">Craft</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {session?.user ? (
              <>
                {/* ⌘K Search placeholder — visual only for now */}
                <button
                  type="button"
                  onClick={() => {
                    /* placeholder */
                  }}
                  className="hidden md:flex items-center gap-2 h-8 px-3 rounded-lg
                    bg-white/[0.03] border border-white/[0.06]
                    text-xs text-[color:var(--text-muted)]
                    hover:bg-white/[0.05] hover:border-white/[0.1]
                    transition-all duration-200"
                  aria-label="搜索"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>搜索</span>
                  <span className="kbd ml-1">⌘ K</span>
                </button>

                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="hidden sm:inline-flex gap-1.5">
                    <Library className="w-4 h-4" /> 我的歌曲
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="sm:hidden">
                    <Library className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/create">
                  <Button size="sm" variant="brand" className="gap-1.5">
                    <Plus className="w-4 h-4" /> <span className="hidden sm:inline">创作新歌</span>
                    <span className="hidden md:inline kbd ml-1">⌘ N</span>
                  </Button>
                </Link>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
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
