import { createClient } from '@/lib/supabase/server';
import { BookingsManager, type AdminBooking } from '@/components/admin/BookingsManager';

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatEventDate(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return `${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}`;
}

function formatValue(paise: number | null) {
  if (!paise) return 'TBD';
  return `₹${Math.round(paise / 100).toLocaleString('en-IN')}`;
}

export default async function AdminBookingsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('bookings')
    .select(
      'id, reference, artist, status, event_date, event_type, venue, guests_count, style_notes, wants_trial, agreed_price, sessions_total, sessions_completed, admin_notes, customer:profiles(full_name, phone), service:services(id, name)'
    )
    .order('created_at', { ascending: false });

  type Row = {
    id: string;
    reference: string;
    artist: string | null;
    status: string;
    event_date: string;
    event_type: string | null;
    venue: string | null;
    guests_count: string | null;
    style_notes: string | null;
    wants_trial: boolean;
    agreed_price: number | null;
    sessions_total: number | null;
    sessions_completed: number;
    admin_notes: string | null;
    customer: { full_name: string; phone: string } | null;
    service: { id: string; name: string } | null;
  };

  const rows = (data ?? []) as unknown as Row[];

  const bookings: AdminBooking[] = rows.map((r) => ({
    id: r.id,
    reference: r.reference,
    title: r.service?.name ?? 'Booking',
    client: r.customer?.full_name ?? '—',
    phone: r.customer?.phone ?? '—',
    detail: [r.event_type, r.venue, r.wants_trial ? 'trial requested' : null].filter(Boolean).join(' · ') || 'To be discussed',
    date: formatEventDate(r.event_date),
    value: formatValue(r.agreed_price),
    status: r.status,
    artist: r.artist ?? '',
    adminNotes: r.admin_notes ?? '',
    agreedPrice: r.agreed_price != null ? String(Math.round(r.agreed_price / 100)) : '',
    sessionsTotal: r.sessions_total,
    sessionsCompleted: r.sessions_completed,
  }));

  return <BookingsManager initialBookings={bookings} />;
}
