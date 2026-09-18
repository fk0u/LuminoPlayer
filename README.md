# Lumino Player 🎬✨

> **Enterprise-Grade Minimalist Desktop Media Player untuk Windows 11 (Kelas MPC-HC)**  
> Ditenagai oleh **Tauri v2 (Rust)**, **libmpv Zero-Copy D3D11VA/NVDEC Engine**, dan antarmuka **Windows 11 Mica/Acrylic Glassmorphism** (React 18 + Tailwind CSS v4 + Framer Motion + Zustand).

---

## 🌟 Fitur Unggulan (Menyaingi MPC-HC)

- ⚡ **Ultra-Low Resource Footprint:** Dibangun dengan Tauri v2 dan backend Rust murni, mengonsumsi RAM dan CPU minimal dibanding Electron.
- 🚀 **Zero-Copy Hardware Acceleration:** Menggunakan `libmpv` dengan backend Direct3D 11 (`d3d11va`, `nvdec`, `quicksync`) yang memintas limitasi HTML5/WebView2 untuk memutar video 4K/60fps HDR/SDR tanpa stuttering.
- 🪟 **Native Windows 11 Backdrop (Mica / Acrylic):** Terintegrasi langsung dengan DWM API Windows 11 (`DwmSetWindowAttribute` & `window-vibrancy`) untuk visual kaca transparan alami.
- 🖱️ **Right-Click Context Menu Glassmorphic:** Klik kanan di area video mana saja untuk mengakses menu trek audio, subtitle, rasio aspek, kecepatan, dan delay sync.
- 📊 **OSD Statistics HUD (`Ctrl+J` / `Tab` / `I`):** Overlay metrik teknis real-time menampilkan hardware decoder aktif, FPS riil, dropped frames, bitrate, codec, resolusi, dan color space HDR BT.2020.
- 🔊 **Audio Boost Hingga 150%:** Menaikkan volume melampaui 100% (hingga 150%) dengan soft limiter untuk video atau film dengan dialog vokal pelan.
- ⏭️ **Frame-by-Frame Stepping & Speed Control:**
  - `.` / `,`: Maju / mundur 1 frame secara presisi.
  - `[` / `]`: Perlambat / percepat pemutaran (0.25x hingga 3.0x).
  - `Backspace`: Kembalikan ke kecepatan normal 1.0x.
- 🎚️ **Mouse Wheel Volume:** Mengatur volume langsung dengan memutar scroll roda mouse di atas area video dengan indikator toast visual.
- 📌 **Always on Top (Pin Window):** Sematkan jendela Lumino agar selalu mengapung di atas aplikasi lain (`Ctrl+T` atau tombol pin di title bar).
- 🏷️ **Chapter Markers:** Penanda bab/chapter otomatis pada scrubber timeline untuk berkas MKV/MP4 dengan tooltip judul saat di-hover.
- 💬 **Dukungan Subtitle Lengkap:** Rendering format `.srt`, `.ass`, `.ssa`, `.vtt` dengan pengaturan delay $\pm 0.1\text{s}$ (`Z`/`X`) dan penyesuaian ukuran font.
- 📂 **Native Drag-and-Drop & File Picker:** Buka berkas melalui dialog Windows File Explorer bawaan atau seret langsung dari desktop/folder.

---

## ⌨️ Daftar Pintasan Keyboard (Hotkeys)

| Tombol | Fungsi |
|---|---|
| `Space` | Putar / Jeda (Play / Pause) |
| `Arrow Left` / `Arrow Right` | Mundur / Maju 5 detik |
| `Shift + Left` / `Shift + Right` | Mundur / Maju halus 1 detik |
| `Arrow Up` / `Arrow Down` | Volume $\pm 5\%$ (Mendukung hingga 150% Boost) |
| `Scroll Roda Mouse` | Volume $\pm 3\%$ di atas area video |
| `[` / `]` | Kecepatan putar $\pm 0.1\text{x}$ (0.25x - 3.0x) |
| `Backspace` | Reset kecepatan putar ke 1.0x |
| `.` (Titik) | Maju 1 Frame (Frame Step Forward) |
| `,` (Koma) | Mundur 1 Frame (Frame Step Backward) |
| `Z` / `X` | Subtitle Delay $\pm 0.1\text{s}$ |
| `Tab` / `Ctrl + J` / `I` | Buka / Tutup OSD Statistics HUD |
| `Ctrl + O` | Buka Dialog Pilih Berkas Media |
| `Ctrl + T` | Toggle Always on Top (Sematkan Jendela) |
| `S` | Tangkapan Layar (Screenshot Frame) |
| `F` | Mode Layar Penuh (Fullscreen) |
| `M` | Bisu (Mute) |

---

## 🏗️ Arsitektur Proyek

```
LuminoPlayer/
├── scripts/
│   └── setup_mpv.py            # Otomasi pengunduhan & penataan libmpv Windows
├── src/                        # Frontend React 18 + TypeScript
│   ├── components/
│   │   ├── TitleBar.tsx        # Titlebar frameless & pin window
│   │   ├── VideoCanvas.tsx     # Area render video & native drop zone
│   │   ├── ControlDock.tsx     # Floating dock glassmorphism (auto-hide & scrubber)
│   │   ├── ContextMenu.tsx     # Menu klik kanan MPC-HC glassmorphism
│   │   ├── StatsOverlay.tsx    # OSD technical HUD (Ctrl+J)
│   │   └── OsdToast.tsx        # Toast visual volume & speed
│   ├── hooks/
│   │   └── useIdleTimer.ts     # Hook timer inaktivitas mouse 2 detik
│   ├── services/
│   │   └── playerApi.ts        # Typed IPC bridge ke Rust backend
│   ├── store/
│   │   └── usePlayerStore.ts   # Zustand state tersinkronisasi event stream MPV
│   ├── types/
│   │   └── player.ts           # Definisi tipe metadata, chapter, stats, dan event
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css               # Styling Tailwind CSS v4 & glassmorphism tokens
└── src-tauri/                  # Backend Rust (Tauri v2)
    ├── Cargo.toml              # Dependensi Rust (tauri, rfd, window-vibrancy, windows-sys)
    ├── build.rs
    ├── tauri.conf.json         # Konfigurasi transparent window & capabilities
    └── src/
        ├── main.rs
        ├── lib.rs              # Lifecycle Tauri v2 & registrasi command handler
        ├── window.rs           # Integrasi DWM Windows 11 Mica/Acrylic & controls
        └── mpv/
            ├── mod.rs          # MPV Controller thread-safe & event polling thread
            ├── commands.rs     # Handler IPC (play, seek, speed, stats, dialog, dll.)
            ├── events.rs       # Payload event stream & data structures
            └── raw.rs          # Safe dynamic FFI loader untuk libmpv (mpv-2.dll)
```

---

## 🚀 Memulai Proyek

### 1. Pasang Dependensi & Siapkan `libmpv`
```bash
npm install
npm run setup:mpv
```
> Perintah `npm run setup:mpv` akan secara otomatis mengunduh berkas binary 64-bit `libmpv-2.dll` resmi dan menempatkannya di folder proyek.

### 2. Jalankan Mode Pengembangan (Desktop)
```bash
npm run tauri dev
```

### 3. Build Executable Produksi
```bash
npm run tauri build
```
Berkas executable hasil kompilasi akan berada di `src-tauri/target/release/lumino-player.exe`.

---

## 📄 Lisensi

Didistribusikan di bawah Lisensi MIT.
