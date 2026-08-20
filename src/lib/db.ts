import Database from "@tauri-apps/plugin-sql";

let dbInstance: Database | null = null;

async function getDb() {
  if (!dbInstance) {
    dbInstance = await Database.load("sqlite:presets.db");
  }
  return dbInstance;
}

export interface Folder {
  id: number;
  name: string;
  created_at: string;
}

export interface Preset {
  id: number;
  title: string;
  template: string;
  created_at: string;
  folder_id: number | null;
}

export async function getAllPresets(): Promise<Preset[]> {
  const db = await getDb();
  return db.select("SELECT * FROM presets ORDER BY created_at DESC");
}

export async function createPreset(
  title: string,
  template: string,
  folderId: number | null = null,
): Promise<void> {
  const db = await getDb();
  await db.execute(
    "INSERT INTO presets (title, template, folder_id) VALUES ($1, $2, $3)",
    [title, template, folderId],
  );
}

export async function updatePreset(
  id: number,
  title: string,
  template: string,
  folderId: number | null,
): Promise<void> {
  const db = await getDb();
  await db.execute(
    "UPDATE presets SET title = $1, template = $2, folder_id = $3 WHERE id = $4",
    [title, template, folderId, id],
  );
}

export async function deletePreset(id: number): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM presets WHERE id = $1", [id]);
}

export async function getAllFolders(): Promise<Folder[]> {
  const db = await getDb();
  return db.select("SELECT * FROM folders ORDER BY created_at DESC");
}

export async function createFolder(name: string): Promise<number> {
  const db = await getDb();
  const result = await db.execute("INSERT INTO folders (name) VALUES ($1)", [
    name,
  ]);
  const id = Number(result.lastInsertId);
  if (id) return id;

  const rows = await db.select<{ id: number }[]>(
    "SELECT last_insert_rowid() as id",
  );
  return rows[0].id;
}

export async function deleteFolder(
  id: number,
  deletePresets: boolean,
): Promise<void> {
  const db = await getDb();
  if (deletePresets) {
    await db.execute("DELETE FROM presets WHERE folder_id = $1", [id]);
  } else {
    // На случай если FK в SQLite не сработал — снимаем связь явно.
    await db.execute("UPDATE presets SET folder_id = NULL WHERE folder_id = $1", [
      id,
    ]);
  }
  await db.execute("DELETE FROM folders WHERE id = $1", [id]);
}

export async function assignPresetToFolder(
  presetId: number,
  folderId: number | null,
): Promise<void> {
  await assignPresetsToFolder([presetId], folderId);
}

export async function assignPresetsToFolder(
  presetIds: number[],
  folderId: number | null,
): Promise<void> {
  if (presetIds.length === 0) return;
  const db = await getDb();
  const idPlaceholders = presetIds.map((_, i) => `$${i + 2}`).join(", ");
  await db.execute(
    `UPDATE presets SET folder_id = $1 WHERE id IN (${idPlaceholders})`,
    [folderId, ...presetIds],
  );
}
