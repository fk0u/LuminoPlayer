import type { SubtitleCue } from '../types/player';

/**
 * Parse time string HH:MM:SS,mmm or HH:MM:SS.mmm to seconds
 */
function parseTimestamp(timeStr: string): number {
  const parts = timeStr.trim().replace(',', '.').split(':');
  if (parts.length === 3) {
    const hours = parseFloat(parts[0]);
    const minutes = parseFloat(parts[1]);
    const seconds = parseFloat(parts[2]);
    return hours * 3600 + minutes * 60 + seconds;
  } else if (parts.length === 2) {
    const minutes = parseFloat(parts[0]);
    const seconds = parseFloat(parts[1]);
    return minutes * 60 + seconds;
  }
  return 0;
}

/**
 * Parse SRT or VTT subtitle string into structured SubtitleCue items
 */
export function parseSubtitleText(text: string): SubtitleCue[] {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const cues: SubtitleCue[] = [];
  let currentCue: Partial<SubtitleCue> | null = null;
  let textBuffer: string[] = [];

  const timePattern = /(\d{1,2}:\d{2}:\d{2}[,.]\d{3}|\d{2}:\d{2}[,.]\d{3})\s*-->\s*(\d{1,2}:\d{2}:\d{2}[,.]\d{3}|\d{2}:\d{2}[,.]\d{3})/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      if (currentCue && currentCue.start !== undefined && currentCue.end !== undefined) {
        currentCue.text = textBuffer.join(' ').replace(/<[^>]+>/g, '').trim();
        if (currentCue.text) {
          cues.push(currentCue as SubtitleCue);
        }
      }
      currentCue = null;
      textBuffer = [];
      continue;
    }

    const timeMatch = line.match(timePattern);
    if (timeMatch) {
      const start = parseTimestamp(timeMatch[1]);
      const end = parseTimestamp(timeMatch[2]);
      currentCue = {
        id: cues.length + 1,
        start,
        end,
      };
      textBuffer = [];
      continue;
    }

    if (currentCue) {
      textBuffer.push(line);
    }
  }

  if (currentCue && currentCue.start !== undefined && currentCue.end !== undefined) {
    currentCue.text = textBuffer.join(' ').replace(/<[^>]+>/g, '').trim();
    if (currentCue.text) {
      cues.push(currentCue as SubtitleCue);
    }
  }

  return cues;
}

/**
 * Generate simulated cues when a video is loaded without an external SRT file,
 * allowing instant demonstration of synced scrolling and interactive seek.
 */
export function generateDemoCues(duration: number, title?: string): SubtitleCue[] {
  if (duration <= 0) return [];
  const cues: SubtitleCue[] = [];
  const phrases = [
    `Memulai pemutaran: ${title || 'Lumino Media Video'}`,
    'Rendering hardware acceleration aktif dengan D3D11 / NVDEC zero-copy.',
    'Windows 11 Acrylic & Mica backdrop terintegrasi mulus.',
    'MPC-HC Level precision: Frame-by-frame navigation & 150% Audio Boost.',
    'Sistem Subtitle Geser Otomatis melacak dialog secara real-time.',
    'Klik baris subtitle manapun pada panel untuk lompat (seek) langsung ke waktu tersebut.',
    'Posisi vertikal subtitle dapat digeser naik atau turun sesuai preferensi Anda.',
    'Dukungan format terlengkap: MKV, MP4, WebM, FLAC, Dolby TrueHD & ASS/SRT styling.',
    'Lumino Player - Ultra-lightweight minimalist Windows 11 player.',
  ];

  const step = Math.max(4, Math.min(15, duration / (phrases.length + 1)));
  for (let i = 0; i < phrases.length; i++) {
    const start = Math.min(duration - 2, (i + 0.5) * step);
    const end = Math.min(duration, start + Math.max(3, step * 0.8));
    if (start < duration) {
      cues.push({
        id: i + 1,
        start: Math.round(start * 10) / 10,
        end: Math.round(end * 10) / 10,
        text: phrases[i],
      });
    }
  }
  return cues;
}
