'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { cancelAppointment } from '@/actions/appointments';
import { cancelBooking } from '@/actions/bookings';

export interface DashboardItem {
  id: string;
  reference: string;
  kind: 'appointment' | 'booking';
  name: string;
  price: string;
  status: string;
  date: string;
  metaLabel: string;
  meta: string;
  artist: string;
  serviceId: string | null;
}

const CANCELLABLE = ['pending', 'confirmed', 'checked_in', 'pending_approval', 'in_progress'];

const CARD_GRADIENTS = [
  'linear-gradient(150deg,#efe1d8,#ecdfce)',
  'linear-gradient(150deg,#f0e2d9,#ece1d0)',
  'linear-gradient(150deg,#f1e2da,#e9d8cd)',
  'linear-gradient(150deg,#f1e2da,#e7d4c7)',
];

function DashboardItemCard({ item, index }: { item: DashboardItem; index: number }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const status = cancelled ? 'cancelled' : item.status;
  const canCancel = !cancelled && CANCELLABLE.includes(item.status);

  async function handleCancel() {
    setCancelling(true);
    const result =
      item.kind === 'appointment'
        ? await cancelAppointment(item.reference)
        : await cancelBooking(item.reference);
    setCancelling(false);
    setConfirming(false);

    if (!result.success) {
      toast.error(result.error ?? 'Something went wrong. Please try again.');
      return;
    }
    setCancelled(true);
    toast.success(`${item.kind === 'appointment' ? 'Appointment' : 'Booking'} cancelled.`);
  }

  function handleReschedule() {
    router.push(`/book?reschedule=${item.reference}`);
  }

  return (
    <div className="bg-white border border-[#eee3d4] rounded-[18px] p-5 md:p-6 flex flex-col md:flex-row gap-5 md:items-center">
      <div
        className="relative overflow-hidden rounded-[14px] flex-none w-full h-[100px] md:w-[118px] md:h-[118px]"
        style={{ background: CARD_GRADIENTS[index % CARD_GRADIENTS.length] }}
      >
        <div
          className="absolute inset-0"
          style={{ backgroundImage: 'repeating-linear-gradient(135deg,rgba(181,144,79,.08) 0 12px,transparent 12px 24px)' }}
        />
        <span className="absolute left-1/2 bottom-2.5 -translate-x-1/2 whitespace-nowrap font-mono text-[8px] tracking-[0.1em] uppercase text-[#7a6a52] bg-white/70 px-2 py-[3px] rounded-[12px]">
          {item.kind === 'appointment' ? 'Appointment' : 'Bridal & Event'}
        </span>
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1.5 flex-wrap">
          <StatusBadge status={status} />
          <span className="font-light text-xs text-[#8a7d6e]">Ref {item.reference}</span>
        </div>
        <h3 className="font-heading text-[22px] md:text-[26px] leading-none text-[#2e2823] m-0">{item.name}</h3>
        <div className="grid grid-cols-2 md:flex gap-x-4 gap-y-3 md:gap-[26px] mt-3">
          <div>
            <div className="font-light text-[11px] tracking-[0.06em] uppercase text-[#8a7d6e]">Date</div>
            <div className="text-sm font-medium mt-0.5">{item.date}</div>
          </div>
          <div>
            <div className="font-light text-[11px] tracking-[0.06em] uppercase text-[#8a7d6e]">{item.metaLabel}</div>
            <div className="text-sm font-medium mt-0.5">{item.meta}</div>
          </div>
          <div>
            <div className="font-light text-[11px] tracking-[0.06em] uppercase text-[#8a7d6e]">Artist</div>
            <div className="text-sm font-medium mt-0.5">{item.artist}</div>
          </div>
          {expanded && (
            <div>
              <div className="font-light text-[11px] tracking-[0.06em] uppercase text-[#8a7d6e]">Price</div>
              <div className="text-sm font-medium mt-0.5">{item.price || '—'}</div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 flex-none md:w-[160px]">
        <div className="flex flex-row md:flex-col gap-2.5">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex-1 md:flex-none inline-flex items-center justify-center rounded-[30px] bg-[#2e2823] text-[#f6ede0] text-[13px] font-medium px-4 py-2.5 transition-opacity hover:opacity-90"
          >
            {expanded ? 'Hide details' : 'View details'}
          </button>
          {canCancel && (
            <button
              onClick={handleReschedule}
              className="flex-1 md:flex-none inline-flex items-center justify-center rounded-[30px] border border-[#d8c6a6] text-[#2e2823] text-[13px] font-medium px-4 py-2.5 hover:border-[#b5904f] hover:text-[#b5904f] transition-colors"
            >
              Reschedule
            </button>
          )}
          {canCancel && !confirming && (
            <button
              onClick={() => setConfirming(true)}
              className="flex-1 md:flex-none inline-flex items-center justify-center rounded-[30px] border border-[#e9d3d3] text-[#b06a6a] text-[13px] font-medium px-4 py-2.5 hover:border-[#b06a6a] transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
        {canCancel && confirming && (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs text-[#b06a6a] text-center m-0">Are you sure?</p>
            <div className="flex gap-1.5">
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 rounded-[30px] bg-[#b06a6a] text-white text-xs font-medium px-3 py-2 disabled:opacity-60"
              >
                {cancelling ? 'Cancelling…' : 'Yes'}
              </button>
              <button
                onClick={() => setConfirming(false)}
                disabled={cancelling}
                className="flex-1 rounded-[30px] border border-[#e2dccf] text-[#2e2823] text-xs font-medium px-3 py-2 disabled:opacity-60"
              >
                No
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function DashboardTabs({
  appointments,
  bookings,
}: {
  appointments: DashboardItem[];
  bookings: DashboardItem[];
}) {
  const [tab, setTab] = useState<'appt' | 'book'>('appt');
  const items = tab === 'appt' ? appointments : bookings;

  return (
    <>
      {/* TABS */}
      <section className="max-w-[1240px] mx-auto px-6 md:px-11 pb-3.5">
        <div className="flex gap-2 bg-[#efe6d6] border border-[#e2d3b8] rounded-[30px] p-[5px] w-fit">
          <button
            onClick={() => setTab('appt')}
            className={`px-[22px] py-[11px] text-[13.5px] font-medium rounded-[24px] transition-all whitespace-nowrap ${
              tab === 'appt' ? 'bg-[#2e2823] text-[#f6ede0]' : 'text-[#9b8e84]'
            }`}
          >
            Appointments
          </button>
          <button
            onClick={() => setTab('book')}
            className={`px-[22px] py-[11px] text-[13.5px] font-medium rounded-[24px] transition-all whitespace-nowrap ${
              tab === 'book' ? 'bg-[#2e2823] text-[#f6ede0]' : 'text-[#9b8e84]'
            }`}
          >
            Bridal &amp; Event Bookings
          </button>
        </div>
      </section>

      {/* LIST */}
      <section className="max-w-[1240px] mx-auto px-6 md:px-11 pt-4.5 pb-10">
        {items.length > 0 ? (
          <div className="flex flex-col gap-4">
            {items.map((item, i) => (
              <DashboardItemCard key={item.id} item={item} index={i} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#eee3d4] rounded-[18px] p-14 text-center">
            <div className="font-script text-[34px] text-[#b5904f] leading-[0.8]">Nothing here yet</div>
            <p className="font-light text-[#6b5f54] text-[15px] my-3">
              You don&apos;t have any {tab === 'appt' ? 'appointments' : 'bookings'} coming up.
            </p>
            <a
              href="/book"
              className="inline-flex items-center justify-center gap-2 bg-[#b5904f] text-white rounded-[30px] px-[26px] py-[13px] font-body font-medium text-[13.5px] no-underline"
            >
              Book now
            </a>
          </div>
        )}
      </section>
    </>
  );
}
