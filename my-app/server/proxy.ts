import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value

  const isProtectedRoute = request.nextUrl.pathname.startsWith('/backoffice')

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/backoffice/:path*',
  ],
}
