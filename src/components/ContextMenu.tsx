import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpen,
  Volume2,
  Captions,
  Gauge,
  Tv,
  Camera,
  Activity,
  Pin,
  Maximize,
  Check,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { playerApi } from '../services/playerApi';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  const tracks = usePlayerStore((state) => state.tracks);
  const speed = usePlayerStore((state) => state.speed);
  const isAlwaysOnTop = usePlayerStore((state) => state.isAlwaysOnTop);
  const isStatsVisible = usePlayerStore((state) => state.isStatsVisible);
  const volume = usePlayerStore((state) => state.volume);
  const aspectRatio = usePlayerStore((state) => state.aspectRatio);

  const loadFile = usePlayerStore((state) => state.loadFile);
  const setSpeed = usePlayerStore((state) => state.setSpeed);
  const setVolume = usePlayerStore((state) => state.setVolume);
  const setAspectRatio = usePlayerStore((state) => state.setAspectRatio);
  const adjustSubDelay = usePlayerStore((state) => state.adjustSubDelay);
  const adjustSubScale = usePlayerStore((state) => state.adjustSubScale);
  const openSubtitleDialog = usePlayerStore((state) => state.openSubtitleDialog);
  const takeScreenshot = usePlayerStore((state) => state.takeScreenshot);
  const toggleAlwaysOnTop = usePlayerStore((state) => state.toggleAlwaysOnTop);
  const toggleStatsVisible = usePlayerStore((state) => state.toggleStatsVisible);
  const toggleFullscreen = usePlayerStore((state) => state.toggleFullscreen);
  const selectSubtitleTrack = usePlayerStore((state) => state.selectSubtitleTrack);
  const selectAudioTrack = usePlayerStore((state) => state.selectAudioTrack);

  // Close on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Adjust coordinates so menu doesn't clip screen boundaries
  const menuWidth = 220;
  const menuHeight = 360;
  const posX = Math.min(x, window.innerWidth - menuWidth - 10);
  const posY = Math.min(y, window.innerHeight - menuHeight - 10);

  const audioTracks = tracks.filter((t) => t.type === 'audio');
  const subTracks = tracks.filter((t) => t.type === 'sub');

  const handleOpenMedia = async () => {
    onClose();
    const selected = await playerApi.openFileDialog();
    if (selected) {
      await loadFile(selected);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.12, ease: 'easeOut' }}
        style={{ left: posX, top: posY }}
        className="fixed z-50 min-w-[210px] rounded-xl bg-slate-950/90 p-1.5 text-xs text-slate-200 border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Open File */}
        <button
          onClick={handleOpenMedia}
          className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 hover:bg-white/10 transition-colors"
        >
          <span className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-blue-400" /> Buka Berkas...
          </span>
          <span className="text-[10px] font-mono text-slate-500">Ctrl+O</span>
        </button>

        <div className="my-1 border-t border-white/10" />

        {/* Audio Submenu */}
        <div
          className="relative"
          onMouseEnter={() => setActiveSubmenu('audio')}
          onMouseLeave={() => setActiveSubmenu(null)}
        >
          <div className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 hover:bg-white/10 cursor-pointer transition-colors">
            <span className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-indigo-400" /> Trek Audio
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
          </div>

          {activeSubmenu === 'audio' && (
            <div className="absolute left-full top-0 ml-1 min-w-[200px] rounded-xl bg-slate-950/95 p-1.5 border border-white/15 shadow-2xl backdrop-blur-2xl">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase">
                Pilih Audio
              </div>
              {audioTracks.length > 0 ? (
                audioTracks.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => {
                      selectAudioTrack(track.id);
                      onClose();
                    }}
                    className="flex w-full items-center justify-between rounded-md px-2 py-1.5 hover:bg-white/10 text-left transition-colors"
                  >
                    <span className="truncate pr-2">{track.title || `Audio ${track.id}`}</span>
                    {track.selected && <Check className="h-3.5 w-3.5 text-blue-400 shrink-0" />}
                  </button>
                ))
              ) : (
                <div className="px-2 py-1.5 text-slate-500 italic">Hanya 1 trek default</div>
              )}
              <div className="my-1 border-t border-white/10" />
              <button
                onClick={() => {
                  setVolume(volume > 100 ? 100 : 150);
                  onClose();
                }}
                className="flex w-full items-center justify-between rounded-md px-2 py-1.5 hover:bg-white/10 text-left text-amber-300"
              >
                <span>⚡ Audio Boost (150%)</span>
                {volume > 100 && <Check className="h-3.5 w-3.5 text-amber-400" />}
              </button>
            </div>
          )}
        </div>

        {/* Subtitle Submenu */}
        <div
          className="relative"
          onMouseEnter={() => setActiveSubmenu('sub')}
          onMouseLeave={() => setActiveSubmenu(null)}
        >
          <div className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 hover:bg-white/10 cursor-pointer transition-colors">
            <span className="flex items-center gap-2">
              <Captions className="h-4 w-4 text-emerald-400" /> Subtitle
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
          </div>

          {activeSubmenu === 'sub' && (
            <div className="absolute left-full top-0 ml-1 min-w-[210px] rounded-xl bg-slate-950/95 p-1.5 border border-white/15 shadow-2xl backdrop-blur-2xl">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase">
                Pilih Subtitle
              </div>
              <button
                onClick={() => {
                  selectSubtitleTrack(0);
                  onClose();
                }}
                className="flex w-full items-center justify-between rounded-md px-2 py-1.5 hover:bg-white/10 text-left"
              >
                <span>Nonaktifkan Subtitle</span>
                {!tracks.some((t) => t.type === 'sub' && t.selected) && (
                  <Check className="h-3.5 w-3.5 text-blue-400" />
                )}
              </button>
              {subTracks.map((track) => (
                <button
                  key={track.id}
                  onClick={() => {
                    selectSubtitleTrack(track.id);
                    onClose();
                  }}
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 hover:bg-white/10 text-left"
                >
                  <span className="truncate pr-2">{track.title || track.lang || `Sub ${track.id}`}</span>
                  {track.selected && <Check className="h-3.5 w-3.5 text-blue-400 shrink-0" />}
                </button>
              ))}
              <div className="my-1 border-t border-white/10" />
              <button
                onClick={() => {
                  openSubtitleDialog();
                  onClose();
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 hover:bg-white/10 text-left text-blue-400"
              >
                <Plus className="h-3.5 w-3.5" /> Muat Subtitle External...
              </button>
              <div className="my-1 border-t border-white/10" />
              <div className="flex items-center justify-between px-2 py-1 text-[11px] text-slate-400">
                <span>Delay:</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => adjustSubDelay(-0.1)}
                    className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white font-mono"
                  >
                    -0.1s
                  </button>
                  <button
                    onClick={() => adjustSubDelay(0.1)}
                    className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white font-mono"
                  >
                    +0.1s
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between px-2 py-1 text-[11px] text-slate-400">
                <span>Ukuran:</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => adjustSubScale(-0.1)}
                    className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white font-mono"
                  >
                    -
                  </button>
                  <button
                    onClick={() => adjustSubScale(0.1)}
                    className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white font-mono"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Speed Submenu */}
        <div
          className="relative"
          onMouseEnter={() => setActiveSubmenu('speed')}
          onMouseLeave={() => setActiveSubmenu(null)}
        >
          <div className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 hover:bg-white/10 cursor-pointer transition-colors">
            <span className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-amber-400" /> Kecepatan ({speed}x)
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
          </div>

          {activeSubmenu === 'speed' && (
            <div className="absolute left-full top-0 ml-1 min-w-[150px] rounded-xl bg-slate-950/95 p-1.5 border border-white/15 shadow-2xl backdrop-blur-2xl">
              {[0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSpeed(s);
                    onClose();
                  }}
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 hover:bg-white/10 text-left font-mono"
                >
                  <span>{s.toFixed(2)}x {s === 1.0 && '(Normal)'}</span>
                  {speed === s && <Check className="h-3.5 w-3.5 text-blue-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Aspect Ratio Submenu */}
        <div
          className="relative"
          onMouseEnter={() => setActiveSubmenu('aspect')}
          onMouseLeave={() => setActiveSubmenu(null)}
        >
          <div className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 hover:bg-white/10 cursor-pointer transition-colors">
            <span className="flex items-center gap-2">
              <Tv className="h-4 w-4 text-cyan-400" /> Rasio Aspek
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
          </div>

          {activeSubmenu === 'aspect' && (
            <div className="absolute left-full top-0 ml-1 min-w-[150px] rounded-xl bg-slate-950/95 p-1.5 border border-white/15 shadow-2xl backdrop-blur-2xl">
              {[
                { label: 'Otomatis (Bawaan)', val: '-1' },
                { label: '16:9 Widescreen', val: '16:9' },
                { label: '4:3 Standard', val: '4:3' },
                { label: '2.35:1 Cinemascope', val: '2.35:1' },
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() => {
                    setAspectRatio(item.val);
                    onClose();
                  }}
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 hover:bg-white/10 text-left"
                >
                  <span>{item.label}</span>
                  {aspectRatio === item.val && <Check className="h-3.5 w-3.5 text-blue-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="my-1 border-t border-white/10" />

        {/* Stats HUD */}
        <button
          onClick={() => {
            toggleStatsVisible();
            onClose();
          }}
          className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 hover:bg-white/10 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-teal-400" /> OSD Stats (MPC-HC)
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            {isStatsVisible ? 'On' : 'Off'}
          </span>
        </button>

        {/* Screenshot */}
        <button
          onClick={() => {
            takeScreenshot();
            onClose();
          }}
          className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 hover:bg-white/10 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Camera className="h-4 w-4 text-rose-400" /> Tangkap Layar
          </span>
          <span className="text-[10px] font-mono text-slate-500">S</span>
        </button>

        {/* Always on top */}
        <button
          onClick={() => {
            toggleAlwaysOnTop();
            onClose();
          }}
          className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 hover:bg-white/10 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Pin className={`h-4 w-4 ${isAlwaysOnTop ? 'text-amber-400' : 'text-slate-400'}`} /> Always on Top
          </span>
          {isAlwaysOnTop && <Check className="h-3.5 w-3.5 text-amber-400" />}
        </button>

        {/* Fullscreen */}
        <button
          onClick={() => {
            toggleFullscreen();
            onClose();
          }}
          className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 hover:bg-white/10 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Maximize className="h-4 w-4 text-purple-400" /> Layar Penuh
          </span>
          <span className="text-[10px] font-mono text-slate-500">F</span>
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
