'use client'

import { useEffect, useState } from 'react'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

type WorkTypeDetail = {
  work_type_name: string | null
  hours: number
  descriptions: string
}

type TimeEntrySummary = {
  project_name: string
  work_type_details: WorkTypeDetail[]
  total_hours: number
}

type TimeEntryListProps = {
  date: string
  updateTrigger?: number
}

export function TimeEntryList({ date, updateTrigger = 0 }: TimeEntryListProps) {
  const [entries, setEntries] = useState<TimeEntrySummary[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalHours, setTotalHours] = useState(0)
  const [editingEntry, setEditingEntry] = useState<{
    project: string
    workType: string | null
    hours: number
    description: string
  } | null>(null)

  const fetchEntries = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/time-entries?date=${date}`)
      if (!response.ok) throw new Error('データの取得に失敗しました')
      
      const data = await response.json()
      setEntries(data)
      
      const total = data.reduce((sum: number, entry: TimeEntrySummary) => 
        sum + Number(entry.total_hours), 0
      )
      setTotalHours(total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEntries()
  }, [date, updateTrigger])

  const handleEdit = (project: string, workType: string | null, hours: number, description: string) => {
    setEditingEntry({
      project,
      workType,
      hours,
      description
    })
  }

  const handleDelete = async (project: string, workType: string | null) => {
    if (!confirm('この工数記録を削除してもよろしいですか？')) return

    try {
      const response = await fetch('/api/time-entries', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date,
          project_name: project,
          work_type_name: workType
        })
      })

      if (!response.ok) throw new Error('削除に失敗しました')

      await fetchEntries()
    } catch (err) {
      alert('削除に失敗しました')
      console.error('Error deleting time entry:', err)
    }
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingEntry) return

    try {
      const response = await fetch('/api/time-entries', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date,
          project_name: editingEntry.project,
          work_type_name: editingEntry.workType,
          hours: editingEntry.hours,
          description: editingEntry.description
        })
      })

      if (!response.ok) throw new Error('更新に失敗しました')

      setEditingEntry(null)
      await fetchEntries()
    } catch (err) {
      alert('更新に失敗しました')
      console.error('Error updating time entry:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">工数記録</h2>
        <div className="text-right">
          <div className="text-sm text-gray-500">合計時間</div>
          <div className="text-xl font-bold">{totalHours.toFixed(1)}時間</div>
        </div>
      </div>
      
      {entries.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          選択された日付の工数記録はありません
        </p>
      ) : (
        <div className="space-y-6">
          {entries.map((entry) => (
            <div 
              key={entry.project_name}
              className="border-b pb-4 last:border-b-0 last:pb-0"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-lg">{entry.project_name}</h3>
                <span className="text-lg font-medium">
                  {Number(entry.total_hours).toFixed(1)}時間
                </span>
              </div>

              <div className="space-y-3 mt-2">
                {entry.work_type_details.map((detail, index) => (
                  <div key={index} className="ml-4">
                    {editingEntry && 
                     editingEntry.project === entry.project_name && 
                     editingEntry.workType === detail.work_type_name ? (
                      <form onSubmit={handleUpdate} className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            作業時間（時間）
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={editingEntry.hours}
                            onChange={(e) => setEditingEntry({
                              ...editingEntry,
                              hours: parseFloat(e.target.value)
                            })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            作業内容
                          </label>
                          <textarea
                            value={editingEntry.description}
                            onChange={(e) => setEditingEntry({
                              ...editingEntry,
                              description: e.target.value
                            })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            rows={2}
                            required
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => setEditingEntry(null)}
                            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                          >
                            キャンセル
                          </button>
                          <button
                            type="submit"
                            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            更新
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                            {detail.work_type_name || '未分類'}
                          </span>
                          <span className="ml-2 text-sm text-gray-600">
                            {Number(detail.hours).toFixed(1)}時間
                          </span>
                          <div className="text-sm text-gray-600 mt-1 ml-2">
                            {detail.descriptions.split(' / ').map((desc, i) => (
                              <div key={i}>• {desc}</div>
                            ))}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(
                              entry.project_name,
                              detail.work_type_name,
                              detail.hours,
                              detail.descriptions
                            )}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(
                              entry.project_name,
                              detail.work_type_name
                            )}
                            className="text-red-600 hover:text-red-800"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 