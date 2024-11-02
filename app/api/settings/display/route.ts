import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    // トークンからユーザーIDを取得
    const cookieStore = cookies()
    const token = cookieStore.get('auth_token')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jwtVerify(token.value, secret)

    // ユーザーの表示設定を取得
    const result = await pool.query(
      'SELECT * FROM user_display_settings WHERE user_id = $1',
      [payload.userId]
    )

    // 設定が存在しない場合はデフォルト値を返す
    if (result.rows.length === 0) {
      return NextResponse.json({
        theme: 'light',
        dateFormat: 'YYYY-MM-DD',
        itemsPerPage: 10,
        defaultView: 'daily'
      })
    }

    // データベースのカラム名をフロントエンドの期待する形式に変換
    return NextResponse.json({
      theme: result.rows[0].theme,
      dateFormat: result.rows[0].date_format,
      itemsPerPage: result.rows[0].items_per_page,
      defaultView: result.rows[0].default_view
    })
  } catch (error) {
    console.error('Error fetching display settings:', error)
    return NextResponse.json({ error: 'Failed to fetch display settings' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    // トークンからユーザーIDを取得
    const cookieStore = cookies()
    const token = cookieStore.get('auth_token')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jwtVerify(token.value, secret)

    // リクエストボディを取得
    const body = await request.json()
    const { theme, dateFormat, itemsPerPage, defaultView } = body

    // 設定を更新または作成
    const result = await pool.query(
      `INSERT INTO user_display_settings 
       (user_id, theme, date_format, items_per_page, default_view)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) 
       DO UPDATE SET
         theme = EXCLUDED.theme,
         date_format = EXCLUDED.date_format,
         items_per_page = EXCLUDED.items_per_page,
         default_view = EXCLUDED.default_view
       RETURNING *`,
      [payload.userId, theme, dateFormat, itemsPerPage, defaultView]
    )

    // レスポンスデータをフロントエンドの期待する形式に変換
    return NextResponse.json({
      theme: result.rows[0].theme,
      dateFormat: result.rows[0].date_format,
      itemsPerPage: result.rows[0].items_per_page,
      defaultView: result.rows[0].default_view
    })
  } catch (error) {
    console.error('Error updating display settings:', error)
    return NextResponse.json({ error: 'Failed to update display settings' }, { status: 500 })
  }
} 