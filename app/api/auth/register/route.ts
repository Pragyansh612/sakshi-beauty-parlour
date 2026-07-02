import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { normalizePhone, PHONE_REGEX, phoneToAuthEmail } from '@/lib/phone-auth';
import type { Database } from '@/types/database';

const schema = z.object({
  full_name: z.string().min(2, 'Enter your full name'),
  phone: z
    .string()
    .transform((v) => normalizePhone(v))
    .refine((v) => PHONE_REGEX.test(v), 'Enter a valid 10-digit mobile number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 }
    );
  }

  const { full_name, phone, password } = parsed.data;
  const email = phoneToAuthEmail(phone);
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from('profiles')
    .select('id')
    .eq('phone', phone)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: 'This phone number is already registered.' }, { status: 409 });
  }

  const { error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, phone },
  });

  if (createErr) {
    const message = createErr.message.toLowerCase();
    if (message.includes('already') || message.includes('exists') || message.includes('registered')) {
      return NextResponse.json({ error: 'This phone number is already registered.' }, { status: 409 });
    }
    return NextResponse.json({ error: createErr.message }, { status: 400 });
  }

  const cookieStore = await cookies();
  let response = NextResponse.json({ ok: true });

  const supabase = createServerClient<Database>(
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

  const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
  if (signInErr) {
    return NextResponse.json(
      { error: 'Account created but sign-in failed. Please try logging in.' },
      { status: 500 }
    );
  }

  return response;
}
