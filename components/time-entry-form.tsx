'use client'

import { useState, useEffect } from 'react'
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline'

type Project = {
  id: number
  name: string
}

type WorkType = {
  id: number
  name: string
}

type TimeEntryDetail = {
  id: string
  project_id: number
  work_type_id: number
  hours: number
  description: string
}

type TimeEntryForm = {
  date: string
  details: TimeEntryDetail[]
}

export function TimeEntryForm() {
  const [projects, setProjects] = useState<Project[]>([])
  const [workTypes, setWorkTypes] = useState<WorkType[]>([])
  const [form, setForm] = useState<TimeEntryForm>({
    date: new Date().toISOString().split('T')[0],
    details: [
      {
        id: crypto.randomUUID(),
        project_id: 0,
        work_type_id: 0,
        hours: 0,
        description: ''
      }
    ]
  })

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => setProjects(data))
      .catch(error => console.error('Error fetching projects:', error))

    fetch('/api/work-types')
      .then(res => res.json())
      .then(data => setWorkTypes(data))
      .catch(error => console.error('Error fetching work types:', error))
  }, [])

  const addDetail = () => {
    setForm(prev => ({
      ...prev,
      details: [
        ...prev.details,
        {
          id: crypto.randomUUID(),
          project_id: 0,
          work_type_id: 0,
          hours: 0,
          description: ''
        }
      ]
    }))
  }

  const removeDetail = (id: string) => {
    setForm(prev => ({
      ...prev,
      details: prev.details.filter(detail => detail.id !== id)
    }))
  }

  const updateDetail = (id: string, field: keyof TimeEntryDetail, value: any) => {
    setForm(prev => ({
      ...prev,
      details: prev.details.map(detail =>
        detail.id === id ? { ...detail, [field]: value } : detail
      )
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const promises = form.details.map(detail =>
        fetch('/api/time-entries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            date: form.date,
            project_id: detail.project_id,
            work_type_id: detail.work_type_id,
            hours: detail.hours,
            description: detail.description,
            user_id: 1, // TODO: 実際のユーザーIDを使用
          }),
        })
      )

      await Promise.all(promises)

      setForm({
        date: new Date().toISOString().split('T')[0],
        details: [
          {
            id: crypto.randomUUID(),
            project_id: 0,
            work_type_id: 0,
            hours: 0,
            description: ''
          }
        ]
      })

      alert('工数が登録されました')
    } catch (error) {
      console.error('Error saving time entries:', error)
      alert('工数の登録に失敗しました')
    }
  }

  const totalHours = form.details.reduce((sum, detail) => sum + detail.hours, 0)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="mb-4">
          <label className="block mb-2">日付</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="border p-2 rounded w-full max-w-xs"
            required
          />
        </div>

        <div className="space-y-4">
          {form.details.map((detail) => (
            <div key={detail.id} className="border p-4 rounded relative">
              <div className="absolute top-2 right-2">
                {form.details.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDetail(detail.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-2">プロジェクト</label>
                  <select
                    value={detail.project_id}
                    onChange={(e) => updateDetail(detail.id, 'project_id', parseInt(e.target.value))}
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
                  <label className="block mb-2">作業種別</label>
                  <select
                    value={detail.work_type_id}
                    onChange={(e) => updateDetail(detail.id, 'work_type_id', parseInt(e.target.value))}
                    className="border p-2 rounded w-full"
                    required
                  >
                    <option value="">作業種別を選択</option>
                    {workTypes.map(workType => (
                      <option key={workType.id} value={workType.id}>
                        {workType.name}
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
                    value={detail.hours}
                    onChange={(e) => updateDetail(detail.id, 'hours', parseFloat(e.target.value))}
                    className="border p-2 rounded w-full"
                    required
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block mb-2">作業内容</label>
                  <textarea
                    value={detail.description}
                    onChange={(e) => updateDetail(detail.id, 'description', e.target.value)}
                    className="border p-2 rounded w-full"
                    rows={2}
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-between items-center">
          <button
            type="button"
            onClick={addDetail}
            className="flex items-center text-blue-500 hover:text-blue-700"
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            明細を追加
          </button>
          <div className="text-right">
            <div className="text-sm text-gray-600">合計時間</div>
            <div className="text-xl font-bold">{totalHours.toFixed(1)}時間</div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          登録
        </button>
      </div>
    </form>
  )
} 