'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, Pencil, X as CancelIcon } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { RecordDrawer, type DrawerField } from '@/components/shared/RecordDrawer';
import { DeleteConfirmModal } from '@/components/shared/DeleteConfirmModal';
import { updateAppointment, cancelAppointmentAdmin } from '@/actions/admin/appointments';

export interface AdminAppointment {
  id: string;
  reference: string;
  client: string;
  service: string;
  slotDate: string | null;
  when: string;
  artist: string;
  status: string;
  notes: string;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'checked_in', label: 'Checked in' },
  { value: 'in_chair', label: 'In chair' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no_show', label: 'No show' },
];

type Filter = 'all' | 'today' | 'upcoming';

export function AppointmentsManager({ initialAppointments }: { initialAppointments: AdminAppointment[] }) {
  const router = useRouter();
  const [appointments, setAppointments] = useState(initialAppointments);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [drawer, setDrawer] = useState<{ item: AdminAppointment; mode: 'view' | 'edit' } | null>(null);
  const [saving, setSaving] = useState(false);
  const [toCancel, setToCancel] = useState<AdminAppointment | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  const filtered = useMemo(() => {
    let list = appointments;
    if (filter === 'today') list = list.filter((a) => a.slotDate === today);
    if (filter === 'upcoming') list = list.filter((a) => a.slotDate != null && a.slotDate >= today);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (a) => a.client.toLowerCase().includes(q) || a.reference.toLowerCase().includes(q) || a.service.toLowerCase().includes(q)
      );
    }
    return list;
  }, [appointments, filter, search, today]);

  function drawerFields(item: AdminAppointment): DrawerField[] {
    return [
      { key: 'client', label: 'Client', value: item.client, editable: false },
      { key: 'service', label: 'Service', value: item.service, editable: false },
      { key: 'when', label: 'Date & time', value: item.when, editable: false },
      { key: 'artist', label: 'Artist', value: item.artist, editable: true },
      { key: 'status', label: 'Status', value: item.status, editable: true, type: 'select', options: STATUS_OPTIONS },
      { key: 'reference', label: 'Reference', value: item.reference, editable: false },
    ];
  }

  async function handleSave(draft: Record<string, string>) {
    if (!drawer) return;
    setSaving(true);
    const result = await updateAppointment({
      id: drawer.item.id,
      artist: draft.artist,
      status: draft.status as Parameters<typeof updateAppointment>[0]['status'],
    });
    setSaving(false);

    if (!result.success) {
      toast.error(result.error ?? 'Something went wrong.');
      return;
    }

    setAppointments((prev) =>
      prev.map((a) => (a.id === drawer.item.id ? { ...a, artist: draft.artist, status: draft.status } : a))
    );
    setDrawer(null);
    toast.success('Appointment updated.');
    router.refresh();
  }

  async function handleCancel() {
    if (!toCancel) return;
    setCancelling(true);
    const result = await cancelAppointmentAdmin(toCancel.id);
    setCancelling(false);

    if (!result.success) {
      toast.error(result.error ?? 'Something went wrong.');
      return;
    }

    setAppointments((prev) => prev.map((a) => (a.id === toCancel.id ? { ...a, status: 'cancelled' } : a)));
    setToCancel(null);
    toast.success('Appointment cancelled.');
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4 mb-[26px]">
        <div>
          <div className="font-heading font-medium text-[26px] md:text-[32px] leading-none text-[#2e2823]">Appointments</div>
          <div className="text-[13px] text-[#8a7d6e] font-light mt-1">Short-service bookings · view, modify, approve</div>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search client or ref…"
            className="border border-[#e2dccf] rounded-[9px] px-3.5 py-2.5 text-[13px] bg-white outline-none w-[230px] focus:border-[#b5904f]"
          />
          <div className="inline-flex bg-[#ece8e0] rounded-[9px] p-[3px]">
            {(['all', 'today', 'upcoming'] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-[12.5px] font-medium px-[15px] py-[7px] rounded-[7px] transition-colors ${
                  filter === f ? 'bg-white text-[#2e2823] shadow-sm' : 'text-[#7a6f60]'
                }`}
              >
                {f === 'all' ? 'All' : f === 'today' ? 'Today' : 'Upcoming'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#e8e2d7] rounded-[14px] overflow-hidden overflow-x-auto">
        <table className="w-full border-collapse min-w-[720px]">
          <thead>
            <tr>
              {['Ref', 'Client', 'Service', 'Date & time', 'Artist', 'Status', ''].map((h) => (
                <th
                  key={h}
                  className="text-left text-[11px] tracking-[0.06em] uppercase text-[#8a7d6e] font-medium px-4 py-3 border-b border-[#ece6db]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-[#8a7d6e]">
                  No appointments found.
                </td>
              </tr>
            )}
            {filtered.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-3.5 border-b border-[#f1ece2] text-[13.5px] text-[#8a7d6e]">{a.reference}</td>
                <td className="px-4 py-3.5 border-b border-[#f1ece2] text-[13.5px] font-medium">{a.client}</td>
                <td className="px-4 py-3.5 border-b border-[#f1ece2] text-[13.5px]">{a.service}</td>
                <td className="px-4 py-3.5 border-b border-[#f1ece2] text-[13.5px]">{a.when}</td>
                <td className="px-4 py-3.5 border-b border-[#f1ece2] text-[13.5px]">{a.artist}</td>
                <td className="px-4 py-3.5 border-b border-[#f1ece2] text-[13.5px]">
                  <StatusBadge status={a.status} />
                </td>
                <td className="px-4 py-3.5 border-b border-[#f1ece2] text-right">
                  <div className="inline-flex gap-1.5">
                    <button
                      title="View"
                      onClick={() => setDrawer({ item: a, mode: 'view' })}
                      className="w-[30px] h-[30px] rounded-lg border border-[#e2dccf] bg-white inline-flex items-center justify-center text-[#6b5f54] hover:border-[#b5904f] hover:text-[#b5904f] transition-colors"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      title="Edit"
                      onClick={() => setDrawer({ item: a, mode: 'edit' })}
                      className="w-[30px] h-[30px] rounded-lg border border-[#e2dccf] bg-white inline-flex items-center justify-center text-[#6b5f54] hover:border-[#b5904f] hover:text-[#b5904f] transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      title="Cancel"
                      disabled={a.status === 'cancelled'}
                      onClick={() => setToCancel(a)}
                      className="w-[30px] h-[30px] rounded-lg border border-[#e2dccf] bg-white inline-flex items-center justify-center text-[#6b5f54] hover:border-[#b5904f] hover:text-[#b5904f] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <CancelIcon size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <RecordDrawer
        isOpen={!!drawer}
        mode={drawer?.mode ?? 'view'}
        title={drawer?.item.client ?? ''}
        kind="Appointment"
        fields={drawer ? drawerFields(drawer.item) : []}
        onClose={() => setDrawer(null)}
        onSave={handleSave}
        isSaving={saving}
      />

      <DeleteConfirmModal
        isOpen={!!toCancel}
        itemName={toCancel ? `${toCancel.client} — ${toCancel.service}` : ''}
        itemKind="appointment"
        onConfirm={handleCancel}
        onCancel={() => setToCancel(null)}
        isDeleting={cancelling}
      />
    </div>
  );
}
