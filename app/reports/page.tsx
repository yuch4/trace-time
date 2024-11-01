'use client'

import { useState } from 'react'
import { ReportList } from '@/components/reports/report-list'
import { ReportViewer } from '@/components/reports/report-viewer'
import { ReportFilter } from '@/components/reports/report-filter'

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    projectId: '',
    userId: '',
    workTypeId: ''
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">レポート</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* レポート一覧 */}
        <div className="lg:col-span-1">
          <ReportList
            selectedReport={selectedReport}
            onSelectReport={setSelectedReport}
          />
        </div>

        {/* レポート表示エリア */}
        <div className="lg:col-span-3 space-y-4">
          <ReportFilter filters={filters} onFilterChange={setFilters} />
          <ReportViewer reportType={selectedReport} filters={filters} />
        </div>
      </div>
    </div>
  )
} 