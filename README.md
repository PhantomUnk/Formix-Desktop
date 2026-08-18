# Formix Desktop

**Formix Desktop** is a system utility for instantly inserting text templates into any application on your computer. Press a global hotkey to open a compact window with your presets — select the one you need, fill in fields directly within the text, and insert the result with a single click wherever the focus is.

Inspired by the Formix browser extension, but works system-wide — not just on the web, but in any application on your PC: email, messengers, IDEs, documents.

## ✨ Features

- ⚡️ **Global hotkey** — open the window from any application (default: `Ctrl+F2`)
- 📍 **Smart positioning** — the window opens next to the mouse cursor
- 📝 **Templates with fields** — create presets like `Hello, {{Name}}, how are you?`
- 🔁 **Field reuse** — the same field can appear multiple times in a template
- 🔍 **Quick search** — instant filtering of the preset list
- 📋 **One-click paste** — text is copied to the clipboard and automatically pasted into the active application (`Ctrl+V`)
- 🎨 **Minimalist interface** — a compact window without clutter, so it doesn't distract you from work
- 🖥 **System tray** — the app runs in the background without taking up space on the taskbar

## 🛠 Tech Stack

- [Tauri 2.0](https://tauri.app) — Rust core + system webview
- React + TypeScript
- Tailwind CSS
- Framer Motion
- SQLite (via `tauri-plugin-sql`) — local preset storage

## 🚀 Installation and Running

### Requirements

- [Node.js](https://nodejs.org) (LTS version)
- [Rust and Cargo](https://www.rust-lang.org/tools/install) (via `rustup`)
- On Windows — [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) with the **Desktop development with C++** component
- On Linux — WebKitGTK system dependencies ([see the Tauri guide](https://tauri.app/start/prerequisites/))

### Steps

```bash
# Clone the repository
git clone https://github.com/<your-username>/formix-desktop.git
cd formix-desktop

# Install dependencies
npm install

# Run in development mode
npm run tauri dev
```

The app will build and open in a native window. The first build may take several minutes — the Rust part compiles from scratch.

### Building a release version

```bash
npm run tauri build
```

The ready installer will appear in `src-tauri/target/release/bundle`.

## ⚠️ Known Limitations

- Paste simulation (`Ctrl+V`) works correctly only with the **English keyboard layout**. With other layouts, errors are possible — a fix is in development.
- The hotkey is currently hardcoded (`Ctrl+F2`); configuration through the interface will be added in upcoming updates.

## 🗺 Roadmap

- [ ] Fix paste simulation for non-English keyboard layouts
- [ ] Configurable hotkey through the interface
- [ ] Launch at system startup
- [ ] Hide window when clicking outside
- [ ] Export/import presets

## 📄 License

MIT

## Tags (SEO)

Keywords: formix, formix desktop, text templates, quick text insertion, text autoreplace, snippet manager, system utility, productivity, text automation, hotkeys, tauri app, rust desktop app, text expander, snippet manager, text template tool, productivity app, hotkey text insertion, clipboard automation, quick reply tool, autotext windows, text snippet manager, desktop productivity tool, formix alternative, formix for desktop
