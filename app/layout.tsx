import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '无感记账 - Tazten',
  description: 'AI 智能识别账单，自动记录每一笔消费',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
