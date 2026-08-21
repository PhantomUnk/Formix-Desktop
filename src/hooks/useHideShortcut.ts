import { DEFAULT_HOTKEY, FOCUS_GRACE_MS } from "@/lib/constants";
import { toGlobalShortcut } from "@/lib/hotkey";
import { getSetting } from "@/lib/settings";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow, PhysicalPosition } from "@tauri-apps/api/window";
import { register, unregister } from "@tauri-apps/plugin-global-shortcut";
import { useEffect } from "react";
import { fadeIn, fadeOut } from "./windowFade";

let showGraceUntil = 0;
let isHiding = false;
let currentHotkey = "";

function markShowGracePeriod() {
  showGraceUntil = Date.now() + FOCUS_GRACE_MS;
}

function isInShowGracePeriod() {
  return Date.now() < showGraceUntil;
}

async function hideWindow() {
  if (isHiding) return;
  isHiding = true;
  try {
    const appWindow = getCurrentWindow();
    await fadeOut(document.getElementById("root"));
    await appWindow.hide();
  } finally {
    isHiding = false;
  }
}

async function showWindow() {
  markShowGracePeriod();
  const appWindow = getCurrentWindow();
  const size = await appWindow.innerSize(); // physical window size
  const scale = await appWindow.scaleFactor();

  const [x, y] = await invoke<[number, number]>("get_window_position", {
    winWidth: size.width / scale, // convert physical size to logical size
    winHeight: size.height / scale,
  });
  await appWindow.setPosition(new PhysicalPosition(x, y));
  await appWindow.show();
  await appWindow.setFocus();
  fadeIn(document.getElementById("root"));
}

async function toggleWindow() {
  const appWindow = getCurrentWindow();
  const visible = await appWindow.isVisible();
  if (visible) {
    await hideWindow();
  } else {
    await showWindow();
  }
}

/** Unregister the current global shortcut, then register `nextHotkey`. */
export async function replaceAppHotkey(nextHotkey: string) {
  if (currentHotkey) {
    try {
      await unregister(toGlobalShortcut(currentHotkey));
    } catch (error) {
      console.error("Failed to unregister shortcut:", error);
    }
    currentHotkey = "";
  }

  try {
    await register(toGlobalShortcut(nextHotkey), (event: { state: string }) => {
      if (event.state === "Pressed") void toggleWindow();
    });
    currentHotkey = nextHotkey;
  } catch (error) {
    console.error("Failed to register shortcut:", error);
  }
}

export default function useHideShortcut() {
  useEffect(() => {
    let cancelled = false;
    let unlisten: (() => void) | undefined;

    const setup = async () => {
      const saved = await getSetting("hotkey", DEFAULT_HOTKEY);
      if (!cancelled) await replaceAppHotkey(saved);

      const appWindow = getCurrentWindow();
      const unlistenFn = await appWindow.onFocusChanged(
        ({ payload: focused }) => {
          if (focused) return;
          if (isInShowGracePeriod()) return;

          void appWindow.isVisible().then((visible) => {
            if (visible) void hideWindow();
          });
        },
      );

      if (cancelled) {
        unlistenFn();
      } else {
        unlisten = unlistenFn;
      }
    };

    void setup();

    return () => {
      cancelled = true;
      unlisten?.();
      if (currentHotkey) {
        unregister(toGlobalShortcut(currentHotkey)).catch((error: Error) =>
          console.error("Failed to unregister shortcut:", error),
        );
        currentHotkey = "";
      }
    };
  }, []);
}
