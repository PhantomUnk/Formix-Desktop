import { PASTE_DELAY_MS } from "@/constants";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";

export async function pasteIntoFocusedApp(
  text: string,
  onAfterHide?: () => void,
): Promise<void> {
  await writeText(text);
  await getCurrentWindow().hide();
  onAfterHide?.();
  await new Promise((resolve) => setTimeout(resolve, PASTE_DELAY_MS));
  await invoke("simulate_paste");
}
