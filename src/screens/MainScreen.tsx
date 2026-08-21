import AddPresetButton from "@/components/AddPresetButton";
import DeleteFolderDialog from "@/components/DeleteFolderDialog";
import FolderFormModal from "@/components/FolderFormModal";
import FolderSection from "@/components/FolderSection";
import PresetFormModal from "@/components/PresetFormModal";
import PresetItem from "@/components/PresetItem";
import PresetSearch from "@/components/PresetSearch";
import SettingsModal from "@/components/SettingsModal";
import {
  assignPresetsToFolder,
  createFolder,
  createPreset,
  deleteFolder,
  deletePreset,
  getAllFolders,
  getAllPresets,
  updatePreset,
  type Folder,
  type Preset,
} from "@/lib/db";
import PresetFillScreen from "@/screens/PresetFillScreen";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

export default function MainScreen() {
  const { t } = useTranslation();
  const [presets, setPresets] = useState<Preset[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [presetModalOpen, setPresetModalOpen] = useState(false);
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<Preset | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null);
  const [collapsedIds, setCollapsedIds] = useState<number[]>([]);
  const [activePreset, setActivePreset] = useState<Preset | null>(null);

  const reload = useCallback(async () => {
    const [nextPresets, nextFolders] = await Promise.all([
      getAllPresets(),
      getAllFolders(),
    ]);
    setPresets(nextPresets);
    setFolders(nextFolders);
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

  const isSearching = query.trim().length > 0;

  const openCreateModal = () => {
    setEditingPreset(null);
    setPresetModalOpen(true);
  };

  const openEditModal = (preset: Preset) => {
    setEditingPreset(preset);
    setPresetModalOpen(true);
  };

  const closePresetModal = () => {
    setPresetModalOpen(false);
    setEditingPreset(null);
  };

  const handleSavePreset = async (
    title: string,
    template: string,
    folderId: number | null,
  ) => {
    if (editingPreset) {
      await updatePreset(editingPreset.id, title, template, folderId);
    } else {
      await createPreset(title, template, folderId);
    }
    await reload();
  };

  const handleSaveFolder = async (name: string, presetIds: number[]) => {
    const folderId = await createFolder(name);
    await assignPresetsToFolder(presetIds, folderId);
    await reload();
  };

  const handleDeletePreset = async (preset: Preset) => {
    await deletePreset(preset.id);
    await reload();
  };

  const handleDeleteFolder = async (deletePresets: boolean) => {
    if (!folderToDelete) return;
    await deleteFolder(folderToDelete.id, deletePresets);
    await reload();
  };

  const toggleFolder = (id: number) => {
    setCollapsedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const renderPreset = (preset: Preset) => (
    <PresetItem
      key={preset.id}
      preset={preset}
      onSelect={setActivePreset}
      onEdit={openEditModal}
      onDelete={handleDeletePreset}
    />
  );

  const renderGroupedList = () => {
    const ungrouped = filtered.filter((p) => p.folder_id == null);

    return (
      <ul className="flex flex-col gap-1">
        {folders.map((folder) => {
          const inFolder = filtered.filter((p) => p.folder_id === folder.id);
          return (
            <FolderSection
              key={folder.id}
              folder={folder}
              collapsed={collapsedIds.includes(folder.id)}
              onToggle={() => toggleFolder(folder.id)}
              onDelete={() => setFolderToDelete(folder)}
            >
              {inFolder.length === 0 ? (
                <li className="px-3 py-1.5 text-xs text-neutral-400 dark:text-neutral-500">
                  {t("main.emptyFolder")}
                </li>
              ) : (
                inFolder.map(renderPreset)
              )}
            </FolderSection>
          );
        })}
        {ungrouped.length > 0 && (
          <li className="flex flex-col">
            {folders.length > 0 && (
                <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                {t("main.noFolder")}
              </p>
            )}
            <ul className="flex flex-col gap-0.5">{ungrouped.map(renderPreset)}</ul>
          </li>
        )}
      </ul>
    );
  };

  return (
    <div className="relative flex min-h-0 flex-1 select-none flex-col overflow-hidden">
      <AnimatePresence mode="wait">
        {activePreset ? (
          <PresetFillScreen
            key={activePreset.id}
            preset={activePreset}
            onBack={() => setActivePreset(null)}
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
            <PresetSearch
              value={query}
              onChange={setQuery}
              onOpenSettings={() => setSettingsOpen(true)}
            />

            <div className="min-h-0 flex-1 overflow-y-auto p-2 pb-10">
              {loading ? (
                <p className="py-6 text-center text-sm text-neutral-400 dark:text-neutral-500">
                  {t("main.loading")}
                </p>
              ) : isSearching && filtered.length === 0 ? (
                <p className="py-6 text-center text-sm text-neutral-400 dark:text-neutral-500">
                  {t("main.noResults")}
                </p>
              ) : !isSearching &&
                filtered.length === 0 &&
                folders.length === 0 ? (
                <p className="py-6 text-center text-sm text-neutral-400 dark:text-neutral-500">
                  {t("main.noPresets")}
                </p>
              ) : isSearching ? (
                <ul className="flex flex-col gap-0.5">
                  <AnimatePresence initial={false}>
                    {filtered.map(renderPreset)}
                  </AnimatePresence>
                </ul>
              ) : (
                renderGroupedList()
              )}
            </div>

            <AddPresetButton
              onAddFolder={() => setFolderModalOpen(true)}
              onAddTemplate={openCreateModal}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <PresetFormModal
        open={presetModalOpen}
        preset={editingPreset}
        folders={folders}
        onClose={closePresetModal}
        onSave={handleSavePreset}
      />
      <FolderFormModal
        open={folderModalOpen}
        presets={presets}
        onClose={() => setFolderModalOpen(false)}
        onSave={handleSaveFolder}
      />
      <DeleteFolderDialog
        folder={folderToDelete}
        onClose={() => setFolderToDelete(null)}
        onConfirm={handleDeleteFolder}
      />
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onImported={() => void reload()}
      />
    </div>
  );
}
