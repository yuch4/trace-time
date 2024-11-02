import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT project_code, name, description, is_active 
       FROM projects 
       ORDER BY project_code`
    )

    const csvHeader = 'project_code,name,description,is_active\n'
    const csvRows = result.rows.map(row => {
      return [
        escapeCsvValue(row.project_code),
        escapeCsvValue(row.name),
        escapeCsvValue(row.description),
        row.is_active ? '1' : '0'
      ].join(',')
    }).join('\n')

    const csvContent = csvHeader + csvRows

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="projects.csv"'
      }
    })
  } catch (error) {
    console.error('Error exporting projects:', error)
    return NextResponse.json({ error: 'Failed to export projects' }, { status: 500 })
  }
}

function escapeCsvValue(value: string | null): string {
  if (value == null) return ''
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
} 