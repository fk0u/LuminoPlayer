pub mod commands;
pub mod events;
pub mod raw;

use std::sync::Arc;
use parking_lot::Mutex;
use tauri::{AppHandle, Emitter};

use events::{ChapterInfo, MediaMetadata, MpvEventPayload, TrackInfo, VideoStats};
use raw::{
    MpvEventProperty, MpvFunctions, SafeMpvInstance, MPV_EVENT_END_FILE,
    MPV_EVENT_FILE_LOADED, MPV_EVENT_PROPERTY_CHANGE, MPV_EVENT_SHUTDOWN,
    MPV_FORMAT_DOUBLE, MPV_FORMAT_FLAG, MPV_FORMAT_STRING,
};

pub struct MpvManager {
    instance: Arc<Mutex<Option<SafeMpvInstance>>>,
    functions: Option<Arc<MpvFunctions>>,
    current_filepath: Arc<Mutex<Option<String>>>,
    current_volume: Arc<Mutex<f64>>,
    is_muted: Arc<Mutex<bool>>,
    is_paused: Arc<Mutex<bool>>,
}

impl MpvManager {
    pub fn new() -> Self {
        let fns = MpvFunctions::load().ok();
        Self {
            instance: Arc::new(Mutex::new(None)),
            functions: fns,
            current_filepath: Arc::new(Mutex::new(None)),
            current_volume: Arc::new(Mutex::new(80.0)),
            is_muted: Arc::new(Mutex::new(false)),
            is_paused: Arc::new(Mutex::new(true)),
        }
    }

    /// Initializes MPV with HWND attachment and hardware acceleration flags
    pub fn initialize(&self, app_handle: AppHandle, wid: Option<usize>) -> Result<(), String> {
        let fns = self
            .functions
            .as_ref()
            .ok_or_else(|| "libmpv DLL is not loaded. Ensure mpv-2.dll is installed.".to_string())?;

        let instance = SafeMpvInstance::new(Arc::clone(fns))?;

        // Configure high-performance zero-copy Direct3D 11 & hardware decoding
        let _ = instance.set_option("hwdec", "auto-safe");
        let _ = instance.set_option("vo", "gpu-next");
        let _ = instance.set_option("gpu-api", "d3d11");
        let _ = instance.set_option("d3d11-exclusive-fs", "no");
        let _ = instance.set_option("keep-open", "yes");
        let _ = instance.set_option("sub-auto", "fuzzy");
        let _ = instance.set_option("sub-file-paths", "sub:subs:subtitles:Subtitles:Subs");
        let _ = instance.set_option("audio-pitch-correction", "yes");

        // Attach to native Window ID (HWND) if provided
        if let Some(hwnd) = wid {
            let _ = instance.set_option("wid", &hwnd.to_string());
        }

        instance.initialize()?;

        // Observe playback properties
        let _ = instance.observe_property(1, "time-pos", MPV_FORMAT_DOUBLE);
        let _ = instance.observe_property(2, "duration", MPV_FORMAT_DOUBLE);
        let _ = instance.observe_property(3, "pause", MPV_FORMAT_FLAG);
        let _ = instance.observe_property(4, "media-title", MPV_FORMAT_STRING);

        // Store active instance
        *self.instance.lock() = Some(instance);

        // Spawn event polling loop in a background thread
        let instance_clone = Arc::clone(&self.instance);
        let fns_clone = Arc::clone(fns);
        let is_paused_clone = Arc::clone(&self.is_paused);

        std::thread::spawn(move || {
            loop {
                let handle = {
                    let guard = instance_clone.lock();
                    match guard.as_ref() {
                        Some(inst) => inst.handle,
                        None => break,
                    }
                };

                let event_ptr = unsafe { (fns_clone.wait_event)(handle, 0.05) };
                if event_ptr.is_null() {
                    continue;
                }

                let event = unsafe { &*event_ptr };
                match event.event_id {
                    MPV_EVENT_SHUTDOWN => {
                        break;
                    }
                    MPV_EVENT_FILE_LOADED => {
                        *is_paused_clone.lock() = false;
                        let _ = app_handle.emit(
                            "mpv-event",
                            MpvEventPayload {
                                event: "file-loaded".to_string(),
                                data: serde_json::json!({}),
                            },
                        );
                    }
                    MPV_EVENT_END_FILE => {
                        *is_paused_clone.lock() = true;
                        let _ = app_handle.emit(
                            "mpv-event",
                            MpvEventPayload {
                                event: "end-file".to_string(),
                                data: serde_json::json!({}),
                            },
                        );
                    }
                    MPV_EVENT_PROPERTY_CHANGE => {
                        if !event.data.is_null() {
                            let prop = unsafe { &*(event.data as *const MpvEventProperty) };
                            let prop_name = unsafe {
                                if prop.name.is_null() {
                                    ""
                                } else {
                                    std::ffi::CStr::from_ptr(prop.name)
                                        .to_str()
                                        .unwrap_or("")
                                }
                            };

                            match prop_name {
                                "time-pos" => {
                                    if prop.format == MPV_FORMAT_DOUBLE && !prop.data.is_null() {
                                        let val = unsafe { *(prop.data as *const f64) };
                                        let _ = app_handle.emit(
                                            "mpv-event",
                                            MpvEventPayload {
                                                event: "time-pos".to_string(),
                                                data: val,
                                            },
                                        );
                                    }
                                }
                                "duration" => {
                                    if prop.format == MPV_FORMAT_DOUBLE && !prop.data.is_null() {
                                        let val = unsafe { *(prop.data as *const f64) };
                                        let _ = app_handle.emit(
                                            "mpv-event",
                                            MpvEventPayload {
                                                event: "duration".to_string(),
                                                data: val,
                                            },
                                        );
                                    }
                                }
                                "pause" => {
                                    if prop.format == MPV_FORMAT_FLAG && !prop.data.is_null() {
                                        let val = unsafe { *(prop.data as *const i32) } != 0;
                                        *is_paused_clone.lock() = val;
                                        let _ = app_handle.emit(
                                            "mpv-event",
                                            MpvEventPayload {
                                                event: "pause".to_string(),
                                                data: val,
                                            },
                                        );
                                    }
                                }
                                _ => {}
                            }
                        }
                    }
                    _ => {}
                }
            }
        });

        Ok(())
    }

    pub fn load_file(&self, file_path: &str) -> Result<(), String> {
        let guard = self.instance.lock();
        let inst = guard.as_ref().ok_or("MPV instance is not initialized")?;

        *self.current_filepath.lock() = Some(file_path.to_string());
        inst.command(&format!("loadfile \"{}\" replace", file_path.replace('\\', "/")))?;
        inst.set_property("pause", "no")?;
        *self.is_paused.lock() = false;
        Ok(())
    }

    pub fn play(&self) -> Result<(), String> {
        let guard = self.instance.lock();
        let inst = guard.as_ref().ok_or("MPV instance is not initialized")?;
        inst.set_property("pause", "no")?;
        *self.is_paused.lock() = false;
        Ok(())
    }

    pub fn pause(&self) -> Result<(), String> {
        let guard = self.instance.lock();
        let inst = guard.as_ref().ok_or("MPV instance is not initialized")?;
        inst.set_property("pause", "yes")?;
        *self.is_paused.lock() = true;
        Ok(())
    }

    pub fn toggle_playback(&self) -> Result<bool, String> {
        let paused = *self.is_paused.lock();
        if paused {
            self.play()?;
            Ok(true)
        } else {
            self.pause()?;
            Ok(false)
        }
    }

    pub fn seek(&self, seconds: f64, absolute: bool) -> Result<(), String> {
        let guard = self.instance.lock();
        let inst = guard.as_ref().ok_or("MPV instance is not initialized")?;
        let mode = if absolute { "absolute" } else { "relative" };
        inst.command(&format!("seek {} {}", seconds, mode))?;
        Ok(())
    }

    pub fn set_volume(&self, volume: f64) -> Result<(), String> {
        let guard = self.instance.lock();
        let inst = guard.as_ref().ok_or("MPV instance is not initialized")?;
        let clamped = volume.clamp(0.0, 150.0); // MPC-HC audio boost up to 150%
        *self.current_volume.lock() = clamped;
        inst.set_property("volume", &clamped.to_string())?;
        Ok(())
    }

    pub fn set_speed(&self, speed: f64) -> Result<(), String> {
        let guard = self.instance.lock();
        let inst = guard.as_ref().ok_or("MPV instance is not initialized")?;
        let clamped = speed.clamp(0.25, 4.0);
        inst.set_property("speed", &clamped.to_string())?;
        Ok(())
    }

    pub fn step_frame(&self, forward: bool) -> Result<(), String> {
        let guard = self.instance.lock();
        let inst = guard.as_ref().ok_or("MPV instance is not initialized")?;
        let cmd = if forward { "frame-step" } else { "frame-back-step" };
        inst.command(cmd)?;
        Ok(())
    }

    pub fn set_aspect_ratio(&self, ratio: &str) -> Result<(), String> {
        let guard = self.instance.lock();
        let inst = guard.as_ref().ok_or("MPV instance is not initialized")?;
        inst.set_property("video-aspect-override", ratio)?;
        Ok(())
    }

    pub fn set_sub_delay(&self, seconds: f64) -> Result<(), String> {
        let guard = self.instance.lock();
        let inst = guard.as_ref().ok_or("MPV instance is not initialized")?;
        inst.set_property("sub-delay", &seconds.to_string())?;
        Ok(())
    }

    pub fn set_audio_delay(&self, seconds: f64) -> Result<(), String> {
        let guard = self.instance.lock();
        let inst = guard.as_ref().ok_or("MPV instance is not initialized")?;
        inst.set_property("audio-delay", &seconds.to_string())?;
        Ok(())
    }

    pub fn set_sub_scale(&self, scale: f64) -> Result<(), String> {
        let guard = self.instance.lock();
        let inst = guard.as_ref().ok_or("MPV instance is not initialized")?;
        let clamped = scale.clamp(0.5, 3.0);
        inst.set_property("sub-scale", &clamped.to_string())?;
        Ok(())
    }

    pub fn set_sub_pos(&self, pos: i64) -> Result<(), String> {
        let guard = self.instance.lock();
        let inst = guard.as_ref().ok_or("MPV instance is not initialized")?;
        let clamped = pos.clamp(0, 100);
        inst.set_property("sub-pos", &clamped.to_string())?;
        Ok(())
    }

    pub fn add_subtitle_file(&self, path: &str) -> Result<(), String> {
        let guard = self.instance.lock();
        let inst = guard.as_ref().ok_or("MPV instance is not initialized")?;
        inst.command(&format!("sub-add \"{}\"", path.replace('\\', "/")))?;
        Ok(())
    }

    pub fn take_screenshot(&self) -> Result<String, String> {
        let guard = self.instance.lock();
        let inst = guard.as_ref().ok_or("MPV instance is not initialized")?;
        inst.command("screenshot video")?;
        Ok("Screenshot captured".to_string())
    }

    pub fn get_stats(&self) -> VideoStats {
        let guard = self.instance.lock();
        let inst = match guard.as_ref() {
            Some(i) => i,
            None => return VideoStats::default(),
        };

        let hwdec_current = inst.get_property_string("hwdec-current");
        let estimated_fps = inst
            .get_property_string("estimated-vf-fps")
            .and_then(|s| s.parse::<f64>().ok());
        let drop_frame_count = inst
            .get_property_string("drop-frame-count")
            .and_then(|s| s.parse::<i64>().ok());
        let video_bitrate = inst
            .get_property_string("video-bitrate")
            .and_then(|s| s.parse::<f64>().ok());
        let audio_bitrate = inst
            .get_property_string("audio-bitrate")
            .and_then(|s| s.parse::<f64>().ok());
        let audio_channels = inst.get_property_string("audio-params/channels");
        let audio_samplerate = inst
            .get_property_string("audio-params/samplerate")
            .and_then(|s| s.parse::<i64>().ok());
        let audio_codec = inst.get_property_string("audio-codec");
        let video_codec = inst.get_property_string("video-codec");
        let aspect_ratio = inst.get_property_string("video-aspect-override");

        VideoStats {
            hwdec_current,
            estimated_fps,
            drop_frame_count,
            video_bitrate,
            audio_bitrate,
            audio_channels,
            audio_samplerate,
            audio_codec,
            video_codec,
            aspect_ratio,
        }
    }

    pub fn get_chapters(&self) -> Vec<ChapterInfo> {
        let guard = self.instance.lock();
        let inst = match guard.as_ref() {
            Some(i) => i,
            None => return Vec::new(),
        };

        let count = inst
            .get_property_string("chapter-list/count")
            .and_then(|s| s.parse::<usize>().ok())
            .unwrap_or(0);

        let mut chapters = Vec::new();
        for i in 0..count {
            let title = inst.get_property_string(&format!("chapter-list/{}/title", i));
            let time = inst
                .get_property_string(&format!("chapter-list/{}/time", i))
                .and_then(|s| s.parse::<f64>().ok())
                .unwrap_or(0.0);

            chapters.push(ChapterInfo {
                id: i as i64,
                title,
                time,
            });
        }
        chapters
    }

    pub fn toggle_mute(&self) -> Result<bool, String> {
        let guard = self.instance.lock();
        let inst = guard.as_ref().ok_or("MPV instance is not initialized")?;
        let mut muted = self.is_muted.lock();
        *muted = !*muted;
        let val_str = if *muted { "yes" } else { "no" };
        inst.set_property("mute", val_str)?;
        Ok(*muted)
    }

    pub fn set_subtitle_track(&self, track_id: i64) -> Result<(), String> {
        let guard = self.instance.lock();
        let inst = guard.as_ref().ok_or("MPV instance is not initialized")?;
        inst.set_property("sid", &track_id.to_string())?;
        Ok(())
    }

    pub fn set_audio_track(&self, track_id: i64) -> Result<(), String> {
        let guard = self.instance.lock();
        let inst = guard.as_ref().ok_or("MPV instance is not initialized")?;
        inst.set_property("aid", &track_id.to_string())?;
        Ok(())
    }

    pub fn get_metadata(&self) -> MediaMetadata {
        let guard = self.instance.lock();
        let inst = match guard.as_ref() {
            Some(i) => i,
            None => return MediaMetadata::default(),
        };

        let title = inst
            .get_property_string("media-title")
            .or_else(|| self.current_filepath.lock().clone());
        let duration = inst
            .get_property_string("duration")
            .and_then(|s| s.parse::<f64>().ok());
        let width = inst
            .get_property_string("width")
            .and_then(|s| s.parse::<i64>().ok());
        let height = inst
            .get_property_string("height")
            .and_then(|s| s.parse::<i64>().ok());
        let video_codec = inst.get_property_string("video-codec");
        let audio_codec = inst.get_property_string("audio-codec");
        let fps = inst
            .get_property_string("container-fps")
            .and_then(|s| s.parse::<f64>().ok());

        let color_space = inst.get_property_string("colormatrix");
        let is_hdr = color_space
            .as_ref()
            .map(|cs| cs.contains("bt.2020") || cs.contains("pq") || cs.contains("hlg"))
            .unwrap_or(false);

        MediaMetadata {
            title,
            artist: inst.get_property_string("metadata/by-key/artist"),
            album: inst.get_property_string("metadata/by-key/album"),
            duration,
            width,
            height,
            fps,
            video_codec,
            audio_codec,
            file_size: None,
            file_path: self.current_filepath.lock().clone(),
            is_hdr: Some(is_hdr),
            color_space,
        }
    }

    pub fn get_tracks(&self) -> Vec<TrackInfo> {
        let guard = self.instance.lock();
        let inst = match guard.as_ref() {
            Some(i) => i,
            None => return Vec::new(),
        };

        let count = inst
            .get_property_string("track-list/count")
            .and_then(|s| s.parse::<usize>().ok())
            .unwrap_or(0);

        let mut tracks = Vec::new();
        for i in 0..count {
            let id = inst
                .get_property_string(&format!("track-list/{}/id", i))
                .and_then(|s| s.parse::<i64>().ok())
                .unwrap_or(i as i64);
            let track_type = inst
                .get_property_string(&format!("track-list/{}/type", i))
                .unwrap_or_else(|| "unknown".into());
            let title = inst.get_property_string(&format!("track-list/{}/title", i));
            let lang = inst.get_property_string(&format!("track-list/{}/lang", i));
            let codec = inst.get_property_string(&format!("track-list/{}/codec", i));
            let selected = inst
                .get_property_string(&format!("track-list/{}/selected", i))
                .map(|s| s == "yes")
                .unwrap_or(false);
            let external = inst
                .get_property_string(&format!("track-list/{}/external", i))
                .map(|s| s == "yes");

            tracks.push(TrackInfo {
                id,
                track_type,
                title,
                lang,
                codec,
                selected,
                external,
            });
        }
        tracks
    }
}
