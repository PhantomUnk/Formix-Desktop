import HotkeyInput from "@/components/HotkeyInput";
import Popup from "@/components/Popup";
import {
  DEFAULT_HOTKEY,
  DEFAULT_LANGUAGE,
  DEFAULT_THEME,
  PASTE_DELAY_MS,
} from "@/lib/constants";
import { replaceAppHotkey } from "@/hooks/useHideShortcut";
import { exportPresets, importPresets } from "@/lib/importExport";
import {
  applyLanguage,
  applyTheme,
  getSetting,
  setSetting,
} from "@/lib/settings";
import { disable, enable, isEnabled } from "@tauri-apps/plugin-autostart";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}

export default function SettingsModal({
  open,
  onClose,
  onImported,
}: SettingsModalProps) {
  const { t } = useTranslation();
  const [hotkey, setHotkey] = useState(DEFAULT_HOTKEY);
  const [savedHotkey, setSavedHotkey] = useState(DEFAULT_HOTKEY);
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [savedTheme, setSavedTheme] = useState(DEFAULT_THEME);
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const [savedLanguage, setSavedLanguage] = useState(DEFAULT_LANGUAGE);
  const [pasteDelay, setPasteDelay] = useState(PASTE_DELAY_MS);
  const [launchOnStartup, setLaunchOnStartup] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      const [nextHotkey, nextTheme, nextDelay, nextLanguage] =
        await Promise.all([
          getSetting("hotkey", DEFAULT_HOTKEY),
          getSetting("theme", DEFAULT_THEME),
          getSetting("pasteDelayMs", String(PASTE_DELAY_MS)),
          getSetting("language", DEFAULT_LANGUAGE),
        ]);

      setHotkey(nextHotkey);
      setSavedHotkey(nextHotkey);
      setTheme(nextTheme);
      setSavedTheme(nextTheme);
      setLanguage(nextLanguage);
      setSavedLanguage(nextLanguage);
      const delayValue = Number(nextDelay);
      setPasteDelay(Number.isFinite(delayValue) ? delayValue : PASTE_DELAY_MS);

      try {
        setLaunchOnStartup(await isEnabled());
      } catch (error) {
        console.error("Failed to read autostart status:", error);
      }
    };

    void load();
  }, [open]);

  const handleThemeChange = (next: string) => {
    setTheme(next);
    applyTheme(next);
  };

  const handleLanguageChange = (next: string) => {
    setLanguage(next);
    void applyLanguage(next);
  };

  const handleAutostartChange = async (checked: boolean) => {
    setLaunchOnStartup(checked);
    try {
      if (checked) await enable();
      else await disable();
    } catch (error) {
      console.error("Failed to update autostart:", error);
      setLaunchOnStartup(!checked);
    }
  };

  const handleClose = () => {
    applyTheme(savedTheme);
    void applyLanguage(savedLanguage);
    onClose();
  };

  const handleExport = async () => {
    try {
      await exportPresets();
    } catch (error) {
      console.error("Failed to export presets:", error);
    }
  };

  const handleImport = async () => {
    try {
      const imported = await importPresets();
      if (imported) onImported();
    } catch (error) {
      console.error("Failed to import presets:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextHotkey = hotkey || DEFAULT_HOTKEY;
    const delayMs = Number.isFinite(pasteDelay)
      ? Math.max(0, pasteDelay)
      : PASTE_DELAY_MS;

    setSaving(true);
    try {
      if (nextHotkey !== savedHotkey) {
        await replaceAppHotkey(nextHotkey);
      }

      await Promise.all([
        setSetting("hotkey", nextHotkey),
        setSetting("theme", theme),
        setSetting("pasteDelayMs", String(delayMs)),
        setSetting("language", language),
      ]);

      applyTheme(theme);
      await applyLanguage(language);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const labelClass =
    "w-[6.5rem] shrink-0 text-xs font-medium text-neutral-500 dark:text-neutral-400";

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
            <div className="shrink-0 border-b border-black/10 px-3 py-1.5 dark:border-white/10">
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {t("settings.title")}
              </h2>
            </div>

            <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto p-3">
              <label className="flex items-center gap-2">
                <span className={labelClass}>{t("settings.hotkey")}</span>
                <div className="min-w-0 flex-1">
                  <HotkeyInput
                    value={hotkey}
                    onChange={(value) => setHotkey(value ?? DEFAULT_HOTKEY)}
                  />
                </div>
              </label>

              <div className="flex items-center gap-2">
                <span className={labelClass}>{t("settings.theme")}</span>
                <div className="flex min-w-0 flex-1 gap-1 rounded-md bg-black/[0.04] p-0.5 dark:bg-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => handleThemeChange("light")}
                    className={`flex-1 rounded px-2 py-1 text-xs font-medium ${
                      theme === "light"
                        ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-neutral-100"
                        : "text-neutral-600 dark:text-neutral-400"
                    }`}
                  >
                    {t("settings.light")}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleThemeChange("dark")}
                    className={`flex-1 rounded px-2 py-1 text-xs font-medium ${
                      theme === "dark"
                        ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-neutral-100"
                        : "text-neutral-600 dark:text-neutral-400"
                    }`}
                  >
                    {t("settings.dark")}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={labelClass}>{t("settings.language")}</span>
                <div className="min-w-0 flex-1">
                  <Popup
                    trigger={
                      <button
                        type="button"
                        className="w-full rounded-md border-0 bg-black/[0.04] px-2 py-1 text-left text-sm text-neutral-900 outline-none ring-0 hover:bg-black/[0.06] dark:bg-white/[0.06] dark:text-neutral-100 dark:hover:bg-white/[0.1]"
                      >
                        {language === "en"
                          ? t("settings.english")
                          : t("settings.russian")}
                      </button>
                    }
                    items={[
                      {
                        label: t("settings.english"),
                        onSelect: () => handleLanguageChange("en"),
                      },
                      {
                        label: t("settings.russian"),
                        onSelect: () => handleLanguageChange("ru"),
                      },
                    ]}
                  />
                </div>
              </div>

              <label className="flex items-center gap-2">
                <span className={labelClass}>{t("settings.pasteDelay")}</span>
                <div className="flex min-w-0 flex-1 items-center gap-1.5">
                  <input
                    type="number"
                    min={0}
                    value={pasteDelay}
                    onChange={(e) => setPasteDelay(Number(e.target.value))}
                    className="w-20 select-text rounded-md border-0 bg-black/[0.04] px-2 py-1 text-sm text-neutral-900 outline-none ring-0 focus:bg-black/[0.06] dark:bg-white/[0.06] dark:text-neutral-100 dark:focus:bg-white/[0.1]"
                  />
                  <span className="text-xs text-neutral-400">
                    {t("common.ms")}
                  </span>
                </div>
              </label>

              <label className="flex cursor-pointer items-center gap-2 pt-0.5">
                <span className="w-[6.5rem] shrink-0" />
                <input
                  type="checkbox"
                  checked={launchOnStartup}
                  onChange={(e) => void handleAutostartChange(e.target.checked)}
                  className="accent-neutral-900 dark:accent-neutral-100"
                />
                <span className="text-xs text-neutral-800 dark:text-neutral-200">
                  {t("settings.launchOnStartup")}
                </span>
              </label>

              <div className="flex items-center gap-2 pt-0.5">
                <span className={labelClass}>{t("settings.data")}</span>
                <div className="flex min-w-0 flex-1 gap-1">
                  <button
                    type="button"
                    onClick={() => void handleExport()}
                    className="flex-1 rounded-md bg-black/[0.04] px-2 py-1 text-xs font-medium text-neutral-800 hover:bg-black/[0.06] dark:bg-white/[0.06] dark:text-neutral-200 dark:hover:bg-white/[0.1]"
                  >
                    {t("settings.export")}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleImport()}
                    className="flex-1 rounded-md bg-black/[0.04] px-2 py-1 text-xs font-medium text-neutral-800 hover:bg-black/[0.06] dark:bg-white/[0.06] dark:text-neutral-200 dark:hover:bg-white/[0.1]"
                  >
                    {t("settings.import")}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 justify-end gap-2 border-t border-black/10 px-3 py-1.5 dark:border-white/10">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-md px-2.5 py-1 text-xs text-neutral-600 transition-colors hover:bg-black/[0.04] dark:text-neutral-400 dark:hover:bg-white/[0.06]"
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                disabled={saving}
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
