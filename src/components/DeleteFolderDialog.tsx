import type { Folder } from "@/lib/db";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface DeleteFolderDialogProps {
  folder: Folder | null;
  onClose: () => void;
  onConfirm: (deletePresets: boolean) => Promise<void>;
}

export default function DeleteFolderDialog({
  folder,
  onClose,
  onConfirm,
}: DeleteFolderDialogProps) {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);

  const choose = async (deletePresets: boolean) => {
    setSaving(true);
    try {
      await onConfirm(deletePresets);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {folder && (
        <motion.div
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 p-3 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full rounded-lg bg-white/95 p-3 shadow-lg dark:bg-neutral-800/95"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
          >
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {t("folder.deleteTitle", { name: folder.name })}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
              {t("folder.deleteHint")}
            </p>

            <div className="mt-3 flex flex-col gap-1.5">
              <button
                type="button"
                disabled={saving}
                onClick={() => choose(true)}
                className="rounded-md bg-red-500 px-2.5 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                {t("folder.deleteWithPresets")}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => choose(false)}
                className="rounded-md bg-neutral-900 px-2.5 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40 dark:bg-neutral-100 dark:text-neutral-900"
              >
                {t("folder.keepPresets")}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={onClose}
                className="rounded-md px-2.5 py-1.5 text-xs text-neutral-600 transition-colors hover:bg-black/[0.04] dark:text-neutral-400 dark:hover:bg-white/[0.06]"
              >
                {t("common.cancel")}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
