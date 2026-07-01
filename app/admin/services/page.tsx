import { createClient } from '@/lib/supabase/server';
import { ServicesManager, type AdminService } from '@/components/admin/ServicesManager';

export default async function AdminServicesPage() {
  const supabase = await createClient();

  const [servicesRes, categoriesRes] = await Promise.all([
    supabase
      .from('services')
      .select('id, name, duration_label, price_from, status, category:service_categories(id, name)')
      .order('display_order'),
    supabase.from('service_categories').select('id, name').order('display_order'),
  ]);

  type Row = {
    id: string;
    name: string;
    duration_label: string | null;
    price_from: number;
    status: string;
    category: { id: string; name: string } | null;
  };

  const rows = (servicesRes.data ?? []) as unknown as Row[];
  const categories = categoriesRes.data ?? [];

  const services: AdminService[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    categoryId: r.category?.id ?? '',
    categoryName: r.category?.name ?? '—',
    duration: r.duration_label ?? '—',
    priceFrom: String(Math.round(r.price_from / 100)),
    status: r.status,
  }));

  return <ServicesManager initialServices={services} categories={categories} />;
}
