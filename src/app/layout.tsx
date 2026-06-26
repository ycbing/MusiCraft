import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Noto_Sans_SC } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { NavBar } from '@/components/NavBar'
import { DecorativeBackground } from '@/components/DecorativeBackground'
import { ScrollProgress } from '@/components/ScrollProgress'
import { GlobalShortcuts } from '@/components/GlobalShortcuts'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
})

const notoSc = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '900'],
  variable: '--font-noto-sc',
  display: 'swap',
  preload: false,
})

export const metadata: Metadata = {
  title: 'MusiCraft - AI 音乐创作平台',
  description: 'Create original songs with AI. 输入主题,30 秒生成原创歌曲,AI 写词、编曲、演唱一气呵成。',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className={`${geist.variable} ${geistMono.variable} ${notoSc.variable}`}
    >
      <body className="font-body">
        <Providers>
          <DecorativeBackground />
          <NavBar />
          <ScrollProgress />
          <GlobalShortcuts />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  )
}
