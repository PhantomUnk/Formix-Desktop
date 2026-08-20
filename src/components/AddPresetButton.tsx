import { FolderPlus, LayoutTemplate, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface AddPresetButtonProps {
  onAddFolder: () => void;
  onAddTemplate: () => void;
}

export default function AddPresetButton({
  onAddFolder,
  onAddTemplate,
}: AddPresetButtonProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [menuOpen]);

  const pick = (action: () => void) => {
    setMenuOpen(false);
    action();
  };

  return (
    <div ref={rootRef} className="absolute bottom-3 right-3 z-10">
      <button
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        aria-label="Add"
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        className="flex items-center gap-1 rounded-full bg-neutral-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-md transition-opacity hover:opacity-90"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
        Add
      </button>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="absolute bottom-full right-0 mb-1.5 min-w-[9.5rem] origin-bottom-right overflow-hidden rounded-lg py-1 shadow-lg"
            style={{ background: "var(--app-bg)" }}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
          >
            <button
              type="button"
              onClick={() => pick(onAddFolder)}
              className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-xs font-medium text-neutral-800 transition-colors hover:bg-black/[0.05]"
            >
              <FolderPlus
                className="h-3.5 w-3.5 text-neutral-500"
                strokeWidth={2}
              />
              Folder
            </button>
            <button
              type="button"
              onClick={() => pick(onAddTemplate)}
              className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-xs font-medium text-neutral-800 transition-colors hover:bg-black/[0.05]"
            >
              <LayoutTemplate
                className="h-3.5 w-3.5 text-neutral-500"
                strokeWidth={2}
              />
              Template
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
