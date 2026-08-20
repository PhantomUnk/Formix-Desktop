use tauri_plugin_sql::{Migration, MigrationKind};

pub const DB_PATH: &str = "sqlite:presets.db";

pub fn get_migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 1,
            description: "create_presets_table",
            sql: "CREATE TABLE presets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                template TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "create_folders_table",
            sql: "CREATE TABLE folders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );",
            kind: MigrationKind::Up,
        },
        // Отдельная версия: sqlx/SQLite обычно выполняет только первый statement в одном sql.
        Migration {
            version: 3,
            description: "add_preset_folder_id",
            sql: "ALTER TABLE presets ADD COLUMN folder_id INTEGER REFERENCES folders(id) ON DELETE SET NULL;",
            kind: MigrationKind::Up,
        },
    ]
}
