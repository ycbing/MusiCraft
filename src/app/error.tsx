'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center pt-24 pb-20 px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/20 flex items-center justify-center ring-1 ring-red-500/20 shadow-2xl shadow-red-500/10">
          <AlertTriangle className="w-10 h-10 text-red-400" />
        </div>
        <h1 className="font-title text-2xl text-white mb-2">页面出错了</h1>
        <p className="text-[color:var(--text-tertiary)] text-sm mb-8">
          遇到意外错误，请稍后重试。如果问题持续，请联系支持。
        </p>
        <Button
          variant="outline"
          onClick={reset}
          className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 active:scale-[0.97] gap-2"
        >
          <RefreshCw className="w-4 h-4" /> 重试
        </Button>
      </div>
    </div>
  )
}
