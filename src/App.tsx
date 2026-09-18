import React, { useEffect } from 'react';
import { TitleBar } from './components/TitleBar';
import { VideoCanvas } from './components/VideoCanvas';
import { ControlDock } from './components/ControlDock';
import { usePlayerStore } from './store/usePlayerStore';
import { useIdleTimer } from './hooks/useIdleTimer';

export const App: React.FC = () => {
  const initialize = usePlayerStore((state) => state.initialize);
  const togglePlayback = usePlayerStore((state) => state.togglePlayback);
  const seek = usePlayerStore((state) => state.seek);
  const currentTime = usePlayerStore((state) => state.currentTime);
  const volume = usePlayerStore((state) => state.volume);
  const setVolume = usePlayerStore((state) => state.setVolume);
  const toggleMute = usePlayerStore((state) => state.toggleMute);
  const toggleFullscreen = usePlayerStore((state) => state.toggleFullscreen);

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

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger hotkeys if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlayback();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seek(currentTime - 5);
          break;
        case 'ArrowRight':
          e.preventDefault();
          seek(currentTime + 5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(volume + 5);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(volume - 5);
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
  }, [currentTime, volume, seek, setVolume, togglePlayback, toggleMute, toggleFullscreen]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-transparent select-none">
      {/* Frameless TitleBar */}
      <TitleBar />

      {/* Main Video & Drag-Drop Surface */}
      <main className="h-full w-full">
        <VideoCanvas />
      </main>

      {/* Glassmorphic Floating Control Dock */}
      <ControlDock />
    </div>
  );
};

export default App;
