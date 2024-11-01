'use client'

import { useState, useEffect } from 'react'

type DisplaySettings = {
  theme: 'light' | 'dark' | 'system'
  dateFormat: string
  itemsPerPage: number
  defaultView: 'daily' | 'weekly' | 'monthly'
}

export function DisplaySettings() {
  const [settings, setSettings] = useState<DisplaySettings>({
    theme: 'system',
    dateFormat: 'YYYY-MM-DD',
    itemsPerPage: 10,
    defaultView: 'daily'
  })
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 表示設定を取得
    fetch('/api/settings/display')
      .then(res => res.json())
      .then(data => {
        setSettings(data)
        setIsLoading(false)
      })
      .catch(error => {
        console.error('Error fetching display settings:', error)
        setIsLoading(false)
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage('')

    try {
      const res = await fetch('/api/settings/display', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (!res.ok) throw new Error('Failed to save settings')

      setMessage('設定を保存しました')
    } catch (error) {
      setMessage('設定の保存に失敗しました')
    }
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded ${message.includes('失敗') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* テーマ設定 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">テーマ設定</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                カラーテーマ
              </label>
              <select
                value={settings.theme}
                onChange={(e) => setSettings({ ...settings, theme: e.target.value as 'light' | 'dark' | 'system' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="light">ライト</option>
                <option value="dark">ダーク</option>
                <option value="system">システム設定に従う</option>
              </select>
            </div>
          </div>
        </div>

        {/* 表示形式設定 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">表示形式設定</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                日付形式
              </label>
              <select
                value={settings.dateFormat}
                onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                <option value="YYYY/MM/DD">YYYY/MM/DD</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                1ページあたりの表示件数
              </label>
              <select
                value={settings.itemsPerPage}
                onChange={(e) => setSettings({ ...settings, itemsPerPage: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="10">10件</option>
                <option value="20">20件</option>
                <option value="50">50件</option>
                <option value="100">100件</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                デフォルトの表示形式
              </label>
              <select
                value={settings.defaultView}
                onChange={(e) => setSettings({ ...settings, defaultView: e.target.value as 'daily' | 'weekly' | 'monthly' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="daily">日別</option>
                <option value="weekly">週別</option>
                <option value="monthly">月別</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            設定を保存
          </button>
        </div>
      </form>
    </div>
  )
} 