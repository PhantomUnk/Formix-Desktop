use mouse_position::mouse_position::Mouse;

#[tauri::command]
pub fn get_mouse_position() -> (i32, i32) {
    match Mouse::get_mouse_position() {
        Mouse::Position { x, y } => (x, y),
        Mouse::Error => (0, 0),
    }
}

use enigo::{Enigo, Keyboard, Settings, Key, Direction};

#[tauri::command]
pub fn simulate_paste() -> Result<(), String> {
    let mut enigo = Enigo::new(&Settings::default()).map_err(|e| e.to_string())?;

    // #[cfg(target_os = "windows")]
    // let v_key = Key::Raw(0x56); - virtual key code for 'V' on Windows

    enigo.key(Key::Control, Direction::Press).map_err(|e| e.to_string())?;
    enigo.key(Key::V, Direction::Click).map_err(|e| e.to_string())?;
    enigo.key(Key::Control, Direction::Release).map_err(|e| e.to_string())?;

    Ok(())
}
