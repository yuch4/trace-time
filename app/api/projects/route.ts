import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('include_inactive') === 'true'

    const result = await pool.query(
      `SELECT * FROM projects
       ${!includeInactive ? 'WHERE is_active = true' : ''}
       ORDER BY name`
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
    const { name, description, is_active } = body

    const result = await pool.query(
      `INSERT INTO projects (name, description, is_active)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, description, is_active]
    )

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
} 