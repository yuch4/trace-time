import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'

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
    const { currentPassword, newPassword } = body

    // 現在のユーザー情報を取得
    const userResult = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [payload.userId]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 現在のパスワードを検証
    const isValid = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash)

    if (!isValid) {
      return NextResponse.json(
        { message: '現在のパスワードが正しくありません' },
        { status: 400 }
      )
    }

    // 新しいパスワードをハッシュ化
    const salt = await bcrypt.genSalt(10)
    const newPasswordHash = await bcrypt.hash(newPassword, salt)

    // パスワードを更新
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [newPasswordHash, payload.userId]
    )

    return NextResponse.json({ message: 'パスワードを更新しました' })
  } catch (error) {
    console.error('Error updating password:', error)
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
  }
} 