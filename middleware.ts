import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that don't require authentication
const PUBLIC_PATHS = [
  '/dashboard/signin',  // Sign-in page
  '/dashboard/signin/password_signin',  // Password sign-in
  // '/dashboard/signin/signup',  // Sign-up page
  '/api/users/sign-in',  // Sign-in API
];

// Check if the path is public
const isPublicPath = (path: string) => {
  return PUBLIC_PATHS.some(publicPath => path === publicPath || path.startsWith(publicPath + '/'));
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get the auth token from cookies
  const authToken = request.cookies.get('authToken')?.value;
  
  // If the path is public, allow access
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }
  
  // If not authenticated and trying to access protected paths
  if (!authToken) {
    // Redirect to sign-in page
    const signInUrl = new URL('/dashboard/signin/password_signin', request.url);
    return NextResponse.redirect(signInUrl);
  }
  
  // If authenticated, allow access
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',  // Match all paths except static files
  ],
};