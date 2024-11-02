'use client'

import { useState } from 'react'
import { TimeEntryForm } from '@/components/time-entry-form'
import { TimeEntryList } from '@/components/time-entry-list'

export default function TimeEntryPage() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [updateTrigger, setUpdateTrigger] = useState(0)

  const handleSubmitSuccess = () => {
    // updateTriggerを更新してTimeEntryListの再取得をトリガー
    setUpdateTrigger(prev => prev + 1)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">工数入力</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 工数入力フォーム */}
        <TimeEntryForm 
          selectedDate={selectedDate} 
          onDateChange={setSelectedDate}
          onSubmitSuccess={handleSubmitSuccess}
        />
        
        {/* 選択された日付の工数一覧 */}
        <TimeEntryList 
          date={selectedDate}
          updateTrigger={updateTrigger}
        />
      </div>
    </div>
  )
} 