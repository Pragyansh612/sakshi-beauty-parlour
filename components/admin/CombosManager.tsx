'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { RecordDrawer, type DrawerField } from '@/components/shared/RecordDrawer';
import { DeleteConfirmModal } from '@/components/shared/DeleteConfirmModal';
import { createCombo, updateCombo, deleteCombo } from '@/actions/admin/combos';

export interface AdminCombo {
  id: string;
  name: string;
  tagLine: string;
  price: string;
  priceOriginal: string;
  savePercent: string;
  isFeatured: string;
  displayOrder: string;
  status: string;
  items: string;
}

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
];

const BLANK: AdminCombo = {
  id: '',
  name: '',
  tagLine: '',
  price: '',
  priceOriginal: '',
  savePercent: '20',
  isFeatured: 'false',
  displayOrder: '0',
  status: 'active',
  items: '',
};

export function CombosManager({ initialCombos }: { initialCombos: AdminCombo[] }) {
  const router = useRouter();
  const [combos, setCombos] = useState(initialCombos);
  const [search, setSearch] = useState('');
  const [drawer, setDrawer] = useState<{ item: AdminCombo; mode: 'view' | 'edit'; isNew: boolean } | null>(null);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<AdminCombo | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return combos;
    const q = search.trim().toLowerCase();
    return combos.filter((c) => c.name.toLowerCase().includes(q));
  }, [combos, search]);

  function drawerFields(item: AdminCombo): DrawerField[] {
    return [
      { key: 'name', label: 'Combo name', value: item.name, editable: true },
      { key: 'tagLine', label: 'Tag line', value: item.tagLine, editable: true },
      { key: 'price', label: 'Offer price (₹)', value: item.price, editable: true },
      { key: 'priceOriginal', label: 'Original price (₹)', value: item.priceOriginal, editable: true },
      { key: 'savePercent', label: 'Save percent (%)', value: item.savePercent, editable: true },
      { key: 'isFeatured', label: 'Featured combo', value: item.isFeatured, editable: true, type: 'checkbox' },
      { key: 'displayOrder', label: 'Display order', value: item.displayOrder, editable: true },
      { key: 'status', label: 'Status', value: item.status, editable: true, type: 'select', options: STATUS_OPTIONS },
      { key: 'items', label: 'Included items (one per line)', value: item.items, editable: true, type: 'textarea' },
    ];
  }

  function toPayload(draft: Record<string, string>) {
    return {
      name: draft.name,
      tag_line: draft.tagLine || undefined,
      price: Number(draft.price || 0),
      price_original: Number(draft.priceOriginal || 0),
      save_percent: Number(draft.savePercent || 0),
      is_featured: draft.isFeatured === 'true',
      display_order: Number(draft.displayOrder || 0),
      status: draft.status as Parameters<typeof createCombo>[0]['status'],
      items: draft.items
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
    };
  }

  async function handleSave(draft: Record<string, string>) {
    if (!drawer) return;
    setSaving(true);
    const payload = toPayload(draft);

    if (drawer.isNew) {
      const result = await createCombo(payload);
      setSaving(false);
      if (!result.success) {
        toast.error(result.error ?? 'Something went wrong.');
        return;
      }
      toast.success('Combo created.');
      setDrawer(null);
      router.refresh();
      return;
    }

    const result = await updateCombo({ id: drawer.item.id, ...payload });
    setSaving(false);

    if (!result.success) {
      toast.error(result.error ?? 'Something went wrong.');
      return;
    }

    setCombos((prev) =>
      prev.map((c) =>
        c.id === drawer.item.id
          ? {
              ...c,
              name: draft.name,
              tagLine: draft.tagLine,
              price: draft.price,
              priceOriginal: draft.priceOriginal,
              savePercent: draft.savePercent,
              isFeatured: draft.isFeatured,
              displayOrder: draft.displayOrder,
              status: draft.status,
              items: draft.items,
            }
          : c
      )
    );
    setDrawer(null);
    toast.success('Combo updated.');
    router.refresh();
  }

  async function handleDelete() {
    if (!toDelete) return;
    setDeleting(true);
    const result = await deleteCombo(toDelete.id);
    setDeleting(false);

    if (!result.success) {
      toast.error(result.error ?? 'Something went wrong.');
      return;
    }

    setCombos((prev) => prev.filter((c) => c.id !== toDelete.id));
    setToDelete(null);
    toast.success('Combo deleted.');
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4 mb-[26px]">
        <div>
          <div className="font-heading font-medium text-[26px] md:text-[32px] leading-none text-[#2e2823]">Combo Offers</div>
          <div className="text-[13px] text-[#8a7d6e] font-light mt-1">Bundle packages shown on the Services page</div>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search combo…"
            className="border border-[#e2dccf] rounded-[9px] px-3.5 py-2.5 text-[13px] bg-white outline-none w-[230px] focus:border-[#b5904f]"
          />
          <button
            onClick={() => setDrawer({ item: { ...BLANK }, mode: 'edit', isNew: true })}
            className="bg-[#b5904f] text-white rounded-[9px] px-[18px] py-2.5 text-[13px] font-medium hover:bg-[#a07e3f] transition-colors"
          >
            + Add combo
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#e8e2d7] rounded-[14px] overflow-hidden overflow-x-auto">
        <table className="w-full border-collapse min-w-[640px]">
          <thead>
            <tr>
              {['Combo', 'Price', 'Original', 'Save %', 'Status', ''].map((h) => (
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
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-[#8a7d6e]">
                  No combo offers found.
                </td>
              </tr>
            )}
            {filtered.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3.5 border-b border-[#f1ece2] text-[13.5px] font-medium">{c.name}</td>
                <td className="px-4 py-3.5 border-b border-[#f1ece2] text-[13.5px] font-semibold text-[#b5904f]">
                  ₹{Number(c.price).toLocaleString('en-IN')}
                </td>
                <td className="px-4 py-3.5 border-b border-[#f1ece2] text-[13.5px] text-[#9b8e84] line-through">
                  ₹{Number(c.priceOriginal).toLocaleString('en-IN')}
                </td>
                <td className="px-4 py-3.5 border-b border-[#f1ece2] text-[13.5px]">{c.savePercent}%</td>
                <td className="px-4 py-3.5 border-b border-[#f1ece2] text-[13.5px]">
                  <StatusBadge status={c.status} />
                </td>
                <td className="px-4 py-3.5 border-b border-[#f1ece2] text-right">
                  <div className="inline-flex gap-1.5">
                    <button
                      title="View"
                      onClick={() => setDrawer({ item: c, mode: 'view', isNew: false })}
                      className="w-[30px] h-[30px] rounded-lg border border-[#e2dccf] bg-white inline-flex items-center justify-center text-[#6b5f54] hover:border-[#b5904f] hover:text-[#b5904f] transition-colors"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      title="Edit"
                      onClick={() => setDrawer({ item: c, mode: 'edit', isNew: false })}
                      className="w-[30px] h-[30px] rounded-lg border border-[#e2dccf] bg-white inline-flex items-center justify-center text-[#6b5f54] hover:border-[#b5904f] hover:text-[#b5904f] transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      title="Delete"
                      onClick={() => setToDelete(c)}
                      className="w-[30px] h-[30px] rounded-lg border border-[#e2dccf] bg-white inline-flex items-center justify-center text-[#6b5f54] hover:border-[#b5904f] hover:text-[#b5904f] transition-colors"
                    >
                      <Trash2 size={14} />
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
        title={drawer?.isNew ? 'New combo' : drawer?.item.name ?? ''}
        kind="Combo offer"
        fields={drawer ? drawerFields(drawer.item) : []}
        onClose={() => setDrawer(null)}
        onSave={handleSave}
        isSaving={saving}
      />

      <DeleteConfirmModal
        isOpen={!!toDelete}
        itemName={toDelete?.name ?? ''}
        itemKind="combo offer"
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
        isDeleting={deleting}
      />
    </div>
  );
}
