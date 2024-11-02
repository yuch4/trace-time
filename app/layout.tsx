import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'

export const metadata: Metadata = {
  title: '工数管理システム',
  description: '工数管理システム',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <div className="flex">
          <Sidebar />
          <div className="flex-1 ml-64">
            <Header />
            <main className="p-8 bg-gray-100 min-h-screen mt-16">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
