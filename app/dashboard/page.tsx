import { createClient } from '@/lib/supabase/server';
import { EyebrowLabel } from '@/components/shared/EyebrowLabel';
import { DashboardTabs, type DashboardItem } from '@/components/dashboard/DashboardTabs';

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return `${DOW[d.getDay()]}, ${d.getDate()} ${MON[d.getMonth()]}`;
}

function formatSlotTime(time: string) {
  const [hourStr, minStr] = time.split(':');
  const hour = parseInt(hourStr, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minStr} ${period}`;
}

function formatPrice(fromPaise: number, toPaise: number | null) {
  const from = Math.round(fromPaise / 100);
  if (!toPaise || toPaise === fromPaise) return `₹${from.toLocaleString('en-IN')}`;
  const to = Math.round(toPaise / 100);
  return `₹${from.toLocaleString('en-IN')}–${to.toLocaleString('en-IN')}`;
}

const APPT_ACTIVE = ['pending', 'confirmed', 'checked_in', 'in_chair'];
const BOOKING_ACTIVE = ['pending_approval', 'confirmed', 'in_progress'];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [profileRes, apptsRes, bookingsRes] = await Promise.all([
    supabase.from('profiles').select('full_name').eq('id', user!.id).single(),
    supabase
      .from('appointments')
      .select(
        'id, reference, artist, status, created_at, service:services(id, name, price_from, price_to), slot:time_slots(slot_date, slot_time)'
      )
      .eq('customer_id', user!.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('bookings')
      .select(
        'id, reference, artist, status, event_date, event_type, sessions_total, sessions_completed, created_at, service:services(id, name, price_from, price_to)'
      )
      .eq('customer_id', user!.id)
      .order('created_at', { ascending: false }),
  ]);

  const fullName = profileRes.data?.full_name ?? 'there';
  const firstName = fullName.split(' ')[0];

  type ApptRow = {
    id: string;
    reference: string;
    artist: string | null;
    status: string;
    created_at: string;
    service: { id: string; name: string; price_from: number; price_to: number | null } | null;
    slot: { slot_date: string; slot_time: string } | null;
  };
  type BookingRow = {
    id: string;
    reference: string;
    artist: string | null;
    status: string;
    event_date: string;
    event_type: string | null;
    sessions_total: number | null;
    sessions_completed: number;
    created_at: string;
    service: { id: string; name: string; price_from: number; price_to: number | null } | null;
  };

  const apptRows = (apptsRes.data ?? []) as unknown as ApptRow[];
  const bookingRows = (bookingsRes.data ?? []) as unknown as BookingRow[];

  const appointments: DashboardItem[] = apptRows.map((a) => ({
    id: a.id,
    reference: a.reference,
    kind: 'appointment',
    name: a.service?.name ?? 'Service',
    price: a.service ? formatPrice(a.service.price_from, a.service.price_to) : '',
    status: a.status,
    date: a.slot ? formatDate(a.slot.slot_date) : '—',
    metaLabel: 'Time',
    meta: a.slot ? formatSlotTime(a.slot.slot_time) : '—',
    artist: a.artist ?? 'Any available',
    serviceId: a.service?.id ?? null,
  }));

  const bookings: DashboardItem[] = bookingRows.map((b) => ({
    id: b.id,
    reference: b.reference,
    kind: 'booking',
    name: b.service?.name ?? 'Service',
    price: b.service ? formatPrice(b.service.price_from, b.service.price_to) : '',
    status: b.status,
    date: formatDate(b.event_date),
    metaLabel: b.sessions_total ? 'Sessions' : 'Event type',
    meta: b.sessions_total
      ? `${b.sessions_completed} of ${b.sessions_total} done`
      : b.event_type || 'To be discussed',
    artist: b.artist ?? 'Sakshi (Lead)',
    serviceId: b.service?.id ?? null,
  }));

  const today = new Date().toISOString().slice(0, 10);
  const currentMonth = today.slice(0, 7);

  const upcomingCount =
    apptRows.filter((a) => APPT_ACTIVE.includes(a.status) && a.slot && a.slot.slot_date >= today).length +
    bookingRows.filter((b) => BOOKING_ACTIVE.includes(b.status) && b.event_date >= today).length;

  const thisMonthCount =
    apptRows.filter((a) => APPT_ACTIVE.includes(a.status) && a.slot && a.slot.slot_date.startsWith(currentMonth))
      .length +
    bookingRows.filter((b) => BOOKING_ACTIVE.includes(b.status) && b.event_date.startsWith(currentMonth)).length;

  const completedCount =
    apptRows.filter((a) => a.status === 'completed').length +
    bookingRows.filter((b) => b.status === 'completed').length;

  const stats = [
    { label: 'Upcoming', value: String(upcomingCount) },
    { label: 'This month', value: String(thisMonthCount) },
    { label: 'Completed', value: String(completedCount) },
  ];

  return (
    <>
      {/* GREETING */}
      <header className="max-w-[1240px] mx-auto px-6 md:px-11 pt-11 pb-6 flex items-end justify-between flex-wrap gap-5">
        <div>
          <EyebrowLabel className="mb-3">Your account</EyebrowLabel>
          <h1 className="font-heading font-medium text-[34px] md:text-[48px] leading-[1.03] text-[#2e2823] m-0">
            Hello, <span className="font-script text-[#b5904f] text-[40px] md:text-[58px]">{firstName}</span>
          </h1>
          <p className="font-light text-[#6b5f54] text-[15px] mt-2 leading-[1.65]">
            Here&apos;s what&apos;s coming up. Manage everything from one place.
          </p>
        </div>
        <a
          href="/book"
          className="inline-flex items-center justify-center gap-2 bg-[#b5904f] text-white rounded-[30px] px-[26px] py-[13px] font-body font-medium text-[13.5px] tracking-[0.02em] no-underline transition-all hover:-translate-y-px hover:shadow-[0_12px_26px_-10px_rgba(181,144,79,.7)]"
        >
          + New booking
        </a>
      </header>

      {/* STAT STRIP */}
      <section className="max-w-[1240px] mx-auto px-6 md:px-11 pb-7">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white border border-[#eee3d4] rounded-[18px] px-6 py-[22px]">
              <div className="font-light text-xs tracking-[0.08em] uppercase text-[#6b5f54]">{s.label}</div>
              <div className="font-heading text-[34px] mt-1.5 text-[#2e2823]">{s.value}</div>
            </div>
          ))}
          <div className="bg-[#2e2823] border border-[#2e2823] rounded-[18px] px-6 py-[22px]">
            <div className="font-light text-xs tracking-[0.08em] uppercase text-[#cdbfae]">Loyalty</div>
            <div className="font-heading text-[34px] mt-1.5 text-[#d9b97e]">Gold</div>
          </div>
        </div>
      </section>

      <DashboardTabs appointments={appointments} bookings={bookings} />

      {/* HELP STRIP */}
      <section className="max-w-[1240px] mx-auto px-6 md:px-11 pb-[74px]">
        <div className="bg-[#2e2823] rounded-[24px] px-8 md:px-[50px] py-[42px] flex items-center justify-between flex-wrap gap-6">
          <div>
            <h2 className="font-heading text-[#f6ede0] text-[26px] md:text-[30px] m-0">Need to change something?</h2>
            <p className="text-[#cdbfae] font-light text-sm mt-1.5">
              Call or WhatsApp us and we&apos;ll sort it out right away.
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href="tel:+918962339467"
              className="inline-flex items-center justify-center gap-2 bg-[#b5904f] text-white rounded-[30px] px-[26px] py-[13px] font-body font-medium text-[13.5px] no-underline"
            >
              ☎ Call now
            </a>
            <a
              href="https://wa.me/919179176465"
              className="inline-flex items-center justify-center gap-2 border border-[#5a5048] text-[#f6ede0] rounded-[30px] px-[26px] py-[13px] font-body font-medium text-[13.5px] no-underline"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
