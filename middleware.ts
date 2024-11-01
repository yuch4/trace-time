import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export function middleware(request: NextRequest) {
  // ログインページはスキップ
  if (request.nextUrl.pathname === '/login') {
    return NextResponse.next()
  }

  const token = request.cookies.get('auth_token')

  // トークンがない場合はログインページにリダイレクト
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    // トークンの検証
    jwt.verify(token.value, JWT_SECRET)
    return NextResponse.next()
  } catch (error) {
    // トークンが無効な場合はログインページにリダイレクト
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
} 