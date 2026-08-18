import type { Preset } from "@/lib/db";
import { extractPlaceholders, fillTemplate } from "@/lib/template";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";

const appWindow = getCurrentWindow();

type TemplateSegment =
  | { type: "text"; value: string }
  | { type: "placeholder"; name: string };

function parseTemplateSegments(template: string): TemplateSegment[] {
  const segments: TemplateSegment[] = [];
  const regex = /\{\{([^{}]+)\}\}/g; // было: /\{\{(\w+)\}\}/g
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(template)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: "text",
        value: template.slice(lastIndex, match.index),
      });
    }
    segments.push({ type: "placeholder", name: match[1].trim() }); // добавлен .trim()
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < template.length) {
    segments.push({ type: "text", value: template.slice(lastIndex) });
  }

  return segments;
}

interface PresetFillScreenProps {
  preset: Preset;
  onBack: () => void;
  onSubmit: (text: string) => void;
}

export default function PresetFillScreen({
  preset,
  onBack,
  onSubmit,
}: PresetFillScreenProps) {
  const placeholders = useMemo(
    () => extractPlaceholders(preset.template),
    [preset.template],
  );

  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(placeholders.map((name) => [name, ""])),
  );

  const segments = useMemo(
    () => parseTemplateSegments(preset.template),
    [preset.template],
  );

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const resetValues = () => {
    setValues(Object.fromEntries(placeholders.map((name) => [name, ""])));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalText = fillTemplate(preset.template, values);
    onSubmit(finalText);
    await writeText(finalText);
    await appWindow.hide();
    window.dispatchEvent(new CustomEvent("app:reset"));
    await new Promise((resolve) => setTimeout(resolve, 150));
    await invoke("simulate_paste");
    resetValues();
  };

  return (
    <motion.div
      className="absolute inset-0 z-10 flex min-h-0 flex-1 flex-col overflow-hidden"
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.15 }}
    >
      <form
        onSubmit={handleSubmit}
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <div className="flex shrink-0 items-center gap-2 border-b border-black/10 px-2 py-2.5">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to presets"
            className="rounded-md p-1.5 text-neutral-600 transition-colors hover:bg-black/[0.06] hover:text-neutral-900"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          </button>
          <h2 className="min-w-0 flex-1 truncate text-[15px] font-semibold text-neutral-900">
            {preset.title}
          </h2>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <div className="flex min-h-[3.5rem] flex-wrap items-baseline gap-x-0.5 gap-y-1 rounded-md bg-black/[0.04] px-2.5 py-2 text-sm leading-relaxed text-neutral-900">
            {segments.length > 0 ? (
              segments.map((segment, index) =>
                segment.type === "text" ? (
                  <span key={index} className="whitespace-pre-wrap">
                    {segment.value}
                  </span>
                ) : (
                  <input
                    key={index}
                    type="text"
                    value={values[segment.name] ?? ""}
                    onChange={(e) => handleChange(segment.name, e.target.value)}
                    placeholder={segment.name}
                    size={Math.max(
                      segment.name.length,
                      (values[segment.name] ?? "").length || 1,
                    )}
                    autoFocus={
                      index ===
                      segments.findIndex((s) => s.type === "placeholder")
                    }
                    className="inline-block min-w-[2ch] select-text border-0 border-b border-neutral-400/60 bg-black/[0.06] px-1 py-0 text-sm text-neutral-900 outline-none ring-0 placeholder:text-neutral-400/70 focus:border-neutral-600 focus:bg-black/[0.08]"
                  />
                ),
              )
            ) : (
              <span className="whitespace-pre-wrap">{preset.template}</span>
            )}
          </div>

          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              aria-label="Paste"
              className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
            >
              Paste
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
