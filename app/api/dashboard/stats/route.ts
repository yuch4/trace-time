import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET() {
  try {
    // 今週の月曜日と日曜日を計算
    const today = new Date()
    const currentDay = today.getDay()
    const diff = currentDay === 0 ? 6 : currentDay - 1 // 日曜日の場合は6日前から、それ以外は（現在の曜日-1）日前から
    const monday = new Date(today)
    monday.setDate(today.getDate() - diff)
    monday.setHours(0, 0, 0, 0)

    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    sunday.setHours(23, 59, 59, 999)

    // 日別の合計時間を取得（直近7日間）
    const dailyStats = await pool.query(`
      SELECT 
        date,
        ROUND(CAST(SUM(hours) as numeric), 1) as total_hours
      FROM time_entries
      WHERE date >= CURRENT_DATE - INTERVAL '6 days'
      GROUP BY date
      ORDER BY date
    `)

    // 今週の合計時間を取得（月曜から日曜）
    const weeklyStats = await pool.query(`
      SELECT 
        ROUND(CAST(SUM(hours) as numeric), 1) as total_hours
      FROM time_entries
      WHERE date >= $1 AND date <= $2
    `, [monday.toISOString(), sunday.toISOString()])

    // プロジェクト別の合計時間を取得（今月）
    const projectStats = await pool.query(`
      SELECT 
        p.name as project_name,
        ROUND(CAST(SUM(te.hours) as numeric), 1) as total_hours
      FROM time_entries te
      JOIN projects p ON te.project_id = p.id
      WHERE date_trunc('month', te.date) = date_trunc('month', CURRENT_DATE)
      GROUP BY p.name
      ORDER BY total_hours DESC
    `)

    // 作業種別ごとの合計時間を取得（今月）
    const workTypeStats = await pool.query(`
      SELECT 
        wt.name as work_type_name,
        ROUND(CAST(SUM(te.hours) as numeric), 1) as total_hours
      FROM time_entries te
      JOIN work_types wt ON te.work_type_id = wt.id
      WHERE date_trunc('month', te.date) = date_trunc('month', CURRENT_DATE)
      GROUP BY wt.name
      ORDER BY total_hours DESC
    `)

    return NextResponse.json({
      daily: dailyStats.rows.map(row => ({
        ...row,
        total_hours: Number(row.total_hours)
      })),
      weekly: {
        total_hours: Number(weeklyStats.rows[0]?.total_hours || 0),
        start_date: monday.toISOString().split('T')[0],
        end_date: sunday.toISOString().split('T')[0]
      },
      projects: projectStats.rows.map(row => ({
        ...row,
        total_hours: Number(row.total_hours)
      })),
      workTypes: workTypeStats.rows.map(row => ({
        ...row,
        total_hours: Number(row.total_hours)
      }))
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 })
  }
} 