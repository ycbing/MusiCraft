'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'sonner'

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
    </SessionProvider>
  )
}
