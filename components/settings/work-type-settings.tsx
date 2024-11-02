'use client'

//import { useState, useEffect } from 'react'
import { PlusIcon, PencilIcon } from '@heroicons/react/24/outline'
import { useState, useEffect, useCallback } from 'react'
import { CSVImport } from '@/components/csv-import'

type WorkType = {
  id: number
  name: string
  description: string
  is_active: boolean
}

export function WorkTypeSettings() {
  const [workTypes, setWorkTypes] = useState<WorkType[]>([])
  const [editingWorkType, setEditingWorkType] = useState<WorkType | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fetchWorkTypes = useCallback(async () => {
    try {
      const res = await fetch('/api/work-types?include_inactive=true')
      const data = await res.json()
      setWorkTypes(data)
    } catch (error) {
      console.error('Error fetching work types:', error)
      showMessage('error', '作業種別の取得に失敗しました')
    }
  }, [])

  useEffect(() => {
    fetchWorkTypes()
  }, [fetchWorkTypes])


 

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000) // 5秒後にメッセージを消す
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      const res = await fetch('/api/work-types' + (editingWorkType ? `/${editingWorkType.id}` : ''), {
        method: editingWorkType ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          description: formData.get('description'),
          is_active: formData.get('is_active') === 'true'
        })
      })

      if (!res.ok) {
        throw new Error('Failed to save work type')
      }

      await fetchWorkTypes()
      setIsModalOpen(false)
      setEditingWorkType(null)
      showMessage('success', editingWorkType ? '作業種別を更新しました' : '新しい作業種別を作成しました')
    } catch (error) {
      console.error('Error saving work type:', error)
      showMessage('error', '作業種別の保存に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImport = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/work-types/import', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'インポートに失敗しました')
      }

      showMessage('success', data.message)
      await fetchWorkTypes()
    } catch (error) {
      console.error('Error importing work types:', error)
      showMessage('error', error instanceof Error ? error.message : 'インポートに失敗しました')
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch('/api/work-types/export')
      if (!response.ok) throw new Error('エクスポートに失敗しました')

      // レスポンスをBlobとして取得
      const blob = await response.blob()
      
      // ダウンロードリンクを作成
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `work_types_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      
      // クリーンアップ
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting work types:', error)
      showMessage('error', 'エクスポートに失敗しました')
    }
  }

  return (
    <div className="space-y-6">
      {/* メッセージ表示エリア */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">作業種別一覧</h2>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            CSVエクスポート
          </button>
          <button
            onClick={() => {
              setEditingWorkType(null)
              setIsModalOpen(true)
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            新規作業種別
          </button>
        </div>
      </div>

      {/* CSVインポート機能を追加 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">CSVインポート</h3>
        <CSVImport onImport={handleImport} />
        <div className="mt-4 text-sm text-gray-500">
          <p>CSVファイルの形式:</p>
          <pre className="bg-gray-50 p-2 rounded mt-1">
            name,description,is_active
          </pre>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                作業種別名
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                説明
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ステータス
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {workTypes.map((workType) => (
              <tr key={workType.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{workType.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">{workType.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      workType.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {workType.is_active ? '有効' : '無効'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setEditingWorkType(workType)
                      setIsModalOpen(true)
                    }}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">
              {editingWorkType ? '作業種別の編集' : '新規作業種別'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  作業種別名
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingWorkType?.name}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  説明
                </label>
                <textarea
                  name="description"
                  defaultValue={editingWorkType?.description}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ステータス
                </label>
                <select
                  name="is_active"
                  defaultValue={editingWorkType?.is_active?.toString() ?? 'true'}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  disabled={isSubmitting}
                >
                  <option value="true">有効</option>
                  <option value="false">無効</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  disabled={isSubmitting}
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 