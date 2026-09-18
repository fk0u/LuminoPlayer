import { create } from 'zustand';
import { playerApi } from '../services/playerApi';
import type { MediaMetadata, TrackInfo, MpvEventPayload } from '../types/player';

interface PlayerStoreState {
  // Playback state
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isIdle: boolean;
  isBuffering: boolean;
  isFullscreen: boolean;
  
  // UI Interaction state
  controlsVisible: boolean;
  
  // Metadata & Tracks
  metadata: MediaMetadata | null;
  tracks: TrackInfo[];

  // Actions
  initialize: () => Promise<() => void>;
  loadFile: (filePath: string) => Promise<void>;
  togglePlayback: () => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  seek: (seconds: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  toggleMute: () => Promise<void>;
  setControlsVisible: (visible: boolean) => void;
  selectSubtitleTrack: (trackId: number) => Promise<void>;
  selectAudioTrack: (trackId: number) => Promise<void>;
  toggleFullscreen: () => Promise<void>;
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
}

export const usePlayerStore = create<PlayerStoreState>((set, get) => ({
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 80,
  isMuted: false,
  isIdle: true,
  isBuffering: false,
  isFullscreen: false,
  controlsVisible: true,
  metadata: null,
  tracks: [],

  initialize: async () => {
    // Listen to backend MPV events
    const unlisten = await playerApi.listenEvents((payload: MpvEventPayload) => {
      switch (payload.event) {
        case 'time-pos': {
          const time = typeof payload.data === 'number' ? payload.data : 0;
          set({ currentTime: time });
          break;
        }
        case 'duration': {
          const dur = typeof payload.data === 'number' ? payload.data : 0;
          set({ duration: dur });
          break;
        }
        case 'pause': {
          const paused = Boolean(payload.data);
          set({ isPlaying: !paused });
          break;
        }
        case 'file-loaded': {
          set({ isIdle: false, isPlaying: true });
          // Fetch initial metadata and tracks
          playerApi.getMetadata().then((meta) => set({ metadata: meta }));
          playerApi.getTracks().then((tracks) => set({ tracks }));
          break;
        }
        case 'end-file': {
          set({ isPlaying: false, currentTime: 0, isIdle: true });
          break;
        }
        case 'metadata-update': {
          set({ metadata: payload.data as MediaMetadata });
          break;
        }
        case 'track-list': {
          set({ tracks: payload.data as TrackInfo[] });
          break;
        }
      }
    });

    return unlisten;
  },

  loadFile: async (filePath: string) => {
    try {
      set({ isBuffering: true });
      await playerApi.loadFile(filePath);
      const meta = await playerApi.getMetadata();
      const tracks = await playerApi.getTracks();
      set({
        metadata: meta,
        tracks,
        isIdle: false,
        isPlaying: true,
        isBuffering: false,
      });
    } catch (err) {
      console.error('Failed to load file:', err);
      set({ isBuffering: false });
    }
  },

  togglePlayback: async () => {
    const isPlaying = get().isPlaying;
    if (isPlaying) {
      await playerApi.pause();
      set({ isPlaying: false });
    } else {
      await playerApi.play();
      set({ isPlaying: true });
    }
  },

  play: async () => {
    await playerApi.play();
    set({ isPlaying: true });
  },

  pause: async () => {
    await playerApi.pause();
    set({ isPlaying: false });
  },

  seek: async (seconds: number) => {
    const dur = get().duration;
    const boundedTime = Math.max(0, dur > 0 ? Math.min(seconds, dur) : seconds);
    set({ currentTime: boundedTime });
    await playerApi.seek(boundedTime, true);
  },

  setVolume: async (volume: number) => {
    const clamped = Math.max(0, Math.min(100, volume));
    set({ volume: clamped, isMuted: clamped === 0 });
    await playerApi.setVolume(clamped);
  },

  toggleMute: async () => {
    const isMuted = get().isMuted;
    const newMuted = !isMuted;
    set({ isMuted: newMuted });
    await playerApi.toggleMute();
  },

  setControlsVisible: (visible: boolean) => {
    set({ controlsVisible: visible });
  },

  selectSubtitleTrack: async (trackId: number) => {
    await playerApi.setSubtitleTrack(trackId);
    set((state) => ({
      tracks: state.tracks.map((t) =>
        t.type === 'sub' ? { ...t, selected: t.id === trackId } : t
      ),
    }));
  },

  selectAudioTrack: async (trackId: number) => {
    await playerApi.setAudioTrack(trackId);
    set((state) => ({
      tracks: state.tracks.map((t) =>
        t.type === 'audio' ? { ...t, selected: t.id === trackId } : t
      ),
    }));
  },

  toggleFullscreen: async () => {
    const nextState = !get().isFullscreen;
    set({ isFullscreen: nextState });
    await playerApi.toggleFullscreen();
  },

  minimizeWindow: async () => {
    await playerApi.minimizeWindow();
  },

  maximizeWindow: async () => {
    await playerApi.maximizeWindow();
  },

  closeWindow: async () => {
    await playerApi.closeWindow();
  },
}));
