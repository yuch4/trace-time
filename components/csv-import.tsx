'use client'

import { useState, useRef } from 'react'
import { CloudArrowUpIcon } from '@heroicons/react/24/outline'

type CSVImportProps = {
  onImport: (file: File) => Promise<void>
  accept?: string
}

export function CSVImport({ onImport, accept = '.csv' }: CSVImportProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith('.csv')) {
      await onImport(file)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await onImport(file)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
      <div className="mt-2">
        <label className="cursor-pointer text-blue-600 hover:text-blue-800">
          CSVファイルを選択
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={accept}
            onChange={handleFileSelect}
          />
        </label>
        <p className="text-sm text-gray-500 mt-1">
          またはファイルをここにドラッグ＆ドロップ
        </p>
      </div>
    </div>
  )
} 