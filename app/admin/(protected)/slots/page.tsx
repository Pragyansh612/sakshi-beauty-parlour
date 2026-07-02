import { createClient } from '@/lib/supabase/server';
import { SlotsManager, type SlotCell } from '@/components/admin/SlotsManager';

const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function startOfWeek(offsetWeeks: number) {
  const now = new Date();
  const day = now.getDay(); // 0 = Mon
  const diffToMonday = (day + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diffToMonday + offsetWeeks * 7);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function formatSlotTime(time: string) {
  const [hourStr, minStr] = time.split(':');
  const hour = parseInt(hourStr, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minStr} ${period}`;
}

const OPEN_HOUR = 11;
const CLOSE_HOUR = 20.5;

function buildSlotTimes(): string[] {
  const times: string[] = [];
  for (let h = OPEN_HOUR; h <= CLOSE_HOUR; h += 0.5) {
    const hour = Math.floor(h);
    const minute = h % 1 === 0 ? '00' : '30';
    times.push(`${String(hour).padStart(2, '0')}:${minute}:00`);
  }
  return times;
}

export default async function AdminSlotsPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  const weekOffset = week ? parseInt(week, 10) || 0 : 0;

  const monday = startOfWeek(weekOffset);
  const weekDates: string[] = [];
  const dayLabels: { dow: string; dnum: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekDates.push(d.toISOString().slice(0, 10));
    dayLabels.push({ dow: DOW[i], dnum: d.getDate() });
  }

  const supabase = await createClient();
  const [slotsRes, apptsRes] = await Promise.all([
    supabase.from('time_slots').select('id, slot_date, slot_time, status').in('slot_date', weekDates),
    supabase.from('appointments').select('slot_id').neq('status', 'cancelled'),
  ]);

  const slots = slotsRes.data ?? [];
  const bookedSlotIds = new Set((apptsRes.data ?? []).map((a) => a.slot_id));

  const slotMap = new Map<string, { id: string; status: string }>();
  for (const s of slots) {
    slotMap.set(`${s.slot_date}_${s.slot_time}`, { id: s.id, status: s.status });
  }

  const times = buildSlotTimes();
  const rows = times.map((time) => ({
    time: formatSlotTime(time),
    cells: weekDates.map((date): SlotCell => {
      const match = slotMap.get(`${date}_${time}`);
      if (!match) return { state: 'none', id: null, date, time };
      if (match.status === 'blocked') return { state: 'blocked', id: match.id, date, time };
      if (bookedSlotIds.has(match.id)) return { state: 'full', id: match.id, date, time };
      return { state: 'open', id: match.id, date, time };
    }),
  }));

  const weekLabel = `Week of ${dayLabels[0].dnum} ${MON[new Date(monday).getMonth()]}`;

  return (
    <SlotsManager
      rows={rows}
      dayLabels={dayLabels}
      weekLabel={weekLabel}
      weekOffset={weekOffset}
      todayIso={new Date().toISOString().slice(0, 10)}
    />
  );
}
