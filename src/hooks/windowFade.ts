import { WINDOW_FADE_MS } from "@/lib/constants";

export function fadeOut(el: HTMLElement | null) {
  if (!el) return Promise.resolve();
  el.style.transition = `opacity ${WINDOW_FADE_MS}ms ease`;
  el.style.opacity = "0";
  return new Promise((r) => setTimeout(r, WINDOW_FADE_MS));
}

export function fadeIn(el: HTMLElement | null) {
  if (!el) return;
  requestAnimationFrame(() => {
    el.style.opacity = "1";
  });
}
