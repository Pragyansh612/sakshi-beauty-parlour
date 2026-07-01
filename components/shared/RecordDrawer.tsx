'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface DrawerField {
  label: string;
  value: string;
  key: string;
  editable?: boolean;
  type?: 'text' | 'date' | 'select';
  options?: { value: string; label: string }[];
}

interface RecordDrawerProps {
  isOpen: boolean;
  mode: 'view' | 'edit';
  title: string;
  kind: string;
  fields: DrawerField[];
  onClose: () => void;
  onSave?: (draft: Record<string, string>) => void;
  isSaving?: boolean;
}

export function RecordDrawer({
  isOpen,
  mode,
  title,
  kind,
  fields,
  onClose,
  onSave,
  isSaving = false,
}: RecordDrawerProps) {
  const [draft, setDraft] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      const initial: Record<string, string> = {};
      fields.forEach((f) => {
        initial[f.key] = f.value;
      });
      setDraft(initial);
    }
  }, [isOpen, fields]);

  const handleSave = () => {
    onSave?.(draft);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-[452px] bg-white shadow-2xl flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#e7dcc8]">
              <div>
                <p className="text-xs text-[#8a7b6e] uppercase tracking-[0.14em] font-mono">{kind}</p>
                <h2 className="font-heading text-[22px] font-medium text-[#2e2823] mt-0.5">{title}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-[#6b5f54] hover:text-[#2e2823] transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
              {fields.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label>{field.label}</Label>
                  {mode === 'edit' && field.editable !== false && field.type === 'select' ? (
                    <select
                      value={draft[field.key] ?? ''}
                      onChange={(e) =>
                        setDraft((prev) => ({ ...prev, [field.key]: e.target.value }))
                      }
                      className="flex h-10 w-full rounded-md border border-[#e7dcc8] bg-[#FAF6EF] px-3 py-2 text-sm text-[#2e2823] focus:outline-none focus:ring-2 focus:ring-[#b5904f] focus:border-transparent"
                    >
                      {(field.options ?? []).map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : mode === 'edit' && field.editable !== false ? (
                    <Input
                      type={field.type === 'date' ? 'date' : 'text'}
                      value={draft[field.key] ?? ''}
                      onChange={(e) =>
                        setDraft((prev) => ({ ...prev, [field.key]: e.target.value }))
                      }
                    />
                  ) : (
                    <p className="text-sm text-[#2e2823] py-2 px-3 bg-[#FAF6EF] border border-[#e7dcc8] rounded-md min-h-[40px] flex items-center">
                      {field.value || <span className="text-[#8a7b6e] italic">—</span>}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Footer actions */}
            {mode === 'edit' && (
              <div className="px-6 py-5 border-t border-[#e7dcc8] flex gap-3">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1"
                >
                  {isSaving ? 'Saving…' : 'Save changes'}
                </Button>
                <Button variant="outline" onClick={onClose} disabled={isSaving}>
                  Cancel
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
