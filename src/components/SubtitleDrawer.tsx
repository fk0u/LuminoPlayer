import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ScrollText,
  Search,
  Clock,
  Play,
  ArrowUpDown,
  FileText,
  Download,
} from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';

const formatSeconds = (sec: number): string => {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.floor((sec % 1) * 10);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
};

export const SubtitleDrawer: React.FC = () => {
  const isOpen = usePlayerStore((state) => state.isSubtitleDrawerOpen);
  const setIsOpen = usePlayerStore((state) => state.setSubtitleDrawerOpen);
  const subtitleCues = usePlayerStore((state) => state.subtitleCues);
  const activeCueId = usePlayerStore((state) => state.activeCueId);
  const subPosition = usePlayerStore((state) => state.subPosition);
  const subDelay = usePlayerStore((state) => state.subDelay);
  const subScale = usePlayerStore((state) => state.subScale);

  const seek = usePlayerStore((state) => state.seek);
  const setSubPos = usePlayerStore((state) => state.setSubPos);
  const adjustSubDelay = usePlayerStore((state) => state.adjustSubDelay);
  const adjustSubScale = usePlayerStore((state) => state.adjustSubScale);
  const openSubtitleDialog = usePlayerStore((state) => state.openSubtitleDialog);
  const toggleAutoSubModal = usePlayerStore((state) => state.toggleAutoSubModal);

  const [autoScroll, setAutoScroll] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const activeCueRef = useRef<HTMLDivElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active cue when it changes
  useEffect(() => {
    if (!autoScroll || !isOpen || activeCueId === null || !activeCueRef.current || !listContainerRef.current) {
      return;
    }

    const container = listContainerRef.current;
    const activeEl = activeCueRef.current;
    const containerHeight = container.clientHeight;
    const activeTop = activeEl.offsetTop;
    const activeHeight = activeEl.clientHeight;

    // Center active item in container
    const targetScroll = activeTop - containerHeight / 2 + activeHeight / 2;
    container.scrollTo({
      top: targetScroll,
      behavior: 'smooth',
    });
  }, [activeCueId, autoScroll, isOpen]);

  const filteredCues = subtitleCues.filter((c) =>
    c.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop click to dismiss on small screens */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] md:hidden"
          />

          {/* Drawer Panel */}
          <motion.aside
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed top-10 right-0 bottom-0 z-40 flex w-80 sm:w-96 flex-col bg-slate-950/85 backdrop-blur-2xl border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] text-slate-100 select-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20 text-cyan-400 border border-blue-500/30">
                  <ScrollText className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold tracking-wide flex items-center gap-2">
                    Subtitle Geser Otomatis
                    {autoScroll && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-400">Transkrip dialog tersinkronisasi</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setAutoScroll(!autoScroll)}
                  title={autoScroll ? 'Auto-scroll aktif (klik untuk matikan)' : 'Auto-scroll nonaktif (klik untuk nyalakan)'}
                  className={`rounded-md px-2 py-1 text-[10px] font-medium border transition-colors ${
                    autoScroll
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {autoScroll ? 'Auto-Sync' : 'Manual'}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Subtitle Positioning & Styling Quick Controls */}
            <div className="border-b border-white/10 bg-white/[0.02] p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span className="font-medium flex items-center gap-1 text-slate-400">
                  <ArrowUpDown className="h-3 w-3 text-cyan-400" />
                  Posisi Vertikal Layar
                </span>
                <span className="font-mono text-amber-400 font-bold">{subPosition}%</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: 'Atas (20%)', val: 20 },
                  { label: 'Tengah', val: 50 },
                  { label: 'Bawah (90%)', val: 90 },
                  { label: 'Dasar', val: 100 },
                ].map((pos) => (
                  <button
                    key={pos.val}
                    onClick={() => setSubPos(pos.val)}
                    className={`py-1 text-[10px] rounded font-medium border transition-colors ${
                      subPosition === pos.val
                        ? 'bg-blue-600/40 text-blue-300 border-blue-500/50'
                        : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>

              {/* Delay & Scale adjusters */}
              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-300">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Delay:</span>
                  <button
                    onClick={() => adjustSubDelay(-0.1)}
                    className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px]"
                  >
                    -0.1s
                  </button>
                  <span className="font-mono text-[10px] text-cyan-300">
                    {subDelay > 0 ? `+${subDelay}` : subDelay}s
                  </span>
                  <button
                    onClick={() => adjustSubDelay(0.1)}
                    className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px]"
                  >
                    +0.1s
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Ukuran:</span>
                  <button
                    onClick={() => adjustSubScale(-0.1)}
                    className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px]"
                  >
                    -
                  </button>
                  <span className="font-mono text-[10px] text-cyan-300">{subScale}x</span>
                  <button
                    onClick={() => adjustSubScale(0.1)}
                    className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px]"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Search Input Bar */}
            <div className="p-3 border-b border-white/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari teks dialog atau kata kunci..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg bg-white/5 border border-white/10 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/60 focus:bg-white/10 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-white"
                  >
                    Bersihkan
                  </button>
                )}
              </div>
            </div>

            {/* Cue List Container (Auto-Scroll Area) */}
            <div
              ref={listContainerRef}
              className="flex-1 overflow-y-auto p-3 space-y-2 select-text"
            >
              {filteredCues.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center p-4">
                  <FileText className="h-10 w-10 text-slate-600 mb-3" />
                  <p className="text-xs text-slate-300 font-medium">
                    {searchQuery ? 'Tidak ada baris yang cocok' : 'Belum ada subtitle yang aktif'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-[220px]">
                    {searchQuery
                      ? 'Coba kata kunci pencarian yang lain'
                      : 'Muat berkas .srt / .vtt atau cari subtitle secara online'}
                  </p>
                  <div className="mt-4 flex flex-col gap-2 w-full max-w-[200px]">
                    <button
                      onClick={openSubtitleDialog}
                      className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs hover:bg-blue-600/50 transition-colors"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Muat Berkas SRT
                    </button>
                    <button
                      onClick={toggleAutoSubModal}
                      className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-slate-200 border border-white/10 text-xs hover:bg-white/10 transition-colors"
                    >
                      <Download className="h-3.5 w-3.5 text-cyan-400" />
                      Cari Online
                    </button>
                  </div>
                </div>
              ) : (
                filteredCues.map((cue) => {
                  const isActive = cue.id === activeCueId;
                  return (
                    <div
                      key={cue.id}
                      ref={isActive ? activeCueRef : null}
                      onClick={() => seek(cue.start)}
                      className={`group relative flex flex-col gap-1 p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-600/25 border-blue-500/60 shadow-[0_0_20px_rgba(59,130,246,0.3)] pl-3.5'
                          : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.07] hover:border-white/15'
                      }`}
                    >
                      {/* Active Indicator Strip */}
                      {isActive && (
                        <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-gradient-to-b from-cyan-400 to-blue-500 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                      )}

                      {/* Timestamp Row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Clock className={`h-3 w-3 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                          <span
                            className={`text-[10px] font-mono font-medium ${
                              isActive ? 'text-cyan-300 font-bold' : 'text-slate-400'
                            }`}
                          >
                            {formatSeconds(cue.start)} - {formatSeconds(cue.end)}
                          </span>
                        </div>

                        {/* Jump Icon Hint on Hover */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="h-2.5 w-2.5 text-blue-400 fill-current" />
                          <span className="text-[10px] text-blue-400 font-medium">Lompat</span>
                        </div>
                      </div>

                      {/* Dialog Text */}
                      <p
                        className={`text-xs leading-relaxed transition-colors ${
                          isActive
                            ? 'text-white font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'
                            : 'text-slate-300 group-hover:text-white'
                        }`}
                      >
                        {cue.text}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Footer Info */}
            <div className="border-t border-white/10 p-3 bg-white/[0.02] flex items-center justify-between text-[11px] text-slate-400">
              <span>{subtitleCues.length} baris subtitle</span>
              <span className="text-[10px] text-slate-500">Klik baris untuk lompat</span>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
