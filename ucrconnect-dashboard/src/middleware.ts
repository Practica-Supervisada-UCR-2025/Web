import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const privateRoutes = [
  '/',
  '/analytics',
  '/content',
  '/notifications',
  '/settings',
  '/users',
  '/profile',
  '/dashboard'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const isPrivateRoute = privateRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  const accessToken = request.cookies.get('access_token');

  if (isPrivateRoute && !accessToken) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === '/login' && accessToken) {
    const dashboardUrl = new URL('/', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};