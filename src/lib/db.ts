// src/lib/db.ts
import Database from "@tauri-apps/plugin-sql";

let dbInstance: Database | null = null;

async function getDb() {
  if (!dbInstance) {
    dbInstance = await Database.load("sqlite:presets.db");
  }
  return dbInstance;
}

export interface Preset {
  id: number;
  title: string;
  template: string;
  created_at: string;
}

export async function getAllPresets(): Promise<Preset[]> {
  const db = await getDb();
  return db.select("SELECT * FROM presets ORDER BY created_at DESC");
}

export async function createPreset(title: string, template: string): Promise<void> {
  const db = await getDb();
  await db.execute(
    "INSERT INTO presets (title, template) VALUES ($1, $2)",
    [title, template]
  );
}

export async function updatePreset(id: number, title: string, template: string): Promise<void> {
  const db = await getDb();
  await db.execute(
    "UPDATE presets SET title = $1, template = $2 WHERE id = $3",
    [title, template, id]
  );
}

export async function deletePreset(id: number): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM presets WHERE id = $1", [id]);
}