import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-pretendard",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "WERASER - AI 에이전트의 미래를 설계하다",
  description: "최첨단 AI 기술과 도메인 전문성이 만나 복잡한 전문 업무의 자동화 서비스를 제공합니다.",
  generator: 'v0.app'
}

export const viewport = {
  width: 'device-width',
  initialScale: 1
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={`${inter.variable} antialiased`}>
      <head>
        <link rel="preload" href="/visual.mp4" as="video" type="video/mp4" />
      </head>
      <body className="font-pretendard">{children}</body>
    </html>
  )
}
