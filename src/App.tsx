import React, { useEffect, useState } from 'react';
import { TitleBar } from './components/TitleBar';
import { VideoCanvas } from './components/VideoCanvas';
import { ControlDock } from './components/ControlDock';
import { StatsOverlay } from './components/StatsOverlay';
import { ContextMenu } from './components/ContextMenu';
import { OsdToast } from './components/OsdToast';
import { SubtitleDrawer } from './components/SubtitleDrawer';
import { AutoSubtitleModal } from './components/AutoSubtitleModal';
import { SettingsModal } from './components/SettingsModal';
import { usePlayerStore } from './store/usePlayerStore';
import { useIdleTimer } from './hooks/useIdleTimer';
import { playerApi } from './services/playerApi';

export const App: React.FC = () => {
  const initialize = usePlayerStore((state) => state.initialize);
  const togglePlayback = usePlayerStore((state) => state.togglePlayback);
  const seek = usePlayerStore((state) => state.seek);
  const currentTime = usePlayerStore((state) => state.currentTime);
  const volume = usePlayerStore((state) => state.volume);
  const setVolume = usePlayerStore((state) => state.setVolume);
  const speed = usePlayerStore((state) => state.speed);
  const setSpeed = usePlayerStore((state) => state.setSpeed);
  const stepFrame = usePlayerStore((state) => state.stepFrame);
  const toggleMute = usePlayerStore((state) => state.toggleMute);
  const toggleFullscreen = usePlayerStore((state) => state.toggleFullscreen);
  const toggleStatsVisible = usePlayerStore((state) => state.toggleStatsVisible);
  const toggleAlwaysOnTop = usePlayerStore((state) => state.toggleAlwaysOnTop);
  const adjustSubDelay = usePlayerStore((state) => state.adjustSubDelay);
  const takeScreenshot = usePlayerStore((state) => state.takeScreenshot);
  const loadFile = usePlayerStore((state) => state.loadFile);
  const toggleSubtitleDrawer = usePlayerStore((state) => state.toggleSubtitleDrawer);
  const toggleSettingsModal = usePlayerStore((state) => state.toggleSettingsModal);
  const toggleAutoSubModal = usePlayerStore((state) => state.toggleAutoSubModal);

  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);

  // Activate 2s mouse idle timer for auto-hiding glass dock and titlebar
  useIdleTimer({ timeoutMs: 2000 });

  // Initialize event stream connection with Rust MPV backend
  useEffect(() => {
    let unlisten: (() => void) | undefined;

    initialize().then((cleaner) => {
      unlisten = cleaner;
    });

    return () => {
      if (unlisten) unlisten();
    };
  }, [initialize]);

  // Mouse Wheel Volume Control (MPC-HC behavior)
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 3 : -3;
      setVolume(volume + delta);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [volume, setVolume]);

  // Right-Click Context Menu Listener
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setContextMenuPos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('contextmenu', handleContextMenu);
    return () => window.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  // Global Keyboard Shortcuts (MPC-HC Standards)
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Don't trigger hotkeys if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl + O: Open file
      if (e.ctrlKey && e.code === 'KeyO') {
        e.preventDefault();
        const selected = await playerApi.openFileDialog();
        if (selected) await loadFile(selected);
        return;
      }

      // Ctrl + T: Toggle Always on top
      if (e.ctrlKey && e.code === 'KeyT') {
        e.preventDefault();
        toggleAlwaysOnTop();
        return;
      }

      // Ctrl + , : Open Settings
      if (e.ctrlKey && e.code === 'Comma') {
        e.preventDefault();
        toggleSettingsModal();
        return;
      }

      // Ctrl + Shift + S : Toggle Subtitle Drawer
      if (e.ctrlKey && e.shiftKey && e.code === 'KeyS') {
        e.preventDefault();
        toggleSubtitleDrawer();
        return;
      }

      // Ctrl + Shift + F : Auto Subtitle Search
      if (e.ctrlKey && e.shiftKey && e.code === 'KeyF') {
        e.preventDefault();
        toggleAutoSubModal();
        return;
      }

      // Ctrl + J or Tab or I: Toggle Stats HUD
      if ((e.ctrlKey && e.code === 'KeyJ') || e.code === 'Tab' || e.code === 'KeyI') {
        e.preventDefault();
        toggleStatsVisible();
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlayback();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seek(currentTime - (e.shiftKey ? 1 : 5));
          break;
        case 'ArrowRight':
          e.preventDefault();
          seek(currentTime + (e.shiftKey ? 1 : 5));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(volume + 5);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(volume - 5);
          break;
        case 'BracketLeft': // [ : Slow down
          e.preventDefault();
          setSpeed(Math.max(0.25, speed - 0.1));
          break;
        case 'BracketRight': // ] : Speed up
          e.preventDefault();
          setSpeed(Math.min(3.0, speed + 0.1));
          break;
        case 'Backspace': // Reset speed to 1.0x
          e.preventDefault();
          setSpeed(1.0);
          break;
        case 'Period': // . : Frame step forward
          e.preventDefault();
          stepFrame(true);
          break;
        case 'Comma': // , : Frame step backward
          e.preventDefault();
          stepFrame(false);
          break;
        case 'KeyZ': // Z : Subtitle delay -0.1s
          e.preventDefault();
          adjustSubDelay(-0.1);
          break;
        case 'KeyX': // X : Subtitle delay +0.1s
          e.preventDefault();
          adjustSubDelay(0.1);
          break;
        case 'KeyS': // S : Screenshot
          e.preventDefault();
          takeScreenshot();
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    currentTime,
    volume,
    speed,
    seek,
    setVolume,
    setSpeed,
    stepFrame,
    togglePlayback,
    toggleMute,
    toggleFullscreen,
    toggleStatsVisible,
    toggleAlwaysOnTop,
    adjustSubDelay,
    takeScreenshot,
    loadFile,
    toggleSubtitleDrawer,
    toggleSettingsModal,
    toggleAutoSubModal,
  ]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-transparent select-none">
      {/* Frameless TitleBar with TopMenuBar */}
      <TitleBar />

      {/* Main Video & Drag-Drop Surface */}
      <main className="h-full w-full">
        <VideoCanvas />
      </main>

      {/* Glassmorphic Floating Control Dock */}
      <ControlDock />

      {/* Real-time Technical OSD HUD (Ctrl+J) */}
      <StatsOverlay />

      {/* Floating Volume / Speed OSD Toast */}
      <OsdToast />

      {/* Glassmorphic Right-Click Context Menu */}
      {contextMenuPos && (
        <ContextMenu
          x={contextMenuPos.x}
          y={contextMenuPos.y}
          onClose={() => setContextMenuPos(null)}
        />
      )}

      {/* Interactive Synced Subtitle Panel (Sistem Subtitle Geser Otomatis) */}
      <SubtitleDrawer />

      {/* Auto Subtitle Downloader & Finder Modal */}
      <AutoSubtitleModal />

      {/* Comprehensive Settings Modal */}
      <SettingsModal />
    </div>
  );
};

export default App;
