import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { isAdminRole } from '@/lib/supabase/auth-helpers';
import { safeRedirectPath } from '@/lib/auth/safe-redirect';
import { AdminLoginForm } from '@/components/auth/AdminLoginForm';

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;
  const target = safeRedirectPath(redirectTo, '/admin/dashboard', { adminOnly: true });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && (await isAdminRole(supabase, user.id))) {
    redirect(target);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#2e2823] px-6 py-12">
      <div className="w-full max-w-[420px]">
        <Link
          href="/"
          className="block text-center font-heading font-medium text-[22px] leading-[0.86] text-[#f6ede0] no-underline mb-8"
        >
          Sakshi
          <small className="block font-body font-normal text-[8px] tracking-[0.42em] uppercase text-[#d9b97e] mt-1">
            Beauty Parlour
          </small>
        </Link>
        <div className="bg-white rounded-[22px] px-7 py-9 md:px-9 md:py-10 shadow-[0_30px_70px_-30px_rgba(0,0,0,.5)]">
          <AdminLoginForm redirectTo={target} />
        </div>
      </div>
    </div>
  );
}
