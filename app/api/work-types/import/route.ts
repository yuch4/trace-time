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
        // 作業種別名の重複チェック
        const existing = await client.query(
          'SELECT id FROM work_types WHERE name = $1',
          [record.name]
        )

        if (existing.rows.length > 0) {
          // 既存の作業種別を更新
          await client.query(
            `UPDATE work_types 
             SET description = $1, is_active = $2
             WHERE name = $3`,
            [
              record.description,
              record.is_active === '1' || record.is_active?.toLowerCase() === 'true',
              record.name
            ]
          )
        } else {
          // 新規作業種別を作成
          await client.query(
            `INSERT INTO work_types (name, description, is_active)
             VALUES ($1, $2, $3)`,
            [
              record.name,
              record.description,
              record.is_active === '1' || record.is_active?.toLowerCase() === 'true'
            ]
          )
        }
      }

      await client.query('COMMIT')
      return NextResponse.json({ 
        message: `${records.length}件の作業種別をインポートしました` 
      })
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error importing work types:', error)
    return NextResponse.json(
      { error: 'Failed to import work types' },
      { status: 500 }
    )
  }
} 