import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileVideo, Music } from 'lucide-react';
import { listen } from '@tauri-apps/api/event';
import { usePlayerStore } from '../store/usePlayerStore';
import { playerApi, isTauriEnvironment } from '../services/playerApi';

export const VideoCanvas: React.FC = () => {
  const isIdle = usePlayerStore((state) => state.isIdle);
  const togglePlayback = usePlayerStore((state) => state.togglePlayback);
  const toggleFullscreen = usePlayerStore((state) => state.toggleFullscreen);
  const loadFile = usePlayerStore((state) => state.loadFile);

  const [isDragOver, setIsDragOver] = useState(false);

  // Native Tauri Window Drag & Drop listener
  useEffect(() => {
    if (!isTauriEnvironment()) return;

    let unlisten: (() => void) | undefined;
    
    // Tauri v2 drag-drop events
    listen<{ paths: string[] }>('tauri://drag-drop', async (event) => {
      setIsDragOver(false);
      if (event.payload.paths && event.payload.paths.length > 0) {
        const filePath = event.payload.paths[0];
        await loadFile(filePath);
      }
    }).then((fn) => {
      unlisten = fn;
    });

    listen('tauri://drag-enter', () => setIsDragOver(true));
    listen('tauri://drag-leave', () => setIsDragOver(false));

    return () => {
      if (unlisten) unlisten();
    };
  }, [loadFile]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const filePath = (file as unknown as { path?: string }).path;
      if (filePath) {
        await loadFile(filePath);
      }
    }
  };

  const handlePickFile = async () => {
    const selected = await playerApi.openFileDialog();
    if (selected) {
      await loadFile(selected);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={togglePlayback}
      onDoubleClick={toggleFullscreen}
      className="relative flex h-full w-full items-center justify-center bg-transparent cursor-pointer overflow-hidden"
    >
      {/* MPV Native Rendering Surface Underlying Passthrough */}
      <div className="absolute inset-0 pointer-events-none -z-10" />

      {/* Empty State / Drag-and-Drop Welcome Hero */}
      <AnimatePresence>
        {isIdle && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()} // don't toggle playback when clicking inside card
            className={`glass-panel relative flex flex-col items-center justify-center rounded-3xl p-10 text-center max-w-md w-full mx-4 transition-all duration-300 ${
              isDragOver ? 'border-blue-400/60 bg-blue-950/40 shadow-[0_0_30px_rgba(59,130,246,0.3)]' : ''
            }`}
          >
            {/* Pulsing Aura Indicator */}
            <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600/30 via-indigo-500/20 to-teal-400/20 border border-white/15 shadow-inner">
              <UploadCloud className={`h-10 w-10 transition-transform duration-300 ${isDragOver ? 'scale-110 text-blue-300' : 'text-blue-400'}`} />
            </div>

            <h2 className="text-xl font-semibold tracking-tight text-white mb-2">
              Tarik & Letakkan Media ke Sini
            </h2>
            <p className="text-xs text-slate-400 max-w-xs mb-6 leading-relaxed">
              Mendukung 4K/60fps HDR MKV, MP4, WebM, MOV serta audio hi-res FLAC, ALAC, WAV, DTS melalui zero-copy D3D11VA/NVDEC engine.
            </p>

            <button
              onClick={handlePickFile}
              className="glass-button flex items-center gap-2 px-5 py-2.5 rounded-xl cursor-pointer text-xs font-medium text-white shadow-lg"
            >
              <FileVideo className="h-4 w-4 text-blue-400" />
              Pilih Berkas Media
            </button>

            {/* Badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 pt-4 border-t border-white/5 text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-1">
                <FileVideo className="h-3 w-3 text-cyan-400" /> D3D11VA / NVDEC
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-1">
                <Music className="h-3 w-3 text-indigo-400" /> Hi-Res Bitperfect
              </span>
              <span className="rounded-md bg-white/5 px-2 py-1">
                libass Subs
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
