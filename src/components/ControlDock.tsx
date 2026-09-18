import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  Volume1,
  VolumeX,
  Maximize,
  Minimize,
  Captions,
  Settings,
} from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';

const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const mStr = m.toString().padStart(2, '0');
  const sStr = s.toString().padStart(2, '0');

  if (h > 0) {
    return `${h}:${mStr}:${sStr}`;
  }
  return `${mStr}:${sStr}`;
};

export const ControlDock: React.FC = () => {
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const currentTime = usePlayerStore((state) => state.currentTime);
  const duration = usePlayerStore((state) => state.duration);
  const volume = usePlayerStore((state) => state.volume);
  const isMuted = usePlayerStore((state) => state.isMuted);
  const controlsVisible = usePlayerStore((state) => state.controlsVisible);
  const isFullscreen = usePlayerStore((state) => state.isFullscreen);
  const tracks = usePlayerStore((state) => state.tracks);
  
  const togglePlayback = usePlayerStore((state) => state.togglePlayback);
  const seek = usePlayerStore((state) => state.seek);
  const setVolume = usePlayerStore((state) => state.setVolume);
  const toggleMute = usePlayerStore((state) => state.toggleMute);
  const toggleFullscreen = usePlayerStore((state) => state.toggleFullscreen);
  const selectSubtitleTrack = usePlayerStore((state) => state.selectSubtitleTrack);

  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number>(0);
  const [showSubMenu, setShowSubMenu] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Scrubber Hover Handling
  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverTime(pos * duration);
    setHoverPosition(pos * 100);
  };

  const handleProgressMouseLeave = () => {
    setHoverTime(null);
  };

  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seek(pos * duration);
  };

  const subTracks = tracks.filter((t) => t.type === 'sub');

  return (
    <AnimatePresence>
      {controlsVisible && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
          onClick={(e) => e.stopPropagation()} // Prevent toggling play on dock click
        >
          <div className="glass-dock flex flex-col gap-3 rounded-2xl p-4 shadow-2xl">
            {/* Progress Bar & Scrubber */}
            <div className="relative flex flex-col gap-1">
              <div
                ref={progressBarRef}
                onClick={handleSeekClick}
                onMouseMove={handleProgressMouseMove}
                onMouseLeave={handleProgressMouseLeave}
                className="group relative flex h-4 w-full cursor-pointer items-center"
              >
                {/* Background Rail */}
                <div className="h-1 w-full rounded-full bg-white/20 transition-all duration-200 group-hover:h-2">
                  {/* Active Played Fill */}
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_10px_rgba(59,130,246,0.6)]"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Scrubber Playhead Thumb */}
                <div
                  className="absolute h-3 w-3 -translate-x-1/2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                  style={{ left: `${progressPercent}%` }}
                />

                {/* Hover Timestamp Tooltip */}
                {hoverTime !== null && (
                  <div
                    className="pointer-events-none absolute -top-8 -translate-x-1/2 rounded-md bg-slate-900/90 px-2 py-1 text-[11px] font-mono text-slate-200 border border-white/10 shadow-lg backdrop-blur"
                    style={{ left: `${hoverPosition}%` }}
                  >
                    {formatTime(hoverTime)}
                  </div>
                )}
              </div>

              {/* Time Indicators */}
              <div className="flex items-center justify-between text-[11px] font-medium font-mono text-slate-400 px-0.5">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Bottom Controls Row */}
            <div className="flex items-center justify-between gap-2">
              {/* Left: Volume Section */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  title={isMuted ? 'Unmute' : 'Mute'}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-4 w-4 text-red-400" />
                  ) : volume < 50 ? (
                    <Volume1 className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4 text-blue-400" />
                  )}
                </button>

                <div className="flex w-20 items-center">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-full accent-blue-500"
                    title={`Volume: ${Math.round(volume)}%`}
                  />
                </div>
              </div>

              {/* Center: Playback Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => seek(currentTime - 10)}
                  title="Rewind 10s (Left Arrow)"
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-300 transition-all hover:bg-white/10 hover:text-white"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>

                <button
                  onClick={togglePlayback}
                  title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-transform hover:scale-105 active:scale-95"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5 fill-current" />
                  ) : (
                    <Play className="h-5 w-5 fill-current translate-x-0.5" />
                  )}
                </button>

                <button
                  onClick={() => seek(currentTime + 10)}
                  title="Forward 10s (Right Arrow)"
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-300 transition-all hover:bg-white/10 hover:text-white"
                >
                  <RotateCw className="h-4 w-4" />
                </button>
              </div>

              {/* Right: Subtitles & Fullscreen */}
              <div className="flex items-center gap-1.5 relative">
                {/* Subtitle Selector */}
                {subTracks.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setShowSubMenu(!showSubMenu)}
                      title="Subtitles"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <Captions className="h-4 w-4" />
                    </button>

                    {showSubMenu && (
                      <div className="absolute bottom-10 right-0 z-50 min-w-40 rounded-xl bg-slate-900/95 p-2 shadow-2xl border border-white/10 backdrop-blur-lg">
                        <div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                          Subtitle Track
                        </div>
                        {subTracks.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => {
                              selectSubtitleTrack(sub.id);
                              setShowSubMenu(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors ${
                              sub.selected
                                ? 'bg-blue-600/30 text-blue-400 font-medium'
                                : 'text-slate-300 hover:bg-white/5'
                            }`}
                          >
                            <span>{sub.title || `Track ${sub.id}`}</span>
                            {sub.lang && (
                              <span className="text-[10px] uppercase text-slate-500">
                                {sub.lang}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Settings / Info placeholder */}
                <button
                  title="Settings"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Settings className="h-4 w-4" />
                </button>

                {/* Fullscreen toggle */}
                <button
                  onClick={toggleFullscreen}
                  title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {isFullscreen ? (
                    <Minimize className="h-4 w-4" />
                  ) : (
                    <Maximize className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
