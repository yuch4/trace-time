'use client'

type ReportListProps = {
  selectedReport: string | null
  onSelectReport: (reportType: string) => void
}

export function ReportList({ selectedReport, onSelectReport }: ReportListProps) {
  const reports = [
    {
      id: 'personal-monthly',
      name: '個人月次レポート',
      description: '個人の月間工数集計と分析'
    },
    {
      id: 'project-summary',
      name: 'プロジェクト概要',
      description: 'プロジェクト別の工数集計と進捗'
    },
    {
      id: 'team-analysis',
      name: 'チーム分析',
      description: 'チーム全体の工数分布と傾向'
    },
    {
      id: 'work-type-distribution',
      name: '作業種別分析',
      description: '作業種別ごとの時間配分'
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="font-semibold">レポート一覧</h2>
      </div>
      <div className="p-2">
        {reports.map(report => (
          <button
            key={report.id}
            onClick={() => onSelectReport(report.id)}
            className={`w-full text-left p-3 rounded hover:bg-gray-50 transition-colors ${
              selectedReport === report.id ? 'bg-blue-50 text-blue-700' : ''
            }`}
          >
            <div className="font-medium">{report.name}</div>
            <div className="text-sm text-gray-500">{report.description}</div>
          </button>
        ))}
      </div>
    </div>
  )
} 