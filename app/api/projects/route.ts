import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('include_inactive') === 'true'

    const result = await pool.query(
      `SELECT * FROM projects
       ${!includeInactive ? 'WHERE is_active = true' : ''}
       ORDER BY project_code`
    )
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { project_code, name, description, is_active } = body

    const existingProject = await pool.query(
      'SELECT id FROM projects WHERE project_code = $1',
      [project_code]
    )

    if (existingProject.rows.length > 0) {
      return NextResponse.json(
        { message: 'このプロジェクトIDは既に使用されています' },
        { status: 400 }
      )
    }

    const result = await pool.query(
      `INSERT INTO projects (project_code, name, description, is_active)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [project_code, name, description, is_active]
    )

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
} 