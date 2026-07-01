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

const CreateGalleryImageSchema = z.object({
  title: z.string().min(1),
  category: z.string().min(1),
  tag: z.string().min(1),
  section: z.enum(['work', 'achievement']),
  storage_path: z.string().min(1),
});

export async function createGalleryImage(
  data: z.infer<typeof CreateGalleryImageSchema>
): Promise<{ success: boolean; error?: string }> {
  const parsed = CreateGalleryImageSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: 'Invalid image data.' };

  const { supabase, ok } = await requireAdmin();
  if (!ok) return { success: false, error: 'Not authorized.' };

  const { error } = await supabase.from('gallery_images').insert(parsed.data);

  if (error) {
    console.error('Admin gallery create error:', error.message);
    return { success: false, error: 'Could not save this image.' };
  }
  revalidatePath('/admin/gallery');
  revalidatePath('/gallery');
  return { success: true };
}

const UpdateGalleryImageSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  tag: z.string().min(1).optional(),
});

export async function updateGalleryImage(
  data: z.infer<typeof UpdateGalleryImageSchema>
): Promise<{ success: boolean; error?: string }> {
  const parsed = UpdateGalleryImageSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: 'Invalid data.' };

  const { supabase, ok } = await requireAdmin();
  if (!ok) return { success: false, error: 'Not authorized.' };

  const { id, ...fields } = parsed.data;
  const { error } = await supabase.from('gallery_images').update(fields).eq('id', id);

  if (error) {
    console.error('Admin gallery update error:', error.message);
    return { success: false, error: 'Could not save changes.' };
  }
  revalidatePath('/admin/gallery');
  revalidatePath('/gallery');
  return { success: true };
}

export async function deleteGalleryImage(
  id: string,
  storagePath: string
): Promise<{ success: boolean; error?: string }> {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { success: false, error: 'Not authorized.' };

  const { error: dbError } = await supabase.from('gallery_images').delete().eq('id', id);
  if (dbError) {
    console.error('Admin gallery delete error:', dbError.message);
    return { success: false, error: 'Could not delete this image.' };
  }

  const { error: storageError } = await supabase.storage.from('gallery').remove([storagePath]);
  if (storageError) {
    console.error('Admin gallery storage delete error:', storageError.message);
  }

  revalidatePath('/admin/gallery');
  revalidatePath('/gallery');
  return { success: true };
}
