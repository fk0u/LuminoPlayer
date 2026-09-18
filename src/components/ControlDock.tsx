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
  Activity,
  Zap,
  ChevronLeft,
  ChevronRight,
  Pin,
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
  const speed = usePlayerStore((state) => state.speed);
  const isMuted = usePlayerStore((state) => state.isMuted);
  const controlsVisible = usePlayerStore((state) => state.controlsVisible);
  const isFullscreen = usePlayerStore((state) => state.isFullscreen);
  const isAlwaysOnTop = usePlayerStore((state) => state.isAlwaysOnTop);
  const isStatsVisible = usePlayerStore((state) => state.isStatsVisible);
  const tracks = usePlayerStore((state) => state.tracks);
  const chapters = usePlayerStore((state) => state.chapters);
  
  const togglePlayback = usePlayerStore((state) => state.togglePlayback);
  const seek = usePlayerStore((state) => state.seek);
  const setVolume = usePlayerStore((state) => state.setVolume);
  const setSpeed = usePlayerStore((state) => state.setSpeed);
  const stepFrame = usePlayerStore((state) => state.stepFrame);
  const toggleMute = usePlayerStore((state) => state.toggleMute);
  const toggleFullscreen = usePlayerStore((state) => state.toggleFullscreen);
  const toggleAlwaysOnTop = usePlayerStore((state) => state.toggleAlwaysOnTop);
  const toggleStatsVisible = usePlayerStore((state) => state.toggleStatsVisible);
  const selectSubtitleTrack = usePlayerStore((state) => state.selectSubtitleTrack);
  const selectAudioTrack = usePlayerStore((state) => state.selectAudioTrack);

  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverChapter, setHoverChapter] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number>(0);
  const [showSubMenu, setShowSubMenu] = useState(false);
  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isBoost = volume > 100;

  // Scrubber Hover Handling
  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetTime = pos * duration;
    setHoverTime(targetTime);
    setHoverPosition(pos * 100);

    // Find if near any chapter
    const matched = chapters.find((ch) => Math.abs(ch.time - targetTime) < 5);
    setHoverChapter(matched?.title || null);
  };

  const handleProgressMouseLeave = () => {
    setHoverTime(null);
    setHoverChapter(null);
  };

  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seek(pos * duration);
  };

  const handleCycleSpeed = () => {
    const speeds = [0.75, 1.0, 1.25, 1.5, 2.0];
    const currentIndex = speeds.findIndex((s) => Math.abs(s - speed) < 0.05);
    const nextSpeed = currentIndex === -1 || currentIndex === speeds.length - 1 ? speeds[0] : speeds[currentIndex + 1];
    setSpeed(nextSpeed);
  };

  const subTracks = tracks.filter((t) => t.type === 'sub');
  const audioTracks = tracks.filter((t) => t.type === 'audio');

  return (
    <AnimatePresence>
      {controlsVisible && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="glass-dock flex flex-col gap-3 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/15 backdrop-blur-2xl">
            {/* Progress Bar & Scrubber */}
            <div className="relative flex flex-col gap-1.5">
              <div
                ref={progressBarRef}
                onClick={handleSeekClick}
                onMouseMove={handleProgressMouseMove}
                onMouseLeave={handleProgressMouseLeave}
                className="group relative flex h-4 w-full cursor-pointer items-center"
              >
                {/* Background Rail */}
                <div className="h-1.5 w-full rounded-full bg-white/20 transition-all duration-200 group-hover:h-2.5">
                  {/* Active Played Fill */}
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-300 shadow-[0_0_12px_rgba(59,130,246,0.8)]"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Chapter Markers */}
                {duration > 0 &&
                  chapters.map((ch) => {
                    const pct = (ch.time / duration) * 100;
                    return (
                      <div
                        key={ch.id}
                        className="absolute top-1/2 h-2.5 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80 shadow-[0_0_4px_rgba(255,255,255,0.9)]"
                        style={{ left: `${pct}%` }}
                        title={ch.title || `Chapter ${ch.id}`}
                      />
                    );
                  })}

                {/* Scrubber Playhead Thumb */}
                <div
                  className="absolute h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,1)] opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                  style={{ left: `${progressPercent}%` }}
                />

                {/* Hover Timestamp Tooltip */}
                {hoverTime !== null && (
                  <div
                    className="pointer-events-none absolute -top-9 -translate-x-1/2 rounded-lg bg-slate-900/95 px-2.5 py-1 text-[11px] font-mono text-slate-100 border border-white/15 shadow-xl backdrop-blur-md flex flex-col items-center"
                    style={{ left: `${hoverPosition}%` }}
                  >
                    <span>{formatTime(hoverTime)}</span>
                    {hoverChapter && (
                      <span className="text-[9px] text-cyan-400 font-sans truncate max-w-[140px]">
                        {hoverChapter}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Time Indicators */}
              <div className="flex items-center justify-between text-xs font-mono text-slate-300 px-1 font-medium">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Bottom Controls Row */}
            <div className="flex items-center justify-between gap-2 pt-1">
              {/* Left: Volume Section with 150% Boost support */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={toggleMute}
                  title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-4 w-4 text-red-400" />
                  ) : isBoost ? (
                    <Zap className="h-4 w-4 text-amber-400 animate-pulse" />
                  ) : volume < 50 ? (
                    <Volume1 className="h-4 w-4 text-blue-400" />
                  ) : (
                    <Volume2 className="h-4 w-4 text-blue-400" />
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="150"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className={`w-24 accent-blue-500 ${isBoost ? 'accent-amber-400' : ''}`}
                    title={`Volume: ${Math.round(volume)}%`}
                  />
                  <span className={`text-[10px] font-mono font-bold w-10 ${isBoost ? 'text-amber-400' : 'text-slate-400'}`}>
                    {Math.round(volume)}%
                  </span>
                </div>
              </div>

              {/* Center: Playback Controls & Frame Stepping */}
              <div className="flex items-center gap-2">
                {/* Step Frame Back */}
                <button
                  onClick={() => stepFrame(false)}
                  title="Step 1 Frame Back (,)"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

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
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.6)] transition-transform hover:scale-105 active:scale-95"
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

                {/* Step Frame Forward */}
                <button
                  onClick={() => stepFrame(true)}
                  title="Step 1 Frame Forward (.)"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Right: MPC-HC Power Tools */}
              <div className="flex items-center gap-1.5 relative">
                {/* Speed Pill */}
                <button
                  onClick={handleCycleSpeed}
                  title="Klik untuk rotasi kecepatan ([ / ])"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 hover:bg-white/15 text-[11px] font-mono text-slate-200 transition-colors"
                >
                  <span className="text-amber-400 font-bold">{speed.toFixed(2)}x</span>
                </button>

                {/* Subtitle Selector */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowSubMenu(!showSubMenu);
                      setShowAudioMenu(false);
                    }}
                    title="Subtitle Tracks"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <Captions className="h-4 w-4" />
                  </button>

                  {showSubMenu && (
                    <div className="absolute bottom-10 right-0 z-50 min-w-44 rounded-xl bg-slate-900/95 p-2 shadow-2xl border border-white/15 backdrop-blur-2xl">
                      <div className="px-2 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                        Subtitle Tracks
                      </div>
                      <button
                        onClick={() => {
                          selectSubtitleTrack(0);
                          setShowSubMenu(false);
                        }}
                        className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs text-slate-300 hover:bg-white/10"
                      >
                        <span>None (Off)</span>
                      </button>
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
                          <span className="truncate pr-2">{sub.title || sub.lang || `Sub ${sub.id}`}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Audio Tracks */}
                {audioTracks.length > 1 && (
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowAudioMenu(!showAudioMenu);
                        setShowSubMenu(false);
                      }}
                      title="Audio Tracks"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>

                    {showAudioMenu && (
                      <div className="absolute bottom-10 right-0 z-50 min-w-44 rounded-xl bg-slate-900/95 p-2 shadow-2xl border border-white/15 backdrop-blur-2xl">
                        <div className="px-2 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                          Audio Tracks
                        </div>
                        {audioTracks.map((audio) => (
                          <button
                            key={audio.id}
                            onClick={() => {
                              selectAudioTrack(audio.id);
                              setShowAudioMenu(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors ${
                              audio.selected
                                ? 'bg-blue-600/30 text-blue-400 font-medium'
                                : 'text-slate-300 hover:bg-white/5'
                            }`}
                          >
                            <span className="truncate pr-2">{audio.title || audio.lang || `Audio ${audio.id}`}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Stats OSD (Ctrl+J) */}
                <button
                  onClick={toggleStatsVisible}
                  title="Toggle OSD Statistics (Tab / Ctrl+J)"
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                    isStatsVisible ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Activity className="h-4 w-4" />
                </button>

                {/* Always On Top */}
                <button
                  onClick={toggleAlwaysOnTop}
                  title={isAlwaysOnTop ? 'Pin: Aktif' : 'Always on Top (Ctrl+T)'}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                    isAlwaysOnTop ? 'bg-amber-500/20 text-amber-400' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Pin className="h-4 w-4" />
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
