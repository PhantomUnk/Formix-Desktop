import { Search, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PresetSearchProps {
  value: string;
  onChange: (value: string) => void;
  onOpenSettings: () => void;
}

export default function PresetSearch({
  value,
  onChange,
  onOpenSettings,
}: PresetSearchProps) {
  const { t } = useTranslation();

  return (
    <div className="flex shrink-0 items-center gap-2 border-b border-black/10 px-4 py-2.5 dark:border-white/10">
      <Search
        className="h-4 w-4 shrink-0 text-neutral-400"
        strokeWidth={2}
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("search.placeholder")}
        className="min-w-0 flex-1 select-text border-0 bg-transparent text-[15px] leading-normal text-neutral-900 outline-none ring-0 placeholder:text-neutral-400 dark:text-neutral-100"
        autoFocus
      />
      <button
        type="button"
        onClick={onOpenSettings}
        aria-label={t("settings.title")}
        className="flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium text-neutral-600 transition-colors hover:bg-black/[0.06] hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/[0.08] dark:hover:text-neutral-100"
      >
        <Settings className="h-3.5 w-3.5" strokeWidth={2} />
        {t("settings.title")}
      </button>
    </div>
  );
}
