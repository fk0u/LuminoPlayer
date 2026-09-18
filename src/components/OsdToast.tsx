import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Volume1, VolumeX, Zap } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';

export const OsdToast: React.FC = () => {
  const osdMessage = usePlayerStore((state) => state.osdMessage);
  const volume = usePlayerStore((state) => state.volume);
  const isMuted = usePlayerStore((state) => state.isMuted);

  const isVolumeMsg = osdMessage?.startsWith('Volume:');
  const isBoost = volume > 100;

  return (
    <AnimatePresence>
      {osdMessage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="pointer-events-none fixed top-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 rounded-full px-5 py-2 glass-panel shadow-[0_10px_30px_rgba(0,0,0,0.6)] border border-white/20 text-xs font-semibold text-white backdrop-blur-2xl"
        >
          {isVolumeMsg && (
            <div className="flex items-center gap-1.5 text-blue-400">
              {isMuted ? (
                <VolumeX className="h-4 w-4 text-red-400" />
              ) : isBoost ? (
                <Zap className="h-4 w-4 text-amber-400 animate-pulse" />
              ) : volume < 50 ? (
                <Volume1 className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </div>
          )}
          <span className={isBoost && isVolumeMsg ? 'text-amber-300 font-bold' : ''}>
            {osdMessage}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
