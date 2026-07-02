import { createClient } from '@/lib/supabase/server';
import { ServicesManager, type AdminService } from '@/components/admin/ServicesManager';

export default async function AdminServicesPage() {
  const supabase = await createClient();

  const [servicesRes, categoriesRes] = await Promise.all([
    supabase
      .from('services')
      .select(
        'id, name, sub_category, description, duration_label, price_from, price_to, is_appointment_eligible, is_booking_eligible, display_order, status, category:service_categories(id, name)'
      )
      .order('display_order'),
    supabase.from('service_categories').select('id, name').order('display_order'),
  ]);

  type Row = {
    id: string;
    name: string;
    sub_category: string | null;
    description: string | null;
    duration_label: string | null;
    price_from: number;
    price_to: number | null;
    is_appointment_eligible: boolean;
    is_booking_eligible: boolean;
    display_order: number;
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
    subCategory: r.sub_category ?? '',
    description: r.description ?? '',
    duration: r.duration_label ?? '—',
    priceFrom: String(Math.round(r.price_from / 100)),
    priceTo: r.price_to != null ? String(Math.round(r.price_to / 100)) : '',
    isAppointmentEligible: String(r.is_appointment_eligible),
    isBookingEligible: String(r.is_booking_eligible),
    displayOrder: String(r.display_order),
    status: r.status,
  }));

  return <ServicesManager initialServices={services} categories={categories} />;
}
