import HotkeyInput from "@/components/HotkeyInput";
import Popup from "@/components/Popup";
import type { Folder, Preset } from "@/lib/db";
import { extractPlaceholders } from "@/lib/template";
import { Keyboard } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface PresetFormModalProps {
  open: boolean;
  preset: Preset | null;
  folders: Folder[];
  onClose: () => void;
  onSave: (
    title: string,
    template: string,
    folderId: number | null,
  ) => Promise<void>;
}

export default function PresetFormModal({
  open,
  preset,
  folders,
  onClose,
  onSave,
}: PresetFormModalProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [template, setTemplate] = useState("");
  const [folderId, setFolderId] = useState<number | null>(null);
  const [hotkeyOpen, setHotkeyOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hotkeyWrapRef = useRef<HTMLDivElement>(null);

  const placeholders = useMemo(() => extractPlaceholders(template), [template]);

  useEffect(() => {
    if (open) {
      setTitle(preset?.title ?? "");
      setTemplate(preset?.template ?? "");
      setFolderId(preset?.folder_id ?? null);
      setHotkeyOpen(false);
    }
  }, [open, preset]);

  useEffect(() => {
    if (!hotkeyOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (
        hotkeyWrapRef.current &&
        !hotkeyWrapRef.current.contains(e.target as Node)
      ) {
        setHotkeyOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [hotkeyOpen]);

  const insertAtCursor = (insertion: string) => {
    const el = textareaRef.current;
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
    let maxNumber = 0;

    for (const name of placeholders) {
      const match = name.match(/^Text Field (\d+)$/);
      if (match) {
        maxNumber = Math.max(maxNumber, Number(match[1]));
      }
    }

    insertAtCursor(`{{Text Field ${maxNumber + 1}}}`);
  };

  const handleHotkeyChange = (combo: string | null) => {
    if (!combo) return;
    insertAtCursor(`{{KEY:${combo}}}`);
    setHotkeyOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedTemplate = template.trim();
    if (!trimmedTitle || !trimmedTemplate) return;

    setSaving(true);
    try {
      await onSave(trimmedTitle, trimmedTemplate, folderId);
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
            className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg bg-white/95 shadow-lg dark:bg-neutral-800/95"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 border-b border-black/10 px-3 py-2 dark:border-white/10">
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {preset ? t("preset.edit") : t("preset.new")}
              </h2>
            </div>

            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
              <label className="block">
                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  {t("preset.title")}
                </span>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full select-text rounded-md border-0 bg-black/[0.04] px-2.5 py-1.5 text-sm text-neutral-900 outline-none ring-0 focus:bg-black/[0.06] dark:bg-white/[0.06] dark:text-neutral-100 dark:focus:bg-white/[0.1]"
                  autoFocus
                />
              </label>

              <div className="block">
                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  {t("preset.template")}
                </span>
                <div
                  ref={hotkeyWrapRef}
                  className="mt-1 rounded-t-md border-b border-black/[0.06] bg-black/[0.03] dark:border-white/[0.08] dark:bg-white/[0.04]"
                >
                  <div className="flex flex-wrap items-center gap-1.5 px-2 py-1.5">
                    <button
                      type="button"
                      onClick={handleAddTextField}
                      className="rounded-md bg-black/[0.06] px-2 py-0.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-black/[0.1] dark:bg-white/[0.08] dark:text-neutral-200 dark:hover:bg-white/[0.12]"
                    >
                      {t("preset.addTextField")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setHotkeyOpen((wasOpen) => !wasOpen)}
                      className="flex items-center gap-1 rounded-md bg-black/[0.06] px-2 py-0.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-black/[0.1] dark:bg-white/[0.08] dark:text-neutral-200 dark:hover:bg-white/[0.12]"
                    >
                      <Keyboard className="h-3 w-3" strokeWidth={2} />
                      {t("preset.addKeyAfterPaste")}
                    </button>
                    {placeholders.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => insertAtCursor(`{{${name}}}`)}
                        className="rounded-full bg-black/[0.06] px-2 py-0.5 text-xs text-neutral-600 transition-colors hover:bg-black/[0.1] hover:text-neutral-900 dark:bg-white/[0.08] dark:text-neutral-300 dark:hover:bg-white/[0.12] dark:hover:text-neutral-100"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                  {hotkeyOpen && (
                    <div className="border-t border-black/[0.06] px-2 py-1.5 dark:border-white/[0.08]">
                      <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-neutral-400">
                        {t("preset.afterPaste")}
                      </p>
                      <HotkeyInput value={null} onChange={handleHotkeyChange} />
                    </div>
                  )}
                </div>
                <textarea
                  ref={textareaRef}
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  rows={2}
                  className="w-full resize-none select-text rounded-b-md rounded-t-none border-0 bg-black/[0.04] px-2.5 py-1.5 text-sm text-neutral-900 outline-none ring-0 focus:bg-black/[0.06] dark:bg-white/[0.06] dark:text-neutral-100 dark:focus:bg-white/[0.1]"
                />
              </div>

              <div className="block">
                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  {t("preset.folder")}
                </span>
                <div className="mt-1">
                  <Popup
                    trigger={
                      <button
                        type="button"
                        className="w-full rounded-md border-0 bg-black/[0.04] px-2.5 py-1.5 text-left text-sm text-neutral-900 outline-none ring-0 hover:bg-black/[0.06] dark:bg-white/[0.06] dark:text-neutral-100 dark:hover:bg-white/[0.1]"
                      >
                        {folders.find((folder) => folder.id === folderId)
                          ?.name ?? t("main.noFolder")}
                      </button>
                    }
                    items={[
                      {
                        label: t("main.noFolder"),
                        onSelect: () => setFolderId(null),
                      },
                      ...folders.map((folder) => ({
                        label: folder.name,
                        onSelect: () => setFolderId(folder.id),
                      })),
                    ]}
                  />
                </div>
              </div>
            </div>

            <div className="flex shrink-0 justify-end gap-2 border-t border-black/10 px-3 py-2 dark:border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md px-2.5 py-1 text-xs text-neutral-600 transition-colors hover:bg-black/[0.04] dark:text-neutral-400 dark:hover:bg-white/[0.06]"
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                disabled={saving || !title.trim() || !template.trim()}
                className="rounded-md bg-neutral-900 px-2.5 py-1 text-xs font-medium text-white transition-opacity disabled:opacity-40 dark:bg-neutral-100 dark:text-neutral-900"
              >
                {saving ? t("common.saving") : t("common.save")}
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
