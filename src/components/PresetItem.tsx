import type { Preset } from "@/lib/db";
import { Pencil, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";

interface PresetItemProps {
  preset: Preset;
  onSelect: (preset: Preset) => void;
  onEdit: (preset: Preset) => void;
  onDelete: (preset: Preset) => void;
}

export default function PresetItem({
  preset,
  onSelect,
  onEdit,
  onDelete,
}: PresetItemProps) {
  const { t } = useTranslation();

  return (
    <motion.li
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="flex items-center rounded-lg transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect(preset)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSelect(preset);
        }}
        className="min-w-0 flex-1 cursor-pointer px-3 py-2.5 text-left outline-none"
      >
        <p className="truncate text-[15px] font-semibold leading-snug text-neutral-900 dark:text-neutral-100">
          {preset.title}
        </p>
        <p className="mt-0.5 truncate text-sm leading-snug text-neutral-500 dark:text-neutral-400">
          {preset.template}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-0.5 pr-1.5">
        <button
          type="button"
          aria-label={t("preset.editAria")}
          onClick={(e) => {
            e.stopPropagation();
            onEdit(preset);
          }}
          className="rounded-md p-1.5 text-neutral-500 transition-colors hover:bg-black/[0.06] hover:text-neutral-800 dark:hover:bg-white/[0.08] dark:hover:text-neutral-200"
        >
          <Pencil className="h-4 w-4" strokeWidth={2} />
        </button>
        <button
          type="button"
          aria-label={t("preset.deleteAria")}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(preset);
          }}
          className="rounded-md p-1.5 text-red-500 transition-colors hover:bg-red-500/10"
        >
          <Trash2 className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </motion.li>
  );
}
