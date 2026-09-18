# Mistake Registry: Lumino Player

## [2026-09-18] Tauri v2 Windows Resource & DWM Attribute Type Issues

- **Error 1:** `icons/icon.ico not found; required for generating a Windows Resource file during tauri-build`.
  - **Root Cause:** Pada Windows, `tauri-build::build()` secara default memerlukan berkas ikon `icons/icon.ico` (atau di `src-tauri/icons/icon.ico`) untuk menyusun file resource Windows (`.rc`).
  - **Prevention / Fix:** Pastikan folder `src-tauri/icons/` selalu memuat `icon.ico`, `icon.png`, `32x32.png`, dan `128x128.png` saat inisialisasi awal proyek Tauri v2 di platform Windows.

- **Error 2:** `mismatched types in DwmSetWindowAttribute: expected u32, found i32`.
  - **Root Cause:** Pada `windows-sys` v0.59, parameter `dwattribute` pada fungsi `DwmSetWindowAttribute` didefinisikan sebagai `u32`, sedangkan konstanta `DWMWINDOWATTRIBUTE` adalah `i32`.
  - **Prevention / Fix:** Definisikan konstanta DWM khusus Windows 11 (`DWMWA_USE_IMMERSIVE_DARK_MODE = 20u32`, `DWMWA_SYSTEMBACKDROP_TYPE = 38u32`) langsung sebagai `u32`.

- **Error 3:** `'tauri' is not recognized as an internal or external command`.
  - **Root Cause:** Script `"tauri": "tauri"` pada `package.json` memerlukan binary CLI dari package `@tauri-apps/cli` di `devDependencies`.
  - **Prevention / Fix:** Selalu sertakan `@tauri-apps/cli` di dalam `devDependencies` pada `package.json` proyek Tauri.
