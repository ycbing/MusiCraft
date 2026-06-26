import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center pt-24 pb-20 px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-500/20 to-gray-600/20 flex items-center justify-center ring-1 ring-white/10 shadow-2xl shadow-purple-500/10">
          <FileQuestion className="w-10 h-10 text-gray-400" />
        </div>
        <h1 className="font-display text-5xl text-white mb-3">404</h1>
        <h2 className="font-title text-xl text-white mb-2">页面未找到</h2>
        <p className="text-[color:var(--text-tertiary)] text-sm mb-8">
          你访问的页面不存在或已被移除。
        </p>
        <Link href="/">
          <Button variant="outline" className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 active:scale-[0.97]">
            返回首页
          </Button>
        </Link>
      </div>
    </div>
  )
}
