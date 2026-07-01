'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const CreateBookingSchema = z.object({
  service_id: z.string().uuid(),
  event_date: z.string(),
  event_type: z.string().optional(),
  guests_count: z.string().optional(),
  venue: z.string().optional(),
  style_notes: z.string().optional(),
  wants_trial: z.boolean().default(false),
});

export type CreateBookingData = z.infer<typeof CreateBookingSchema>;

export async function createBooking(
  data: CreateBookingData
): Promise<{ success: boolean; reference?: string; error?: string }> {
  const parsed = CreateBookingSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: 'Invalid selection. Please try again.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Please sign in to confirm your booking.' };
  }

  const { data: inserted, error } = await supabase
    .from('bookings')
    .insert({
      customer_id: user.id,
      service_id: parsed.data.service_id,
      event_date: parsed.data.event_date,
      event_type: parsed.data.event_type || null,
      guests_count: parsed.data.guests_count || null,
      venue: parsed.data.venue || null,
      style_notes: parsed.data.style_notes || null,
      wants_trial: parsed.data.wants_trial,
    })
    .select('reference')
    .single();

  if (error) {
    console.error('Booking insert error:', error.message);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }

  return { success: true, reference: inserted.reference };
}
