'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { RecordDrawer, type DrawerField } from '@/components/shared/RecordDrawer';
import { DeleteConfirmModal } from '@/components/shared/DeleteConfirmModal';
import { updateBooking, deleteBookingAdmin } from '@/actions/admin/bookings';

export interface AdminBooking {
  id: string;
  reference: string;
  title: string;
  client: string;
  phone: string;
  detail: string;
  date: string;
  value: string;
  status: string;
  artist: string;
  adminNotes: string;
  agreedPrice: string;
  sessionsTotal: number | null;
  sessionsCompleted: number;
}

const STATUS_OPTIONS = [
  { value: 'pending_approval', label: 'Pending approval' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const CTA_LABEL: Record<string, string> = {
  pending_approval: 'Approve',
  confirmed: 'Manage',
  in_progress: 'Update',
  completed: 'View',
  cancelled: 'View',
};

const CARD_GRADIENTS = [
  'linear-gradient(150deg,#f1e2da,#e7d4c7)',
  'linear-gradient(150deg,#efe0d6,#ecdccb)',
  'linear-gradient(150deg,#f0e2d9,#ece1d0)',
];

export function BookingsManager({ initialBookings }: { initialBookings: AdminBooking[] }) {
  const router = useRouter();
  const [bookings, setBookings] = useState(initialBookings);
  const [search, setSearch] = useState('');
  const [drawer, setDrawer] = useState<{ item: AdminBooking; mode: 'view' | 'edit' } | null>(null);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<AdminBooking | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return bookings;
    const q = search.trim().toLowerCase();
    return bookings.filter(
      (b) => b.client.toLowerCase().includes(q) || b.reference.toLowerCase().includes(q) || b.title.toLowerCase().includes(q)
    );
  }, [bookings, search]);

  function drawerFields(item: AdminBooking): DrawerField[] {
    return [
      { key: 'title', label: 'Booking', value: item.title, editable: false },
      { key: 'client', label: 'Client', value: `${item.client} · ${item.phone}`, editable: false },
      { key: 'detail', label: 'Details', value: item.detail, editable: false },
      { key: 'date', label: 'Event date', value: item.date, editable: false },
      { key: 'artist', label: 'Artist', value: item.artist, editable: true },
      { key: 'agreedPrice', label: 'Agreed price (₹)', value: item.agreedPrice, editable: true },
      { key: 'status', label: 'Status', value: item.status, editable: true, type: 'select', options: STATUS_OPTIONS },
      { key: 'adminNotes', label: 'Admin notes', value: item.adminNotes, editable: true },
      { key: 'reference', label: 'Reference', value: item.reference, editable: false },
    ];
  }

  async function handleSave(draft: Record<string, string>) {
    if (!drawer) return;
    setSaving(true);
    const result = await updateBooking({
      id: drawer.item.id,
      artist: draft.artist,
      status: draft.status as Parameters<typeof updateBooking>[0]['status'],
      admin_notes: draft.adminNotes,
      agreed_price: draft.agreedPrice ? Number(draft.agreedPrice) : undefined,
    });
    setSaving(false);

    if (!result.success) {
      toast.error(result.error ?? 'Something went wrong.');
      return;
    }

    setBookings((prev) =>
      prev.map((b) =>
        b.id === drawer.item.id
          ? {
              ...b,
              artist: draft.artist,
              status: draft.status,
              adminNotes: draft.adminNotes,
              agreedPrice: draft.agreedPrice,
              value: draft.agreedPrice ? `₹${Number(draft.agreedPrice).toLocaleString('en-IN')}` : b.value,
            }
          : b
      )
    );
    setDrawer(null);
    toast.success('Booking updated.');
    router.refresh();
  }

  async function handleDelete() {
    if (!toDelete) return;
    setDeleting(true);
    const result = await deleteBookingAdmin(toDelete.id);
    setDeleting(false);

    if (!result.success) {
      toast.error(result.error ?? 'Something went wrong.');
      return;
    }

    setBookings((prev) => prev.filter((b) => b.id !== toDelete.id));
    setToDelete(null);
    toast.success('Booking deleted.');
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4 mb-[26px]">
        <div>
          <div className="font-heading font-medium text-[26px] md:text-[32px] leading-none text-[#2e2823]">
            Bridal &amp; Event Bookings
          </div>
          <div className="text-[13px] text-[#8a7d6e] font-light mt-1">Special-occasion bookings · approve &amp; manage</div>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search booking…"
          className="border border-[#e2dccf] rounded-[9px] px-3.5 py-2.5 text-[13px] bg-white outline-none w-[230px] focus:border-[#b5904f]"
        />
      </div>

      <div className="flex flex-col gap-3.5">
        {filtered.length === 0 && (
          <div className="bg-white border border-[#e8e2d7] rounded-[14px] px-6 py-10 text-center text-sm text-[#8a7d6e]">
            No bookings found.
          </div>
        )}
        {filtered.map((b, i) => (
          <div key={b.id} className="bg-white border border-[#e8e2d7] rounded-[14px] p-5 flex flex-col md:flex-row gap-5 md:items-center">
            <div
              className="w-full h-[80px] md:w-[84px] md:h-[84px] rounded-[11px] flex-none"
              style={{ background: CARD_GRADIENTS[i % CARD_GRADIENTS.length] }}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <StatusBadge status={b.status} />
                <span className="text-[11.5px] text-[#8a7d6e]">{b.reference}</span>
              </div>
              <div className="font-heading font-semibold text-[19px] md:text-[21px] mt-1.5">{b.title}</div>
              <div className="text-[12.5px] text-[#8a7d6e] mt-0.5">
                {b.client} · {b.detail}
              </div>
            </div>
            <div className="grid grid-cols-2 md:flex gap-x-4 gap-y-2 md:gap-6">
              <div className="text-right">
                <div className="text-[11.5px] text-[#8a7d6e] uppercase tracking-[0.05em]">Event date</div>
                <div className="font-medium text-sm mt-0.5">{b.date}</div>
              </div>
              <div className="text-right">
                <div className="text-[11.5px] text-[#8a7d6e] uppercase tracking-[0.05em]">Value</div>
                <div className="font-heading font-semibold text-[16px] text-[#b5904f] mt-0.5">{b.value}</div>
              </div>
            </div>
            <div className="flex flex-row md:flex-col gap-1.5 md:w-[132px]">
              <button
                onClick={() => setDrawer({ item: b, mode: 'edit' })}
                className="flex-1 bg-[#b5904f] text-white rounded-lg px-3 py-2 text-xs font-medium hover:bg-[#a07e3f] transition-colors"
              >
                {CTA_LABEL[b.status] ?? 'Manage'}
              </button>
              <button
                onClick={() => setDrawer({ item: b, mode: 'view' })}
                className="flex-1 bg-white text-[#2e2823] border border-[#e2dccf] rounded-lg px-3 py-2 text-xs font-medium hover:border-[#b5904f] hover:text-[#b5904f] transition-colors"
              >
                View details
              </button>
              <button
                onClick={() => setToDelete(b)}
                className="flex-1 bg-white text-[#a8595a] border border-[#eed6d6] rounded-lg px-3 py-2 text-xs font-medium hover:bg-[#f4e6e6] transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <RecordDrawer
        isOpen={!!drawer}
        mode={drawer?.mode ?? 'view'}
        title={drawer?.item.title ?? ''}
        kind="Booking"
        fields={drawer ? drawerFields(drawer.item) : []}
        onClose={() => setDrawer(null)}
        onSave={handleSave}
        isSaving={saving}
      />

      <DeleteConfirmModal
        isOpen={!!toDelete}
        itemName={toDelete ? `${toDelete.client} — ${toDelete.title}` : ''}
        itemKind="booking"
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
        isDeleting={deleting}
      />
    </div>
  );
}
