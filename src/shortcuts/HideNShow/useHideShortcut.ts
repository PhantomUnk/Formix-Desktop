import { getCurrentWindow, PhysicalPosition } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";
import useGlobalShortcut from "../useGlobalShortcut";
import { fadeOut, fadeIn } from "./windowFade";

const WINDOW_X_OFFSET = 225; // offset 
const WINDOW_Y_OFFSET = 250;

async function hideWindow() {
  const appWindow = getCurrentWindow();
  await fadeOut(document.getElementById("root"));
  await appWindow.hide();
  window.dispatchEvent(new CustomEvent("app:reset"));
}

async function showWindow() {
  const appWindow = getCurrentWindow();
  const [x, y] = await invoke<[number, number]>("get_mouse_position");
  await appWindow.setPosition(
    new PhysicalPosition(x - WINDOW_X_OFFSET, y - WINDOW_Y_OFFSET),
  );
  await appWindow.show();
  await appWindow.setFocus();
  fadeIn(document.getElementById("root"));
}

export default function useHideShortcut(shortcut = "CommandOrControl+F2") {
  useGlobalShortcut(shortcut, async () => {
    const appWindow = getCurrentWindow();
    const visible = await appWindow.isVisible();
    if (visible) {
      await hideWindow();
    } else {
      await showWindow();
    }
  });
}
