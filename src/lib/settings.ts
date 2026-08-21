import i18n from "@/lib/i18n";
import { getDb } from "@/lib/db";
import { invoke } from "@tauri-apps/api/core";

export async function getSetting(
  key: string,
  defaultValue: string,
): Promise<string> {
  const db = await getDb();
  const rows = await db.select<{ value: string }[]>(
    "SELECT value FROM settings WHERE key = $1",
    [key],
  );
  return rows[0]?.value ?? defaultValue;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDb();
  await db.execute(
    "INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT(key) DO UPDATE SET value = $2",
    [key, value],
  );
}

export function applyTheme(theme: string) {
  document.getElementById("root")?.setAttribute("data-theme", theme);
  // ? this is how TailwindCSS applies dark mode styles
}

export async function applyLanguage(language: string) {
  await i18n.changeLanguage(language);
  try {
    await invoke("set_tray_quit_text", { text: i18n.t("tray.quit") });
  } catch (error) {
    console.error("Failed to update tray menu:", error);
  }
}
