# Lumino Player 🎬✨

> **Enterprise-Grade Minimalist Desktop Media Player untuk Windows 11**  
> Ditenagai oleh **Tauri v2 (Rust)**, **libmpv Zero-Copy D3D11VA/NVDEC Engine**, dan antarmuka **Windows 11 Mica/Acrylic Glassmorphism** (React 18 + Tailwind CSS v4 + Framer Motion + Zustand).

---

## 🌟 Fitur Utama

- ⚡ **Ultra-Low Resource Footprint:** Dibangun dengan Tauri v2 dan backend Rust murni, mengonsumsi RAM dan CPU minimal dibanding Electron.
- 🚀 **Zero-Copy Hardware Acceleration:** Menggunakan `libmpv` dengan backend Direct3D 11 (`d3d11va`, `nvdec`, `quicksync`) yang memintas limitasi HTML5/WebView2 untuk memutar video 4K/60fps HDR/SDR tanpa stuttering.
- 🪟 **Native Windows 11 Backdrop (Mica / Acrylic):** Terintegrasi langsung dengan DWM API Windows 11 (`DwmSetWindowAttribute` & `window-vibrancy`) untuk visual kaca transparan alami.
- 🎛️ **Glassmorphic Floating Control Dock:** Kontrol melayang berdesain modern dengan auto-hide otomatis setelah 2 detik kursor tidak bergerak (Framer Motion).
- ⏱️ **Precision Scrubber & Hover Preview:** Timeline penjelajahan mulus dengan kalkulasi timestamp mengambang saat kursor diarahkan.
- 📂 **Drag-and-Drop Cepat:** Cukup seret berkas video/audio langsung ke dalam jendela aplikasi.
- 💬 **Dukungan Subtitle Lengkap:** Rendering subtitle format `.srt`, `.ass`, `.ssa` berkualitas tinggi melalui `libass`/mpv core.
- ⌨️ **Pintasan Keyboard Komprehensif:**
  - `Space`: Putar / Jeda
  - `Arrow Left` / `Arrow Right`: Mundur / Maju 5 detik
  - `Arrow Up` / `Arrow Down`: Volume $\pm 5\%$
  - `F`: Mode Layar Penuh (Fullscreen)
  - `M`: Bisu (Mute)

---

## 🏗️ Arsitektur Proyek

```
LuminoPlayer/
├── src/                        # Frontend React 18 + TypeScript
│   ├── components/
│   │   ├── TitleBar.tsx        # Titlebar frameless & native window controls
│   │   ├── VideoCanvas.tsx     # Area render video & drop zone
│   │   └── ControlDock.tsx     # Floating dock glassmorphism (auto-hide)
│   ├── hooks/
│   │   └── useIdleTimer.ts     # Hook timer inaktivitas mouse 2 detik
│   ├── services/
│   │   └── playerApi.ts        # Typed IPC bridge ke Rust backend
│   ├── store/
│   │   └── usePlayerStore.ts   # Zustand state tersinkronisasi event stream MPV
│   ├── types/
│   │   └── player.ts           # Definisi tipe metadata, track, dan event
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css               # Styling Tailwind CSS v4 & glassmorphism tokens
└── src-tauri/                  # Backend Rust (Tauri v2)
    ├── Cargo.toml
    ├── build.rs
    ├── tauri.conf.json
    ├── capabilities/
    │   └── default.json
    └── src/
        ├── main.rs
        ├── lib.rs              # Lifecycle Tauri v2 & event registration
        ├── window.rs           # Integrasi DWM Windows 11 Mica/Acrylic
        └── mpv/
            ├── mod.rs          # MPV Controller thread-safe & polling thread
            ├── commands.rs     # Tauri IPC commands (play, seek, volume, dll.)
            ├── events.rs       # Payload event stream
            └── raw.rs          # Safe dynamic FFI loader untuk libmpv (mpv-2.dll)
```

---

## 🛠️ Persyaratan Lingkungan (Prerequisites)

1. **Sistem Operasi:** Windows 11 (Build 22000+ untuk Mica, Build 22621+ disarankan untuk efek optimal).
2. **Node.js:** v18.0.0 atau lebih baru (v24 direkomendasikan).
3. **Rust Toolchain:** Rust `stable-x86_64-pc-windows-msvc`.
4. **Visual Studio C++ Build Tools:** Termasuk MSVC v143 dan Windows 11 SDK.

---

## 📥 Panduan Instalasi & Linking `libmpv` di Windows

Aplikasi menggunakan FFI dynamic loader cerdas yang mencari library `mpv-2.dll` pada runtime:

### Langkah 1: Unduh Binary `libmpv` untuk Windows
1. Kunjungi rilis build Windows MPV dari [zhongfly/mpv-winbuild](https://github.com/zhongfly/mpv-winbuild/releases) atau [SourceForge mpv-player-windows](https://sourceforge.net/projects/mpv-player-windows/files/libmpv/).
2. Unduh arsip **`mpv-dev-x86_64-*.7z`**.
3. Ekstrak arsip tersebut.

### Langkah 2: Tempatkan DLL
Salin berkas **`mpv-2.dll`** (atau `libmpv-2.dll`) ke salah satu lokasi berikut:
- Direktori root proyek: `d:\ServerData\Project\LuminoPlayer\`
- Atau direktori target output: `d:\ServerData\Project\LuminoPlayer\src-tauri\target\debug\`
- Atau letakkan folder yang berisi `mpv-2.dll` ke dalam variabel lingkungan sistem **`PATH`**.

---

## 🚀 Menjalankan Aplikasi

### Mode Pengembangan (Development)

1. **Pasang Dependensi Frontend:**
   ```bash
   npm install
   ```

2. **Jalankan Aplikasi Desktop (Tauri v2):**
   ```bash
   npm run tauri dev
   ```

3. **Pratinjau Antarmuka Web (Mocking Mode):**
   Jika ingin meninjau atau mengembangkan antarmuka UI di browser tanpa membuka jendela native desktop:
   ```bash
   npm run dev
   ```

### Mode Produksi (Build)

Untuk menghasilkan berkas installer/executable `.exe`:
```bash
npm run tauri build
```
Berkas executable hasil kompilasi akan berada di `src-tauri/target/release/lumino-player.exe`.

---

## 📄 Lisensi

Didistribusikan di bawah Lisensi MIT.
