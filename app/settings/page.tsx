'use client'

import { useState } from 'react'
import { ProjectSettings } from '@/components/settings/project-settings'
import { WorkTypeSettings } from '@/components/settings/work-type-settings'
import { UserSettings } from '@/components/settings/user-settings'
import { DisplaySettings } from '@/components/settings/display-settings'

type SettingTab = 'projects' | 'workTypes' | 'user' | 'display'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingTab>('projects')

  const tabs = [
    { id: 'projects', label: 'プロジェクト', icon: '📁' },
    { id: 'workTypes', label: '作業種別', icon: '🏷️' },
    { id: 'user', label: 'ユーザー設定', icon: '👤' },
    { id: 'display', label: '表示設定', icon: '🎨' },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'projects':
        return <ProjectSettings />
      case 'workTypes':
        return <WorkTypeSettings />
      case 'user':
        return <UserSettings />
      case 'display':
        return <DisplaySettings />
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">設定</h1>
      
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingTab)}
                className={`px-6 py-4 text-sm font-medium border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  )
} 