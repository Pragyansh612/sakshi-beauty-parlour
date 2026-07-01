import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="min-h-screen md:grid md:grid-cols-[236px_1fr] bg-[#f4f1ec] text-[#2e2823]">
      <AdminSidebar adminName={profile.full_name} />
      <main className="px-5 py-6 md:px-[34px] md:py-[26px] pb-[60px]">{children}</main>
    </div>
  );
}
