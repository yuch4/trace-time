'use client'

import { useEffect, useState } from 'react'

type User = {
  name: string
  email: string
}

export function Header() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    fetch('/api/auth/profile')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setUser(data)
        }
      })
      .catch(error => console.error('Error fetching user profile:', error))
  }, [])

  if (!user) return null

  return (
    <div className="fixed top-0 right-0 p-4 bg-white shadow-sm z-10">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
          <span className="text-gray-600 font-medium">
            {user.name.charAt(0)}
          </span>
        </div>
        <div className="text-sm">
          <div className="font-medium text-gray-900">{user.name}</div>
          <div className="text-gray-500">{user.email}</div>
        </div>
      </div>
    </div>
  )
} 