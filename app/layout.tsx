import './globals.css'
import { Sidebar } from '@/components/sidebar'

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
          <main className="flex-1 ml-64 p-8 bg-gray-100 min-h-screen">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
