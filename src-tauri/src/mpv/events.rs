use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrackInfo {
    pub id: i64,
    #[serde(rename = "type")]
    pub track_type: String,
    pub title: Option<String>,
    pub lang: Option<String>,
    pub codec: Option<String>,
    pub selected: bool,
    pub external: Option<bool>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct MediaMetadata {
    pub title: Option<String>,
    pub artist: Option<String>,
    pub album: Option<String>,
    pub duration: Option<f64>,
    pub width: Option<i64>,
    pub height: Option<i64>,
    pub fps: Option<f64>,
    #[serde(rename = "videoCodec")]
    pub video_codec: Option<String>,
    #[serde(rename = "audioCodec")]
    pub audio_codec: Option<String>,
    #[serde(rename = "fileSize")]
    pub file_size: Option<u64>,
    #[serde(rename = "filePath")]
    pub file_path: Option<String>,
    #[serde(rename = "isHdr")]
    pub is_hdr: Option<bool>,
    #[serde(rename = "colorSpace")]
    pub color_space: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MpvEventPayload<T> {
    pub event: String,
    pub data: T,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChapterInfo {
    pub id: i64,
    pub title: Option<String>,
    pub time: f64,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct VideoStats {
    #[serde(rename = "hwdecCurrent")]
    pub hwdec_current: Option<String>,
    #[serde(rename = "estimatedFps")]
    pub estimated_fps: Option<f64>,
    #[serde(rename = "dropFrameCount")]
    pub drop_frame_count: Option<i64>,
    #[serde(rename = "videoBitrate")]
    pub video_bitrate: Option<f64>,
    #[serde(rename = "audioBitrate")]
    pub audio_bitrate: Option<f64>,
    #[serde(rename = "audioChannels")]
    pub audio_channels: Option<String>,
    #[serde(rename = "audioSamplerate")]
    pub audio_samplerate: Option<i64>,
    #[serde(rename = "audioCodec")]
    pub audio_codec: Option<String>,
    #[serde(rename = "videoCodec")]
    pub video_codec: Option<String>,
    #[serde(rename = "aspectRatio")]
    pub aspect_ratio: Option<String>,
}
