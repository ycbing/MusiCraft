'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Music, Eye, EyeOff } from 'lucide-react'
import { hash } from 'bcryptjs'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const hashedPassword = await hash(password, 12)
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: hashedPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || '注册失败')
        setLoading(false)
        return
      }

      toast.success('账号创建成功！正在登录...')

      // Auto sign in
      const { signIn } = await import('next-auth/react')
      await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 mb-4">
            <Music className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold">创建账号</h1>
          <p className="text-sm text-gray-400 mt-1">开始使用 MusiCraft</p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">昵称</label>
            <Input
              placeholder="你的昵称"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="bg-black/50"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">邮箱</label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="bg-black/50"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">密码</label>
            <div className="relative">
              <Input
                type={showPwd ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="bg-black/50 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" disabled={loading} variant="brand" className="w-full">
            {loading ? '注册中...' : '创建账号'}
          </Button>
          <p className="text-xs text-gray-500 text-center">
            注册即赠送 <span className="text-purple-400 font-medium">50 免费积分</span>
          </p>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          已有账号？{' '}
          <Link href="/login" className="text-purple-400 hover:text-purple-300">
            登录
          </Link>
        </p>
      </div>
    </div>
  )
}
