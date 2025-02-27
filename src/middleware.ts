import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Create a Supabase client configured to use cookies
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Get the session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protect routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/my-pets',
    '/pets/create',
    '/pets/edit',
  ];

  // Admin-only routes
  const adminRoutes = ['/admin'];

  // Redirect to login if accessing a protected route without a session
  const isAccessingProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  );

  const isAccessingAdminRoute = adminRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  );

  if (isAccessingProtectedRoute && !session) {
    const redirectUrl = new URL('/login', req.url);
    // Add the intended destination as a query parameter to redirect after login
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Check admin access
  if (isAccessingAdminRoute && session) {
    // Need to check if the user is an admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();

    if (!profile?.is_admin) {
      // User is logged in but not an admin
      return NextResponse.redirect(new URL('/', req.url));
    }
  } else if (isAccessingAdminRoute && !session) {
    // Not logged in and trying to access admin route
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Redirect from login/register to dashboard if already logged in
  const authRoutes = ['/login', '/register'];
  const isAccessingAuthRoute = authRoutes.some(route => 
    req.nextUrl.pathname === route
  );

  if (isAccessingAuthRoute && session) {
    // If there's a redirectTo parameter, use that, otherwise go to dashboard
    const redirectTo = req.nextUrl.searchParams.get('redirectTo') || '/dashboard';
    return NextResponse.redirect(new URL(redirectTo, req.url));
  }

  return res;
}

// Specify which routes this middleware should run for
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
