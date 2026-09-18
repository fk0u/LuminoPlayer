import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Square, X, Sparkles, Film, Pin } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';

export const TitleBar: React.FC = () => {
  const metadata = usePlayerStore((state) => state.metadata);
  const controlsVisible = usePlayerStore((state) => state.controlsVisible);
  const isAlwaysOnTop = usePlayerStore((state) => state.isAlwaysOnTop);
  const toggleAlwaysOnTop = usePlayerStore((state) => state.toggleAlwaysOnTop);
  const minimizeWindow = usePlayerStore((state) => state.minimizeWindow);
  const maximizeWindow = usePlayerStore((state) => state.maximizeWindow);
  const closeWindow = usePlayerStore((state) => state.closeWindow);

  return (
    <AnimatePresence>
      {controlsVisible && (
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed top-0 left-0 right-0 z-50 flex h-10 select-none items-center justify-between px-3 bg-gradient-to-b from-black/90 via-black/50 to-transparent backdrop-blur-sm"
        >
          {/* Drag region for entire titlebar except buttons */}
          <div
            data-tauri-drag-region
            className="absolute inset-0 -z-10 cursor-default"
          />

          {/* Brand & File Information */}
          <div className="flex items-center gap-2.5 overflow-hidden pl-1">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.5)]">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            </div>
            <span className="text-xs font-bold tracking-wider text-slate-100">
              LUMINO
            </span>

            {metadata?.title && (
              <>
                <span className="text-slate-600 font-light">/</span>
                <div className="flex items-center gap-1.5 overflow-hidden text-xs text-slate-300">
                  <Film className="h-3 w-3 text-cyan-400 shrink-0" />
                  <span className="truncate max-w-[360px] font-medium text-slate-200">
                    {metadata.title}
                  </span>
                  {metadata.isHdr && (
                    <span className="rounded bg-amber-500/20 px-1.5 py-0.2 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                      HDR
                    </span>
                  )}
                  {metadata.videoCodec && (
                    <span className="rounded bg-white/10 px-1.5 py-0.2 text-[10px] text-slate-300 border border-white/10 font-mono">
                      {metadata.videoCodec}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right Controls: Pin + Window Buttons */}
          <div className="flex items-center gap-1.5">
            {/* Always On Top Toggle Button */}
            <button
              onClick={toggleAlwaysOnTop}
              title={isAlwaysOnTop ? 'Lepas Pin Always on Top' : 'Sematkan di Atas (Always on Top)'}
              className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
                isAlwaysOnTop
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-300 hover:bg-white/15 hover:text-white'
              }`}
            >
              <Pin className="h-3.5 w-3.5" />
            </button>

            {/* Native Window Controls (Minimize, Maximize, Close) */}
            <div className="flex items-center gap-0.5 ml-1 bg-white/5 rounded-md p-0.5 border border-white/10">
              <button
                onClick={minimizeWindow}
                title="Minimize"
                className="group flex h-6 w-8 items-center justify-center rounded text-slate-300 transition-colors hover:bg-white/15 hover:text-white"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={maximizeWindow}
                title="Maximize / Restore"
                className="group flex h-6 w-8 items-center justify-center rounded text-slate-300 transition-colors hover:bg-white/15 hover:text-white"
              >
                <Square className="h-3 w-3" />
              </button>
              <button
                onClick={closeWindow}
                title="Close"
                className="group flex h-6 w-8 items-center justify-center rounded text-slate-300 transition-colors hover:bg-red-600 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  );
};
