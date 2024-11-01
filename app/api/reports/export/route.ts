import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') || new Date().toISOString().split('T')[0]
    const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0]
    const projectId = searchParams.get('projectId')
    const userId = searchParams.get('userId')
    const workTypeId = searchParams.get('workTypeId')

    // 詳細な工数データを取得
    const result = await pool.query(`
      SELECT 
        te.date,
        u.name as user_name,
        p.name as project_name,
        wt.name as work_type,
        te.hours,
        te.description
      FROM time_entries te
      JOIN users u ON te.user_id = u.id
      JOIN projects p ON te.project_id = p.id
      LEFT JOIN work_types wt ON te.work_type_id = wt.id
      WHERE te.date BETWEEN $1 AND $2
      ${projectId ? 'AND te.project_id = $3' : ''}
      ${userId ? `AND te.user_id = ${projectId ? '$4' : '$3'}` : ''}
      ${workTypeId ? `AND te.work_type_id = ${projectId && userId ? '$5' : projectId || userId ? '$4' : '$3'}` : ''}
      ORDER BY te.date, u.name, p.name
    `, [startDate, endDate, ...[projectId, userId, workTypeId].filter(Boolean)])

    // CSVヘッダー
    const headers = ['日付', '担当者', 'プロジェクト', '作業種別', '工数', '作業内容']
    
    // データを整形してCSV形式に変換
    const csvData = [
      headers.join(','),
      ...result.rows.map(row => [
        row.date,
        escapeCsvValue(row.user_name),
        escapeCsvValue(row.project_name),
        escapeCsvValue(row.work_type || ''),
        row.hours,
        escapeCsvValue(row.description)
      ].join(','))
    ].join('\n')

    // レスポンスヘッダーの設定
    const response = new NextResponse(csvData, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="timesheet_${startDate}_${endDate}.csv"`,
      },
    })

    return response
  } catch (error) {
    console.error('Error exporting data:', error)
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 })
  }
}

// CSVの値をエスケープする関数
function escapeCsvValue(value: string): string {
  if (!value) return ''
  const needsQuotes = value.includes(',') || value.includes('"') || value.includes('\n')
  if (!needsQuotes) return value
  return `"${value.replace(/"/g, '""')}"`
} 