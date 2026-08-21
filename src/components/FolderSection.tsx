import type { Folder } from "@/lib/db";
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface FolderSectionProps {
  folder: Folder;
  collapsed: boolean;
  onToggle: () => void;
  onDelete: () => void;
  children: ReactNode;
}

export default function FolderSection({
  folder,
  collapsed,
  onToggle,
  onDelete,
  children,
}: FolderSectionProps) {
  const { t } = useTranslation();

  return (
    <li className="flex flex-col">
      <div className="flex items-center rounded-lg hover:bg-black/[0.03] dark:hover:bg-white/[0.05]">
        <button
          type="button"
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-center gap-1 px-2 py-1.5 text-left"
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
          )}
          <span className="truncate text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            {folder.name}
          </span>
        </button>
        <button
          type="button"
          aria-label={t("folder.deleteAria", { name: folder.name })}
          onClick={onDelete}
          className="mr-1 rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-red-500/10 hover:text-red-500"
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>
      {!collapsed && <ul className="flex flex-col gap-0.5">{children}</ul>}
    </li>
  );
}
