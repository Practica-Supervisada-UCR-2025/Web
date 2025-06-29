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

export async function middleware(request: NextRequest) {
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

  // If we have a token and it's a private route, validate the token
  if (isPrivateRoute && accessToken) {
    try {
      // Validate token by making a request to the profile endpoint
      const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken.value}`,
        },
      });

      // If token is invalid (401), clear the token and redirect to login with session expired message
      if (profileResponse.status === 401) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('session_expired', 'true');
        
        // Create response with redirect and cookie clearing
        const response = NextResponse.redirect(loginUrl);
        response.cookies.set('access_token', '', {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          path: '/',
          maxAge: 0 // Expire immediately
        });
        
        return response;
      }

      // If token is valid, continue
      if (profileResponse.ok) {
        return NextResponse.next();
      }
    } catch (error) {
      console.error('Error validating token in middleware:', error);
      // On error, clear the token and redirect to login with session expired message
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('session_expired', 'true');
      
      // Create response with redirect and cookie clearing
      const response = NextResponse.redirect(loginUrl);
      response.cookies.set('access_token', '', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 0 // Expire immediately
      });
      
      return response;
    }
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