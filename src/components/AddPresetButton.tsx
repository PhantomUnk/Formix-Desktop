import Popup from "@/components/Popup";
import { FolderPlus, LayoutTemplate, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AddPresetButtonProps {
  onAddFolder: () => void;
  onAddTemplate: () => void;
}

export default function AddPresetButton({
  onAddFolder,
  onAddTemplate,
}: AddPresetButtonProps) {
  const { t } = useTranslation();

  return (
    <div className="absolute bottom-3 right-3 z-10">
      <Popup
        align="right"
        trigger={
          <button
            type="button"
            aria-label={t("common.add")}
            aria-haspopup="menu"
            className="flex items-center gap-1 rounded-full bg-neutral-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-md transition-opacity hover:opacity-90 dark:bg-neutral-100 dark:text-neutral-900"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
            {t("common.add")}
          </button>
        }
        items={[
          {
            label: (
              <>
                <FolderPlus
                  className="h-3.5 w-3.5 text-neutral-500"
                  strokeWidth={2}
                />
                {t("add.folder")}
              </>
            ),
            onSelect: onAddFolder,
          },
          {
            label: (
              <>
                <LayoutTemplate
                  className="h-3.5 w-3.5 text-neutral-500"
                  strokeWidth={2}
                />
                {t("add.template")}
              </>
            ),
            onSelect: onAddTemplate,
          },
        ]}
      />
    </div>
  );
}
