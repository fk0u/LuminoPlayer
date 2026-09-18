use std::sync::Arc;
use tauri::State;

use super::{
    events::{ChapterInfo, MediaMetadata, TrackInfo, VideoStats},
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

#[tauri::command]
pub fn set_speed(mpv: State<'_, Arc<MpvManager>>, speed: f64) -> Result<(), String> {
    mpv.set_speed(speed)
}

#[tauri::command]
pub fn step_frame(mpv: State<'_, Arc<MpvManager>>, forward: bool) -> Result<(), String> {
    mpv.step_frame(forward)
}

#[tauri::command]
pub fn set_aspect_ratio(mpv: State<'_, Arc<MpvManager>>, ratio: String) -> Result<(), String> {
    mpv.set_aspect_ratio(&ratio)
}

#[tauri::command]
pub fn set_sub_delay(mpv: State<'_, Arc<MpvManager>>, seconds: f64) -> Result<(), String> {
    mpv.set_sub_delay(seconds)
}

#[tauri::command]
pub fn set_audio_delay(mpv: State<'_, Arc<MpvManager>>, seconds: f64) -> Result<(), String> {
    mpv.set_audio_delay(seconds)
}

#[tauri::command]
pub fn set_sub_scale(mpv: State<'_, Arc<MpvManager>>, scale: f64) -> Result<(), String> {
    mpv.set_sub_scale(scale)
}

#[tauri::command]
pub fn add_subtitle_file(mpv: State<'_, Arc<MpvManager>>, path: String) -> Result<(), String> {
    mpv.add_subtitle_file(&path)
}

#[tauri::command]
pub fn take_screenshot(mpv: State<'_, Arc<MpvManager>>) -> Result<String, String> {
    mpv.take_screenshot()
}

#[tauri::command]
pub fn get_stats(mpv: State<'_, Arc<MpvManager>>) -> Result<VideoStats, String> {
    Ok(mpv.get_stats())
}

#[tauri::command]
pub fn get_chapters(mpv: State<'_, Arc<MpvManager>>) -> Result<Vec<ChapterInfo>, String> {
    Ok(mpv.get_chapters())
}

#[tauri::command]
pub async fn open_subtitle_dialog() -> Result<Option<String>, String> {
    let file = rfd::AsyncFileDialog::new()
        .add_filter(
            "Subtitle Files",
            &["srt", "ass", "ssa", "vtt", "sub", "idx", "lrc"],
        )
        .add_filter("All Files", &["*"])
        .set_title("Pilih Berkas Subtitle - Lumino Player")
        .pick_file()
        .await;

    Ok(file.map(|f| f.path().to_string_lossy().to_string()))
}
