import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET() {
  try {
    // 日別の合計時間を取得（直近7日間）
    const dailyStats = await pool.query(`
      SELECT 
        date,
        SUM(hours) as total_hours
      FROM time_entries
      WHERE date >= CURRENT_DATE - INTERVAL '6 days'
      GROUP BY date
      ORDER BY date
    `)

    // プロジェクト別の合計時間を取得（今月）
    const projectStats = await pool.query(`
      SELECT 
        p.name as project_name,
        SUM(te.hours) as total_hours
      FROM time_entries te
      JOIN projects p ON te.project_id = p.id
      WHERE date_trunc('month', te.date) = date_trunc('month', CURRENT_DATE)
      GROUP BY p.name
      ORDER BY total_hours DESC
    `)

    return NextResponse.json({
      daily: dailyStats.rows,
      projects: projectStats.rows
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 })
  }
} 