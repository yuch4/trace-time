'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Sidebar() {
  const pathname = usePathname()

  const menuItems = [
    { href: '/', label: 'ダッシュボード', icon: '📊' },
    { href: '/time-entry', label: '工数入力', icon: '⏱' },
    { href: '/reports', label: 'レポート', icon: '📈' },
    { href: '/settings', label: '設定', icon: '⚙️' },
  ]

  return (
    <div className="w-64 bg-gray-800 text-white h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-4">
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
    </div>
  )
} 