import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const { pathname } = request.nextUrl

  // Public routes that don't need authentication
  const publicRoutes = [
    '/',
    '/events',
    '/events/[id]',
    '/auth/signin',
    '/auth/signup',
    '/api/auth',
  ]

  // Check if current path is public
  const isPublicRoute = publicRoutes.some(route => {
    if (route.includes('[id]')) {
      const routePattern = route.replace('[id]', '[^/]+')
      return new RegExp(`^${routePattern}$`).test(pathname)
    }
    return pathname === route || pathname.startsWith('/api/auth')
  })

  // Allow access to public routes
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Redirect to login if not authenticated
  if (!token) {
    const loginUrl = new URL('/auth/signin', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Role-based route protection
  const protectedRoutes = {
    organizer: [
      '/dashboard',
      '/dashboard/events',
      '/dashboard/transactions',
      '/dashboard/vouchers',
      '/dashboard/analytics',
    ],
    customer: [
      '/profile',
      '/tickets',
      '/transactions',
    ],
  }

  // Check organizer routes (Admin also has access)
  if (protectedRoutes.organizer.some(route => pathname.startsWith(route))) {
    if (!['ORGANIZER', 'ADMIN'].includes(token.role as string)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  // Check customer routes (accessible by all authenticated roles)
  if (protectedRoutes.customer.some(route => pathname.startsWith(route))) {
    if (!['CUSTOMER', 'ORGANIZER', 'ADMIN'].includes(token.role as string)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  // Admin routes
  if (pathname.startsWith('/admin')) {
    if (token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - uploads folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|uploads/).*)',
  ],
}
