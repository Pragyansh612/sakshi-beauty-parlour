import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { normalizePhone, PHONE_REGEX, phoneToAuthEmail } from '@/lib/phone-auth';
import { getUserRole } from '@/lib/supabase/auth-helpers';
import { createSupabaseRouteClient } from '@/lib/supabase/route-client';

const schema = z.object({
  phone: z
    .string()
    .transform((v) => normalizePhone(v))
    .refine((v) => PHONE_REGEX.test(v), 'Enter a valid 10-digit mobile number'),
  password: z.string().min(1, 'Enter your password'),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 }
    );
  }

  const { phone, password } = parsed.data;
  const email = phoneToAuthEmail(phone);
  const cookieStore = await cookies();
  let cookieResponse = NextResponse.json({ ok: true });
  const supabase = createSupabaseRouteClient(cookieStore, cookieResponse);

  await supabase.auth.signOut();

  const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  const role = signInData.user ? await getUserRole(supabase, signInData.user.id) : null;
  const finalResponse = NextResponse.json({ ok: true, role: role ?? 'customer' });
  cookieResponse.cookies.getAll().forEach((cookie) => {
    finalResponse.cookies.set(cookie.name, cookie.value, cookie);
  });

  return finalResponse;
}
