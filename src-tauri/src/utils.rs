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

use enigo::{Direction, Enigo, Key, Keyboard, Settings};

#[tauri::command]
pub fn simulate_paste() -> Result<(), String> {
    let mut enigo = Enigo::new(&Settings::default()).map_err(|e| e.to_string())?;

    enigo
        .key(Key::Control, Direction::Press)
        .map_err(|e| e.to_string())?;
    enigo
        .key(Key::V, Direction::Click)
        .map_err(|e| e.to_string())?;
    enigo
        .key(Key::Control, Direction::Release)
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn send_key_combo(combo: String) -> Result<(), String> {
    let mut enigo = Enigo::new(&Settings::default()).map_err(|e| e.to_string())?;
    send_hotkey(&mut enigo, &combo)
}

fn send_hotkey(enigo: &mut Enigo, combo: &str) -> Result<(), String> {
    let mut modifiers = Vec::new();
    let mut main_key = None;

    for part in combo.split('+') {
        let part = part.trim().to_ascii_lowercase();
        if part.is_empty() {
            continue;
        }
        match part.as_str() {
            "ctrl" | "control" => modifiers.push(Key::Control),
            "alt" => modifiers.push(Key::Alt),
            "shift" => modifiers.push(Key::Shift),
            other => main_key = Some(parse_main_key(other)?),
        }
    }

    let main_key = main_key.ok_or_else(|| "hotkey has no main key".to_string())?;

    for key in &modifiers {
        enigo.key(*key, Direction::Press).map_err(|e| e.to_string())?;
    }
    enigo
        .key(main_key, Direction::Click)
        .map_err(|e| e.to_string())?;
    for key in modifiers.iter().rev() {
        enigo.key(*key, Direction::Release).map_err(|e| e.to_string())?;
    }

    Ok(())
}

fn parse_main_key(name: &str) -> Result<Key, String> {
    match name {
        "enter" | "return" => Ok(Key::Return),
        "tab" => Ok(Key::Tab),
        "escape" | "esc" => Ok(Key::Escape),
        "backspace" => Ok(Key::Backspace),
        "space" => Ok(Key::Space),
        "f1" => Ok(Key::F1),
        "f2" => Ok(Key::F2),
        "f3" => Ok(Key::F3),
        "f4" => Ok(Key::F4),
        "f5" => Ok(Key::F5),
        "f6" => Ok(Key::F6),
        "f7" => Ok(Key::F7),
        "f8" => Ok(Key::F8),
        "f9" => Ok(Key::F9),
        "f10" => Ok(Key::F10),
        "f11" => Ok(Key::F11),
        "f12" => Ok(Key::F12),
        s if s.len() == 1 => parse_char_key(s.chars().next().unwrap()),
        _ => Err(format!("unsupported key: {name}")),
    }
}

// Use virtual keys (Key::S), not Unicode. Unicode types a character and
// shortcuts like Ctrl+S would not fire.
fn parse_char_key(c: char) -> Result<Key, String> {
    #[cfg(target_os = "windows")]
    {
        let key = match c {
            'a' => Key::A,
            'b' => Key::B,
            'c' => Key::C,
            'd' => Key::D,
            'e' => Key::E,
            'f' => Key::F,
            'g' => Key::G,
            'h' => Key::H,
            'i' => Key::I,
            'j' => Key::J,
            'k' => Key::K,
            'l' => Key::L,
            'm' => Key::M,
            'n' => Key::N,
            'o' => Key::O,
            'p' => Key::P,
            'q' => Key::Q,
            'r' => Key::R,
            's' => Key::S,
            't' => Key::T,
            'u' => Key::U,
            'v' => Key::V,
            'w' => Key::W,
            'x' => Key::X,
            'y' => Key::Y,
            'z' => Key::Z,
            '0' => Key::Num0,
            '1' => Key::Num1,
            '2' => Key::Num2,
            '3' => Key::Num3,
            '4' => Key::Num4,
            '5' => Key::Num5,
            '6' => Key::Num6,
            '7' => Key::Num7,
            '8' => Key::Num8,
            '9' => Key::Num9,
            _ => return Err(format!("unsupported key: {c}")),
        };
        return Ok(key);
    }

    #[cfg(not(target_os = "windows"))]
    {
        if c.is_ascii_alphanumeric() {
            Ok(Key::Unicode(c))
        } else {
            Err(format!("unsupported key: {c}"))
        }
    }
}
