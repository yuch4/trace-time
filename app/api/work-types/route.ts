import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET() {
  try {
    const result = await pool.query(
      'SELECT * FROM work_types WHERE is_active = true ORDER BY name'
    )
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching work types:', error)
    return NextResponse.json({ error: 'Failed to fetch work types' }, { status: 500 })
  }
} 