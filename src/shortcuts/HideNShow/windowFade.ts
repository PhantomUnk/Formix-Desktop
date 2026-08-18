const ANIM_MS = 150;

export function fadeOut(el: HTMLElement | null) {
  if (!el) return Promise.resolve();
  el.style.transition = `opacity ${ANIM_MS}ms ease`;
  el.style.opacity = "0";
  return new Promise((r) => setTimeout(r, ANIM_MS));
}

export function fadeIn(el: HTMLElement | null) {
  if (!el) return;
  requestAnimationFrame(() => {
    el.style.opacity = "1";
  });
}
