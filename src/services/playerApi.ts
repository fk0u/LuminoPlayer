import { invoke } from '@tauri-apps/api/core';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import type { ChapterInfo, MediaMetadata, MpvEventPayload, TrackInfo, VideoStats } from '../types/player';

export const isTauriEnvironment = (): boolean => {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
};

export const playerApi = {
  /**
   * Load media file (video or audio) into MPV engine
   */
  async loadFile(filePath: string): Promise<boolean> {
    if (!isTauriEnvironment()) {
      console.warn('[Web Mock] loadFile:', filePath);
      return true;
    }
    return await invoke<boolean>('load_file', { filePath });
  },

  /**
   * Toggle between Play and Pause
   */
  async togglePlayback(): Promise<boolean> {
    if (!isTauriEnvironment()) {
      console.warn('[Web Mock] togglePlayback');
      return true;
    }
    return await invoke<boolean>('toggle_playback');
  },

  /**
   * Resume playback
   */
  async play(): Promise<void> {
    if (!isTauriEnvironment()) {
      console.warn('[Web Mock] play');
      return;
    }
    await invoke('play');
  },

  /**
   * Pause playback
   */
  async pause(): Promise<void> {
    if (!isTauriEnvironment()) {
      console.warn('[Web Mock] pause');
      return;
    }
    await invoke('pause');
  },

  /**
   * Seek playback position (in seconds, absolute or relative)
   */
  async seek(seconds: number, absolute = true): Promise<void> {
    if (!isTauriEnvironment()) {
      console.warn('[Web Mock] seek:', seconds, 'absolute:', absolute);
      return;
    }
    await invoke('seek', { seconds, absolute });
  },

  /**
   * Set player volume (0.0 to 150.0 for audio boost)
   */
  async setVolume(volume: number): Promise<void> {
    if (!isTauriEnvironment()) {
      console.warn('[Web Mock] setVolume:', volume);
      return;
    }
    await invoke('set_volume', { volume: Math.max(0, Math.min(150, volume)) });
  },

  /**
   * Set playback speed (0.25x - 4.0x)
   */
  async setSpeed(speed: number): Promise<void> {
    if (!isTauriEnvironment()) return;
    await invoke('set_speed', { speed });
  },

  /**
   * Frame by frame step (true = forward, false = back)
   */
  async stepFrame(forward = true): Promise<void> {
    if (!isTauriEnvironment()) return;
    await invoke('step_frame', { forward });
  },

  /**
   * Set aspect ratio override ("-1" for auto, "16:9", "4:3", "2.35:1")
   */
  async setAspectRatio(ratio: string): Promise<void> {
    if (!isTauriEnvironment()) return;
    await invoke('set_aspect_ratio', { ratio });
  },

  /**
   * Subtitle delay in seconds (+/-)
   */
  async setSubDelay(seconds: number): Promise<void> {
    if (!isTauriEnvironment()) return;
    await invoke('set_sub_delay', { seconds });
  },

  /**
   * Audio delay in seconds (+/-)
   */
  async setAudioDelay(seconds: number): Promise<void> {
    if (!isTauriEnvironment()) return;
    await invoke('set_audio_delay', { seconds });
  },

  /**
   * Subtitle scale factor (0.5 to 3.0)
   */
  async setSubScale(scale: number): Promise<void> {
    if (!isTauriEnvironment()) return;
    await invoke('set_sub_scale', { scale });
  },

  /**
   * Subtitle vertical position (0 to 100, 100 = bottom)
   */
  async setSubPos(pos: number): Promise<void> {
    if (!isTauriEnvironment()) return;
    await invoke('set_sub_pos', { pos: Math.max(0, Math.min(100, pos)) });
  },

  /**
   * Add external subtitle file
   */
  async addSubtitleFile(path: string): Promise<void> {
    if (!isTauriEnvironment()) return;
    await invoke('add_subtitle_file', { path });
  },

  /**
   * Open native subtitle file picker
   */
  async openSubtitleDialog(): Promise<string | null> {
    if (!isTauriEnvironment()) return null;
    return await invoke<string | null>('open_subtitle_dialog');
  },

  /**
   * Take screenshot of current frame
   */
  async takeScreenshot(): Promise<string> {
    if (!isTauriEnvironment()) return 'Mock screenshot';
    return await invoke<string>('take_screenshot');
  },

  /**
   * Get real-time video stats for OSD HUD
   */
  async getStats(): Promise<VideoStats> {
    if (!isTauriEnvironment()) {
      return {
        hwdecCurrent: 'd3d11va (copy-back)',
        estimatedFps: 59.94,
        dropFrameCount: 0,
        videoBitrate: 8540000,
        audioBitrate: 1536000,
        audioChannels: 'stereo',
        audioSamplerate: 48000,
        audioCodec: 'flac',
        videoCodec: 'hevc',
        aspectRatio: '16:9',
      };
    }
    return await invoke<VideoStats>('get_stats');
  },

  /**
   * Get chapters list
   */
  async getChapters(): Promise<ChapterInfo[]> {
    if (!isTauriEnvironment()) return [];
    return await invoke<ChapterInfo[]>('get_chapters');
  },

  /**
   * Toggle Always-On-Top window mode
   */
  async toggleAlwaysOnTop(): Promise<boolean> {
    if (!isTauriEnvironment()) return false;
    return await invoke<boolean>('window_toggle_always_on_top');
  },

  /**
   * Toggle mute
   */
  async toggleMute(): Promise<boolean> {
    if (!isTauriEnvironment()) {
      console.warn('[Web Mock] toggleMute');
      return false;
    }
    return await invoke<boolean>('toggle_mute');
  },

  /**
   * Select subtitle track by track ID
   */
  async setSubtitleTrack(trackId: number): Promise<void> {
    if (!isTauriEnvironment()) {
      console.warn('[Web Mock] setSubtitleTrack:', trackId);
      return;
    }
    await invoke('set_subtitle_track', { trackId });
  },

  /**
   * Select audio track by track ID
   */
  async setAudioTrack(trackId: number): Promise<void> {
    if (!isTauriEnvironment()) {
      console.warn('[Web Mock] setAudioTrack:', trackId);
      return;
    }
    await invoke('set_audio_track', { trackId });
  },

  /**
   * Retrieve extracted media metadata from MPV
   */
  async getMetadata(): Promise<MediaMetadata> {
    if (!isTauriEnvironment()) {
      return {
        title: 'Demo 4K HDR - Horizon Coastline.mkv',
        duration: 245.5,
        videoCodec: 'HEVC / H.265 (Main 10)',
        audioCodec: 'FLAC 24-bit 96kHz',
        width: 3840,
        height: 2160,
        fps: 60,
        isHdr: true,
      };
    }
    return await invoke<MediaMetadata>('get_metadata');
  },

  /**
   * Retrieve available audio and subtitle tracks
   */
  async getTracks(): Promise<TrackInfo[]> {
    if (!isTauriEnvironment()) {
      return [
        { id: 1, type: 'video', codec: 'hevc', selected: true },
        { id: 2, type: 'audio', title: 'Japanese (DTS-HD MA)', lang: 'ja', selected: true },
        { id: 3, type: 'audio', title: 'English (Dolby Digital Plus)', lang: 'en', selected: false },
        { id: 4, type: 'sub', title: 'English [Full ASS]', lang: 'en', selected: true },
        { id: 5, type: 'sub', title: 'Indonesian [SRT]', lang: 'id', selected: false },
      ];
    }
    return await invoke<TrackInfo[]>('get_tracks');
  },

  /**
   * Open native Windows file picker dialog
   */
  async openFileDialog(): Promise<string | null> {
    if (!isTauriEnvironment()) {
      console.warn('[Web Mock] openFileDialog');
      return null;
    }
    return await invoke<string | null>('open_file_dialog');
  },

  // Window Controls
  async minimizeWindow(): Promise<void> {
    if (!isTauriEnvironment()) return;
    await invoke('window_minimize');
  },

  async maximizeWindow(): Promise<void> {
    if (!isTauriEnvironment()) return;
    await invoke('window_maximize');
  },

  async closeWindow(): Promise<void> {
    if (!isTauriEnvironment()) return;
    await invoke('window_close');
  },

  async toggleFullscreen(): Promise<boolean> {
    if (!isTauriEnvironment()) return false;
    return await invoke<boolean>('window_toggle_fullscreen');
  },

  /**
   * Listen to MPV events dispatched from Rust backend
   */
  async listenEvents(callback: (payload: MpvEventPayload) => void): Promise<UnlistenFn> {
    if (!isTauriEnvironment()) {
      return () => {};
    }
    return await listen<MpvEventPayload>('mpv-event', (event) => {
      callback(event.payload);
    });
  },
};
