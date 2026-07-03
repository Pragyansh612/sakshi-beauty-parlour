import { createClient } from '@/lib/supabase/server';
import { AppointmentsManager, type AdminAppointment } from '@/components/admin/AppointmentsManager';

function formatSlotTime(time: string) {
  const [hourStr, minStr] = time.split(':');
  const hour = parseInt(hourStr, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minStr} ${period}`;
}

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatSlotDate(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return `${d.getDate()} ${MON[d.getMonth()]}`;
}

export default async function AdminAppointmentsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('appointments')
    .select(
      'id, reference, artist, status, notes, customer:profiles(full_name, phone), service:services(id, name), slot:time_slots(slot_date, slot_time)'
    )
    .order('created_at', { ascending: false });

  type Row = {
    id: string;
    reference: string;
    artist: string | null;
    status: string;
    notes: string | null;
    customer: { full_name: string; phone: string } | null;
    service: { id: string; name: string } | null;
    slot: { slot_date: string; slot_time: string } | null;
  };

  const rows = (data ?? []) as unknown as Row[];

  const appointments: AdminAppointment[] = rows.map((r) => ({
    id: r.id,
    reference: r.reference,
    client: r.customer?.full_name ?? '—',
    phone: r.customer?.phone ?? '—',
    service: r.service?.name ?? '—',
    slotDate: r.slot?.slot_date ?? null,
    when: r.slot ? `${formatSlotDate(r.slot.slot_date)} · ${formatSlotTime(r.slot.slot_time)}` : '—',
    artist: r.artist ?? 'Any available',
    status: r.status,
    notes: r.notes ?? '',
  }));

  return <AppointmentsManager initialAppointments={appointments} />;
}
