use tauri_plugin_sql::{Migration, MigrationKind};

pub const DB_PATH: &str = "sqlite:presets.db";

pub fn get_migrations() -> Vec<Migration> {
    return vec![Migration {
        version: 1,
        description: "create_presets_table",
        sql: "CREATE TABLE presets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                template TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );",
        kind: MigrationKind::Up,
    }];
}
