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

function revalidatePublicComboPages() {
  revalidatePath('/admin/combos');
  revalidatePath('/services');
}

const COMBO_STATUSES = ['active', 'draft'] as const;

const ComboSchema = z.object({
  name: z.string().min(1),
  tag_line: z.string().optional(),
  price: z.coerce.number().min(0),
  price_original: z.coerce.number().min(0),
  save_percent: z.coerce.number().int().min(0).max(100),
  is_featured: z.boolean().default(false),
  display_order: z.coerce.number().int().default(0),
  status: z.enum(COMBO_STATUSES).default('active'),
  items: z.array(z.string().min(1)).default([]),
});

async function replaceComboItems(
  supabase: Awaited<ReturnType<typeof createClient>>,
  comboId: string,
  items: string[]
) {
  await supabase.from('combo_offer_items').delete().eq('combo_id', comboId);
  if (items.length === 0) return;
  await supabase.from('combo_offer_items').insert(
    items.map((description, i) => ({ combo_id: comboId, description, display_order: i + 1 }))
  );
}

export async function createCombo(
  data: z.infer<typeof ComboSchema>
): Promise<{ success: boolean; error?: string }> {
  const parsed = ComboSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: 'Please fill all required fields correctly.' };

  const { supabase, ok } = await requireAdmin();
  if (!ok) return { success: false, error: 'Not authorized.' };

  const { data: inserted, error } = await supabase
    .from('combo_offers')
    .insert({
      name: parsed.data.name,
      tag_line: parsed.data.tag_line || null,
      price: Math.round(parsed.data.price * 100),
      price_original: Math.round(parsed.data.price_original * 100),
      save_percent: parsed.data.save_percent,
      is_featured: parsed.data.is_featured,
      display_order: parsed.data.display_order,
      status: parsed.data.status,
    })
    .select('id')
    .single();

  if (error || !inserted) {
    console.error('Admin combo create error:', error?.message);
    return { success: false, error: 'Could not create this combo.' };
  }

  await replaceComboItems(supabase, inserted.id, parsed.data.items);

  revalidatePublicComboPages();
  return { success: true };
}

const UpdateComboSchema = ComboSchema.extend({ id: z.string().uuid() });

export async function updateCombo(
  data: z.infer<typeof UpdateComboSchema>
): Promise<{ success: boolean; error?: string }> {
  const parsed = UpdateComboSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: 'Invalid data.' };

  const { supabase, ok } = await requireAdmin();
  if (!ok) return { success: false, error: 'Not authorized.' };

  const { id, items, ...fields } = parsed.data;

  const { error } = await supabase
    .from('combo_offers')
    .update({
      name: fields.name,
      tag_line: fields.tag_line || null,
      price: Math.round(fields.price * 100),
      price_original: Math.round(fields.price_original * 100),
      save_percent: fields.save_percent,
      is_featured: fields.is_featured,
      display_order: fields.display_order,
      status: fields.status,
    })
    .eq('id', id);

  if (error) {
    console.error('Admin combo update error:', error.message);
    return { success: false, error: 'Could not save changes.' };
  }

  await replaceComboItems(supabase, id, items);

  revalidatePublicComboPages();
  return { success: true };
}

export async function deleteCombo(id: string): Promise<{ success: boolean; error?: string }> {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { success: false, error: 'Not authorized.' };

  const { error } = await supabase.from('combo_offers').delete().eq('id', id);

  if (error) {
    console.error('Admin combo delete error:', error.message);
    return { success: false, error: 'Could not delete this combo.' };
  }
  revalidatePublicComboPages();
  return { success: true };
}
