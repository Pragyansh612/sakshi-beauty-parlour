import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export async function getUserRole(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<'customer' | 'admin' | null> {
  const { data } = await supabase.from('profiles').select('role').eq('id', userId).single();
  return data?.role ?? null;
}

export async function isAdminRole(supabase: SupabaseClient<Database>, userId: string): Promise<boolean> {
  return (await getUserRole(supabase, userId)) === 'admin';
}
