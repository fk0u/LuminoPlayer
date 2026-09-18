import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Settings,
  Cpu,
  Subtitles,
  Keyboard,
  Monitor,
  Zap,
} from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';

type SettingsTab = 'general' | 'playback' | 'subtitle' | 'shortcuts';

export const SettingsModal: React.FC = () => {
  const isOpen = usePlayerStore((state) => state.isSettingsModalOpen);
  const setIsOpen = usePlayerStore((state) => state.setSettingsModalOpen);
  const isAlwaysOnTop = usePlayerStore((state) => state.isAlwaysOnTop);
  const toggleAlwaysOnTop = usePlayerStore((state) => state.toggleAlwaysOnTop);
  const subPosition = usePlayerStore((state) => state.subPosition);
  const setSubPos = usePlayerStore((state) => state.setSubPos);
  const showOsd = usePlayerStore((state) => state.showOsd);

  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [hwdec, setHwdec] = useState('d3d11va');

  const shortcutsList = [
    { key: 'Spasi', desc: 'Putar / Jeda video' },
    { key: 'Panah Kiri / Kanan', desc: 'Mundur / Maju 10 detik (Shift: 1 detik)' },
    { key: 'Panah Atas / Bawah', desc: 'Volume +/- 5% (Bisa hingga 150% Boost)' },
    { key: 'Scroll Roda Mouse', desc: 'Volume halus dengan OSD visual' },
    { key: '[ / ]', desc: 'Perlambat / Percepat pemutaran (0.1x)' },
    { key: 'Backspace', desc: 'Reset kecepatan ke normal (1.0x)' },
    { key: ', / .', desc: '1 Frame Mundur / 1 Frame Maju' },
    { key: 'Z / X', desc: 'Sinkronisasi delay subtitle (-0.1s / +0.1s)' },
    { key: 'S', desc: 'Ambil tangkapan layar (Screenshot)' },
    { key: 'F', desc: 'Masuk / Keluar Layar Penuh (Fullscreen)' },
    { key: 'M', desc: 'Bisu / Hidupkan Suara (Mute / Unmute)' },
    { key: 'Ctrl + T', desc: 'Sematkan di Atas (Always on Top)' },
    { key: 'Ctrl + O', desc: 'Buka dialog pemilih berkas video' },
    { key: 'Tab / Ctrl + J / I', desc: 'Buka / Tutup HUD Statistik Teknis OSD' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md select-none">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-2xl overflow-hidden rounded-2xl bg-slate-900/95 border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.9)] backdrop-blur-2xl text-slate-100 flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 p-5 bg-gradient-to-r from-blue-900/20 via-slate-900/40 to-cyan-900/20 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/20 text-cyan-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                  <Settings className="h-5 w-5 animate-spin-slow" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Pengaturan Lumino Player</h3>
                  <p className="text-xs text-slate-400">Konfigurasi visual, decoding hardware & kontrol</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content Body: Sidebar Tabs + Main View */}
            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar Tabs */}
              <div className="w-48 border-r border-white/10 bg-white/[0.01] p-3 space-y-1 shrink-0">
                {[
                  { id: 'general' as const, label: 'Umum & Tampilan', icon: Monitor },
                  { id: 'playback' as const, label: 'Akselerasi & Audio', icon: Cpu },
                  { id: 'subtitle' as const, label: 'Sistem Subtitle', icon: Subtitles },
                  { id: 'shortcuts' as const, label: 'Pintasan Tombol', icon: Keyboard },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex w-full items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40 shadow-sm'
                          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Content Panel */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {activeTab === 'general' && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                      Tampilan Windows 11 Fluent
                    </h4>

                    {/* Always on Top Setting */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                      <div>
                        <div className="text-xs font-semibold text-white">Sematkan di Atas (Always on Top)</div>
                        <div className="text-[11px] text-slate-400">Menjaga Lumino Player selalu terlihat di atas jendela lain</div>
                      </div>
                      <button
                        onClick={toggleAlwaysOnTop}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          isAlwaysOnTop
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-white/10 text-slate-300 border-white/10 hover:bg-white/20'
                        }`}
                      >
                        {isAlwaysOnTop ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </div>

                    {/* Window Backdrop Effect */}
                    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                      <div className="text-xs font-semibold text-white">Efek Transparansi Backdrop</div>
                      <div className="text-[11px] text-slate-400">
                        Memanfaatkan Windows 11 DWM Desktop Window Manager API secara native.
                      </div>
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        {['Acrylic (Kaca Buram)', 'Mica (Material Fluent)', 'Tabbed (Mica Alt)'].map((eff, i) => (
                          <div
                            key={eff}
                            className={`p-2 rounded-lg text-center text-xs border ${
                              i === 0
                                ? 'bg-blue-600/20 text-blue-300 border-blue-500/40 font-medium'
                                : 'bg-white/5 text-slate-400 border-white/5'
                            }`}
                          >
                            {eff}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'playback' && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                      Mesin Rendering & Akselerasi Hardware
                    </h4>

                    {/* HWDEC Setting */}
                    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                      <div className="text-xs font-semibold text-white">Metode Akselerasi GPU (Zero-Copy)</div>
                      <div className="text-[11px] text-slate-400">
                        Memungkinkan pemutaran video 4K/60fps HDR tanpa membebani CPU.
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {[
                          { id: 'd3d11va', label: 'D3D11VA (Rekomendasi Windows 11)' },
                          { id: 'nvdec', label: 'NVDEC (NVIDIA CUDA Native)' },
                          { id: 'qsv', label: 'QuickSync (Intel QSV)' },
                          { id: 'auto-copy', label: 'Auto Safe Fallback' },
                        ].map((m) => (
                          <button
                            key={m.id}
                            onClick={() => {
                              setHwdec(m.id);
                              showOsd(`Akselerasi diubah ke: ${m.label}`);
                            }}
                            className={`p-2.5 rounded-lg text-left text-xs border transition-all ${
                              hwdec === m.id
                                ? 'bg-blue-600/30 text-blue-300 border-blue-500/50 font-semibold'
                                : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Audio Boost Info */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                      <div>
                        <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                          <Zap className="h-3.5 w-3.5 text-amber-400" />
                          Audio Boost hingga 150%
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Memperkuat audio dialog yang terlalu pelan dengan kompresi dinamis MPC-HC
                        </div>
                      </div>
                      <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-300 border border-amber-500/30">
                        Aktif
                      </span>
                    </div>
                  </div>
                )}

                {activeTab === 'subtitle' && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                      Konfigurasi Subtitle & Transkrip
                    </h4>

                    {/* Default Sub Position */}
                    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-semibold text-white">Posisi Vertikal Default</div>
                        <span className="text-xs font-mono font-bold text-amber-400">{subPosition}%</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Geser posisi subtitle naik atau turun pada layar (0 = puncak layar, 100 = dasar layar).
                      </div>
                      <div className="grid grid-cols-4 gap-2 pt-1">
                        {[
                          { label: 'Atas (20%)', val: 20 },
                          { label: 'Tengah (50%)', val: 50 },
                          { label: 'Bawah (90%)', val: 90 },
                          { label: 'Dasar (100%)', val: 100 },
                        ].map((pos) => (
                          <button
                            key={pos.val}
                            onClick={() => setSubPos(pos.val)}
                            className={`py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                              subPosition === pos.val
                                ? 'bg-blue-600/30 text-blue-300 border-blue-500/50 font-bold'
                                : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
                            }`}
                          >
                            {pos.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Auto Directory Subtitle Detection */}
                    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5">
                      <div className="text-xs font-semibold text-white">Pencarian Folder Subtitle Otomatis</div>
                      <div className="text-[11px] text-slate-400">
                        Direktori yang dipindai saat memutar video:
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {['sub/', 'subs/', 'subtitles/', 'Subtitles/', 'Subs/'].map((dir) => (
                          <span
                            key={dir}
                            className="px-2 py-0.5 rounded bg-white/10 text-[11px] font-mono text-cyan-300 border border-white/10"
                          >
                            {dir}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'shortcuts' && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                      Daftar Pintasan Keyboard Standar MPC-HC
                    </h4>

                    <div className="space-y-1.5">
                      {shortcutsList.map((sc) => (
                        <div
                          key={sc.key}
                          className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] transition-colors border border-white/5 text-xs"
                        >
                          <span className="text-slate-300">{sc.desc}</span>
                          <kbd className="px-2 py-0.5 rounded bg-white/10 border border-white/15 font-mono text-[11px] text-cyan-300 font-semibold shadow-sm">
                            {sc.key}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 p-4 bg-white/[0.02] flex items-center justify-between text-xs text-slate-400 shrink-0">
              <span className="text-[11px]">Lumino Player v1.0.0 • Modern Minimalist Desktop Player</span>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
              >
                Selesai
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
