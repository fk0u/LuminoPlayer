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
