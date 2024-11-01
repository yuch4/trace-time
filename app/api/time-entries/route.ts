import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        te.*, 
        p.name as project_name,
        u.name as user_name,
        wt.name as work_type_name
      FROM time_entries te
      JOIN projects p ON te.project_id = p.id
      JOIN users u ON te.user_id = u.id
      LEFT JOIN work_types wt ON te.work_type_id = wt.id
      ORDER BY te.date DESC, te.created_at DESC
      LIMIT 10
    `)
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching time entries:', error)
    return NextResponse.json({ error: 'Failed to fetch time entries' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { user_id, project_id, work_type_id, date, hours, description } = body

    const result = await pool.query(
      `INSERT INTO time_entries (user_id, project_id, work_type_id, date, hours, description)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [user_id, project_id, work_type_id, date, hours, description]
    )

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error creating time entry:', error)
    return NextResponse.json({ error: 'Failed to create time entry' }, { status: 500 })
  }
} 