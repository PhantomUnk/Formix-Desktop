use mouse_position::mouse_position::Mouse;
use tauri::{WebviewWindow};
// #[tauri::command]
// pub fn get_mouse_position() -> (i32, i32) {
//     match Mouse::get_mouse_position() {
//         Mouse::Position { x, y } => (x, y),
//         Mouse::Error => (0, 0),
//     }
// }
#[tauri::command]
pub fn get_window_position(
    window: WebviewWindow,
    win_width: f64,
    win_height: f64,
) -> (i32, i32) {
    // current cursor position (physical pixels)
    let (cursor_x, cursor_y) = match Mouse::get_mouse_position() {
        Mouse::Position { x, y } => (x, y),
        Mouse::Error => (0, 0),
    };

    // find monitor that contains the cursor position
    let monitor = window
        .available_monitors()
        .ok()
        .and_then(|monitors| {
            monitors.into_iter().find(|m| {
                let pos = m.position();
                let size = m.size();
                cursor_x >= pos.x
                    && cursor_x < pos.x + size.width as i32
                    && cursor_y >= pos.y
                    && cursor_y < pos.y + size.height as i32
            })
        })
        // fallback,if cursor is not on any monitor, use the current monitor of the window
        .or_else(|| window.current_monitor().ok().flatten());

    let Some(monitor) = monitor else {
        return (cursor_x, cursor_y);
    };

    let mon_pos = monitor.position();
    let mon_size = monitor.size();
    let scale = monitor.scale_factor();

    // win_width/win_height comes in logical pixels, so we need to convert them to physical pixels using the monitor's scale factor
    // Convert them to physical pixels using the monitor's scale factor
    let win_w_phys = (win_width * scale) as i32;
    let win_h_phys = (win_height * scale) as i32;

    let max_x = mon_pos.x + mon_size.width as i32 - win_w_phys;
    let max_y = mon_pos.y + mon_size.height as i32 - win_h_phys;

    let x = cursor_x.min(max_x).max(mon_pos.x);
    let y = cursor_y.min(max_y).max(mon_pos.y);

    (x, y)
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
