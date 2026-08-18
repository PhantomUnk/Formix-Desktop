import { Search } from "lucide-react";

interface PresetSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function PresetSearch({ value, onChange }: PresetSearchProps) {
  return (
    <div className="flex shrink-0 items-center gap-2 border-b border-black/10 px-4 py-2.5">
      <Search
        className="h-4 w-4 shrink-0 text-neutral-400"
        strokeWidth={2}
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search presets…"
        className="min-w-0 flex-1 select-text border-0 bg-transparent text-[15px] leading-normal text-neutral-900 outline-none ring-0 placeholder:text-neutral-400"
        autoFocus
      />
    </div>
  );
}
