'use client'

import { useEffect } from 'react'
import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'sonner'

/**
 * ToastRumble — listens for sonner toast mount events and applies a brief
 * CSS class to the body, producing a very subtle screen "rumble".
 * Optically adds tactility without being annoying.
 */
function ToastRumble() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    // Sonner exposes no public event; we hook into its container.
    let observer: MutationObserver | null = null
    const tryHook = () => {
      const container = document.querySelector('[data-sonner-toaster]')
      if (!container) return
      observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
          for (const node of Array.from(m.addedNodes)) {
            if (
              node instanceof HTMLElement &&
              node.classList &&
              (node.classList.contains('sonner-toast') ||
                node.querySelector?.('.sonner-toast'))
            ) {
              const target =
                node.classList.contains('sonner-toast') ? node : node.querySelector('.sonner-toast')!
              target.classList.add('toast-rumble')
              setTimeout(() => target.classList.remove('toast-rumble'), 500)
            }
          }
        }
      })
      observer.observe(container, { childList: true, subtree: true })
    }
    // wait for toaster mount
    const id = setTimeout(tryHook, 200)
    return () => {
      clearTimeout(id)
      observer?.disconnect()
    }
  }, [])
  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="top-center"
        theme="dark"
        toastOptions={{
          style: {
            background: 'hsl(0 0% 7%)',
            border: '1px solid hsl(240 4% 16%)',
            color: 'hsl(0 0% 98%)',
          },
        }}
      />
      <ToastRumble />
    </SessionProvider>
  )
}
