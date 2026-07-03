import { createClient } from '@/lib/supabase/server';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import Link from 'next/link';

function formatRevenue(paise: number) {
  const rupees = paise / 100;
  if (rupees >= 100000) return `₹${(rupees / 100000).toFixed(1)}L`;
  return `₹${Math.round(rupees).toLocaleString('en-IN')}`;
}

function formatSlotTime(time: string) {
  const [hourStr, minStr] = time.split(':');
  const hour = parseInt(hourStr, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minStr} ${period}`;
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const today = new Date().toISOString().slice(0, 10);
  const currentMonth = today.slice(0, 7);
  const weekday = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  type ApptRow = {
    id: string;
    status: string;
    artist: string | null;
    created_at: string;
    cancelled_at: string | null;
    customer: { full_name: string; phone: string } | null;
    service: { name: string; price_from: number } | null;
    slot: { slot_date: string; slot_time: string } | null;
  };
  type BookingRow = {
    id: string;
    status: string;
    event_date: string;
    agreed_price: number | null;
    created_at: string;
    cancelled_at: string | null;
    customer: { full_name: string } | null;
    service: { name: string; price_from: number } | null;
  };

  const [apptsRes, bookingsRes] = await Promise.all([
    supabase
      .from('appointments')
      .select(
        'id, status, artist, created_at, cancelled_at, customer:profiles(full_name, phone), service:services(name, price_from), slot:time_slots(slot_date, slot_time)'
      )
      .order('created_at', { ascending: false })
      .limit(200),
    supabase
      .from('bookings')
      .select(
        'id, status, event_date, agreed_price, created_at, cancelled_at, customer:profiles(full_name), service:services(name, price_from)'
      )
      .order('created_at', { ascending: false })
      .limit(200),
  ]);

  const appts = (apptsRes.data ?? []) as unknown as ApptRow[];
  const bookings = (bookingsRes.data ?? []) as unknown as BookingRow[];

  const todaysAppts = appts.filter((a) => a.slot?.slot_date === today);
  const todaysUpcoming = todaysAppts.filter((a) => ['pending', 'confirmed'].includes(a.status));
  const upcomingBookings = bookings.filter(
    (b) => ['pending_approval', 'confirmed', 'in_progress'].includes(b.status) && b.event_date >= today
  );
  const bridalThisMonth = upcomingBookings.filter((b) => b.event_date.startsWith(currentMonth));
  const pendingApprovals = bookings.filter((b) => b.status === 'pending_approval');

  const revenuePaise =
    appts
      .filter((a) => ['confirmed', 'completed'].includes(a.status) && a.slot?.slot_date.startsWith(currentMonth))
      .reduce((sum, a) => sum + (a.service?.price_from ?? 0), 0) +
    bookings
      .filter((b) => ['confirmed', 'in_progress', 'completed'].includes(b.status) && b.event_date.startsWith(currentMonth))
      .reduce((sum, b) => sum + (b.agreed_price ?? b.service?.price_from ?? 0), 0);

  const stats = [
    { label: "Today's appointments", value: String(todaysAppts.length), detail: `${todaysUpcoming.length} still upcoming` },
    { label: 'Upcoming bookings', value: String(upcomingBookings.length), detail: `${bridalThisMonth.length} bridal this month` },
    { label: 'Revenue (this month)', value: formatRevenue(revenuePaise), detail: null },
    { label: 'Pending approvals', value: String(pendingApprovals.length), detail: pendingApprovals.length ? 'Needs review' : 'All caught up', amber: true },
  ];

  const todaySchedule = todaysAppts
    .slice()
    .sort((a, b) => (a.slot?.slot_time ?? '').localeCompare(b.slot?.slot_time ?? ''))
    .slice(0, 8);

  type ActivityEvent = { id: string; text: string; sub: string; at: string; color: string };
  const activity: ActivityEvent[] = [];
  for (const b of bookings.slice(0, 20)) {
    if (b.cancelled_at) {
      activity.push({ id: `${b.id}-c`, text: `Cancellation — ${b.customer?.full_name ?? 'Customer'}`, sub: b.service?.name ?? 'Booking', at: b.cancelled_at, color: '#a8595a' });
    } else {
      activity.push({ id: b.id, text: `New booking — ${b.customer?.full_name ?? 'Customer'}`, sub: b.service?.name ?? 'Booking', at: b.created_at, color: '#3f7a4e' });
    }
  }
  for (const a of appts.slice(0, 20)) {
    if (a.cancelled_at) {
      activity.push({ id: `${a.id}-c`, text: `Cancellation — ${a.customer?.full_name ?? 'Customer'}`, sub: a.service?.name ?? 'Appointment', at: a.cancelled_at, color: '#a8595a' });
    } else {
      activity.push({ id: a.id, text: `New appointment — ${a.customer?.full_name ?? 'Customer'}`, sub: a.service?.name ?? 'Appointment', at: a.created_at, color: '#3d6691' });
    }
  }
  activity.sort((x, y) => new Date(y.at).getTime() - new Date(x.at).getTime());
  const recentActivity = activity.slice(0, 5);

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        subtitle={`${weekday} · Good day, welcome back`}
        actions={
          <Link href="/" className="inline-flex items-center gap-1.5 bg-white text-[#2e2823] border border-[#e2dccf] rounded-[9px] px-[18px] py-2.5 text-[13px] font-medium no-underline hover:border-[#b5904f] hover:text-[#b5904f] transition-colors">
            View site
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-[22px]">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-[#e8e2d7] rounded-[14px] px-[22px] py-5">
            <div className="text-[11.5px] tracking-[0.06em] uppercase text-[#8a7d6e]">{s.label}</div>
            <div className={`font-heading font-semibold text-[32px] md:text-[38px] leading-none mt-2 ${s.amber ? 'text-[#9a7b2e]' : 'text-[#2e2823]'}`}>
              {s.value}
            </div>
            {s.detail && <div className={`text-[11.5px] mt-1.5 ${s.amber ? 'text-[#9a7b2e]' : 'text-[#3f7a4e]'}`}>{s.detail}</div>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-[18px]">
        {/* Today's schedule */}
        <div className="bg-white border border-[#e8e2d7] rounded-[14px] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-[18px] border-b border-[#ece6db]">
            <div className="font-heading text-[21px]">Today&apos;s schedule</div>
            <Link href="/admin/appointments" className="bg-white text-[#2e2823] border border-[#e2dccf] rounded-lg px-3 py-1.5 text-xs font-medium no-underline hover:border-[#b5904f] hover:text-[#b5904f] transition-colors">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {['Time', 'Client', 'Service', 'Artist', 'Status'].map((h) => (
                    <th key={h} className="text-left text-[11px] tracking-[0.06em] uppercase text-[#8a7d6e] font-medium px-4 py-3 border-b border-[#ece6db]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {todaySchedule.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-sm text-[#8a7d6e]">
                      No appointments scheduled for today.
                    </td>
                  </tr>
                )}
                {todaySchedule.map((a) => (
                  <tr key={a.id}>
                    <td className="px-4 py-3.5 border-b border-[#f1ece2] text-[13.5px]">{a.slot ? formatSlotTime(a.slot.slot_time) : '—'}</td>
                    <td className="px-4 py-3.5 border-b border-[#f1ece2] text-[13.5px]">
                      <div>{a.customer?.full_name ?? '—'}</div>
                      <div className="text-[11.5px] text-[#8a7d6e]">{a.customer?.phone ?? ''}</div>
                    </td>
                    <td className="px-4 py-3.5 border-b border-[#f1ece2] text-[13.5px]">{a.service?.name ?? '—'}</td>
                    <td className="px-4 py-3.5 border-b border-[#f1ece2] text-[13.5px]">{a.artist ?? 'Any available'}</td>
                    <td className="px-4 py-3.5 border-b border-[#f1ece2] text-[13.5px]">
                      <StatusBadge status={a.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white border border-[#e8e2d7] rounded-[14px] px-5 py-[18px]">
          <div className="font-heading text-[21px] mb-1.5">Recent activity</div>
          <div className="flex flex-col">
            {recentActivity.length === 0 && <p className="text-sm text-[#8a7d6e] py-3">No recent activity yet.</p>}
            {recentActivity.map((ev, i) => (
              <div
                key={ev.id}
                className={`flex gap-3 py-3.5 ${i < recentActivity.length - 1 ? 'border-b border-[#f1ece2]' : ''}`}
              >
                <div className="w-2 h-2 rounded-full mt-1.5 flex-none" style={{ background: ev.color }} />
                <div>
                  <div className="text-[13px]">
                    {ev.text.split('—')[0]}— <b>{ev.text.split('—')[1]}</b>
                  </div>
                  <div className="text-[11.5px] text-[#8a7d6e]">
                    {ev.sub} · {timeAgo(ev.at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
