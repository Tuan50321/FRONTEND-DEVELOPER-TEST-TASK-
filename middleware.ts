import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Temporarily disabled for demo - in production, check auth token
  // const token = request.cookies.get('accessToken')
  // if (!token && request.nextUrl.pathname.startsWith('/courses')) {
  //   return NextResponse.redirect(new URL('/auth/login', request.url))
  // }
  return NextResponse.next()
}

export const config = {
  matcher: ['/courses/:path*'],
}