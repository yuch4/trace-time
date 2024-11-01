import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: { type: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') || new Date().toISOString().split('T')[0]
    const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0]
    const projectId = searchParams.get('projectId')
    const userId = searchParams.get('userId')
    const workTypeId = searchParams.get('workTypeId')

    let data
    switch (params.type) {
      case 'personal-monthly':
        data = await getPersonalMonthlyReport(startDate, endDate, userId)
        break
      case 'project-summary':
        data = await getProjectSummaryReport(startDate, endDate, projectId)
        break
      case 'team-analysis':
        data = await getTeamAnalysisReport(startDate, endDate)
        break
      case 'work-type-distribution':
        data = await getWorkTypeDistributionReport(startDate, endDate, workTypeId)
        break
      default:
        return NextResponse.json({ error: '���正なレポートタイプです' }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json({ error: 'レポートの生成に失敗しました' }, { status: 500 })
  }
}

async function getPersonalMonthlyReport(startDate: string, endDate: string, userId: string | null) {
  const result = await pool.query(`
    WITH daily_hours AS (
      SELECT 
        date,
        ROUND(CAST(SUM(hours) as numeric), 1) as hours,
        STRING_AGG(DISTINCT p.name, ', ') as projects
      FROM time_entries te
      JOIN projects p ON te.project_id = p.id
      WHERE date BETWEEN $1 AND $2
      ${userId ? 'AND user_id = $3' : ''}
      GROUP BY date
    ),
    work_type_summary AS (
      SELECT 
        wt.name as work_type,
        ROUND(CAST(SUM(hours) as numeric), 1) as total_hours
      FROM time_entries te
      JOIN work_types wt ON te.work_type_id = wt.id
      WHERE date BETWEEN $1 AND $2
      ${userId ? 'AND user_id = $3' : ''}
      GROUP BY wt.name
    )
    SELECT 
      json_build_object(
        'daily', (SELECT json_agg(daily_hours ORDER BY date) FROM daily_hours),
        'workTypes', (SELECT json_agg(work_type_summary) FROM work_type_summary)
      ) as report_data
  `, userId ? [startDate, endDate, userId] : [startDate, endDate])

  return result.rows[0].report_data
}

async function getProjectSummaryReport(startDate: string, endDate: string, projectId: string | null) {
  const result = await pool.query(`
    WITH project_summary AS (
      SELECT 
        p.name as project_name,
        ROUND(CAST(SUM(hours) as numeric), 1) as total_hours,
        COUNT(DISTINCT user_id) as member_count,
        STRING_AGG(DISTINCT wt.name, ', ') as work_types
      FROM time_entries te
      JOIN projects p ON te.project_id = p.id
      LEFT JOIN work_types wt ON te.work_type_id = wt.id
      WHERE date BETWEEN $1 AND $2
      ${projectId ? 'AND project_id = $3' : ''}
      GROUP BY p.name
    ),
    daily_progress AS (
      SELECT 
        date,
        p.name as project_name,
        ROUND(CAST(SUM(hours) as numeric), 1) as hours
      FROM time_entries te
      JOIN projects p ON te.project_id = p.id
      WHERE date BETWEEN $1 AND $2
      ${projectId ? 'AND project_id = $3' : ''}
      GROUP BY date, p.name
      ORDER BY date
    )
    SELECT 
      json_build_object(
        'summary', (SELECT json_agg(project_summary) FROM project_summary),
        'progress', (SELECT json_agg(daily_progress) FROM daily_progress)
      ) as report_data
  `, projectId ? [startDate, endDate, projectId] : [startDate, endDate])

  return result.rows[0].report_data
}

async function getTeamAnalysisReport(startDate: string, endDate: string) {
  const result = await pool.query(`
    WITH member_stats AS (
      SELECT 
        u.name as member_name,
        ROUND(CAST(SUM(hours) as numeric), 1) as total_hours,
        COUNT(DISTINCT project_id) as project_count,
        STRING_AGG(DISTINCT p.name, ', ') as projects
      FROM time_entries te
      JOIN users u ON te.user_id = u.id
      JOIN projects p ON te.project_id = p.id
      WHERE date BETWEEN $1 AND $2
      GROUP BY u.name
    ),
    team_daily AS (
      SELECT 
        date,
        ROUND(CAST(SUM(hours) as numeric), 1) as total_hours,
        COUNT(DISTINCT user_id) as active_members
      FROM time_entries
      WHERE date BETWEEN $1 AND $2
      GROUP BY date
      ORDER BY date
    )
    SELECT 
      json_build_object(
        'members', (SELECT json_agg(member_stats) FROM member_stats),
        'daily', (SELECT json_agg(team_daily) FROM team_daily)
      ) as report_data
  `, [startDate, endDate])

  return result.rows[0].report_data
}

async function getWorkTypeDistributionReport(startDate: string, endDate: string, workTypeId: string | null) {
  const result = await pool.query(`
    WITH work_type_summary AS (
      SELECT 
        wt.name as work_type,
        ROUND(CAST(SUM(hours) as numeric), 1) as total_hours,
        COUNT(DISTINCT user_id) as user_count,
        STRING_AGG(DISTINCT p.name, ', ') as projects
      FROM time_entries te
      JOIN work_types wt ON te.work_type_id = wt.id
      JOIN projects p ON te.project_id = p.id
      WHERE date BETWEEN $1 AND $2
      ${workTypeId ? 'AND work_type_id = $3' : ''}
      GROUP BY wt.name
    ),
    daily_distribution AS (
      SELECT 
        date,
        wt.name as work_type,
        ROUND(CAST(SUM(hours) as numeric), 1) as hours
      FROM time_entries te
      JOIN work_types wt ON te.work_type_id = wt.id
      WHERE date BETWEEN $1 AND $2
      ${workTypeId ? 'AND work_type_id = $3' : ''}
      GROUP BY date, wt.name
      ORDER BY date
    )
    SELECT 
      json_build_object(
        'summary', (SELECT json_agg(work_type_summary) FROM work_type_summary),
        'daily', (SELECT json_agg(daily_distribution) FROM daily_distribution)
      ) as report_data
  `, workTypeId ? [startDate, endDate, workTypeId] : [startDate, endDate])

  return result.rows[0].report_data
} 