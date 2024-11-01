'use client'

import { useEffect, useState } from 'react'

type TimeEntry = {
  id: number
  date: string
  project_name: string
  hours: number
  description: string
  user_name: string
}

export function RecentEntries() {
  const [entries, setEntries] = useState<TimeEntry[]>([])

  useEffect(() => {
    fetch('/api/time-entries')
      .then(res => res.json())
      .then(data => setEntries(data))
      .catch(error => console.error('Error fetching time entries:', error))
  }, [])

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">最近の工数入力</h2>
      </div>
      <div className="p-4">
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="pb-2">日付</th>
              <th className="pb-2">担当者</th>
              <th className="pb-2">プロジェクト</th>
              <th className="pb-2">時間</th>
              <th className="pb-2">作業内容</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-t">
                <td className="py-2">{entry.date}</td>
                <td>{entry.user_name}</td>
                <td>{entry.project_name}</td>
                <td>{entry.hours}h</td>
                <td>{entry.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 