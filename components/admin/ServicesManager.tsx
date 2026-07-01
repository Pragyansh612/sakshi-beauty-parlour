'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { RecordDrawer, type DrawerField } from '@/components/shared/RecordDrawer';
import { DeleteConfirmModal } from '@/components/shared/DeleteConfirmModal';
import { createService, updateService, deleteService } from '@/actions/admin/services';

export interface AdminService {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  duration: string;
  priceFrom: string;
  status: string;
}

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
];

const BLANK: AdminService = {
  id: '',
  name: '',
  categoryId: '',
  categoryName: '',
  duration: '',
  priceFrom: '',
  status: 'active',
};

export function ServicesManager({
  initialServices,
  categories,
}: {
  initialServices: AdminService[];
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [services, setServices] = useState(initialServices);
  const [search, setSearch] = useState('');
  const [drawer, setDrawer] = useState<{ item: AdminService; mode: 'view' | 'edit'; isNew: boolean } | null>(null);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<AdminService | null>(null);
  const [deleting, setDeleting] = useState(false);

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));

  const filtered = useMemo(() => {
    if (!search.trim()) return services;
    const q = search.trim().toLowerCase();
    return services.filter((s) => s.name.toLowerCase().includes(q) || s.categoryName.toLowerCase().includes(q));
  }, [services, search]);

  function drawerFields(item: AdminService, mode: 'view' | 'edit'): DrawerField[] {
    return [
      { key: 'name', label: 'Service name', value: item.name, editable: true },
      {
        key: 'categoryId',
        label: 'Category',
        value: mode === 'edit' ? item.categoryId : item.categoryName,
        editable: true,
        type: 'select',
        options: categoryOptions,
      },
      { key: 'duration', label: 'Duration', value: item.duration, editable: true },
      { key: 'priceFrom', label: 'Price (₹)', value: item.priceFrom, editable: true },
      { key: 'status', label: 'Status', value: item.status, editable: true, type: 'select', options: STATUS_OPTIONS },
    ];
  }

  async function handleSave(draft: Record<string, string>) {
    if (!drawer) return;
    setSaving(true);

    if (drawer.isNew) {
      const result = await createService({
        name: draft.name,
        category_id: draft.categoryId,
        duration_label: draft.duration || undefined,
        price_from: Number(draft.priceFrom || 0),
        status: draft.status as Parameters<typeof createService>[0]['status'],
      });
      setSaving(false);
      if (!result.success) {
        toast.error(result.error ?? 'Something went wrong.');
        return;
      }
      toast.success('Service created.');
      setDrawer(null);
      router.refresh();
      return;
    }

    const result = await updateService({
      id: drawer.item.id,
      name: draft.name,
      category_id: draft.categoryId,
      duration_label: draft.duration,
      price_from: Number(draft.priceFrom || 0),
      status: draft.status as Parameters<typeof updateService>[0]['status'],
    });
    setSaving(false);

    if (!result.success) {
      toast.error(result.error ?? 'Something went wrong.');
      return;
    }

    setServices((prev) =>
      prev.map((s) =>
        s.id === drawer.item.id
          ? {
              ...s,
              name: draft.name,
              categoryId: draft.categoryId,
              categoryName: categories.find((c) => c.id === draft.categoryId)?.name ?? s.categoryName,
              duration: draft.duration,
              priceFrom: draft.priceFrom,
              status: draft.status,
            }
          : s
      )
    );
    setDrawer(null);
    toast.success('Service updated.');
    router.refresh();
  }

  async function handleDelete() {
    if (!toDelete) return;
    setDeleting(true);
    const result = await deleteService(toDelete.id);
    setDeleting(false);

    if (!result.success) {
      toast.error(result.error ?? 'Something went wrong.');
      return;
    }

    setServices((prev) => prev.filter((s) => s.id !== toDelete.id));
    setToDelete(null);
    toast.success('Service deleted.');
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4 mb-[26px]">
        <div>
          <div className="font-heading font-medium text-[26px] md:text-[32px] leading-none text-[#2e2823]">Services</div>
          <div className="text-[13px] text-[#8a7d6e] font-light mt-1">Add, edit, remove &amp; update pricing</div>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search service…"
            className="border border-[#e2dccf] rounded-[9px] px-3.5 py-2.5 text-[13px] bg-white outline-none w-[230px] focus:border-[#b5904f]"
          />
          <button
            onClick={() => setDrawer({ item: { ...BLANK, categoryId: categories[0]?.id ?? '' }, mode: 'edit', isNew: true })}
            className="bg-[#b5904f] text-white rounded-[9px] px-[18px] py-2.5 text-[13px] font-medium hover:bg-[#a07e3f] transition-colors"
          >
            + Add service
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#e8e2d7] rounded-[14px] overflow-hidden overflow-x-auto">
        <table className="w-full border-collapse min-w-[640px]">
          <thead>
            <tr>
              {['Service', 'Category', 'Duration', 'Price', 'Status', ''].map((h) => (
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
                  No services found.
                </td>
              </tr>
            )}
            {filtered.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3.5 border-b border-[#f1ece2] text-[13.5px] font-medium">{s.name}</td>
                <td className="px-4 py-3.5 border-b border-[#f1ece2] text-[13.5px]">
                  <StatusBadge status={s.categoryName} className="bg-[#ece8e0] text-[#7a6f60]" />
                </td>
                <td className="px-4 py-3.5 border-b border-[#f1ece2] text-[13.5px] text-[#6b5f54]">{s.duration}</td>
                <td className="px-4 py-3.5 border-b border-[#f1ece2] text-[13.5px] font-semibold text-[#b5904f]">
                  ₹{Number(s.priceFrom).toLocaleString('en-IN')}
                </td>
                <td className="px-4 py-3.5 border-b border-[#f1ece2] text-[13.5px]">
                  <StatusBadge status={s.status} />
                </td>
                <td className="px-4 py-3.5 border-b border-[#f1ece2] text-right">
                  <div className="inline-flex gap-1.5">
                    <button
                      title="View"
                      onClick={() => setDrawer({ item: s, mode: 'view', isNew: false })}
                      className="w-[30px] h-[30px] rounded-lg border border-[#e2dccf] bg-white inline-flex items-center justify-center text-[#6b5f54] hover:border-[#b5904f] hover:text-[#b5904f] transition-colors"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      title="Edit"
                      onClick={() => setDrawer({ item: s, mode: 'edit', isNew: false })}
                      className="w-[30px] h-[30px] rounded-lg border border-[#e2dccf] bg-white inline-flex items-center justify-center text-[#6b5f54] hover:border-[#b5904f] hover:text-[#b5904f] transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      title="Delete"
                      onClick={() => setToDelete(s)}
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
        title={drawer?.isNew ? 'New service' : drawer?.item.name ?? ''}
        kind="Service"
        fields={drawer ? drawerFields(drawer.item, drawer.mode) : []}
        onClose={() => setDrawer(null)}
        onSave={handleSave}
        isSaving={saving}
      />

      <DeleteConfirmModal
        isOpen={!!toDelete}
        itemName={toDelete?.name ?? ''}
        itemKind="service"
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
        isDeleting={deleting}
      />
    </div>
  );
}
