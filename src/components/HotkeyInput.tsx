import { eventToHotkey, formatHotkeyLabel } from "@/lib/hotkey";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface HotkeyInputProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

export default function HotkeyInput({ value, onChange }: HotkeyInputProps) {
  const { t } = useTranslation();
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    if (!recording) return;

    const onKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const hotkey = eventToHotkey(e);
      if (!hotkey) return;
      onChange(hotkey);
      setRecording(false);
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [recording, onChange]);

  const label = recording
    ? t("hotkey.pressKey")
    : value
      ? formatHotkeyLabel(value)
      : t("hotkey.clickToRecord");

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => setRecording(true)}
        className={`min-w-0 flex-1 rounded-md px-2.5 py-1.5 text-left text-xs outline-none ring-0 ${
          recording
            ? "bg-black/[0.08] text-neutral-900 dark:bg-white/[0.12] dark:text-neutral-100"
            : "bg-black/[0.04] text-neutral-700 hover:bg-black/[0.06] dark:bg-white/[0.06] dark:text-neutral-200 dark:hover:bg-white/[0.1]"
        }`}
      >
        {label}
      </button>
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange(null);
            setRecording(false);
          }}
          aria-label={t("hotkey.clearAria")}
          className="rounded-md p-1 text-neutral-500 transition-colors hover:bg-black/[0.06] hover:text-neutral-800 dark:hover:bg-white/[0.08] dark:hover:text-neutral-200"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
