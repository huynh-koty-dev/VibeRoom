import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isAuthenticated = !!req.auth

  const protectedPrefixes = ['/spaces', '/studio', '/company']
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p))

  if (isProtected && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if ((pathname === '/login' || pathname === '/register') && isAuthenticated) {
    return NextResponse.redirect(new URL('/spaces', req.url))
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
}
