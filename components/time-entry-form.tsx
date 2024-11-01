'use client'

import { useState, useEffect } from 'react'

type Project = {
  id: number
  name: string
}

type TimeEntry = {
  date: string
  project_id: number
  hours: number
  description: string
}

export function TimeEntryForm() {
  const [projects, setProjects] = useState<Project[]>([])
  const [entry, setEntry] = useState<TimeEntry>({
    date: new Date().toISOString().split('T')[0],
    project_id: 0,
    hours: 0,
    description: ''
  })

  useEffect(() => {
    // プロジェクト一覧を取得
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => setProjects(data))
      .catch(error => console.error('Error fetching projects:', error))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/time-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...entry,
          user_id: 1, // TODO: 実際のユーザーIDを使用
        }),
      })

      if (!response.ok) throw new Error('Failed to save time entry')

      // フォームをリセット
      setEntry({
        date: new Date().toISOString().split('T')[0],
        project_id: 0,
        hours: 0,
        description: ''
      })

      alert('工数が登録されました')
    } catch (error) {
      console.error('Error saving time entry:', error)
      alert('工数の登録に失敗しました')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-2">日付</label>
        <input
          type="date"
          value={entry.date}
          onChange={(e) => setEntry({ ...entry, date: e.target.value })}
          className="border p-2 rounded w-full"
          required
        />
      </div>

      <div>
        <label className="block mb-2">プロジェクト</label>
        <select
          value={entry.project_id}
          onChange={(e) => setEntry({ ...entry, project_id: parseInt(e.target.value) })}
          className="border p-2 rounded w-full"
          required
        >
          <option value="">プロジェクトを選択</option>
          {projects.map(project => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-2">作業時間（時間）</label>
        <input
          type="number"
          min="0"
          step="0.5"
          value={entry.hours}
          onChange={(e) => setEntry({ ...entry, hours: parseFloat(e.target.value) })}
          className="border p-2 rounded w-full"
          required
        />
      </div>

      <div>
        <label className="block mb-2">作業内容</label>
        <textarea
          value={entry.description}
          onChange={(e) => setEntry({ ...entry, description: e.target.value })}
          className="border p-2 rounded w-full"
          rows={4}
          required
        />
      </div>

      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        登録
      </button>
    </form>
  )
} 