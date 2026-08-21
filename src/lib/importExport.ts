import { createFolder, createPreset, getAllFolders, getAllPresets } from "@/lib/db";
import { open, save } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";

export async function exportPresets(): Promise<void> {
  const [folders, presets] = await Promise.all([
    getAllFolders(),
    getAllPresets(),
  ]);

  const data = {
    folders: folders.map((folder) => ({
      id: folder.id,
      name: folder.name,
    })),
    presets: presets.map((preset) => ({
      id: preset.id,
      name: preset.title,
      template: preset.template,
      folder_id: preset.folder_id,
    })),
  };

  const path = await save({
    defaultPath: "formix-export.json",
    filters: [{ name: "JSON", extensions: ["json"] }],
  });
  if (!path) return;

  await writeTextFile(path, JSON.stringify(data, null, 2));
}

export async function importPresets(): Promise<boolean> {
  const selected = await open({
    multiple: false,
    filters: [{ name: "JSON", extensions: ["json"] }],
  });
  if (!selected) return false;

  const path = Array.isArray(selected) ? selected[0] : selected;
  const parsed: unknown = JSON.parse(await readTextFile(path));
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid export file");
  }

  const data = parsed as { folders?: unknown; presets?: unknown };
  if (!Array.isArray(data.folders) || !Array.isArray(data.presets)) {
    throw new Error("Invalid export file");
  }

  // Remember old folder id → new SQLite id so presets can be re-attached.
  const folderIdMap = new Map<number, number>();
  for (const folder of data.folders) {
    const name = String((folder as { name?: unknown }).name ?? "");
    const oldId = Number((folder as { id?: unknown }).id);
    const newId = await createFolder(name);
    if (Number.isFinite(oldId)) {
      folderIdMap.set(oldId, newId);
    }
  }

  for (const preset of data.presets) {
    const row = preset as {
      name?: unknown;
      template?: unknown;
      folder_id?: unknown;
    };
    let folderId: number | null = null;
    if (row.folder_id != null) {
      folderId = folderIdMap.get(Number(row.folder_id)) ?? null;
    }
    await createPreset(String(row.name ?? ""), String(row.template ?? ""), folderId);
  }

  return true;
}
