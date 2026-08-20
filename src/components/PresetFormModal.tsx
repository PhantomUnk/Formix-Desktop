import type { Preset } from "@/lib/db";
import { extractPlaceholders } from "@/lib/template";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

interface PresetFormModalProps {
  open: boolean;
  preset: Preset | null;
  onClose: () => void;
  onSave: (title: string, template: string) => Promise<void>;
}

export default function PresetFormModal({
  open,
  preset,
  onClose,
  onSave,
}: PresetFormModalProps) {
  const [title, setTitle] = useState("");
  const [template, setTemplate] = useState("");
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const placeholders = useMemo(() => extractPlaceholders(template), [template]);

  useEffect(() => {
    if (open) {
      setTitle(preset?.title ?? "");
      setTemplate(preset?.template ?? "");
    }
  }, [open, preset]);

  const insertAtCursor = (name: string) => {
    const el = textareaRef.current;
    const insertion = `{{${name}}}`;
    const start = el?.selectionStart ?? template.length;
    const end = el?.selectionEnd ?? template.length;
    const nextTemplate =
      template.slice(0, start) + insertion + template.slice(end);

    setTemplate(nextTemplate);

    requestAnimationFrame(() => {
      const pos = start + insertion.length;
      el?.focus();
      el?.setSelectionRange(pos, pos);
    });
  };

  const handleAddTextField = () => {
    // + Text Field button click handler
    let maxNumber = 0;

    for (const name of placeholders) {
      const match = name.match(/^Text Field (\d+)$/);
      if (match) {
        maxNumber = Math.max(maxNumber, Number(match[1]));
      }
    }

    insertAtCursor(`Text Field ${maxNumber + 1}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedTemplate = template.trim();
    if (!trimmedTitle || !trimmedTemplate) return;

    setSaving(true);
    try {
      await onSave(trimmedTitle, trimmedTemplate);
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
                {preset ? "Edit Preset" : "New Preset"}
              </h2>
            </div>

            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
              <label className="block">
                <span className="text-xs font-medium text-neutral-500">
                  Title
                </span>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full select-text rounded-md border-0 bg-black/[0.04] px-2.5 py-1.5 text-sm text-neutral-900 outline-none ring-0 focus:bg-black/[0.06]"
                  autoFocus
                />
              </label>

              <div className="block">
                <span className="text-xs font-medium text-neutral-500">
                  Template
                </span>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 rounded-t-md border-b border-black/[0.06] bg-black/[0.03] px-2 py-1.5">
                  <button
                    type="button"
                    onClick={handleAddTextField}
                    className="rounded-md bg-black/[0.06] px-2 py-0.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-black/[0.1]"
                  >
                    + Text Field
                  </button>
                  {placeholders.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => insertAtCursor(name)}
                      className="rounded-full bg-black/[0.06] px-2 py-0.5 text-xs text-neutral-600 transition-colors hover:bg-black/[0.1] hover:text-neutral-900"
                    >
                      {name}
                    </button>
                  ))}
                </div>
                <textarea
                  ref={textareaRef}
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  rows={2}
                  className="w-full resize-none select-text rounded-b-md rounded-t-none border-0 bg-black/[0.04] px-2.5 py-1.5 text-sm text-neutral-900 outline-none ring-0 focus:bg-black/[0.06]"
                />
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
                disabled={saving || !title.trim() || !template.trim()}
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
