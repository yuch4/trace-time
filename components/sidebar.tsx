'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const menuItems = [
    { href: '/', label: 'ダッシュボード', icon: '📊' },
    { href: '/time-entry', label: '工数入力', icon: '⏱' },
    { href: '/reports', label: 'レポート', icon: '📈' },
    { href: '/settings', label: '設定', icon: '⚙️' },
  ]

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        // ログインページにリダイレクト
        router.push('/login')
      } else {
        throw new Error('ログアウトに失敗しました')
      }
    } catch (error) {
      console.error('Logout error:', error)
      alert('ログアウトに失敗しました')
    }
  }

  return (
    <div className="w-64 bg-gray-800 text-white h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-4 flex-1">
        <h1 className="text-xl font-bold mb-8">工数管理システム</h1>
        <nav>
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center p-2 rounded-lg hover:bg-gray-700 ${
                    pathname === item.href ? 'bg-gray-700' : ''
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* ログアウトボタン */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center w-full p-2 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-3" />
          ログアウト
        </button>
      </div>
    </div>
  )
} 