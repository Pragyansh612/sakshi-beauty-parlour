import { createServerClient } from '@supabase/ssr';
import type { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';
import type { Database } from '@/types/database';

type CookieStore = Awaited<ReturnType<typeof cookies>>;

export function createSupabaseRouteClient(cookieStore: CookieStore, response: NextResponse) {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );
}
