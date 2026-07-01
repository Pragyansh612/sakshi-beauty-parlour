'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, Pencil, Trash2, Upload } from 'lucide-react';
import { RecordDrawer, type DrawerField } from '@/components/shared/RecordDrawer';
import { DeleteConfirmModal } from '@/components/shared/DeleteConfirmModal';
import { createClient } from '@/lib/supabase/client';
import { getGalleryPublicUrl } from '@/lib/supabase/storage';
import { createGalleryImage, updateGalleryImage, deleteGalleryImage } from '@/actions/admin/gallery';

export interface AdminGalleryImage {
  id: string;
  title: string;
  category: string;
  tag: string;
  section: 'work' | 'achievement';
  storagePath: string;
}

function filenameToTitle(filename: string) {
  return filename
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function GalleryManager({ initialImages }: { initialImages: AdminGalleryImage[] }) {
  const router = useRouter();
  const [images, setImages] = useState(initialImages);
  const [tab, setTab] = useState<'work' | 'achievement'>('work');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [drawer, setDrawer] = useState<{ item: AdminGalleryImage; mode: 'view' | 'edit' } | null>(null);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<AdminGalleryImage | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const visible = useMemo(() => images.filter((i) => i.section === tab), [images, tab]);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    const supabase = createClient();

    for (const file of Array.from(files)) {
      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const storagePath = `${tab}/${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage.from('gallery').upload(storagePath, file, {
        contentType: file.type,
      });

      if (uploadError) {
        toast.error(`Upload failed: ${file.name}`);
        continue;
      }

      const title = filenameToTitle(file.name);
      const result = await createGalleryImage({
        title,
        category: tab === 'work' ? 'Our Work' : 'Achievements',
        tag: tab === 'work' ? 'Work' : 'Achievement',
        section: tab,
        storage_path: storagePath,
      });

      if (!result.success) {
        toast.error(result.error ?? `Could not save ${file.name}.`);
        continue;
      }

      setImages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), title, category: tab === 'work' ? 'Our Work' : 'Achievements', tag: tab === 'work' ? 'Work' : 'Achievement', section: tab, storagePath },
      ]);
      toast.success(`${file.name} uploaded.`);
    }

    setUploading(false);
    router.refresh();
  }

  function drawerFields(item: AdminGalleryImage): DrawerField[] {
    return [
      { key: 'title', label: 'Title', value: item.title, editable: true },
      { key: 'category', label: 'Category', value: item.category, editable: true },
      { key: 'tag', label: 'Tag', value: item.tag, editable: true },
    ];
  }

  async function handleSave(draft: Record<string, string>) {
    if (!drawer) return;
    setSaving(true);
    const result = await updateGalleryImage({
      id: drawer.item.id,
      title: draft.title,
      category: draft.category,
      tag: draft.tag,
    });
    setSaving(false);

    if (!result.success) {
      toast.error(result.error ?? 'Something went wrong.');
      return;
    }

    setImages((prev) =>
      prev.map((img) => (img.id === drawer.item.id ? { ...img, title: draft.title, category: draft.category, tag: draft.tag } : img))
    );
    setDrawer(null);
    toast.success('Image updated.');
    router.refresh();
  }

  async function handleDelete() {
    if (!toDelete) return;
    setDeleting(true);
    const result = await deleteGalleryImage(toDelete.id, toDelete.storagePath);
    setDeleting(false);

    if (!result.success) {
      toast.error(result.error ?? 'Something went wrong.');
      return;
    }

    setImages((prev) => prev.filter((img) => img.id !== toDelete.id));
    setToDelete(null);
    toast.success('Image deleted.');
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4 mb-[26px]">
        <div>
          <div className="font-heading font-medium text-[26px] md:text-[32px] leading-none text-[#2e2823]">Gallery</div>
          <div className="text-[13px] text-[#8a7d6e] font-light mt-1">Upload &amp; organise — Our Work and Achievements</div>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="inline-flex bg-[#ece8e0] rounded-[9px] p-[3px]">
            <button
              onClick={() => setTab('work')}
              className={`text-[12.5px] font-medium px-[15px] py-[7px] rounded-[7px] transition-colors ${
                tab === 'work' ? 'bg-white text-[#2e2823] shadow-sm' : 'text-[#7a6f60]'
              }`}
            >
              Our Work
            </button>
            <button
              onClick={() => setTab('achievement')}
              className={`text-[12.5px] font-medium px-[15px] py-[7px] rounded-[7px] transition-colors ${
                tab === 'achievement' ? 'bg-white text-[#2e2823] shadow-sm' : 'text-[#7a6f60]'
              }`}
            >
              Achievements
            </button>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-[#b5904f] text-white rounded-[9px] px-[18px] py-2.5 text-[13px] font-medium hover:bg-[#a07e3f] transition-colors disabled:opacity-60"
          >
            {uploading ? 'Uploading…' : '⬆ Upload'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={`bg-white border-2 border-dashed rounded-[14px] flex flex-col items-center justify-center min-h-[200px] text-[#9b8e84] cursor-pointer transition-colors ${
            dragOver ? 'border-[#b5904f] bg-[#faf3e6]' : 'border-[#d8cdb8]'
          }`}
        >
          <Upload className="text-[#b5904f]" size={26} />
          <div className="text-[13px] mt-2">{uploading ? 'Uploading…' : 'Upload image'}</div>
          <div className="text-[11px] text-[#a89c8d] mt-0.5">Drag &amp; drop or browse</div>
        </div>

        {visible.length === 0 && (
          <div className="col-span-2 md:col-span-3 flex items-center justify-center text-sm text-[#8a7d6e]">
            No images in this section yet.
          </div>
        )}

        {visible.map((img) => (
          <div key={img.id} className="bg-white border border-[#e8e2d7] rounded-[14px] overflow-hidden">
            <div
              className="h-[140px] bg-cover bg-center"
              style={{ backgroundImage: `url(${getGalleryPublicUrl(img.storagePath)})` }}
            />
            <div className="px-3.5 py-2.5 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[13px] font-medium truncate">{img.title}</div>
                <div className="text-[11px] text-[#8a7d6e] truncate">{img.category}</div>
              </div>
              <div className="flex gap-1.5 flex-none">
                <button
                  title="View"
                  onClick={() => setDrawer({ item: img, mode: 'view' })}
                  className="w-[26px] h-[26px] rounded-lg border border-[#e2dccf] bg-white inline-flex items-center justify-center text-[#6b5f54] hover:border-[#b5904f] hover:text-[#b5904f] transition-colors"
                >
                  <Eye size={12} />
                </button>
                <button
                  title="Edit"
                  onClick={() => setDrawer({ item: img, mode: 'edit' })}
                  className="w-[26px] h-[26px] rounded-lg border border-[#e2dccf] bg-white inline-flex items-center justify-center text-[#6b5f54] hover:border-[#b5904f] hover:text-[#b5904f] transition-colors"
                >
                  <Pencil size={12} />
                </button>
                <button
                  title="Delete"
                  onClick={() => setToDelete(img)}
                  className="w-[26px] h-[26px] rounded-lg border border-[#e2dccf] bg-white inline-flex items-center justify-center text-[#6b5f54] hover:border-[#b5904f] hover:text-[#b5904f] transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <RecordDrawer
        isOpen={!!drawer}
        mode={drawer?.mode ?? 'view'}
        title={drawer?.item.title ?? ''}
        kind="Gallery item"
        fields={drawer ? drawerFields(drawer.item) : []}
        onClose={() => setDrawer(null)}
        onSave={handleSave}
        isSaving={saving}
      />

      <DeleteConfirmModal
        isOpen={!!toDelete}
        itemName={toDelete?.title ?? ''}
        itemKind="image"
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
        isDeleting={deleting}
      />
    </div>
  );
}
