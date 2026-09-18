use std::sync::Arc;
use tauri::State;

use super::{
    events::{MediaMetadata, TrackInfo},
    MpvManager,
};

#[tauri::command]
pub fn load_file(mpv: State<'_, Arc<MpvManager>>, file_path: String) -> Result<bool, String> {
    mpv.load_file(&file_path)?;
    Ok(true)
}

#[tauri::command]
pub fn play(mpv: State<'_, Arc<MpvManager>>) -> Result<(), String> {
    mpv.play()
}

#[tauri::command]
pub fn pause(mpv: State<'_, Arc<MpvManager>>) -> Result<(), String> {
    mpv.pause()
}

#[tauri::command]
pub fn toggle_playback(mpv: State<'_, Arc<MpvManager>>) -> Result<bool, String> {
    mpv.toggle_playback()
}

#[tauri::command]
pub fn seek(mpv: State<'_, Arc<MpvManager>>, seconds: f64, absolute: Option<bool>) -> Result<(), String> {
    mpv.seek(seconds, absolute.unwrap_or(true))
}

#[tauri::command]
pub fn set_volume(mpv: State<'_, Arc<MpvManager>>, volume: f64) -> Result<(), String> {
    mpv.set_volume(volume)
}

#[tauri::command]
pub fn toggle_mute(mpv: State<'_, Arc<MpvManager>>) -> Result<bool, String> {
    mpv.toggle_mute()
}

#[tauri::command]
pub fn set_subtitle_track(mpv: State<'_, Arc<MpvManager>>, track_id: i64) -> Result<(), String> {
    mpv.set_subtitle_track(track_id)
}

#[tauri::command]
pub fn set_audio_track(mpv: State<'_, Arc<MpvManager>>, track_id: i64) -> Result<(), String> {
    mpv.set_audio_track(track_id)
}

#[tauri::command]
pub fn get_metadata(mpv: State<'_, Arc<MpvManager>>) -> Result<MediaMetadata, String> {
    Ok(mpv.get_metadata())
}

#[tauri::command]
pub fn get_tracks(mpv: State<'_, Arc<MpvManager>>) -> Result<Vec<TrackInfo>, String> {
    Ok(mpv.get_tracks())
}

#[tauri::command]
pub async fn open_file_dialog() -> Result<Option<String>, String> {
    let file = rfd::AsyncFileDialog::new()
        .add_filter(
            "Media Files",
            &["mkv", "mp4", "webm", "avi", "mov", "flac", "wav", "mp3", "aac", "alac", "ts", "m4v", "mka", "ogg", "opus"],
        )
        .add_filter("All Files", &["*"])
        .set_title("Pilih Berkas Media - Lumino Player")
        .pick_file()
        .await;

    Ok(file.map(|f| f.path().to_string_lossy().to_string()))
}
