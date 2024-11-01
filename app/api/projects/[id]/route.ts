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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, description, is_active } = body
    const projectId = params.id

    const result = await pool.query(
      `UPDATE projects 
       SET name = $1, description = $2, is_active = $3
       WHERE id = $4
       RETURNING *`,
      [name, description, is_active, projectId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id

    // 物理削除ではなく、論理削除を行う
    const result = await pool.query(
      `UPDATE projects 
       SET is_active = false
       WHERE id = $1
       RETURNING *`,
      [projectId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    )
  }
} 