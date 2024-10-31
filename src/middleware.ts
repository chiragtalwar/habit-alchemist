import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  try {
    const { data: { session } } = await supabase.auth.getSession()

    // Allow access to join/[code] without auth
    if (req.nextUrl.pathname.startsWith('/join/') && 
        !req.nextUrl.pathname.includes('/select-habits')) {
      return res
    }

    // Protected routes
    const protectedRoutes = ['/create', '/dashboard', '/waiting', '/join/*/select-habits']
    const isProtectedRoute = protectedRoutes.some(route => {
      if (route.includes('*')) {
        const pattern = route.replace('*', '.*')
        return new RegExp(pattern).test(req.nextUrl.pathname)
      }
      return req.nextUrl.pathname.startsWith(route)
    })

    if (!session && isProtectedRoute) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.redirect(new URL('/', req.url))
  }
}

export const config = {
  matcher: [
    '/',
    '/create',
    '/dashboard',
    '/waiting',
    '/join/:path*'
  ]
} 