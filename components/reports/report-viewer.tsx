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
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts'

type ReportViewerProps = {
  reportType: string | null
  filters: {
    startDate: string
    endDate: string
    projectId: string
    userId: string
    workTypeId: string
  }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function ReportViewer({ reportType, filters }: ReportViewerProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!reportType) return

    setLoading(true)
    setError(null)

    fetch(`/api/reports/${reportType}?` + new URLSearchParams(filters as any))
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching report data:', err)
        setError('レポートデータの取得に失敗しました')
        setLoading(false)
      })
  }, [reportType, filters])

  const handleExport = async () => {
    try {
      // URLSearchParamsを使用してクエリパラメータを構築
      const queryParams = new URLSearchParams(filters as any)
      
      // CSVファイルをダウンロード
      const response = await fetch(`/api/reports/export?${queryParams}`)
      if (!response.ok) throw new Error('Export failed')

      // Blobとしてレスポンスを取得
      const blob = await response.blob()
      
      // ダウンロードリンクを作成
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `timesheet_${filters.startDate}_${filters.endDate}.csv`
      document.body.appendChild(a)
      a.click()
      
      // クリーンアップ
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('エクスポートに失敗しました')
    }
  }

  if (!reportType) {
    return (
      <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
        レポートを選択してください
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <div className="mt-2 text-gray-600">データを読み込んでいます...</div>
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

  if (!data) return null

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric'
    })
  }

  const formatHours = (value: number) => {
    return `${value.toFixed(1)}h`
  }

  const renderReport = () => {
    switch (reportType) {
      case 'personal-monthly':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h4 className="text-sm text-gray-500">合計時間</h4>
                <p className="text-2xl font-bold">
                  {formatHours(data.daily?.reduce((sum: number, d: any) => sum + d.hours, 0) || 0)}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h4 className="text-sm text-gray-500">プロジェクト数</h4>
                <p className="text-2xl font-bold">
                  {new Set(data.daily?.flatMap((d: any) => d.projects?.split(', ') || []) || []).size}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h4 className="text-sm text-gray-500">作業種別数</h4>
                <p className="text-2xl font-bold">{data.workTypes?.length || 0}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">日別工数推移</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.daily}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={formatDate} />
                    <YAxis />
                    <Tooltip
                      labelFormatter={formatDate}
                      formatter={(value: number) => [formatHours(value), '工数']}
                    />
                    <Area type="monotone" dataKey="hours" name="工数" fill="#8884d8" stroke="#8884d8" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">作業種別内訳</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.workTypes || []}
                      dataKey="total_hours"
                      nameKey="work_type"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                    >
                      {data.workTypes?.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [formatHours(value)]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )

      case 'project-summary':
        return (
          <div className="space-y-6">
            {data.summary && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.summary.map((project: any) => (
                  <div key={project.project_name} className="bg-white p-4 rounded-lg shadow">
                    <h4 className="text-lg font-semibold">{project.project_name}</h4>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-600">
                        合計時間: <span className="font-bold">{formatHours(project.total_hours)}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        メンバー数: <span className="font-bold">{project.member_count}名</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        作業種別: <span className="text-gray-800">{project.work_types}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">プロジェクト進捗</h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.progress || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={formatDate} />
                    <YAxis />
                    <Tooltip
                      labelFormatter={formatDate}
                      formatter={(value: number) => [formatHours(value)]}
                    />
                    <Legend />
                    {data.progress?.map((p: any) => p.project_name)
                      .filter((name: string, index: number, self: string[]) => self.indexOf(name) === index)
                      .map((project: string, index: number) => (
                        <Line
                          key={project}
                          type="monotone"
                          dataKey="hours"
                          data={data.progress?.filter((p: any) => p.project_name === project)}
                          name={project}
                          stroke={COLORS[index % COLORS.length]}
                        />
                      ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )

      case 'team-analysis':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">メンバー別工数</h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.members}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="member_name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [formatHours(value)]} />
                    <Legend />
                    <Bar
                      dataKey="total_hours"
                      name="工数"
                      fill="#8884d8"
                      label={{ position: 'top', formatter: formatHours }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">日別アクティブメンバー数</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.daily}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={formatDate} />
                      <YAxis />
                      <Tooltip
                        labelFormatter={formatDate}
                        formatter={(value: number) => [`${value}名`, 'アクティブメンバー']}
                      />
                      <Line
                        type="monotone"
                        dataKey="active_members"
                        name="アクティブメンバー"
                        stroke="#8884d8"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">日別合計工数</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.daily}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={formatDate} />
                      <YAxis />
                      <Tooltip
                        labelFormatter={formatDate}
                        formatter={(value: number) => [formatHours(value), '合計工数']}
                      />
                      <Area
                        type="monotone"
                        dataKey="total_hours"
                        name="合計工数"
                        fill="#8884d8"
                        stroke="#8884d8"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )

      case 'work-type-distribution':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.summary?.map((workType: any) => (
                <div key={workType.work_type} className="bg-white p-4 rounded-lg shadow">
                  <h4 className="text-lg font-semibold">{workType.work_type}</h4>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600">
                      合計時間: <span className="font-bold">{formatHours(workType.total_hours)}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      担当者数: <span className="font-bold">{workType.user_count}名</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      プロジェクト: <span className="text-gray-800">{workType.projects}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">作業種別別の時間推移</h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.daily || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={formatDate} />
                    <YAxis />
                    <Tooltip
                      labelFormatter={formatDate}
                      formatter={(value: number) => [formatHours(value)]}
                    />
                    <Legend />
                    {data.daily?.map((d: any) => d.work_type)
                      .filter((type: string, index: number, self: string[]) => self.indexOf(type) === index)
                      .map((type: string, index: number) => (
                        <Area
                          key={type}
                          type="monotone"
                          dataKey="hours"
                          data={data.daily?.filter((d: any) => d.work_type === type)}
                          name={type}
                          fill={COLORS[index % COLORS.length]}
                          stroke={COLORS[index % COLORS.length]}
                          stackId="1"
                        />
                      ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="text-gray-500">
            このレポートタイプは現在実装されていません
          </div>
        )
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          {getReportTitle(reportType)}
        </h2>
        <button
          onClick={handleExport}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          CSVエクスポート
        </button>
      </div>
      {renderReport()}
    </div>
  )
}

// レポートタイプに応じたタイトルを返す関数
function getReportTitle(reportType: string | null): string {
  switch (reportType) {
    case 'personal-monthly':
      return '個人月次レポート'
    case 'project-summary':
      return 'プロジェクト概要'
    case 'team-analysis':
      return 'チーム分析'
    case 'work-type-distribution':
      return '作業種別分析'
    default:
      return 'レポート'
  }
} 