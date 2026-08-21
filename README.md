# Formix Desktop

**Formix Desktop** is a system utility for instantly inserting text templates into any application on your computer. Press a global hotkey to open a compact window with your presets – pick the one you need, fill in fields directly in the text, and insert the result with a single click wherever focus is.

## ✨ Features

- ⚡️ **Global hotkey** – configurable in the settings menu (default: `Ctrl+F2`)
- 📍 **Smart positioning** – the window opens next to the mouse cursor and stays within the screen bounds
- 📝 **Templates with fields** – create presets like `Hello, {{Name}}, how are you?`; a field can appear in a template more than once
- ⌨️ **Key automation** – insert a key press or combination into a template (for example Enter or Ctrl+Enter) anywhere in the text
- 📁 **Folders** – group presets into folders
- 🔍 **Quick search** – instant filtering of the preset list, including inside folders
- 📋 **One-click paste** – text is copied to the clipboard and automatically pasted into the active application; works correctly regardless of the active keyboard layout
- ⚙️ **Settings menu** – hotkey, theme, interface language, paste delay, launch at system startup
- 🌍 **Multilingual** – English and Russian interface
- 💾 **Preset export/import** – back up and transfer your preset library via a JSON file
- 🖥 **System tray** – the app runs in the background



## 🛠 Tech Stack

- [Tauri 2.0](https://tauri.app) – Rust core + system webview
- React + TypeScript
- Tailwind CSS
- Framer Motion
- react-i18next – internationalization
- SQLite (via `tauri-plugin-sql`) – local storage for presets, folders, and settings



## 🚀 Installation and Running



### Requirements

- [Node.js](https://nodejs.org) (LTS version)
- [Rust and Cargo](https://www.rust-lang.org/tools/install) (via `rustup`)
- On Windows – [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) with the **Desktop development with C++** component
- On Linux – WebKitGTK system dependencies ([see the Tauri guide](https://tauri.app/start/prerequisites/))



### Development

```bash
git clone https://github.com/PhantomUnk/Formix-Desktop.git
cd Formix-Desktop
npm install
npm run tauri dev
```



### Building a release version

```bash
npm run tauri build
```

The installer will appear in `src-tauri/target/release/bundle`.

### Ready-made build

The latest `.exe` is available on the [Releases](https://github.com/PhantomUnk/Formix-Desktop/releases) page.

> **Note:** the build is not signed with a certificate, so Windows SmartScreen may show a warning on first launch. Click "More info" → "Run anyway".



## 🗺 Roadmap

- [ ] Quick text abbreviations (e.g. `!hi` → ready-made text when typed in any field)



## 📄 License

MIT

## Tags (SEO)

Keywords: formix, formix desktop, text templates, quick text insertion, text autoreplace, snippet manager, system utility, productivity, text automation, hotkeys, tauri app, rust desktop app, text expander, snippet manager, text template tool, productivity app, hotkey text insertion, clipboard automation, quick reply tool, autotext windows, text snippet manager, desktop productivity tool, formix alternative, formix for desktop