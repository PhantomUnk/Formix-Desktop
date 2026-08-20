export const WINDOW_X_OFFSET = 225;
export const WINDOW_Y_OFFSET = 250;


export const FOCUS_GRACE_MS = 200;

export const PASTE_DELAY_MS = 150;

export const WINDOW_FADE_MS = 150;

export const DEFAULT_HOTKEY = "CommandOrControl+F2";

export const PLACEHOLDER_REGEX_SOURCE = String.raw`\{\{([^{}]+)\}\}`;

export function createPlaceholderRegex(): RegExp {
  return new RegExp(PLACEHOLDER_REGEX_SOURCE, "g");
}
