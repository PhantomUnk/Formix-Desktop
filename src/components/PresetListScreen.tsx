import {
  createPreset,
  deletePreset,
  getAllPresets,
  updatePreset,
  type Preset,
} from "@/lib/db";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import PresetFormModal from "./PresetFormModal";
import AddPresetButton from "./AddPresetButton";
import PresetFillScreen from "./PresetFillScreen";
import PresetItem from "./PresetItem";
import PresetSearch from "./PresetSearch";

export default function PresetListScreen() {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<Preset | null>(null);
  const [activePreset, setActivePreset] = useState<Preset | null>(null);

  const reload = useCallback(async () => {
    const next = await getAllPresets();
    setPresets(next);
    return next;
  }, []);

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, [reload]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return presets;
    return presets.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.template.toLowerCase().includes(q),
    );
  }, [presets, query]);

  const handleSelect = (preset: Preset) => {
    setActivePreset(preset);
  };

  const handleFillSubmit = (text: string) => {
    console.log("final text:", text);
  };

  const openCreateModal = () => {
    setEditingPreset(null);
    setModalOpen(true);
  };

  const openEditModal = (preset: Preset) => {
    setEditingPreset(preset);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingPreset(null);
  };

  const handleSave = async (title: string, template: string) => {
    if (editingPreset) {
      await updatePreset(editingPreset.id, title, template);
    } else {
      await createPreset(title, template);
    }
    await reload();
  };

  const handleDelete = async (preset: Preset) => {
    await deletePreset(preset.id);
    await reload();
  };

  return (
    <div className="relative flex min-h-0 flex-1 select-none flex-col overflow-hidden">
      <AnimatePresence mode="wait">
        {activePreset ? (
          <PresetFillScreen
            key={activePreset.id}
            preset={activePreset}
            onBack={() => setActivePreset(null)}
            onSubmit={handleFillSubmit}
          />
        ) : (
          <motion.div
            key="list"
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.15 }}
          >
            <PresetSearch value={query} onChange={setQuery} />

            <div className="min-h-0 flex-1 overflow-y-auto p-2 pb-10">
              {loading ? (
                <p className="py-6 text-center text-sm text-neutral-400">
                  Loading…
                </p>
              ) : filtered.length === 0 ? (
                <p className="py-6 text-center text-sm text-neutral-400">
                  {query ? "No results found" : "No presets yet"}
                </p>
              ) : (
                <ul className="flex flex-col gap-0.5">
                  <AnimatePresence initial={false}>
                    {filtered.map((preset) => (
                      <PresetItem
                        key={preset.id}
                        preset={preset}
                        onSelect={handleSelect}
                        onEdit={openEditModal}
                        onDelete={handleDelete}
                      />
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            <AddPresetButton onAdd={openCreateModal} />
          </motion.div>
        )}
      </AnimatePresence>

      <PresetFormModal
        open={modalOpen}
        preset={editingPreset}
        onClose={closeModal}
        onSave={handleSave}
      />
    </div>
  );
}
