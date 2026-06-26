'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'

/**
 * GlobalShortcuts — global keyboard shortcuts.
 * - Cmd/Ctrl + N on dashboard pages → /create
 * - Cmd/Ctrl + Enter on /create → triggers a custom event "musicraft:create" that
 *   the Create page can listen to.
 */
export function GlobalShortcuts() {
  const router = useRouter()
  const pathname = usePathname()
  const { status } = useSession()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey

      // Cmd/Ctrl + N → /create (only on dashboard or root)
      if (isMod && e.key.toLowerCase() === 'n' && !e.shiftKey && !e.altKey) {
        if (pathname?.startsWith('/dashboard') || pathname === '/') {
          if (status === 'authenticated') {
            e.preventDefault()
            router.push('/create')
          }
        }
      }

      // Cmd/Ctrl + Enter → fire create event on /create
      if (isMod && e.key === 'Enter') {
        if (pathname?.startsWith('/create')) {
          e.preventDefault()
          window.dispatchEvent(new CustomEvent('musicraft:create'))
        }
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [router, pathname, status])

  return null
}