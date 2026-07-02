import { createClient } from '@/lib/supabase/server';
import { CombosManager, type AdminCombo } from '@/components/admin/CombosManager';

export default async function AdminCombosPage() {
  const supabase = await createClient();

  const [{ data: combos }, { data: items }] = await Promise.all([
    supabase.from('combo_offers').select('*').order('display_order'),
    supabase.from('combo_offer_items').select('*').order('display_order'),
  ]);

  const adminCombos: AdminCombo[] = (combos ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    tagLine: c.tag_line ?? '',
    price: String(Math.round(c.price / 100)),
    priceOriginal: String(Math.round(c.price_original / 100)),
    savePercent: String(c.save_percent),
    isFeatured: String(c.is_featured),
    displayOrder: String(c.display_order),
    status: c.status,
    items: (items ?? [])
      .filter((i) => i.combo_id === c.id)
      .map((i) => i.description)
      .join('\n'),
  }));

  return <CombosManager initialCombos={adminCombos} />;
}
