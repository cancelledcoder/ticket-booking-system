import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Public paths that don't require authentication
  const isPublicPath = path === '/auth/login' || path === '/auth/signup';

  // Get the token from the cookies
  const token = request.cookies.get('token')?.value;

  if (isPublicPath && token) {
    // If user is already logged in and tries to access login/signup page,
    // redirect to home page
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (!isPublicPath && !token) {
    // If user is not logged in and tries to access protected route,
    // redirect to login page
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // If token exists and path is protected, verify the token
  if (token && !isPublicPath) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
    } catch (error) {
      // If token is invalid, redirect to login
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/',
    '/auth/login',
    '/auth/signup',
    '/booking/:path*',
  ],
}; 