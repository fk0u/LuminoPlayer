export type TrackType = 'video' | 'audio' | 'sub';

export interface TrackInfo {
  id: number;
  type: TrackType;
  title?: string;
  lang?: string;
  codec?: string;
  selected: boolean;
  external?: boolean;
}

export interface MediaMetadata {
  title?: string;
  artist?: string;
  album?: string;
  duration?: number;
  width?: number;
  height?: number;
  fps?: number;
  videoCodec?: string;
  audioCodec?: string;
  fileSize?: number;
  filePath?: string;
  isHdr?: boolean;
  colorSpace?: string;
}

export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  isIdle: boolean;
  isBuffering: boolean;
}

export type MpvEventType =
  | 'time-pos'
  | 'duration'
  | 'pause'
  | 'file-loaded'
  | 'end-file'
  | 'track-list'
  | 'metadata-update'
  | 'seek'
  | 'error';

export interface MpvEventPayload<T = unknown> {
  event: MpvEventType;
  data: T;
}

export interface PlayerTimeUpdate {
  currentTime: number;
}

export interface PlayerDurationUpdate {
  duration: number;
}

export interface PlayerPauseUpdate {
  paused: boolean;
}

export interface ChapterInfo {
  id: number;
  title?: string;
  time: number;
}

export interface VideoStats {
  hwdecCurrent?: string;
  estimatedFps?: number;
  dropFrameCount?: number;
  videoBitrate?: number;
  audioBitrate?: number;
  audioChannels?: string;
  audioSamplerate?: number;
  audioCodec?: string;
  videoCodec?: string;
  aspectRatio?: string;
}

export type AspectRatioOption = 'auto' | '16:9' | '4:3' | '2.35:1' | 'original';

export interface SubtitleCue {
  id: number;
  start: number;
  end: number;
  text: string;
}
