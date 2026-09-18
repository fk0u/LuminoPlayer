import { useEffect, useRef } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';

interface UseIdleTimerOptions {
  timeoutMs?: number;
}

export const useIdleTimer = ({ timeoutMs = 2000 }: UseIdleTimerOptions = {}) => {
  const timerRef = useRef<number | null>(null);
  const setControlsVisible = usePlayerStore((state) => state.setControlsVisible);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const isIdle = usePlayerStore((state) => state.isIdle);

  useEffect(() => {
    const handleActivity = () => {
      setControlsVisible(true);

      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }

      // Only auto-hide if media is currently playing and not in empty idle state
      if (isPlaying && !isIdle) {
        timerRef.current = window.setTimeout(() => {
          setControlsVisible(false);
        }, timeoutMs);
      }
    };

    // Initial trigger
    handleActivity();

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('keydown', handleActivity);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, [isPlaying, isIdle, timeoutMs, setControlsVisible]);
};
