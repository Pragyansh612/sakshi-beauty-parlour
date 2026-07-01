'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

type ServiceUpdate = Database['public']['Tables']['services']['Update'];

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, ok: false as const };

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || profile.role !== 'admin') return { supabase, ok: false as const };

  return { supabase, ok: true as const };
}

const SERVICE_STATUSES = ['active', 'draft', 'archived'] as const;

const ServiceSchema = z.object({
  name: z.string().min(1),
  category_id: z.string().uuid(),
  duration_label: z.string().optional(),
  price_from: z.coerce.number().min(0),
  status: z.enum(SERVICE_STATUSES).default('active'),
});

export async function createService(
  data: z.infer<typeof ServiceSchema>
): Promise<{ success: boolean; error?: string }> {
  const parsed = ServiceSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: 'Please fill all required fields correctly.' };

  const { supabase, ok } = await requireAdmin();
  if (!ok) return { success: false, error: 'Not authorized.' };

  const { error } = await supabase.from('services').insert({
    name: parsed.data.name,
    category_id: parsed.data.category_id,
    duration_label: parsed.data.duration_label || null,
    price_from: Math.round(parsed.data.price_from * 100),
    status: parsed.data.status,
  });

  if (error) {
    console.error('Admin service create error:', error.message);
    return { success: false, error: 'Could not create this service.' };
  }
  revalidatePath('/admin/services');
  return { success: true };
}

const UpdateServiceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  category_id: z.string().uuid().optional(),
  duration_label: z.string().optional(),
  price_from: z.coerce.number().min(0).optional(),
  status: z.enum(SERVICE_STATUSES).optional(),
});

export async function updateService(
  data: z.infer<typeof UpdateServiceSchema>
): Promise<{ success: boolean; error?: string }> {
  const parsed = UpdateServiceSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: 'Invalid data.' };

  const { supabase, ok } = await requireAdmin();
  if (!ok) return { success: false, error: 'Not authorized.' };

  const { id, price_from, ...fields } = parsed.data;
  const update: ServiceUpdate = { ...fields };
  if (price_from != null) update.price_from = Math.round(price_from * 100);

  const { error } = await supabase.from('services').update(update).eq('id', id);

  if (error) {
    console.error('Admin service update error:', error.message);
    return { success: false, error: 'Could not save changes.' };
  }
  revalidatePath('/admin/services');
  return { success: true };
}

export async function deleteService(id: string): Promise<{ success: boolean; error?: string }> {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { success: false, error: 'Not authorized.' };

  const { error } = await supabase.from('services').delete().eq('id', id);

  if (error) {
    console.error('Admin service delete error:', error.message);
    return { success: false, error: 'Could not delete this service. It may have existing appointments or bookings linked to it.' };
  }
  revalidatePath('/admin/services');
  return { success: true };
}
