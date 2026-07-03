'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { toggleSlotStatus, generateDaySlots, setDayStatus } from '@/actions/admin/slots';

export interface SlotCell {
  state: 'open' | 'full' | 'blocked' | 'none';
  id: string | null;
  date: string;
  time: string;
}

interface SlotRow {
  time: string;
  cells: SlotCell[];
}

const CELL_STYLES: Record<SlotCell['state'], string> = {
  open: 'bg-white border-[#e8e2d7] text-[#2e2823] cursor-pointer hover:border-[#b5904f]',
  full: 'bg-[#f4e6e6] border-[#eed6d6] text-[#a8595a] cursor-not-allowed',
  blocked: 'bg-[#ece8e0] border-[#e8e2d7] text-[#9a9082] line-through cursor-pointer hover:border-[#b5904f]',
  none: 'bg-transparent border-dashed border-[#e8e2d7] text-[#c9c0b0] cursor-not-allowed',
};

const CELL_TEXT: Record<SlotCell['state'], string> = {
  open: 'Open',
  full: 'Full',
  blocked: '—',
  none: '·',
};

function AddSlotModal({ onClose, onGenerated }: { onClose: () => void; onGenerated: () => void }) {
  const [date, setDate] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!date) return;
    setSaving(true);
    const result = await generateDaySlots({ date });
    setSaving(false);
    if (!result.success) {
      toast.error(result.error ?? 'Something went wrong.');
      return;
    }
    toast.success(`Slots created for ${date}.`);
    onGenerated();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-7">
        <h3 className="font-heading text-[22px] font-medium text-[#2e2823] mb-1">Add slot day</h3>
        <p className="text-sm text-[#6b5f54] mb-4">
          Generates a full day of open slots (11:00 AM–8:30 PM, 30-min increments) for the selected date.
        </p>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border border-[#e2dccf] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#b5904f] mb-5"
        />
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 bg-white text-[#2e2823] border border-[#e2dccf] rounded-lg px-4 py-2.5 text-sm font-medium hover:border-[#b5904f] transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !date}
            className="flex-1 bg-[#b5904f] text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-[#a07e3f] transition-colors disabled:opacity-60"
          >
            {saving ? 'Creating…' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function SlotsManager({
  rows,
  dayLabels,
  dayStatuses,
  weekLabel,
  weekOffset,
}: {
  rows: SlotRow[];
  dayLabels: { dow: string; dnum: number; date: string }[];
  dayStatuses: ('open' | 'blocked' | 'empty')[];
  weekLabel: string;
  weekOffset: number;
  todayIso: string;
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pendingDay, setPendingDay] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  async function handleCellClick(cell: SlotCell) {
    if (cell.state !== 'open' && cell.state !== 'blocked') return;
    if (!cell.id) return;
    setPendingId(cell.id);
    const nextStatus = cell.state === 'open' ? 'blocked' : 'open';
    const result = await toggleSlotStatus({ id: cell.id, status: nextStatus });
    setPendingId(null);

    if (!result.success) {
      toast.error(result.error ?? 'Something went wrong.');
      return;
    }
    toast.success(nextStatus === 'blocked' ? 'Slot blocked.' : 'Slot opened.');
    router.refresh();
  }

  async function handleDayToggle(date: string, currentStatus: 'open' | 'blocked' | 'empty') {
    if (currentStatus === 'empty') return;
    setPendingDay(date);
    const nextStatus = currentStatus === 'blocked' ? 'open' : 'blocked';
    const result = await setDayStatus({ date, status: nextStatus });
    setPendingDay(null);

    if (!result.success) {
      toast.error(result.error ?? 'Something went wrong.');
      return;
    }
    toast.success(nextStatus === 'blocked' ? 'Day closed.' : 'Day opened.');
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4 mb-[26px]">
        <div>
          <div className="font-heading font-medium text-[26px] md:text-[32px] leading-none text-[#2e2823]">Slot management</div>
          <div className="text-[13px] text-[#8a7d6e] font-light mt-1">Create slots, edit availability, block time off</div>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="inline-flex bg-[#ece8e0] rounded-[9px] p-[3px] items-center">
            <button
              onClick={() => router.push(`/admin/slots?week=${weekOffset - 1}`)}
              className="text-[12.5px] font-medium px-[15px] py-[7px] rounded-[7px] text-[#7a6f60] hover:text-[#2e2823] transition-colors"
            >
              ‹ Prev
            </button>
            <span className="text-[12.5px] font-medium px-[15px] py-[7px] rounded-[7px] bg-white text-[#2e2823] shadow-sm whitespace-nowrap">
              {weekLabel}
            </span>
            <button
              onClick={() => router.push(`/admin/slots?week=${weekOffset + 1}`)}
              className="text-[12.5px] font-medium px-[15px] py-[7px] rounded-[7px] text-[#7a6f60] hover:text-[#2e2823] transition-colors"
            >
              Next ›
            </button>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#b5904f] text-white rounded-[9px] px-[18px] py-2.5 text-[13px] font-medium hover:bg-[#a07e3f] transition-colors"
          >
            + Add slot
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#e8e2d7] rounded-[14px] px-5 py-5 overflow-x-auto">
        <div className="flex gap-4 mb-4 text-xs text-[#6b5f54] flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-[11px] h-[11px] border border-[#e2dccf] rounded-[3px] bg-white inline-block" /> Open
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-[11px] h-[11px] rounded-[3px] bg-[#f4e6e6] inline-block" /> Fully booked
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-[11px] h-[11px] rounded-[3px] bg-[#ece8e0] inline-block" /> Blocked
          </span>
        </div>

        <div className="min-w-[720px] grid gap-2 items-center" style={{ gridTemplateColumns: '70px repeat(7, 1fr)' }}>
          <div />
          {dayLabels.map((d, i) => {
            const status = dayStatuses[i] ?? 'empty';
            return (
              <div key={d.date} className="text-center">
                <div className="text-[11.5px] text-[#8a7d6e] font-medium mb-1">
                  {d.dow} {d.dnum}
                </div>
                <button
                  onClick={() => handleDayToggle(d.date, status)}
                  disabled={status === 'empty' || pendingDay === d.date}
                  title={status === 'empty' ? 'No slots generated for this day yet' : undefined}
                  className={`w-full text-[10.5px] font-medium rounded-[6px] px-1.5 py-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                    status === 'blocked'
                      ? 'bg-[#ece8e0] text-[#7a6f60] hover:bg-[#e2ddd0]'
                      : 'bg-[#f4e6e6] text-[#a8595a] hover:bg-[#eed6d6]'
                  }`}
                >
                  {pendingDay === d.date ? '…' : status === 'blocked' ? 'Open day' : status === 'empty' ? 'No slots' : 'Close day'}
                </button>
              </div>
            );
          })}
          {rows.map((row) => (
            <div key={row.time} className="contents">
              <div className="text-xs text-[#6b5f54] text-right pr-1">{row.time}</div>
              {row.cells.map((cell) => (
                <button
                  key={`${cell.date}-${cell.time}`}
                  disabled={cell.state === 'full' || cell.state === 'none' || pendingId === cell.id}
                  onClick={() => handleCellClick(cell)}
                  className={`border rounded-[9px] py-2.5 px-1.5 text-center text-[12.5px] font-medium transition-colors disabled:opacity-70 ${CELL_STYLES[cell.state]}`}
                >
                  {pendingId === cell.id ? '…' : CELL_TEXT[cell.state]}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {showAddModal && (
        <AddSlotModal onClose={() => setShowAddModal(false)} onGenerated={() => router.refresh()} />
      )}
    </div>
  );
}
