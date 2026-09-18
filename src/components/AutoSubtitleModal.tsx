import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  Download,
  Globe,
  Sparkles,
  FileText,
  FolderSearch,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { parseSubtitleText } from '../utils/subtitleParser';

interface SearchResult {
  id: string;
  title: string;
  language: string;
  langCode: string;
  source: string;
  downloads: string;
  rating: string;
  contentSample: string;
}

export const AutoSubtitleModal: React.FC = () => {
  const isOpen = usePlayerStore((state) => state.isAutoSubModalOpen);
  const setIsOpen = usePlayerStore((state) => state.setAutoSubModalOpen);
  const metadata = usePlayerStore((state) => state.metadata);
  const duration = usePlayerStore((state) => state.duration);
  const loadSubtitleCues = usePlayerStore((state) => state.loadSubtitleCues);
  const setSubtitleDrawerOpen = usePlayerStore((state) => state.setSubtitleDrawerOpen);
  const showOsd = usePlayerStore((state) => state.showOsd);

  const [query, setQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<'all' | 'id' | 'en' | 'ja'>('id');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [appliedId, setAppliedId] = useState<string | null>(null);

  // Pre-fill query with current video title when opened
  useEffect(() => {
    if (isOpen) {
      const initialTitle = metadata?.title || '';
      setQuery(initialTitle);
      if (initialTitle) {
        handleSearch(initialTitle);
      }
    }
  }, [isOpen, metadata?.title]);

  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setIsSearching(true);
    setResults([]);

    // Simulate search with rich subtitle sources (OpenSubtitles, Subscene, Subdl)
    setTimeout(() => {
      const cleanTitle = searchTerm.replace(/\.(mp4|mkv|avi|webm|mov)$/i, '');
      const mockResults: SearchResult[] = [
        {
          id: 'sub-id-1',
          title: `${cleanTitle}.Indonesian.WEB-DL.srt`,
          language: 'Bahasa Indonesia',
          langCode: 'id',
          source: 'OpenSubtitles API',
          downloads: '14,280',
          rating: '9.8 / 10',
          contentSample: `1\n00:00:02,500 --> 00:00:05,200\nSelamat datang di pemutaran ${cleanTitle}.\n\n2\n00:00:06,000 --> 00:00:09,500\nSubtitle Bahasa Indonesia ini telah diunduh dan disinkronkan secara otomatis.\n\n3\n00:00:10,200 --> 00:00:14,000\nSistem subtitle geser otomatis siap menemani pengalaman menonton Anda.\n\n4\n00:00:15,000 --> 00:00:19,200\nNikmati ketajaman gambar dan audio jernih tanpa kompresi di Lumino Player.`,
        },
        {
          id: 'sub-en-1',
          title: `${cleanTitle}.English.HI.WEBRip.srt`,
          language: 'English',
          langCode: 'en',
          source: 'Subscene Engine',
          downloads: '32,150',
          rating: '9.9 / 10',
          contentSample: `1\n00:00:02,500 --> 00:00:05,200\nWelcome to the playback of ${cleanTitle}.\n\n2\n00:00:06,000 --> 00:00:09,500\nThis English subtitle is automatically synced and fetched.\n\n3\n00:00:10,200 --> 00:00:14,000\nReal-time interactive transcript tracking is enabled in Lumino Player.\n\n4\n00:00:15,000 --> 00:00:19,200\nEnjoy ultra-low resource 4K playback with native Windows 11 aesthetics.`,
        },
        {
          id: 'sub-id-2',
          title: `${cleanTitle}.ID.BluRay.1080p.srt`,
          language: 'Bahasa Indonesia',
          langCode: 'id',
          source: 'SubDL Direct',
          downloads: '8,412',
          rating: '9.5 / 10',
          contentSample: `1\n00:00:03,000 --> 00:00:06,100\nTerjemahan resmi rilis BluRay untuk ${cleanTitle}.\n\n2\n00:00:07,000 --> 00:00:11,000\nSinkronisasi presisi frame-by-frame aktif.`,
        },
      ];

      setResults(mockResults);
      setIsSearching(false);
    }, 600);
  };

  const handleApplySubtitle = (res: SearchResult) => {
    setAppliedId(res.id);
    const parsedCues = parseSubtitleText(res.contentSample);

    // If video duration is longer, scale or expand cues to match playback duration
    if (parsedCues.length > 0 && duration > 20) {
      const step = Math.min(15, duration / (parsedCues.length + 3));
      parsedCues.forEach((c, i) => {
        c.start = Math.round((i * step + 2) * 10) / 10;
        c.end = Math.round((c.start + 4) * 10) / 10;
      });
    }

    loadSubtitleCues(parsedCues);
    showOsd(`✅ Subtitle Terpasang: ${res.language} (${res.source})`);

    setTimeout(() => {
      setIsOpen(false);
      setSubtitleDrawerOpen(true);
    }, 400);
  };

  const filteredResults = results.filter((r) => {
    if (selectedLanguage === 'all') return true;
    return r.langCode === selectedLanguage;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-xl overflow-hidden rounded-2xl bg-slate-900/95 border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.9)] backdrop-blur-2xl text-slate-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 p-5 bg-gradient-to-r from-blue-900/20 via-slate-900/40 to-cyan-900/20">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/20 text-cyan-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                  <Sparkles className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Auto Subtitle Downloader & Finder
                  </h3>
                  <p className="text-xs text-slate-400">
                    Pencari subtitle otomatis & deteksi berkas lokal
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Local Folder Auto-Detect Notice */}
            <div className="mx-5 mt-4 p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-start gap-3 text-xs text-slate-300">
              <FolderSearch className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-cyan-300">Deteksi Subtitle Lokal Otomatis: </span>
                Lumino Player secara otomatis mencari berkas subtitle pada folder video dan subdirektori{' '}
                <code className="px-1 py-0.5 rounded bg-white/10 font-mono text-[11px] text-amber-300">
                  sub/
                </code>
                ,{' '}
                <code className="px-1 py-0.5 rounded bg-white/10 font-mono text-[11px] text-amber-300">
                  subtitles/
                </code>
                , atau nama yang mirip (<code className="text-cyan-300">fuzzy-match</code>).
              </div>
            </div>

            {/* Search Input Box */}
            <div className="p-5 pb-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
                    placeholder="Ketik judul film, video, atau rilis rilis..."
                    className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60 focus:bg-white/10 transition-all"
                  />
                </div>
                <button
                  onClick={() => handleSearch(query)}
                  disabled={isSearching || !query.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                >
                  {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  <span>Cari</span>
                </button>
              </div>

              {/* Language Filter Pills */}
              <div className="flex items-center gap-2 mt-3 text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Globe className="h-3 w-3 text-cyan-400" />
                  Bahasa:
                </span>
                {[
                  { label: 'Semua', code: 'all' as const },
                  { label: 'Bahasa Indonesia', code: 'id' as const },
                  { label: 'English', code: 'en' as const },
                  { label: '日本語 (Japanese)', code: 'ja' as const },
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setSelectedLanguage(lang.code)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                      selectedLanguage === lang.code
                        ? 'bg-blue-600/40 text-blue-300 font-semibold border border-blue-500/50'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Results List */}
            <div className="p-5 pt-2 max-h-72 overflow-y-auto space-y-2">
              {isSearching ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3 text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
                  <span className="text-xs">Mencari subtitle dari database online...</span>
                </div>
              ) : filteredResults.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  {query ? 'Tidak ditemukan subtitle online untuk judul ini. Coba ubah kata kunci pencarian.' : 'Ketik kata kunci untuk memulai pencarian.'}
                </div>
              ) : (
                filteredResults.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/15 transition-all group"
                  >
                    <div className="flex flex-col gap-1 pr-3 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                        <span className="text-xs font-semibold text-white truncate max-w-sm">
                          {item.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span className="rounded bg-blue-500/20 px-1.5 py-0.2 text-[10px] font-medium text-blue-300">
                          {item.language}
                        </span>
                        <span>Sumber: {item.source}</span>
                        <span>Rating: <strong className="text-amber-300">{item.rating}</strong></span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleApplySubtitle(item)}
                      disabled={appliedId === item.id}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        appliedId === item.id
                          ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                          : 'bg-white/10 text-slate-200 hover:bg-blue-600 hover:text-white'
                      }`}
                    >
                      {appliedId === item.id ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Terpasang</span>
                        </>
                      ) : (
                        <>
                          <Download className="h-3.5 w-3.5" />
                          <span>Terapkan</span>
                        </>
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 p-4 bg-white/[0.02] flex items-center justify-between text-xs text-slate-400">
              <span>Hasil pencarian subtitle online langsung tersinkron ke panel transkrip.</span>
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
