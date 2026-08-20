import type { Preset } from "@/lib/db";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

interface FolderFormModalProps {
  open: boolean;
  presets: Preset[];
  onClose: () => void;
  onSave: (name: string, presetIds: number[]) => Promise<void>;
}

export default function FolderFormModal({
  open,
  presets,
  onClose,
  onSave,
}: FolderFormModalProps) {
  const [name, setName] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName("");
      setSelectedIds([]);
    }
  }, [open]);

  const togglePreset = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    setSaving(true);
    try {
      await onSave(trimmed, selectedIds);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute inset-0 z-20 flex flex-col overflow-hidden bg-black/30 p-2 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.form
            onSubmit={handleSubmit}
            className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg bg-white/95 shadow-lg"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 border-b border-black/10 px-3 py-2">
              <h2 className="text-sm font-semibold text-neutral-900">
                New Folder
              </h2>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
              <label className="block">
                <span className="text-xs font-medium text-neutral-500">
                  Folder name
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full select-text rounded-md border-0 bg-black/[0.04] px-2.5 py-1.5 text-sm text-neutral-900 outline-none ring-0 focus:bg-black/[0.06]"
                  autoFocus
                />
              </label>

              <div>
                <span className="text-xs font-medium text-neutral-500">
                  Add presets
                </span>
                {presets.length === 0 ? (
                  <p className="mt-1 text-xs text-neutral-400">
                    No presets yet
                  </p>
                ) : (
                  <ul className="mt-1 max-h-40 overflow-y-auto rounded-md bg-black/[0.03] py-0.5">
                    {presets.map((preset) => (
                      <li key={preset.id}>
                        <label className="flex cursor-pointer items-center gap-2 px-2.5 py-1.5 text-sm text-neutral-800 hover:bg-black/[0.04]">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(preset.id)}
                            onChange={() => togglePreset(preset.id)}
                            className="accent-neutral-900"
                          />
                          <span className="min-w-0 truncate">{preset.title}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="flex shrink-0 justify-end gap-2 border-t border-black/10 px-3 py-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md px-2.5 py-1 text-xs text-neutral-600 transition-colors hover:bg-black/[0.04]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !name.trim()}
                className="rounded-md bg-neutral-900 px-2.5 py-1 text-xs font-medium text-white transition-opacity disabled:opacity-40"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
