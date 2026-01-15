import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import GoogleAnalytics from '@/components/GoogleAnalytics'

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
      <head>
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=G-5HPGNXBYCE`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-5HPGNXBYCE');
          `}
        </Script>
      </head>
      <body>
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  )
}
