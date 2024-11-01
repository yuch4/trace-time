'use client'

import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts'

type DailyStats = {
  date: string
  total_hours: number
}

type ProjectStats = {
  project_name: string
  total_hours: number
}

type WorkTypeStats = {
  work_type_name: string
  total_hours: number
}

type DashboardData = {
  daily: DailyStats[]
  projects: ProjectStats[]
  workTypes: WorkTypeStats[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function DashboardStats() {
  const [data, setData] = useState<DashboardData>({ 
    daily: [], 
    projects: [],
    workTypes: []
  })

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(data => setData(data))
      .catch(error => console.error('Error fetching dashboard stats:', error))
  }, [])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  const formatHours = (value: number | string) => {
    const hours = Number(value)
    return isNaN(hours) ? '0.0時間' : `${hours.toFixed(1)}時間`
  }

  return (
    <div className="space-y-8">
      {/* 概要カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">今月の合計時間</h3>
          <p className="text-2xl font-bold">
            {formatHours(data.projects.reduce((sum, p) => sum + p.total_hours, 0))}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">今週の合計時間</h3>
          <p className="text-2xl font-bold">
            {formatHours(data.daily.reduce((sum, d) => sum + d.total_hours, 0))}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">プロジェクト数</h3>
          <p className="text-2xl font-bold">{data.projects.length}</p>
        </div>
      </div>

      {/* グラフ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 日別推移グラフ */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">日別工数推移</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.daily}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatDate} />
                <YAxis />
                <Tooltip 
                  labelFormatter={formatDate}
                  formatter={(value) => [formatHours(value)]}
                />
                <Legend />
                <Bar dataKey="total_hours" name="工数" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* プロジェクト別円グラフ */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">プロジェクト別工数比率</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.projects}
                  dataKey="total_hours"
                  nameKey="project_name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => 
                    `${name} ${(percent * 100).toFixed(1)}%`
                  }
                >
                  {data.projects.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [formatHours(value)]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 作業種別別円グラフ */}
        <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
          <h3 className="text-lg font-semibold mb-4">作業種別工数分布</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.workTypes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="work_type_name" />
                <YAxis />
                <Tooltip formatter={(value) => [formatHours(value)]} />
                <Legend />
                <Bar 
                  dataKey="total_hours" 
                  name="工数" 
                  fill="#8884d8"
                  label={{ 
                    position: 'top',
                    formatter: (value: number) => `${value.toFixed(1)}h`
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
} 