import { create } from 'zustand';
import { playerApi } from '../services/playerApi';
import type { ChapterInfo, MediaMetadata, MpvEventPayload, TrackInfo, VideoStats, SubtitleCue } from '../types/player';
import { generateDemoCues } from '../utils/subtitleParser';

interface PlayerStoreState {
  // Playback state
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number; // 0 to 150 (audio boost)
  speed: number;
  isMuted: boolean;
  isIdle: boolean;
  isBuffering: boolean;
  isFullscreen: boolean;
  isAlwaysOnTop: boolean;
  
  // Audio & Subtitle Sync & Styling
  aspectRatio: string;
  subDelay: number;
  audioDelay: number;
  subScale: number;
  subPosition: number; // 0 (top) to 100 (bottom)

  // Interactive Subtitle Drawer & Modals
  isSubtitleDrawerOpen: boolean;
  isAutoSubModalOpen: boolean;
  isSettingsModalOpen: boolean;
  subtitleCues: SubtitleCue[];
  activeCueId: number | null;

  // UI Interaction state
  controlsVisible: boolean;
  isStatsVisible: boolean;
  osdMessage: string | null;
  
  // Metadata & Tracks & Chapters
  metadata: MediaMetadata | null;
  tracks: TrackInfo[];
  chapters: ChapterInfo[];
  stats: VideoStats | null;

  // Actions
  initialize: () => Promise<() => void>;
  loadFile: (filePath: string) => Promise<void>;
  togglePlayback: () => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  seek: (seconds: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  toggleMute: () => Promise<void>;
  setSpeed: (speed: number) => Promise<void>;
  stepFrame: (forward?: boolean) => Promise<void>;
  setAspectRatio: (ratio: string) => Promise<void>;
  adjustSubDelay: (delta: number) => Promise<void>;
  adjustAudioDelay: (delta: number) => Promise<void>;
  adjustSubScale: (delta: number) => Promise<void>;
  setSubPos: (pos: number) => Promise<void>;
  adjustSubPos: (delta: number) => Promise<void>;
  addSubtitleFile: (path: string) => Promise<void>;
  openSubtitleDialog: () => Promise<void>;
  takeScreenshot: () => Promise<void>;
  toggleAlwaysOnTop: () => Promise<void>;
  toggleStatsVisible: () => void;
  refreshStats: () => Promise<void>;
  showOsd: (text: string, durationMs?: number) => void;
  setControlsVisible: (visible: boolean) => void;
  selectSubtitleTrack: (trackId: number) => Promise<void>;
  selectAudioTrack: (trackId: number) => Promise<void>;
  toggleFullscreen: () => Promise<void>;
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;

  // Drawer and Modal Toggles
  toggleSubtitleDrawer: () => void;
  setSubtitleDrawerOpen: (open: boolean) => void;
  toggleAutoSubModal: () => void;
  setAutoSubModalOpen: (open: boolean) => void;
  toggleSettingsModal: () => void;
  setSettingsModalOpen: (open: boolean) => void;
  loadSubtitleCues: (cues: SubtitleCue[]) => void;
  clearSubtitleCues: () => void;
}

let osdTimer: number | null = null;

export const usePlayerStore = create<PlayerStoreState>((set, get) => ({
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 80,
  speed: 1.0,
  isMuted: false,
  isIdle: true,
  isBuffering: false,
  isFullscreen: false,
  isAlwaysOnTop: false,
  aspectRatio: '-1',
  subDelay: 0,
  audioDelay: 0,
  subScale: 1.0,
  subPosition: 100,
  isSubtitleDrawerOpen: false,
  isAutoSubModalOpen: false,
  isSettingsModalOpen: false,
  subtitleCues: [],
  activeCueId: null,
  controlsVisible: true,
  isStatsVisible: false,
  osdMessage: null,
  metadata: null,
  tracks: [],
  chapters: [],
  stats: null,

  showOsd: (text: string, durationMs = 1500) => {
    if (osdTimer) window.clearTimeout(osdTimer);
    set({ osdMessage: text });
    osdTimer = window.setTimeout(() => {
      set({ osdMessage: null });
    }, durationMs);
  },

  initialize: async () => {
    const unlisten = await playerApi.listenEvents((payload: MpvEventPayload) => {
      switch (payload.event) {
        case 'time-pos': {
          const time = typeof payload.data === 'number' ? payload.data : 0;
          const cues = get().subtitleCues;
          let matchedCueId: number | null = null;
          if (cues.length > 0) {
            const currentCue = cues.find((c) => time >= c.start && time <= c.end);
            if (currentCue) {
              matchedCueId = currentCue.id;
            }
          }
          set({ currentTime: time, activeCueId: matchedCueId });
          break;
        }
        case 'duration': {
          const dur = typeof payload.data === 'number' ? payload.data : 0;
          set({ duration: dur });
          if (dur > 0 && get().subtitleCues.length === 0) {
            set({ subtitleCues: generateDemoCues(dur, get().metadata?.title) });
          }
          break;
        }
        case 'pause': {
          const paused = Boolean(payload.data);
          set({ isPlaying: !paused });
          break;
        }
        case 'file-loaded': {
          set({ isIdle: false, isPlaying: true, speed: 1.0 });
          playerApi.getMetadata().then((meta) => {
            set({ metadata: meta });
            const dur = get().duration;
            if (dur > 0 && get().subtitleCues.length === 0) {
              set({ subtitleCues: generateDemoCues(dur, meta?.title) });
            }
          });
          playerApi.getTracks().then((tracks) => set({ tracks }));
          playerApi.getChapters().then((chapters) => set({ chapters }));
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
      const chapters = await playerApi.getChapters();
      const dur = meta.duration || 0;
      set({
        metadata: meta,
        tracks,
        chapters,
        duration: dur,
        isIdle: false,
        isPlaying: true,
        isBuffering: false,
        subtitleCues: dur > 0 ? generateDemoCues(dur, meta.title || filePath.split(/[\\/]/).pop()) : [],
      });
      get().showOsd(`Memutar: ${meta.title || filePath.split(/[\\/]/).pop()}`);
    } catch (err) {
      console.error('Failed to load file:', err);
      set({ isBuffering: false });
      alert(`Gagal memutar berkas: ${err}`);
    }
  },

  togglePlayback: async () => {
    const isPlaying = get().isPlaying;
    if (isPlaying) {
      await playerApi.pause();
      set({ isPlaying: false });
      get().showOsd('Jeda');
    } else {
      await playerApi.play();
      set({ isPlaying: true });
      get().showOsd('Putar');
    }
  },

  play: async () => {
    await playerApi.play();
    set({ isPlaying: true });
    get().showOsd('Putar');
  },

  pause: async () => {
    await playerApi.pause();
    set({ isPlaying: false });
    get().showOsd('Jeda');
  },

  seek: async (seconds: number) => {
    const dur = get().duration;
    const boundedTime = Math.max(0, dur > 0 ? Math.min(seconds, dur) : seconds);
    set({ currentTime: boundedTime });
    await playerApi.seek(boundedTime, true);
  },

  setVolume: async (volume: number) => {
    const clamped = Math.max(0, Math.min(150, Math.round(volume)));
    set({ volume: clamped, isMuted: clamped === 0 });
    await playerApi.setVolume(clamped);
    if (clamped > 100) {
      get().showOsd(`Volume: ${clamped}% (⚡ Audio Boost)`);
    } else {
      get().showOsd(`Volume: ${clamped}%`);
    }
  },

  toggleMute: async () => {
    const isMuted = get().isMuted;
    const newMuted = !isMuted;
    set({ isMuted: newMuted });
    await playerApi.toggleMute();
    get().showOsd(newMuted ? 'Bisu (Muted)' : `Volume: ${Math.round(get().volume)}%`);
  },

  setSpeed: async (speed: number) => {
    const rounded = Math.round(speed * 100) / 100;
    set({ speed: rounded });
    await playerApi.setSpeed(rounded);
    get().showOsd(`Kecepatan: ${rounded}x`);
  },

  stepFrame: async (forward = true) => {
    await playerApi.stepFrame(forward);
    get().showOsd(forward ? 'Frame +1' : 'Frame -1');
  },

  setAspectRatio: async (ratio: string) => {
    set({ aspectRatio: ratio });
    await playerApi.setAspectRatio(ratio);
    get().showOsd(`Rasio Aspek: ${ratio === '-1' ? 'Bawaan (Auto)' : ratio}`);
  },

  adjustSubDelay: async (delta: number) => {
    const newDelay = Math.round((get().subDelay + delta) * 100) / 100;
    set({ subDelay: newDelay });
    await playerApi.setSubDelay(newDelay);
    get().showOsd(`Subtitle Delay: ${newDelay > 0 ? `+${newDelay}` : newDelay}s`);
  },

  adjustAudioDelay: async (delta: number) => {
    const newDelay = Math.round((get().audioDelay + delta) * 100) / 100;
    set({ audioDelay: newDelay });
    await playerApi.setAudioDelay(newDelay);
    get().showOsd(`Audio Delay: ${newDelay > 0 ? `+${newDelay}` : newDelay}s`);
  },

  adjustSubScale: async (delta: number) => {
    const newScale = Math.max(0.5, Math.min(3.0, Math.round((get().subScale + delta) * 10) / 10));
    set({ subScale: newScale });
    await playerApi.setSubScale(newScale);
    get().showOsd(`Ukuran Subtitle: ${newScale}x`);
  },

  setSubPos: async (pos: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(pos)));
    set({ subPosition: clamped });
    await playerApi.setSubPos(clamped);
    get().showOsd(`Posisi Vertikal Subtitle: ${clamped}%`);
  },

  adjustSubPos: async (delta: number) => {
    const newPos = Math.max(0, Math.min(100, get().subPosition + delta));
    await get().setSubPos(newPos);
  },

  addSubtitleFile: async (path: string) => {
    await playerApi.addSubtitleFile(path);
    const tracks = await playerApi.getTracks();
    set({ tracks });
    get().showOsd(`Subtitle Ditambahkan: ${path.split(/[\\/]/).pop()}`);
  },

  openSubtitleDialog: async () => {
    const path = await playerApi.openSubtitleDialog();
    if (path) {
      await get().addSubtitleFile(path);
    }
  },

  takeScreenshot: async () => {
    try {
      await playerApi.takeScreenshot();
      get().showOsd('📸 Screenshot Berhasil Disimpan');
    } catch (err) {
      console.error(err);
    }
  },

  toggleAlwaysOnTop: async () => {
    const next = await playerApi.toggleAlwaysOnTop();
    set({ isAlwaysOnTop: next });
    get().showOsd(next ? '📌 Always on Top: Aktif' : 'Always on Top: Nonaktif');
  },

  toggleStatsVisible: () => {
    const next = !get().isStatsVisible;
    set({ isStatsVisible: next });
    if (next) {
      get().refreshStats();
    }
  },

  refreshStats: async () => {
    const stats = await playerApi.getStats();
    set({ stats });
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
    const track = get().tracks.find((t) => t.id === trackId);
    get().showOsd(`Subtitle: ${track?.title || track?.lang || 'Track ' + trackId}`);
  },

  selectAudioTrack: async (trackId: number) => {
    await playerApi.setAudioTrack(trackId);
    set((state) => ({
      tracks: state.tracks.map((t) =>
        t.type === 'audio' ? { ...t, selected: t.id === trackId } : t
      ),
    }));
    const track = get().tracks.find((t) => t.id === trackId);
    get().showOsd(`Audio: ${track?.title || track?.lang || 'Track ' + trackId}`);
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

  toggleSubtitleDrawer: () => {
    set((state) => ({ isSubtitleDrawerOpen: !state.isSubtitleDrawerOpen }));
  },

  setSubtitleDrawerOpen: (open: boolean) => {
    set({ isSubtitleDrawerOpen: open });
  },

  toggleAutoSubModal: () => {
    set((state) => ({ isAutoSubModalOpen: !state.isAutoSubModalOpen }));
  },

  setAutoSubModalOpen: (open: boolean) => {
    set({ isAutoSubModalOpen: open });
  },

  toggleSettingsModal: () => {
    set((state) => ({ isSettingsModalOpen: !state.isSettingsModalOpen }));
  },

  setSettingsModalOpen: (open: boolean) => {
    set({ isSettingsModalOpen: open });
  },

  loadSubtitleCues: (cues: SubtitleCue[]) => {
    set({ subtitleCues: cues });
  },

  clearSubtitleCues: () => {
    set({ subtitleCues: [], activeCueId: null });
  },
}));
