import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(request: NextRequest) {
  // ログインページとサインアップページはスキップ
  if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup') {
    return NextResponse.next()
  }

  const token = request.cookies.get('auth_token')

  // トークンがない場合はログインページにリダイレクト
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    // JWTの検証
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    await jwtVerify(token.value, secret)
    return NextResponse.next()
  } catch (error) {
    // トークンが無効な場合はログインページにリダイレクト
    console.error('Token verification failed:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
} 