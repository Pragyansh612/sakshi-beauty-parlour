'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

type BookingUpdate = Database['public']['Tables']['bookings']['Update'];

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

const BOOKING_STATUSES = ['pending_approval', 'confirmed', 'in_progress', 'completed', 'cancelled'] as const;

const UpdateBookingSchema = z.object({
  id: z.string().uuid(),
  artist: z.string().optional(),
  status: z.enum(BOOKING_STATUSES).optional(),
  admin_notes: z.string().optional(),
  agreed_price: z.coerce.number().optional(),
});

export async function updateBooking(
  data: z.infer<typeof UpdateBookingSchema>
): Promise<{ success: boolean; error?: string }> {
  const parsed = UpdateBookingSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: 'Invalid data.' };

  const { supabase, ok } = await requireAdmin();
  if (!ok) return { success: false, error: 'Not authorized.' };

  const { id, status, agreed_price, ...fields } = parsed.data;
  const update: BookingUpdate = { ...fields };
  if (agreed_price != null) update.agreed_price = Math.round(agreed_price * 100);
  if (status) {
    update.status = status;
    if (status === 'confirmed') update.confirmed_at = new Date().toISOString();
  }

  const { error } = await supabase.from('bookings').update(update).eq('id', id);

  if (error) {
    console.error('Admin booking update error:', error.message);
    return { success: false, error: 'Could not save changes.' };
  }
  revalidatePath('/admin/bookings');
  revalidatePath('/admin/dashboard');
  return { success: true };
}

export async function deleteBookingAdmin(id: string): Promise<{ success: boolean; error?: string }> {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { success: false, error: 'Not authorized.' };

  const { error } = await supabase.from('bookings').delete().eq('id', id);

  if (error) {
    console.error('Admin booking delete error:', error.message);
    return { success: false, error: 'Could not delete this booking.' };
  }
  revalidatePath('/admin/bookings');
  revalidatePath('/admin/dashboard');
  return { success: true };
}
