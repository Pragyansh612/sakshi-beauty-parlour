import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createSupabaseRouteClient } from '@/lib/supabase/route-client';

export async function POST() {
  const cookieStore = await cookies();
  const response = NextResponse.json({ ok: true });
  const supabase = createSupabaseRouteClient(cookieStore, response);
  await supabase.auth.signOut();
  return response;
}
