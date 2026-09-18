import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpen,
  FileText,
  Camera,
  Power,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Zap,
  Volume2,
  VolumeX,
  ScrollText,
  Activity,
  Pin,
  Maximize,
  Search,
} from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { playerApi } from '../services/playerApi';

type MenuId = 'file' | 'play' | 'audio' | 'subtitle' | 'view' | 'settings' | null;

export const TopMenuBar: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<MenuId>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const currentTime = usePlayerStore((state) => state.currentTime);
  const volume = usePlayerStore((state) => state.volume);
  const speed = usePlayerStore((state) => state.speed);
  const isMuted = usePlayerStore((state) => state.isMuted);
  const isAlwaysOnTop = usePlayerStore((state) => state.isAlwaysOnTop);
  const aspectRatio = usePlayerStore((state) => state.aspectRatio);
  const tracks = usePlayerStore((state) => state.tracks);
  const subDelay = usePlayerStore((state) => state.subDelay);
  const audioDelay = usePlayerStore((state) => state.audioDelay);
  const subScale = usePlayerStore((state) => state.subScale);
  const subPosition = usePlayerStore((state) => state.subPosition);
  const isSubtitleDrawerOpen = usePlayerStore((state) => state.isSubtitleDrawerOpen);

  const togglePlayback = usePlayerStore((state) => state.togglePlayback);
  const seek = usePlayerStore((state) => state.seek);
  const setVolume = usePlayerStore((state) => state.setVolume);
  const toggleMute = usePlayerStore((state) => state.toggleMute);
  const setSpeed = usePlayerStore((state) => state.setSpeed);
  const stepFrame = usePlayerStore((state) => state.stepFrame);
  const setAspectRatio = usePlayerStore((state) => state.setAspectRatio);
  const adjustSubDelay = usePlayerStore((state) => state.adjustSubDelay);
  const adjustAudioDelay = usePlayerStore((state) => state.adjustAudioDelay);
  const adjustSubScale = usePlayerStore((state) => state.adjustSubScale);
  const setSubPos = usePlayerStore((state) => state.setSubPos);
  const openSubtitleDialog = usePlayerStore((state) => state.openSubtitleDialog);
  const takeScreenshot = usePlayerStore((state) => state.takeScreenshot);
  const toggleAlwaysOnTop = usePlayerStore((state) => state.toggleAlwaysOnTop);
  const toggleStatsVisible = usePlayerStore((state) => state.toggleStatsVisible);
  const toggleFullscreen = usePlayerStore((state) => state.toggleFullscreen);
  const selectSubtitleTrack = usePlayerStore((state) => state.selectSubtitleTrack);
  const selectAudioTrack = usePlayerStore((state) => state.selectAudioTrack);
  const closeWindow = usePlayerStore((state) => state.closeWindow);
  const toggleSubtitleDrawer = usePlayerStore((state) => state.toggleSubtitleDrawer);
  const toggleAutoSubModal = usePlayerStore((state) => state.toggleAutoSubModal);
  const toggleSettingsModal = usePlayerStore((state) => state.toggleSettingsModal);
  const loadFile = usePlayerStore((state) => state.loadFile);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveMenu(null);
    };

    window.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleMenuClick = (menu: MenuId) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const handleMenuHover = (menu: MenuId) => {
    if (activeMenu !== null) {
      setActiveMenu(menu);
    }
  };

  const closeMenu = () => setActiveMenu(null);

  const subTracks = tracks.filter((t) => t.type === 'sub');
  const audioTracks = tracks.filter((t) => t.type === 'audio');

  const menuButtonClass = (menu: MenuId) =>
    `px-2.5 py-1 text-xs rounded transition-colors select-none ${
      activeMenu === menu
        ? 'bg-white/20 text-white font-medium shadow-sm'
        : 'text-slate-300 hover:bg-white/10 hover:text-white'
    }`;

  const menuItemClass =
    'flex w-full items-center justify-between px-3 py-1.5 text-xs text-slate-200 hover:bg-blue-600 hover:text-white rounded-md transition-colors cursor-pointer group text-left';

  const menuSeparatorClass = 'my-1 h-px bg-white/10';

  return (
    <div ref={menuContainerRef} className="relative flex items-center gap-0.5">
      {/* 1. Berkas (File) */}
      <div className="relative">
        <button
          onClick={() => handleMenuClick('file')}
          onMouseEnter={() => handleMenuHover('file')}
          className={menuButtonClass('file')}
        >
          Berkas
        </button>

        <AnimatePresence>
          {activeMenu === 'file' && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.12 }}
              className="absolute top-full left-0 mt-1 w-64 rounded-xl bg-slate-900/95 p-1.5 shadow-2xl border border-white/15 backdrop-blur-2xl z-50"
            >
              <button
                onClick={async () => {
                  closeMenu();
                  const file = await playerApi.openFileDialog();
                  if (file) await loadFile(file);
                }}
                className={menuItemClass}
              >
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-3.5 w-3.5 text-cyan-400 group-hover:text-white" />
                  <span>Buka Berkas Video...</span>
                </div>
                <span className="text-[10px] text-slate-400 group-hover:text-slate-200">Ctrl+O</span>
              </button>

              <button
                onClick={async () => {
                  closeMenu();
                  await openSubtitleDialog();
                }}
                className={menuItemClass}
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-teal-400 group-hover:text-white" />
                  <span>Buka Subtitle Eksternal...</span>
                </div>
              </button>

              <button
                onClick={() => {
                  closeMenu();
                  toggleAutoSubModal();
                }}
                className={menuItemClass}
              >
                <div className="flex items-center gap-2">
                  <Search className="h-3.5 w-3.5 text-blue-400 group-hover:text-white" />
                  <span>Cari & Unduh Subtitle Otomatis</span>
                </div>
                <span className="text-[10px] font-semibold text-cyan-400 group-hover:text-cyan-200">Auto</span>
              </button>

              <div className={menuSeparatorClass} />

              <button
                onClick={async () => {
                  closeMenu();
                  await takeScreenshot();
                }}
                className={menuItemClass}
              >
                <div className="flex items-center gap-2">
                  <Camera className="h-3.5 w-3.5 text-amber-400 group-hover:text-white" />
                  <span>Ambil Tangkapan Layar (Screenshot)</span>
                </div>
                <span className="text-[10px] text-slate-400 group-hover:text-slate-200">S</span>
              </button>

              <div className={menuSeparatorClass} />

              <button
                onClick={async () => {
                  closeMenu();
                  await closeWindow();
                }}
                className={`${menuItemClass} hover:!bg-red-600`}
              >
                <div className="flex items-center gap-2 text-red-300 group-hover:text-white">
                  <Power className="h-3.5 w-3.5" />
                  <span>Keluar</span>
                </div>
                <span className="text-[10px] text-slate-400 group-hover:text-slate-200">Alt+F4</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. Putar (Playback) */}
      <div className="relative">
        <button
          onClick={() => handleMenuClick('play')}
          onMouseEnter={() => handleMenuHover('play')}
          className={menuButtonClass('play')}
        >
          Putar
        </button>

        <AnimatePresence>
          {activeMenu === 'play' && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.12 }}
              className="absolute top-full left-0 mt-1 w-64 rounded-xl bg-slate-900/95 p-1.5 shadow-2xl border border-white/15 backdrop-blur-2xl z-50"
            >
              <button
                onClick={() => {
                  closeMenu();
                  togglePlayback();
                }}
                className={menuItemClass}
              >
                <div className="flex items-center gap-2">
                  {isPlaying ? (
                    <Pause className="h-3.5 w-3.5 text-blue-400 group-hover:text-white" />
                  ) : (
                    <Play className="h-3.5 w-3.5 text-blue-400 group-hover:text-white" />
                  )}
                  <span>{isPlaying ? 'Jeda' : 'Putar'}</span>
                </div>
                <span className="text-[10px] text-slate-400 group-hover:text-slate-200">Spasi</span>
              </button>

              <button
                onClick={() => {
                  closeMenu();
                  seek(currentTime - 10);
                }}
                className={menuItemClass}
              >
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-3.5 w-3.5 text-slate-300 group-hover:text-white" />
                  <span>Mundur 10 Detik</span>
                </div>
                <span className="text-[10px] text-slate-400 group-hover:text-slate-200">Kiri</span>
              </button>

              <button
                onClick={() => {
                  closeMenu();
                  seek(currentTime + 10);
                }}
                className={menuItemClass}
              >
                <div className="flex items-center gap-2">
                  <RotateCw className="h-3.5 w-3.5 text-slate-300 group-hover:text-white" />
                  <span>Maju 10 Detik</span>
                </div>
                <span className="text-[10px] text-slate-400 group-hover:text-slate-200">Kanan</span>
              </button>

              <div className={menuSeparatorClass} />

              <button
                onClick={() => {
                  closeMenu();
                  stepFrame(false);
                }}
                className={menuItemClass}
              >
                <div className="flex items-center gap-2">
                  <ChevronLeft className="h-3.5 w-3.5 text-slate-300 group-hover:text-white" />
                  <span>1 Frame Mundur</span>
                </div>
                <span className="text-[10px] text-slate-400 group-hover:text-slate-200">,</span>
              </button>

              <button
                onClick={() => {
                  closeMenu();
                  stepFrame(true);
                }}
                className={menuItemClass}
              >
                <div className="flex items-center gap-2">
                  <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-white" />
                  <span>1 Frame Maju</span>
                </div>
                <span className="text-[10px] text-slate-400 group-hover:text-slate-200">.</span>
              </button>

              <div className={menuSeparatorClass} />

              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Kecepatan Putar
              </div>

              {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                <button
                  key={rate}
                  onClick={() => {
                    closeMenu();
                    setSpeed(rate);
                  }}
                  className={`${menuItemClass} ${Math.abs(speed - rate) < 0.05 ? 'bg-blue-600/30 text-blue-300 font-bold' : ''}`}
                >
                  <span>{rate === 1.0 ? '1.0x (Normal)' : `${rate}x`}</span>
                  {Math.abs(speed - rate) < 0.05 && <span>✓</span>}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Audio */}
      <div className="relative">
        <button
          onClick={() => handleMenuClick('audio')}
          onMouseEnter={() => handleMenuHover('audio')}
          className={menuButtonClass('audio')}
        >
          Audio
        </button>

        <AnimatePresence>
          {activeMenu === 'audio' && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.12 }}
              className="absolute top-full left-0 mt-1 w-64 rounded-xl bg-slate-900/95 p-1.5 shadow-2xl border border-white/15 backdrop-blur-2xl z-50"
            >
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Trek Audio ({audioTracks.length})
              </div>

              {audioTracks.length === 0 ? (
                <div className="px-3 py-1 text-xs text-slate-500 italic">Tidak ada trek audio</div>
              ) : (
                audioTracks.map((tr) => (
                  <button
                    key={tr.id}
                    onClick={() => {
                      closeMenu();
                      selectAudioTrack(tr.id);
                    }}
                    className={`${menuItemClass} ${tr.selected ? 'bg-blue-600/30 text-blue-300 font-bold' : ''}`}
                  >
                    <span className="truncate pr-2">{tr.title || tr.lang || `Trek ${tr.id}`}</span>
                    {tr.selected && <span>✓</span>}
                  </button>
                ))
              )}

              <div className={menuSeparatorClass} />

              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Tingkat Volume
              </div>

              {[50, 80, 100, 125, 150].map((v) => (
                <button
                  key={v}
                  onClick={() => {
                    closeMenu();
                    setVolume(v);
                  }}
                  className={`${menuItemClass} ${Math.round(volume) === v ? 'bg-blue-600/30 text-blue-300 font-bold' : ''}`}
                >
                  <div className="flex items-center gap-1.5">
                    {v > 100 && <Zap className="h-3 w-3 text-amber-400" />}
                    <span>{v}% {v > 100 ? '(⚡ Audio Boost)' : ''}</span>
                  </div>
                  {Math.round(volume) === v && <span>✓</span>}
                </button>
              ))}

              <div className={menuSeparatorClass} />

              <button
                onClick={() => {
                  closeMenu();
                  toggleMute();
                }}
                className={menuItemClass}
              >
                <div className="flex items-center gap-2">
                  {isMuted ? (
                    <VolumeX className="h-3.5 w-3.5 text-red-400" />
                  ) : (
                    <Volume2 className="h-3.5 w-3.5 text-blue-400" />
                  )}
                  <span>{isMuted ? 'Batalkan Bisu (Unmute)' : 'Bisu (Mute)'}</span>
                </div>
                <span className="text-[10px] text-slate-400 group-hover:text-slate-200">M</span>
              </button>

              <div className={menuSeparatorClass} />

              <div className="px-3 py-1 flex items-center justify-between text-xs text-slate-300">
                <span>Audio Delay: {audioDelay > 0 ? `+${audioDelay}` : audioDelay}s</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => adjustAudioDelay(-0.1)}
                    className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px]"
                  >
                    -0.1s
                  </button>
                  <button
                    onClick={() => adjustAudioDelay(0.1)}
                    className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px]"
                  >
                    +0.1s
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. Subtitle */}
      <div className="relative">
        <button
          onClick={() => handleMenuClick('subtitle')}
          onMouseEnter={() => handleMenuHover('subtitle')}
          className={menuButtonClass('subtitle')}
        >
          Subtitle
        </button>

        <AnimatePresence>
          {activeMenu === 'subtitle' && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.12 }}
              className="absolute top-full left-0 mt-1 w-72 rounded-xl bg-slate-900/95 p-1.5 shadow-2xl border border-white/15 backdrop-blur-2xl z-50"
            >
              {/* Feature 3: Sistem Subtitle Geser Otomatis Drawer Toggle */}
              <button
                onClick={() => {
                  closeMenu();
                  toggleSubtitleDrawer();
                }}
                className={`${menuItemClass} !bg-gradient-to-r ${
                  isSubtitleDrawerOpen
                    ? '!from-blue-600/50 !to-indigo-600/50 !text-white'
                    : 'hover:!from-blue-600 hover:!to-cyan-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ScrollText className="h-4 w-4 text-cyan-400 group-hover:text-white" />
                  <div>
                    <div className="font-semibold">Panel Geser Otomatis</div>
                    <div className="text-[10px] text-slate-300">Auto-scroll transkrip real-time</div>
                  </div>
                </div>
                <span className="text-[10px] rounded px-1.5 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {isSubtitleDrawerOpen ? 'Aktif' : 'Buka'}
                </span>
              </button>

              {/* Feature 4: Auto Subtitle Downloader */}
              <button
                onClick={() => {
                  closeMenu();
                  toggleAutoSubModal();
                }}
                className={menuItemClass}
              >
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-blue-400 group-hover:text-white" />
                  <div>
                    <div className="font-medium">Auto Cari Subtitle Online</div>
                    <div className="text-[10px] text-slate-400">Unduh subtitle otomatis</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-cyan-400">Auto</span>
              </button>

              <button
                onClick={async () => {
                  closeMenu();
                  await openSubtitleDialog();
                }}
                className={menuItemClass}
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-teal-400 group-hover:text-white" />
                  <span>Muat Berkas Subtitle (.srt / .ass)...</span>
                </div>
              </button>

              <div className={menuSeparatorClass} />

              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Pilih Trek Subtitle
              </div>

              <button
                onClick={() => {
                  closeMenu();
                  selectSubtitleTrack(0);
                }}
                className={menuItemClass}
              >
                <span>Nonaktifkan Subtitle (Off)</span>
              </button>

              {subTracks.map((tr) => (
                <button
                  key={tr.id}
                  onClick={() => {
                    closeMenu();
                    selectSubtitleTrack(tr.id);
                  }}
                  className={`${menuItemClass} ${tr.selected ? 'bg-blue-600/30 text-blue-300 font-bold' : ''}`}
                >
                  <span className="truncate pr-2">{tr.title || tr.lang || `Subtitle ${tr.id}`}</span>
                  {tr.selected && <span>✓</span>}
                </button>
              ))}

              <div className={menuSeparatorClass} />

              {/* Subtitle Vertical Position Setting */}
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Posisi Vertikal Layar</span>
                <span className="text-amber-400 font-mono">{subPosition}%</span>
              </div>

              <div className="grid grid-cols-4 gap-1 px-2 py-1">
                {[
                  { label: 'Atas', val: 20 },
                  { label: 'Tengah', val: 50 },
                  { label: 'Bawah', val: 90 },
                  { label: 'Dasar', val: 100 },
                ].map((pos) => (
                  <button
                    key={pos.val}
                    onClick={() => setSubPos(pos.val)}
                    className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                      subPosition === pos.val
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-white/10 text-slate-300 hover:bg-white/20'
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>

              <div className={menuSeparatorClass} />

              <div className="px-3 py-1 flex items-center justify-between text-xs text-slate-300">
                <span>Sinkronisasi Delay: {subDelay > 0 ? `+${subDelay}` : subDelay}s</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => adjustSubDelay(-0.1)}
                    className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px]"
                  >
                    -0.1s (Z)
                  </button>
                  <button
                    onClick={() => adjustSubDelay(0.1)}
                    className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px]"
                  >
                    +0.1s (X)
                  </button>
                </div>
              </div>

              <div className="px-3 py-1 flex items-center justify-between text-xs text-slate-300">
                <span>Skala Ukuran: {subScale}x</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => adjustSubScale(-0.1)}
                    className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px]"
                  >
                    Kecil
                  </button>
                  <button
                    onClick={() => adjustSubScale(0.1)}
                    className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px]"
                  >
                    Besar
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 5. Tampilan (View) */}
      <div className="relative">
        <button
          onClick={() => handleMenuClick('view')}
          onMouseEnter={() => handleMenuHover('view')}
          className={menuButtonClass('view')}
        >
          Tampilan
        </button>

        <AnimatePresence>
          {activeMenu === 'view' && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.12 }}
              className="absolute top-full left-0 mt-1 w-64 rounded-xl bg-slate-900/95 p-1.5 shadow-2xl border border-white/15 backdrop-blur-2xl z-50"
            >
              <button
                onClick={() => {
                  closeMenu();
                  toggleStatsVisible();
                }}
                className={menuItemClass}
              >
                <div className="flex items-center gap-2">
                  <Activity className="h-3.5 w-3.5 text-cyan-400 group-hover:text-white" />
                  <span>Statistik Hardware HUD</span>
                </div>
                <span className="text-[10px] text-slate-400 group-hover:text-slate-200">Tab / Ctrl+J</span>
              </button>

              <button
                onClick={async () => {
                  closeMenu();
                  await toggleAlwaysOnTop();
                }}
                className={menuItemClass}
              >
                <div className="flex items-center gap-2">
                  <Pin className="h-3.5 w-3.5 text-amber-400 group-hover:text-white" />
                  <span>Sematkan di Atas (Always on Top)</span>
                </div>
                <span className="text-[10px] text-slate-400 group-hover:text-slate-200">
                  {isAlwaysOnTop ? '✓' : 'Ctrl+T'}
                </span>
              </button>

              <button
                onClick={async () => {
                  closeMenu();
                  await toggleFullscreen();
                }}
                className={menuItemClass}
              >
                <div className="flex items-center gap-2">
                  <Maximize className="h-3.5 w-3.5 text-blue-400 group-hover:text-white" />
                  <span>Layar Penuh (Fullscreen)</span>
                </div>
                <span className="text-[10px] text-slate-400 group-hover:text-slate-200">F</span>
              </button>

              <div className={menuSeparatorClass} />

              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Rasio Aspek Layar
              </div>

              {[
                { label: 'Bawaan Video (Auto)', val: '-1' },
                { label: '16:9 Widescreen', val: '16:9' },
                { label: '4:3 Standard', val: '4:3' },
                { label: '2.35:1 Cinematic', val: '2.35:1' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => {
                    closeMenu();
                    setAspectRatio(opt.val);
                  }}
                  className={`${menuItemClass} ${aspectRatio === opt.val ? 'bg-blue-600/30 text-blue-300 font-bold' : ''}`}
                >
                  <span>{opt.label}</span>
                  {aspectRatio === opt.val && <span>✓</span>}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 6. Pengaturan (Settings) */}
      <div className="relative">
        <button
          onClick={() => {
            closeMenu();
            toggleSettingsModal();
          }}
          className={menuButtonClass('settings')}
          title="Buka Panel Pengaturan Lumino Player"
        >
          Pengaturan
        </button>
      </div>
    </div>
  );
};
