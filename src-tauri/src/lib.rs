pub mod mpv;
pub mod window;

use std::sync::Arc;
use tauri::Manager;

use mpv::{commands as mpv_cmds, MpvManager};
use window as win_cmds;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mpv_manager = Arc::new(MpvManager::new());
    let mpv_for_setup = Arc::clone(&mpv_manager);

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(mpv_manager)
        .setup(move |app| {
            if let Some(main_window) = app.get_webview_window("main") {
                // Apply Windows 11 Mica / Acrylic backdrop effects
                win_cmds::setup_window_effects(&main_window);

                // Initialize MPV instance with window HWND
                let hwnd = main_window.hwnd().map(|h| h.0 as usize).ok();
                if let Err(e) = mpv_for_setup.initialize(app.handle().clone(), hwnd) {
                    eprintln!("[Lumino Warning] MPV initialization: {}", e);
                }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // MPV Playback Commands
            mpv_cmds::load_file,
            mpv_cmds::play,
            mpv_cmds::pause,
            mpv_cmds::toggle_playback,
            mpv_cmds::seek,
            mpv_cmds::set_volume,
            mpv_cmds::toggle_mute,
            mpv_cmds::set_subtitle_track,
            mpv_cmds::set_audio_track,
            mpv_cmds::get_metadata,
            mpv_cmds::get_tracks,
            mpv_cmds::open_file_dialog,
            // Window Commands
            win_cmds::window_minimize,
            win_cmds::window_maximize,
            win_cmds::window_close,
            win_cmds::window_toggle_fullscreen,
        ])
        .run(tauri::generate_context!())
        .expect("error while running lumino player application");
}
