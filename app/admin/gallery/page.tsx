import { createClient } from '@/lib/supabase/server';
import { GalleryManager, type AdminGalleryImage } from '@/components/admin/GalleryManager';

export default async function AdminGalleryPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('gallery_images')
    .select('id, title, category, tag, section, storage_path')
    .order('display_order');

  const images: AdminGalleryImage[] = (data ?? []).map((g) => ({
    id: g.id,
    title: g.title,
    category: g.category,
    tag: g.tag,
    section: g.section,
    storagePath: g.storage_path,
  }));

  return <GalleryManager initialImages={images} />;
}
