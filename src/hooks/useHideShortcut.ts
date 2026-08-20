import {
  DEFAULT_HOTKEY,
  FOCUS_GRACE_MS,
  WINDOW_X_OFFSET,
  WINDOW_Y_OFFSET,
} from "@/constants";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow, PhysicalPosition } from "@tauri-apps/api/window";
import { useEffect } from "react";
import useGlobalShortcut from "./useGlobalShortcut";
import { fadeIn, fadeOut } from "./windowFade";

let showGraceUntil = 0;
let isHiding = false;

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
  const [x, y] = await invoke<[number, number]>("get_mouse_position");
  await appWindow.setPosition(
    new PhysicalPosition(x - WINDOW_X_OFFSET, y - WINDOW_Y_OFFSET),
  );
  await appWindow.show();
  await appWindow.setFocus();
  fadeIn(document.getElementById("root"));
}

export default function useHideShortcut(shortcut = DEFAULT_HOTKEY) {
  useGlobalShortcut(shortcut, async () => {
    const appWindow = getCurrentWindow();
    const visible = await appWindow.isVisible();
    if (visible) {
      await hideWindow();
    } else {
      await showWindow();
    }
  });

  // Set up event listener for window focus changes to auto-hide the window
  useEffect(() => {
    // Function to unsubscribe from the focus change event
    let unlisten: (() => void) | undefined;
    // Flag to handle race condition if component unmounts during async setup
    let cancelled = false;

    const setup = async () => {
      const appWindow = getCurrentWindow();
      // Subscribe to focus change events
      const unlistenFn = await appWindow.onFocusChanged(
        ({ payload: focused }) => {
          // If window gained focus, do nothing
          if (focused) return;
          // If we just showed the window, skip auto-hide to prevent accidental closing
          if (isInShowGracePeriod()) return;

          // Check if window is still visible, then hide it
          void appWindow.isVisible().then((visible) => {
            if (visible) void hideWindow();
          });
        },
      );

      // Handle race condition: if component unmounted before setup finished
      if (cancelled) {
        unlistenFn(); // Clean up immediately
      } else {
        unlisten = unlistenFn; // Save the unsubscribe function for cleanup
      }
    };

    void setup();

    // Cleanup function when component unmounts
    return () => {
      cancelled = true; // Mark setup as cancelled to prevent memory leak
      unlisten?.(); // Unsubscribe from focus change event
    };
  }, []);
}
