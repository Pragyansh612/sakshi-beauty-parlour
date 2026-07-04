import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/types/database';
import { safeRedirectPath } from '@/lib/auth/safe-redirect';
import { isAdminRole } from '@/lib/supabase/auth-helpers';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;

  function redirectWithCookies(url: URL) {
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  }

  if (user && pathname === '/login') {
    const redirectTo = request.nextUrl.searchParams.get('redirectTo');
    const isAdmin = await isAdminRole(supabase, user.id);
    const fallback = isAdmin ? '/admin/dashboard' : '/dashboard';
    const destination = safeRedirectPath(redirectTo, fallback);
    return redirectWithCookies(new URL(destination, request.url));
  }

  if (user && pathname === '/admin/login') {
    if (await isAdminRole(supabase, user.id)) {
      const redirectTo = request.nextUrl.searchParams.get('redirectTo');
      const destination = safeRedirectPath(redirectTo, '/admin/dashboard', { adminOnly: true });
      return redirectWithCookies(new URL(destination, request.url));
    }
  }

  if (!user && pathname.startsWith('/dashboard')) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname + search);
    return redirectWithCookies(loginUrl);
  }

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!user) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return redirectWithCookies(loginUrl);
    }
    if (!(await isAdminRole(supabase, user.id))) {
      return redirectWithCookies(new URL('/', request.url));
    }
  }

  return supabaseResponse;
}
