import { Plus } from "lucide-react";

interface AddPresetButtonProps {
  onAdd: () => void;
}

export default function AddPresetButton({ onAdd }: AddPresetButtonProps) {
  return (
    <button
      type="button"
      onClick={onAdd}
      aria-label="Add preset"
      className="absolute bottom-3 right-3 z-10 flex items-center gap-1 rounded-full bg-neutral-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-md transition-opacity hover:opacity-90"
    >
      <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
      Add
    </button>
  );
}
