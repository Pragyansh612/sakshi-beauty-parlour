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

const ToggleSlotSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['open', 'blocked']),
});

export async function toggleSlotStatus(
  data: z.infer<typeof ToggleSlotSchema>
): Promise<{ success: boolean; error?: string }> {
  const parsed = ToggleSlotSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: 'Invalid data.' };

  const { supabase, ok } = await requireAdmin();
  if (!ok) return { success: false, error: 'Not authorized.' };

  const { error } = await supabase.from('time_slots').update({ status: parsed.data.status }).eq('id', parsed.data.id);

  if (error) {
    console.error('Admin slot toggle error:', error.message);
    return { success: false, error: 'Could not update this slot.' };
  }
  revalidatePath('/admin/slots');
  return { success: true };
}

const SetDayStatusSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(['open', 'blocked']),
});

export async function setDayStatus(
  data: z.infer<typeof SetDayStatusSchema>
): Promise<{ success: boolean; error?: string }> {
  const parsed = SetDayStatusSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: 'Invalid data.' };

  const { supabase, ok } = await requireAdmin();
  if (!ok) return { success: false, error: 'Not authorized.' };

  const { error } = await supabase
    .from('time_slots')
    .update({ status: parsed.data.status })
    .eq('slot_date', parsed.data.date);

  if (error) {
    console.error('Admin set day status error:', error.message);
    return { success: false, error: 'Could not update this day.' };
  }
  revalidatePath('/admin/slots');
  return { success: true };
}

const OPEN_HOUR = 11;
const CLOSE_HOUR = 20.5;

function buildSlotTimes(): string[] {
  const times: string[] = [];
  for (let h = OPEN_HOUR; h <= CLOSE_HOUR; h += 0.5) {
    const hour = Math.floor(h);
    const minute = h % 1 === 0 ? '00' : '30';
    times.push(`${String(hour).padStart(2, '0')}:${minute}:00`);
  }
  return times;
}

const GenerateDaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function generateDaySlots(
  data: z.infer<typeof GenerateDaySchema>
): Promise<{ success: boolean; error?: string }> {
  const parsed = GenerateDaySchema.safeParse(data);
  if (!parsed.success) return { success: false, error: 'Invalid date.' };

  const { supabase, ok } = await requireAdmin();
  if (!ok) return { success: false, error: 'Not authorized.' };

  const rows = buildSlotTimes().map((slot_time) => ({ slot_date: parsed.data.date, slot_time }));

  const { error } = await supabase
    .from('time_slots')
    .upsert(rows, { onConflict: 'slot_date,slot_time', ignoreDuplicates: true });

  if (error) {
    console.error('Admin generate day slots error:', error.message);
    return { success: false, error: 'Could not create slots for this date.' };
  }
  revalidatePath('/admin/slots');
  return { success: true };
}
