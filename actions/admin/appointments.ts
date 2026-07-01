'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

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

const APPOINTMENT_STATUSES = ['pending', 'confirmed', 'checked_in', 'in_chair', 'completed', 'cancelled', 'no_show'] as const;

const UpdateAppointmentSchema = z.object({
  id: z.string().uuid(),
  artist: z.string().optional(),
  status: z.enum(APPOINTMENT_STATUSES).optional(),
  notes: z.string().optional(),
});

export async function updateAppointment(
  data: z.infer<typeof UpdateAppointmentSchema>
): Promise<{ success: boolean; error?: string }> {
  const parsed = UpdateAppointmentSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: 'Invalid data.' };

  const { supabase, ok } = await requireAdmin();
  if (!ok) return { success: false, error: 'Not authorized.' };

  const { id, ...fields } = parsed.data;
  const { error } = await supabase.from('appointments').update(fields).eq('id', id);

  if (error) {
    console.error('Admin appointment update error:', error.message);
    return { success: false, error: 'Could not save changes.' };
  }
  revalidatePath('/admin/appointments');
  revalidatePath('/admin/dashboard');
  return { success: true };
}

export async function cancelAppointmentAdmin(id: string): Promise<{ success: boolean; error?: string }> {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { success: false, error: 'Not authorized.' };

  const { error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Admin appointment cancel error:', error.message);
    return { success: false, error: 'Could not cancel this appointment.' };
  }
  revalidatePath('/admin/appointments');
  revalidatePath('/admin/dashboard');
  return { success: true };
}
