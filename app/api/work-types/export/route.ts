import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT name, description, is_active 
       FROM work_types 
       ORDER BY name`
    )

    const csvHeader = 'name,description,is_active\n'
    const csvRows = result.rows.map(row => {
      return [
        escapeCsvValue(row.name),
        escapeCsvValue(row.description),
        row.is_active ? '1' : '0'
      ].join(',')
    }).join('\n')

    const csvContent = csvHeader + csvRows

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="work_types.csv"'
      }
    })
  } catch (error) {
    console.error('Error exporting work types:', error)
    return NextResponse.json({ error: 'Failed to export work types' }, { status: 500 })
  }
}

function escapeCsvValue(value: string | null): string {
  if (value == null) return ''
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
} 