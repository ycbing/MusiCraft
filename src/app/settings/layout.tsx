import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '设置 - MusiCraft',
  description: '管理你的 MusiCraft 账户设置',
}

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
