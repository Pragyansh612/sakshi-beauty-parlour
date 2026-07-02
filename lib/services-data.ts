import { createClient } from '@/lib/supabase/server';

export interface PriceRow {
  name: string;
  price: string;
}

export interface ServiceSubcard {
  heading: string;
  rows: PriceRow[];
}

export interface ServiceCategoryData {
  id: string;
  slug: string;
  title: string;
  desc: string;
  fromPrice: string;
  iconRadius: string;
  dark: boolean;
  columns: 2 | 3;
  subcards: ServiceSubcard[];
}

export interface ComboOfferData {
  id: string;
  title: string;
  tagLabel: string;
  badge: string;
  items: string[];
  price: string;
  originalPrice: string;
  featured: boolean;
}

// Presentation-only styling per category slug — not stored in the DB since
// it's layout, not content an admin needs to edit service-by-service.
const CATEGORY_STYLE: Record<string, { iconRadius: string; dark?: boolean; columns?: 2 | 3 }> = {
  hair: { iconRadius: '50%' },
  skin: { iconRadius: '50% 50% 50% 0' },
  body: { iconRadius: '14px' },
  threading: { iconRadius: '50% 0' },
  waxing: { iconRadius: '0 50% 0 50%' },
  grooming: { iconRadius: '50% 50% 0 50%', columns: 2 },
  bridal: { iconRadius: '50%', dark: true, columns: 2 },
};

export function formatPriceRange(priceFrom: number, priceTo: number | null): string {
  const from = priceFrom / 100;
  if (priceTo != null && priceTo !== priceFrom) {
    const to = priceTo / 100;
    return `₹${from.toLocaleString('en-IN')} - ₹${to.toLocaleString('en-IN')}`;
  }
  return `₹${from.toLocaleString('en-IN')}+`;
}

export async function getServiceCategoriesWithServices(): Promise<ServiceCategoryData[]> {
  const supabase = await createClient();

  const [{ data: categories }, { data: services }] = await Promise.all([
    supabase.from('service_categories').select('*').order('display_order'),
    supabase
      .from('services')
      .select('*')
      .eq('status', 'active')
      .order('display_order'),
  ]);

  if (!categories) return [];

  return categories.map((cat) => {
    const catServices = (services ?? []).filter((s) => s.category_id === cat.id);

    const bySub = new Map<string, typeof catServices>();
    for (const s of catServices) {
      const key = s.sub_category ?? cat.name;
      if (!bySub.has(key)) bySub.set(key, []);
      bySub.get(key)!.push(s);
    }

    const subcards: ServiceSubcard[] = Array.from(bySub.entries()).map(([heading, rows]) => ({
      heading,
      rows: rows.map((s) => ({ name: s.name, price: formatPriceRange(s.price_from, s.price_to) })),
    }));

    const lowestPrice = catServices.length
      ? Math.min(...catServices.map((s) => s.price_from))
      : 0;

    const style = CATEGORY_STYLE[cat.slug] ?? { iconRadius: '50%' };

    return {
      id: cat.id,
      slug: cat.slug,
      title: cat.name,
      desc: cat.description ?? '',
      fromPrice: (lowestPrice / 100).toLocaleString('en-IN'),
      iconRadius: cat.icon_shape ?? style.iconRadius,
      dark: !!style.dark,
      columns: style.columns ?? 3,
      subcards,
    };
  });
}

export async function getComboOffers(): Promise<ComboOfferData[]> {
  const supabase = await createClient();

  const [{ data: combos }, { data: items }] = await Promise.all([
    supabase.from('combo_offers').select('*').eq('status', 'active').order('display_order'),
    supabase.from('combo_offer_items').select('*').order('display_order'),
  ]);

  if (!combos) return [];

  return combos.map((combo) => ({
    id: combo.id,
    title: combo.name,
    tagLabel: combo.tag_line ?? '',
    badge: `Save ${combo.save_percent}%`,
    items: (items ?? []).filter((i) => i.combo_id === combo.id).map((i) => i.description),
    price: `₹${(combo.price / 100).toLocaleString('en-IN')}`,
    originalPrice: `₹${(combo.price_original / 100).toLocaleString('en-IN')}`,
    featured: combo.is_featured,
  }));
}
