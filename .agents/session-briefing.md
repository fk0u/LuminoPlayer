# Session Briefing: Lumino Player

## Project Snapshot
- **Project Name:** Lumino Player
- **Architecture:** Tauri v2 (Rust Backend) + libmpv Zero-Copy Hardware Acceleration + Windows 11 Acrylic/Mica (DWM) + React 18 / Vite / Tailwind CSS v4 / Framer Motion / Zustand.
- **Root Directory:** `d:\ServerData\Project\LuminoPlayer`
- **Current Status:** Inisialisasi awal proyek dan pembuatan codebase produksi.

## Goals & Milestones
- [x] Inisialisasi Git & Guardrails (`.gitignore`, `.graphifyignore`, `.agents/session-briefing.md`)
- [ ] Implementasi konfigurasi & modul Rust backend (`src-tauri`):
  - [ ] `Cargo.toml` & `build.rs`
  - [ ] `tauri.conf.json` & `capabilities/default.json`
  - [ ] `window.rs` (Windows 11 DWM Mica/Acrylic backdrop & frameless controls)
  - [ ] `mpv/` engine controller, event dispatcher, dan Tauri IPC commands
  - [ ] `main.rs` & `lib.rs`
- [ ] Implementasi Frontend React + Vite:
  - [ ] `package.json`, `vite.config.ts`, `tsconfig.json`
  - [ ] `src/types/player.ts` (Typed IPC Bridge)
  - [ ] `src/services/playerApi.ts` (Tauri invoke/listen wrapper)
  - [ ] `src/store/usePlayerStore.ts` (Zustand state synced with MPV events)
  - [ ] `src/components/TitleBar.tsx` (Frameless drag region & custom controls)
  - [ ] `src/components/VideoCanvas.tsx` (Direct MPV canvas & drag-and-drop handler)
  - [ ] `src/components/ControlDock.tsx` (Glassmorphic floating dock, auto-hide, scrubber)
  - [ ] `src/hooks/useIdleTimer.ts` & Hotkey listeners
- [ ] Verifikasi build dan dokumentasi eksekusi Windows 11 (`README.md`).
