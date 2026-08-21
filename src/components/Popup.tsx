import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

export interface PopupItem {
  label: ReactNode;
  onSelect: () => void;
}

interface PopupProps {
  trigger: ReactNode;
  items: PopupItem[];
  // кнопка Add в углу: меню шире триггера и прижато вправо
  align?: "left" | "right";
}

export default function Popup({ trigger, items, align = "left" }: PopupProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <div onClick={() => setOpen((wasOpen) => !wasOpen)}>{trigger}</div>

      <AnimatePresence>
        {open && (
          <motion.div
            className={
              align === "right"
                ? "absolute bottom-full right-0 z-10 mb-1.5 min-w-[9.5rem] origin-bottom-right overflow-hidden rounded-lg py-1 shadow-lg"
                : "absolute bottom-full left-0 z-10 mb-1.5 w-full origin-bottom-left overflow-hidden rounded-lg py-1 shadow-lg"
            }
            style={{ background: "var(--app-bg)" }}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
          >
            {items.map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setOpen(false);
                  item.onSelect();
                }}
                className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-xs font-medium text-neutral-800 transition-colors hover:bg-black/[0.05] dark:text-neutral-200 dark:hover:bg-white/[0.06]"
              >
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
