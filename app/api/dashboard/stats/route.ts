import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET() {
  try {
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