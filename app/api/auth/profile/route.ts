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

    // ユーザー情報を取得
    const result = await pool.query(
      'SELECT id, name, email FROM users WHERE id = $1',
      [payload.userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    // トークンからユーザ��IDを取得
    const cookieStore = cookies()
    const token = cookieStore.get('auth_token')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jwtVerify(token.value, secret)

    // リクエストボディを取得
    const body = await request.json()
    const { name, email } = body

    // メールアドレスの重複チェック（自分以外）
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [email, payload.userId]
    )

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { message: 'このメールアドレスは既に使用されています' },
        { status: 400 }
      )
    }

    // ユーザー情報を更新
    const result = await pool.query(
      `UPDATE users 
       SET name = $1, email = $2
       WHERE id = $3
       RETURNING id, name, email`,
      [name, email, payload.userId]
    )

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 })
  }
} 