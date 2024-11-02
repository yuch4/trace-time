import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { parse } from 'csv-parse/sync'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const text = await file.text()
    const records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    })

    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      for (const record of records) {
        // プロジェクトIDの重複チェック
        const existing = await client.query(
          'SELECT id FROM projects WHERE project_code = $1',
          [record.project_code]
        )

        if (existing.rows.length > 0) {
          // 既存のプロジェクトを更新
          await client.query(
            `UPDATE projects 
             SET name = $1, description = $2, is_active = $3
             WHERE project_code = $4`,
            [
              record.name,
              record.description,
              record.is_active === '1' || record.is_active?.toLowerCase() === 'true',
              record.project_code
            ]
          )
        } else {
          // 新規プロジェクトを作成
          await client.query(
            `INSERT INTO projects (project_code, name, description, is_active)
             VALUES ($1, $2, $3, $4)`,
            [
              record.project_code,
              record.name,
              record.description,
              record.is_active === '1' || record.is_active?.toLowerCase() === 'true'
            ]
          )
        }
      }

      await client.query('COMMIT')
      return NextResponse.json({ 
        message: `${records.length}件のプロジェクトをインポートしました` 
      })
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error importing projects:', error)
    return NextResponse.json(
      { error: 'Failed to import projects' },
      { status: 500 }
    )
  }
} 