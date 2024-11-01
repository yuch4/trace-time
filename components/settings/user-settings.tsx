'use client'

import { useState, useEffect } from 'react'

type UserProfile = {
  id: number
  name: string
  email: string
}

export function UserSettings() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    // ユーザープロフィールを取得
    fetch('/api/auth/profile')
      .then(res => res.json())
      .then(data => setProfile(data))
      .catch(error => console.error('Error fetching profile:', error))
  }, [])

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email')
        })
      })

      if (!res.ok) throw new Error('Failed to update profile')

      const updatedProfile = await res.json()
      setProfile(updatedProfile)
      setIsEditing(false)
      setMessage('プロフィールを更新しました')
    } catch (error) {
      setMessage('プロフィールの更新に失敗しました')
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    if (formData.get('newPassword') !== formData.get('confirmPassword')) {
      setMessage('新しいパスワードが一致しません')
      return
    }

    try {
      const res = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: formData.get('currentPassword'),
          newPassword: formData.get('newPassword')
        })
      })

      if (!res.ok) throw new Error('Failed to update password')

      setIsChangingPassword(false)
      setMessage('パスワードを更新しました')
      form.reset()
    } catch (error) {
      setMessage('パスワードの更新に失敗しました')
    }
  }

  if (!profile) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded ${message.includes('失敗') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      {/* プロフィール設定 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">プロフィール設定</h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-blue-600 hover:text-blue-800"
          >
            {isEditing ? 'キャンセル' : '編集'}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">名前</label>
              <input
                type="text"
                name="name"
                defaultValue={profile.name}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
              <input
                type="email"
                name="email"
                defaultValue={profile.email}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                保存
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">名前</label>
              <div className="mt-1 text-gray-900">{profile.name}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
              <div className="mt-1 text-gray-900">{profile.email}</div>
            </div>
          </div>
        )}
      </div>

      {/* パスワード変更 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">パスワード変更</h3>
          <button
            onClick={() => setIsChangingPassword(!isChangingPassword)}
            className="text-blue-600 hover:text-blue-800"
          >
            {isChangingPassword ? 'キャンセル' : 'パスワードを変更'}
          </button>
        </div>

        {isChangingPassword && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">現在のパスワード</label>
              <input
                type="password"
                name="currentPassword"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">新しいパスワード</label>
              <input
                type="password"
                name="newPassword"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                minLength={8}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">新しいパスワード（確認）</label>
              <input
                type="password"
                name="confirmPassword"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                minLength={8}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                パスワードを更新
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
} 