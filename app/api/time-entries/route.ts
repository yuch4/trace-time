import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    const query = `
      WITH work_type_entries AS (
        SELECT 
          p.name as project_name,
          wt.name as work_type_name,
          SUM(te.hours) as hours,
          STRING_AGG(te.description, ' / ' ORDER BY te.created_at) as descriptions
        FROM time_entries te
        JOIN projects p ON te.project_id = p.id
        LEFT JOIN work_types wt ON te.work_type_id = wt.id
        WHERE te.date = $1
        GROUP BY p.name, wt.name
      )
      SELECT 
        project_name,
        json_agg(
          json_build_object(
            'work_type_name', work_type_name,
            'hours', hours,
            'descriptions', descriptions
          )
        ) as work_type_details,
        SUM(hours) as total_hours
      FROM work_type_entries
      GROUP BY project_name
      ORDER BY project_name
    `

    const result = await pool.query(query, [date])
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching time entries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch time entries' },
      { status: 500 }
    )
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

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { date, project_name, work_type_name, hours, description } = body

    const result = await pool.query(
      `WITH target_entries AS (
        SELECT te.id
        FROM time_entries te
        JOIN projects p ON te.project_id = p.id
        LEFT JOIN work_types wt ON te.work_type_id = wt.id
        WHERE te.date = $1
        AND p.name = $2
        AND (wt.name = $3 OR ($3 IS NULL AND wt.name IS NULL))
      )
      UPDATE time_entries
      SET hours = $4, description = $5
      WHERE id IN (SELECT id FROM target_entries)
      RETURNING *`,
      [date, project_name, work_type_name, hours, description]
    )

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error updating time entry:', error)
    return NextResponse.json({ error: 'Failed to update time entry' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    const { date, project_name, work_type_name } = body

    const result = await pool.query(
      `WITH target_entries AS (
        SELECT te.id
        FROM time_entries te
        JOIN projects p ON te.project_id = p.id
        LEFT JOIN work_types wt ON te.work_type_id = wt.id
        WHERE te.date = $1
        AND p.name = $2
        AND (wt.name = $3 OR ($3 IS NULL AND wt.name IS NULL))
      )
      DELETE FROM time_entries
      WHERE id IN (SELECT id FROM target_entries)
      RETURNING *`,
      [date, project_name, work_type_name]
    )

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error deleting time entry:', error)
    return NextResponse.json({ error: 'Failed to delete time entry' }, { status: 500 })
  }
} 