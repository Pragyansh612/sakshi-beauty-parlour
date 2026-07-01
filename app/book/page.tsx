import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { EyebrowLabel } from '@/components/shared/EyebrowLabel';
import { BookingWizard } from '@/components/booking/BookingWizard';
import { createClient } from '@/lib/supabase/server';

function formatPrice(fromPaise: number, toPaise: number | null) {
  const from = Math.round(fromPaise / 100);
  if (!toPaise || toPaise === fromPaise) return `₹${from.toLocaleString('en-IN')}`;
  const to = Math.round(toPaise / 100);
  return `₹${from.toLocaleString('en-IN')}–${to.toLocaleString('en-IN')}`;
}

function formatSlotTime(time: string) {
  const [hourStr, minStr] = time.split(':');
  const hour = parseInt(hourStr, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minStr} ${period}`;
}

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default async function BookPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const today = new Date();
  const dateStrings: string[] = [];
  const days = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    dateStrings.push(iso);
    days.push({
      date: iso,
      dow: DOW[d.getDay()],
      dnum: d.getDate(),
      mon: MON[d.getMonth()],
      full: `${DOW[d.getDay()]}, ${d.getDate()} ${MON[d.getMonth()]}`,
    });
  }

  const [servicesRes, slotsRes] = await Promise.all([
    supabase
      .from('services')
      .select('id, name, description, price_from, price_to, duration_label, is_appointment_eligible, is_booking_eligible')
      .eq('status', 'active')
      .or('is_appointment_eligible.eq.true,is_booking_eligible.eq.true')
      .order('display_order'),
    supabase
      .from('time_slots')
      .select('id, slot_date, slot_time, status')
      .in('slot_date', dateStrings)
      .eq('status', 'open')
      .order('slot_time'),
  ]);

  const services = servicesRes.data ?? [];
  const timeSlots = slotsRes.data ?? [];

  let bookedSlotIds = new Set<string>();
  const slotIds = timeSlots.map((s) => s.id);
  if (slotIds.length > 0) {
    const { data: takenAppointments } = await supabase
      .from('appointments')
      .select('slot_id')
      .in('slot_id', slotIds)
      .neq('status', 'cancelled');
    bookedSlotIds = new Set((takenAppointments ?? []).map((a) => a.slot_id));
  }

  const slotsByDate: Record<string, { id: string; label: string; off: boolean }[]> = {};
  for (const slot of timeSlots) {
    if (!slotsByDate[slot.slot_date]) slotsByDate[slot.slot_date] = [];
    slotsByDate[slot.slot_date].push({
      id: slot.id,
      label: formatSlotTime(slot.slot_time),
      off: bookedSlotIds.has(slot.id),
    });
  }

  const apptServices = services
    .filter((s) => s.is_appointment_eligible)
    .map((s) => ({
      id: s.id,
      name: s.name,
      desc: s.description ?? '',
      price: formatPrice(s.price_from, s.price_to),
      metaLabel: s.duration_label ?? '',
    }));

  const bookServices = services
    .filter((s) => s.is_booking_eligible)
    .map((s) => ({
      id: s.id,
      name: s.name,
      desc: s.description ?? '',
      price: formatPrice(s.price_from, s.price_to),
      metaLabel: s.duration_label ?? '',
    }));

  return (
    <>
      <Navbar />

      <main>
        <header className="max-w-[1240px] mx-auto px-6 md:px-11 pt-12 pb-2 text-center">
          <EyebrowLabel className="mb-3.5">Reserve your time</EyebrowLabel>
          <h1 className="font-heading font-medium text-[38px] md:text-[54px] leading-[1.04] text-[#2e2823] m-0">
            Book with <span className="font-script text-[#b5904f] text-[46px] md:text-[64px]">Sakshi</span>
          </h1>
          <p className="text-[14.5px] md:text-[15.5px] font-light text-[#6b5f54] leading-[1.65] mt-3.5 mb-0 max-w-[520px] mx-auto">
            Prefer to talk?{' '}
            <a href="tel:+919876543210" className="text-[#b5904f]">Call us</a> or{' '}
            <a href="https://wa.me/919876543210" className="text-[#b5904f]">WhatsApp</a> — we&apos;re happy to book you in personally.
          </p>
        </header>

        <BookingWizard
          apptServices={apptServices}
          bookServices={bookServices}
          days={days}
          slotsByDate={slotsByDate}
          isAuthenticated={!!user}
        />
      </main>

      <Footer />
    </>
  );
}
