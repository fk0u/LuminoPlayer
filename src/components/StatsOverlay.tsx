import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Activity, Video, Volume2, Clock } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';

export const StatsOverlay: React.FC = () => {
  const isStatsVisible = usePlayerStore((state) => state.isStatsVisible);
  const metadata = usePlayerStore((state) => state.metadata);
  const stats = usePlayerStore((state) => state.stats);
  const refreshStats = usePlayerStore((state) => state.refreshStats);
  const speed = usePlayerStore((state) => state.speed);
  const subDelay = usePlayerStore((state) => state.subDelay);
  const audioDelay = usePlayerStore((state) => state.audioDelay);

  // Poll stats every 1 second while visible
  useEffect(() => {
    if (!isStatsVisible) return;
    refreshStats();
    const interval = window.setInterval(refreshStats, 1000);
    return () => window.clearInterval(interval);
  }, [isStatsVisible, refreshStats]);

  return (
    <AnimatePresence>
      {isStatsVisible && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="fixed top-12 left-4 z-40 max-w-sm rounded-xl bg-black/85 p-4 font-mono text-[11px] text-slate-300 border border-cyan-500/30 shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl pointer-events-none select-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2 text-cyan-400 font-bold tracking-wider">
            <span className="flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5" /> LUMINO OSD STATS [Ctrl+J / Tab]
            </span>
          </div>

          <div className="space-y-2">
            {/* Decoder & Hardware Acceleration */}
            <div className="flex items-start gap-2">
              <Cpu className="h-3.5 w-3.5 text-blue-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-slate-400">HW Decoder:</div>
                <div className="font-semibold text-emerald-400">
                  {stats?.hwdecCurrent || 'd3d11va (Direct3D 11 Zero-Copy)'}
                </div>
              </div>
            </div>

            {/* Video Resolution & Framerate */}
            <div className="flex items-start gap-2">
              <Video className="h-3.5 w-3.5 text-cyan-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-slate-400">Video Stream:</div>
                <div className="text-white">
                  {metadata?.width && metadata?.height
                    ? `${metadata.width}x${metadata.height}`
                    : 'Auto'}{' '}
                  @ {stats?.estimatedFps ? stats.estimatedFps.toFixed(2) : metadata?.fps || 60} fps
                </div>
                <div className="text-slate-400 text-[10px]">
                  Codec: <span className="text-slate-200">{metadata?.videoCodec || stats?.videoCodec || 'HEVC'}</span>
                  {metadata?.isHdr && (
                    <span className="ml-1.5 rounded bg-amber-500/20 px-1 py-0.2 text-[9px] text-amber-300 border border-amber-500/30">
                      HDR BT.2020
                    </span>
                  )}
                </div>
                <div className="text-slate-400 text-[10px]">
                  Dropped Frames: <span className={stats?.dropFrameCount ? 'text-red-400' : 'text-emerald-400'}>{stats?.dropFrameCount ?? 0}</span>
                </div>
              </div>
            </div>

            {/* Audio Stream */}
            <div className="flex items-start gap-2">
              <Volume2 className="h-3.5 w-3.5 text-indigo-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-slate-400">Audio Stream:</div>
                <div className="text-slate-200">
                  {metadata?.audioCodec || stats?.audioCodec || 'FLAC / AAC'}{' '}
                  {stats?.audioChannels ? `(${stats.audioChannels})` : ''}
                </div>
                {stats?.audioSamplerate && (
                  <div className="text-slate-400 text-[10px]">
                    Sample Rate: {stats.audioSamplerate} Hz
                  </div>
                )}
              </div>
            </div>

            {/* Sync & Speed */}
            <div className="flex items-start gap-2 border-t border-white/5 pt-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px] w-full">
                <div>
                  <span className="text-slate-400">Speed:</span>{' '}
                  <span className="text-white font-bold">{speed}x</span>
                </div>
                <div>
                  <span className="text-slate-400">Sub Delay:</span>{' '}
                  <span className="text-slate-200">{subDelay}s</span>
                </div>
                <div>
                  <span className="text-slate-400">A/V Sync:</span>{' '}
                  <span className="text-slate-200">{audioDelay}s</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
