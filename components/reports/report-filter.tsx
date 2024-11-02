'use client'

import { useState, useEffect } from 'react'

interface Filters {
  startDate: string
  endDate: string
  projectId: string
  userId: string
  workTypeId: string
}

interface Project {
  id: string
  name: string
}

interface User {
  id: string
  name: string
}

interface WorkType {
  id: string
  name: string
}

type FilterProps = {
  filters: Filters
  onFilterChange: (filters: Filters) => void
}

export function ReportFilter({ filters, onFilterChange }: FilterProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [workTypes, setWorkTypes] = useState<WorkType[]>([])

  useEffect(() => {
    Promise.all([
      fetch('/api/projects').then((res: Response) => res.json()),
      fetch('/api/users').then((res: Response) => res.json()),
      fetch('/api/work-types').then((res: Response) => res.json())
    ]).then(([projectsData, usersData, workTypesData]) => {
      setProjects(projectsData as Project[])
      setUsers(usersData as User[])
      setWorkTypes(workTypesData as WorkType[])
    })
  }, [])

  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">期間（開始）</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">期間（終了）</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">プロジェクト</label>
          <select
            value={filters.projectId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onFilterChange({ ...filters, projectId: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">全て</option>
            {projects.map((project: Project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">メンバー</label>
          <select
            value={filters.userId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onFilterChange({ ...filters, userId: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">全て</option>
            {users.map((user: User) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">作業種別</label>
          <select
            value={filters.workTypeId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onFilterChange({ ...filters, workTypeId: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">全て</option>
            {workTypes.map((type: WorkType) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}