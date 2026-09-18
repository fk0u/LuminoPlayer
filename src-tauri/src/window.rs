use tauri::{Runtime, WebviewWindow};

#[cfg(target_os = "windows")]
use windows_sys::Win32::Graphics::Dwm::DwmSetWindowAttribute;

// DWM System Backdrop Constants for Windows 11 Build 22621+
#[cfg(target_os = "windows")]
const DWMWA_USE_IMMERSIVE_DARK_MODE: u32 = 20;
#[cfg(target_os = "windows")]
const DWMWA_SYSTEMBACKDROP_TYPE: u32 = 38;

#[allow(dead_code)]
#[cfg(target_os = "windows")]
#[repr(u32)]
enum SystemBackdropType {
    Auto = 0,
    None = 1,
    MainWindow = 2, // Mica
    TransientWindow = 3, // Acrylic
    TabbedWindow = 4, // Mica Alt
}

/// Applies native Windows 11 Mica / Acrylic blur effect and dark mode to the Tauri window
pub fn setup_window_effects<R: Runtime>(window: &WebviewWindow<R>) {
    #[cfg(target_os = "windows")]
    {
        use window_vibrancy::{apply_acrylic, apply_mica};

        // Try applying Mica first (Windows 11 default standard)
        if apply_mica(window, Some(true)).is_err() {
            // Fallback to Acrylic if Mica is not supported (e.g. earlier Windows 10/11 revisions)
            let _ = apply_acrylic(window, Some((14, 16, 23, 125)));
        }

        // Apply DWM attributes directly for maximum fidelity on Win 11 Build 22621+
        if let Ok(hwnd) = window.hwnd() {
            unsafe {
                let dark_mode: i32 = 1;
                DwmSetWindowAttribute(
                    hwnd.0,
                    DWMWA_USE_IMMERSIVE_DARK_MODE,
                    &dark_mode as *const _ as *const _,
                    std::mem::size_of::<i32>() as u32,
                );

                let backdrop: u32 = SystemBackdropType::TransientWindow as u32; // Acrylic glass
                DwmSetWindowAttribute(
                    hwnd.0,
                    DWMWA_SYSTEMBACKDROP_TYPE,
                    &backdrop as *const _ as *const _,
                    std::mem::size_of::<u32>() as u32,
                );
            }
        }
    }

    #[cfg(target_os = "macos")]
    {
        use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};
        let _ = apply_vibrancy(window, NSVisualEffectMaterial::HudWindow, None, None);
    }
}

// Window Control Commands
#[tauri::command]
pub fn window_minimize<R: Runtime>(window: WebviewWindow<R>) -> Result<(), String> {
    window.minimize().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn window_maximize<R: Runtime>(window: WebviewWindow<R>) -> Result<(), String> {
    if window.is_maximized().unwrap_or(false) {
        window.unmaximize().map_err(|e| e.to_string())
    } else {
        window.maximize().map_err(|e| e.to_string())
    }
}

#[tauri::command]
pub fn window_close<R: Runtime>(window: WebviewWindow<R>) -> Result<(), String> {
    window.close().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn window_toggle_fullscreen<R: Runtime>(window: WebviewWindow<R>) -> Result<bool, String> {
    let is_fullscreen = window.is_fullscreen().unwrap_or(false);
    let next_state = !is_fullscreen;
    window.set_fullscreen(next_state).map_err(|e| e.to_string())?;
    Ok(next_state)
}

#[tauri::command]
pub fn window_toggle_always_on_top<R: Runtime>(window: WebviewWindow<R>) -> Result<bool, String> {
    // Check current state or invert
    // In Tauri, is_always_on_top can be checked or toggled
    let is_on_top = window.is_always_on_top().unwrap_or(false);
    let next = !is_on_top;
    window.set_always_on_top(next).map_err(|e| e.to_string())?;
    Ok(next)
}
