import { useEffect } from "react";
import { getCurrentWindow, PhysicalPosition } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";
import useGlobalShortcut from "../useGlobalShortcut";
import { fadeOut, fadeIn } from "./windowFade";

const WINDOW_X_OFFSET = 225; // offset
const WINDOW_Y_OFFSET = 250;
const FOCUS_GRACE_MS = 200;

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
    window.dispatchEvent(new CustomEvent("app:reset"));
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

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    let cancelled = false;

    const setup = async () => {
      const appWindow = getCurrentWindow();
      const unlistenFn = await appWindow.onFocusChanged(({ payload: focused }) => {
        if (focused) return;
        if (isInShowGracePeriod()) return;

        void appWindow.isVisible().then((visible) => {
          if (visible) void hideWindow();
        });
      });

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
    };
  }, []);
}
