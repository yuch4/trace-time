'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { UserCircleIcon } from '@heroicons/react/24/outline'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
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
    <header className="fixed top-0 right-0 left-64 h-16 bg-white border-b border-gray-200 z-10">
      <div className="h-full px-4 flex justify-between items-center">
        <div className="text-lg font-semibold text-gray-800">
          {/* ページタイトルなどを表示 */}
        </div>
        
        <div className="relative">
          <button
            ref={buttonRef}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
          >
            <UserCircleIcon className="h-8 w-8" />
          </button>

          {isMenuOpen && (
            <div
              ref={menuRef}
              className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5"
            >
              <button
                onClick={() => {
                  router.push('/settings')
                  setIsMenuOpen(false)
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                設定
              </button>
              <button
                onClick={() => {
                  handleLogout()
                  setIsMenuOpen(false)
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                ログアウト
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
} 