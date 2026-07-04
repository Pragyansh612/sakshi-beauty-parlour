'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const CreateAppointmentSchema = z.object({
  service_id: z.string().uuid(),
  slot_id: z.string().uuid(),
  notes: z.string().optional(),
});

export type CreateAppointmentData = z.infer<typeof CreateAppointmentSchema>;

export async function createAppointment(
  data: CreateAppointmentData
): Promise<{ success: boolean; reference?: string; error?: string }> {
  const parsed = CreateAppointmentSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: 'Invalid selection. Please try again.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Please sign in to confirm your appointment.' };
  }

  const { data: inserted, error } = await supabase
    .from('appointments')
    .insert({
      customer_id: user.id,
      service_id: parsed.data.service_id,
      slot_id: parsed.data.slot_id,
      notes: parsed.data.notes || null,
    })
    .select('reference')
    .single();

  if (error) {
    console.error('Appointment insert error:', error.message);
    if (error.code === '23505') {
      return { success: false, error: 'That slot was just taken. Please pick another time.' };
    }
    return { success: false, error: 'That slot may no longer be available. Please pick another.' };
  }

  return { success: true, reference: inserted.reference };
}

export async function cancelAppointment(
  reference: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Please sign in to manage your appointments.' };
  }

  const { error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
    .eq('reference', reference)
    .eq('customer_id', user.id);

  if (error) {
    console.error('Appointment cancel error:', error.message);
    return { success: false, error: 'Could not cancel this appointment. Please try again.' };
  }

  return { success: true };
}
