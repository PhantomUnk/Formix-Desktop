const MODIFIER_KEYS = new Set(["Control", "Shift", "Alt", "Meta", "OS"]);

/** Turns "ctrl+f2" into "Ctrl+F2" for @tauri-apps/plugin-global-shortcut. */
export function toGlobalShortcut(hotkey: string): string {
  return hotkey
    .split("+")
    .filter(Boolean)
    .map((part) => {
      const p = part.trim().toLowerCase();
      if (p === "ctrl" || p === "control") return "Ctrl";
      if (p === "alt") return "Alt";
      if (p === "shift") return "Shift";
      if (p === "meta" || p === "cmd" || p === "command") return "Command";
      if (/^f([1-9]|1[0-2])$/.test(p)) return p.toUpperCase();
      return p.charAt(0).toUpperCase() + p.slice(1);
    })
    .join("+");
}

/** Turns "ctrl+enter" into "Ctrl + Enter" for display. */
export function formatHotkeyLabel(hotkey: string): string {
  return hotkey
    .split("+")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" + ");
}

function mainKeyFromEvent(e: KeyboardEvent): string | null {
  if (/^F([1-9]|1[0-2])$/.test(e.key)) return e.key.toLowerCase();
  if (e.key === "Enter") return "enter";
  if (e.key === "Tab") return "tab";
  if (e.key === "Escape") return "escape";
  if (e.key === "Backspace") return "backspace";
  if (e.key === " ") return "space";
  if (/^[a-zA-Z]$/.test(e.key)) return e.key.toLowerCase();
  if (/^[0-9]$/.test(e.key)) return e.key;

  // Shift+digit produces a symbol in e.key ("!"), so read the physical key.
  if (/^Digit[0-9]$/.test(e.code)) return e.code.slice(5);
  if (/^Key[A-Z]$/.test(e.code)) return e.code.slice(3).toLowerCase();

  return null;
}

/** Returns a stored string like "ctrl+enter", or null if this keydown is only a modifier. */
export function eventToHotkey(e: KeyboardEvent): string | null {
  if (MODIFIER_KEYS.has(e.key)) return null;

  const mainKey = mainKeyFromEvent(e);
  if (!mainKey) return null;

  const parts: string[] = [];
  if (e.ctrlKey) parts.push("ctrl");
  if (e.altKey) parts.push("alt");
  if (e.shiftKey) parts.push("shift");
  parts.push(mainKey);
  return parts.join("+");
}
