import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow all API routes to pass through - our backend will handle auth
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Add cache control headers for dashboard pages to prevent caching
  if (pathname.startsWith('/dashboard')) {
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  }

  // Let client-side authentication handle redirects to avoid loops
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
};