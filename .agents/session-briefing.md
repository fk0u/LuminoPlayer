# Session Briefing: Lumino Player

## Project Snapshot
- **Project Name:** Lumino Player
- **Architecture:** Tauri v2 (Rust Backend) + libmpv Zero-Copy Hardware Acceleration + Windows 11 Acrylic/Mica (DWM) + React 18 / Vite / Tailwind CSS v4 / Framer Motion / Zustand.
- **Root Directory:** `d:\ServerData\Project\LuminoPlayer`
- **Current Status:** Seluruh fitur revisi UI (Volume Slider Rail, TopMenuBar Desktop Fluent, Sistem Subtitle Geser Otomatis, dan Auto Subtitle Downloader/Finder) telah selesai dibangun dan terverifikasi lulus kompilasi tanpa error.

## Completed Milestones
- [x] Inisialisasi Git & Guardrails (`.gitignore`, `.graphifyignore`, `.agents/session-briefing.md`)
- [x] Perbaikan Git Push: Mengabaikan seluruh file binary (`*.dll`, `*.lib`, `*.a`, `*.7z`) dari Git tracking dan memindahkan unduhan ke `scripts/setup_mpv.py` sehingga `git push` aman dari limit 100MB GitHub.
- [x] Peningkatan Fitur Kelas MPC-HC:
  - [x] Right-Click Glassmorphic Context Menu (`src/components/ContextMenu.tsx`)
  - [x] OSD Statistics HUD real-time (`Ctrl+J` / `Tab` / `I`) (`src/components/StatsOverlay.tsx`)
  - [x] Audio Boost hingga 150% dengan soft limiter (`src/components/ControlDock.tsx`)
  - [x] Frame-by-Frame Stepping (`.` dan `,`)
  - [x] Playback Speed dinamis 0.25x - 3.0x (`[` / `]` / `Backspace`)
  - [x] Mouse Scroll Wheel Volume Control dengan visual OSD Toast (`src/components/OsdToast.tsx`)
  - [x] Chapter Markers pada timeline scrubber dengan tooltip hover
  - [x] Always-on-Top toggle (`Ctrl+T` / tombol Pin pada title bar)
  - [x] Subtitle & Audio sync delay ($\pm 0.1\text{s}$) serta penyesuaian ukuran font
- [x] Perbaikan UI & Fitur Baru (User Feedback):
  - [x] **Volume Slider Dual-Rail:** Memperbaiki bar volume yang sebelumnya tidak tampak dengan bar ganda (`bg-white/20`), gradient fill, dan glowing thumb indicator yang 100% tampak jelas di backdrop gelap/terang.
  - [x] **TopMenuBar Desktop Fluent:** Menu dropdown klasik terintegrasi pada TitleBar (`Berkas`, `Putar`, `Audio`, `Subtitle`, `Tampilan`, `Pengaturan`) dengan Windows 11 Acrylic styling.
  - [x] **Sistem Subtitle Geser Otomatis:** Panel transkrip interaktif kanan (`src/components/SubtitleDrawer.tsx`) dengan auto-scrolling tersinkronisasi per baris dialog secara real-time, jump-to-seek saat diklik, search bar teks dialog, dan kontrol vertikal `sub-pos`.
  - [x] **Auto Subtitle Finder & Downloader:** Modal pencarian subtitle online (`src/components/AutoSubtitleModal.tsx`) dan auto-deteksi folder lokal menggunakan konfigurasi mpv `sub-auto=fuzzy` serta `sub-file-paths`.
  - [x] **Settings Modal:** Pengaturan umum, akselerasi GPU hardware decoding, subtitle defaults, dan cheat-sheet lengkap shortcut MPC-HC (`src/components/SettingsModal.tsx`).
- [x] Otomasi Setup Libmpv (`npm run setup:mpv`)
- [x] Verifikasi Kompilasi (Frontend & Backend lulus 0 error)
