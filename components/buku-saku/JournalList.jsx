"use client";

import React, { useState } from 'react';
import { Trash2, Sparkles, Calendar, Clock, Activity, Zap, ChevronDown, ChevronUp, Lock, Send, Image as ImageIcon, Film, Cloud, ExternalLink } from 'lucide-react';

function formatYouTubeEmbedUrl(url) {
  if (!url || typeof url !== "string") return "";
  const cleanUrl = url.trim();
  if (!cleanUrl) return "";

  const shortsMatch = cleanUrl.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
  if (shortsMatch && shortsMatch[1]) return `https://www.youtube.com/embed/${shortsMatch[1]}`;

  const youtuMatch = cleanUrl.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (youtuMatch && youtuMatch[1]) return `https://www.youtube.com/embed/${youtuMatch[1]}`;

  const watchMatch = cleanUrl.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watchMatch && watchMatch[1]) return `https://www.youtube.com/embed/${watchMatch[1]}`;

  if (cleanUrl.includes("/embed/")) return cleanUrl;
  return cleanUrl;
}

export const JournalList = ({ journals, onDeleteJournal, isKitabTheme = true }) => {
  const [filterType, setFilterType] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const filtered = journals.filter((j) => {
    if (filterType === 'all') return true;
    if (filterType === 'shared') return !!j.isSharedWithAdmin;
    if (filterType === 'private') return !j.isSharedWithAdmin;
    return j.practiceType === filterType;
  });

  const getPracticeLabel = (type) => {
    switch (type) {
      case 'dynamic_meditation':
        return { label: 'Dynamic Meditation', color: 'bg-rose-500/10 text-rose-600 border-rose-500/20' };
      case 'khalwat':
        return { label: 'Khalwat & Hening', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' };
      case 'refleksi_harian':
        return { label: 'Refleksi Harian', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' };
      default:
        return { label: 'Temuan & Pengamatan', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' };
    }
  };

  if (journals.length === 0) {
    return (
      <div className={`rounded-3xl p-8 text-center border ${
        isKitabTheme ? 'card-kitab-frame' : 'bg-white dark:bg-slate-900 border-slate-800'
      }`}>
        <Activity className="w-10 h-10 text-amber-600 mx-auto mb-3 opacity-70" />
        <h4 className={`text-base font-bold ${isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-slate-200'}`}>
          Belum Ada Catatan Diary Harian
        </h4>
        <p className={`text-xs mt-1 max-w-sm mx-auto ${isKitabTheme ? 'text-[#634224]' : 'text-slate-400'}`}>
          Mulai tuliskan temuan harian, latihan somatik, atau refleksi batinmu dan simpan sebagai catatan pribadi atau bagikan ke Admin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-left">
      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
              filterType === 'all'
                ? isKitabTheme ? 'bg-[#3a2211] text-[#fbf6ec] border-[#8f632d]' : 'bg-slate-800 text-white border-slate-700'
                : isKitabTheme ? 'bg-[#eee3cb] text-[#543516] border-[#d8c3a1]' : 'text-slate-400 border-transparent'
            }`}
          >
            Semua ({journals.length})
          </button>

          <button
            onClick={() => setFilterType('private')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border flex items-center gap-1 ${
              filterType === 'private'
                ? isKitabTheme ? 'bg-[#ebdcc4] text-[#8f632d] border-[#d8c3a1]' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : isKitabTheme ? 'bg-[#eee3cb] text-[#543516] border-[#d8c3a1]' : 'text-slate-400 border-transparent'
            }`}
          >
            <Lock className="w-3 h-3 text-amber-600" />
            <span>Pribadi ({journals.filter(j => !j.isSharedWithAdmin).length})</span>
          </button>

          <button
            onClick={() => setFilterType('shared')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border flex items-center gap-1 ${
              filterType === 'shared'
                ? isKitabTheme ? 'bg-[#edd8b6] text-[#9e2a2b] border-[#cbb38b]' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                : isKitabTheme ? 'bg-[#eee3cb] text-[#543516] border-[#d8c3a1]' : 'text-slate-400 border-transparent'
            }`}
          >
            <Send className="w-3 h-3 text-rose-600" />
            <span>Dibagikan ke Admin ({journals.filter(j => j.isSharedWithAdmin).length})</span>
          </button>
        </div>
      </div>

      {/* List Item Diary */}
      <div className="space-y-3">
        {filtered.map((item) => {
          const typeBadge = getPracticeLabel(item.practiceType);
          const isExpanded = expandedId === item.id;

          return (
            <div
              key={item.id}
              className={`rounded-2xl p-5 shadow-xs transition-all border ${
                isKitabTheme
                  ? 'card-kitab-frame hover:border-[#8f632d]'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${typeBadge.color}`}>
                      {typeBadge.label}
                    </span>

                    {/* PRIVACY BADGE */}
                    {item.isSharedWithAdmin ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1">
                        <Send className="w-3 h-3" /> Shared ke Admin
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-amber-600" /> Catatan Pribadi
                      </span>
                    )}

                    <span className={`text-xs font-bold ${isKitabTheme ? 'text-[#8f632d]' : 'text-slate-300'}`}>
                      {item.targetRootName}
                    </span>
                  </div>

                  <h3 className={`text-base font-black leading-snug tracking-tight pt-1 ${
                    isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-white'
                  }`}>
                    {item.title || "Catatan Temuan Harian"}
                  </h3>

                  <div className={`flex flex-wrap items-center gap-3 text-[11px] font-medium ${
                    isKitabTheme ? 'text-[#734822]' : 'text-slate-400'
                  }`}>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {item.date}
                    </span>
                    {item.durationMinutes > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {item.durationMinutes} menit
                      </span>
                    )}
                    {item.energyLevelBefore && item.energyLevelAfter && (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                        <Zap className="w-3.5 h-3.5" />
                        Energi: {item.energyLevelBefore} → {item.energyLevelAfter}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className={`p-1.5 rounded-lg border transition cursor-pointer ${
                      isKitabTheme ? 'bg-[#eee3cb] text-[#543516] border-[#d8c3a1]' : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                    title={isExpanded ? 'Tutup Detail' : 'Buka Detail Lengkap'}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('Yakin ingin menghapus catatan diary ini?')) {
                        onDeleteJournal(item.id);
                      }
                    }}
                    className={`p-1.5 rounded-lg border transition cursor-pointer ${
                      isKitabTheme
                        ? 'bg-[#edd8b6] text-[#9e2a2b] border-[#cbb38b] hover:bg-[#dfcdab]'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                    }`}
                    title="Hapus Catatan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sensasi Somatik */}
              {item.somaticSensations?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {item.somaticSensations.map((sens, idx) => (
                    <span
                      key={idx}
                      className={`text-[10px] px-2 py-0.5 rounded-md font-medium border ${
                        isKitabTheme ? 'bg-[#eee3cb] text-[#4a2e12] border-[#d8c3a1]' : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {sens}
                    </span>
                  ))}
                </div>
              )}

              {/* Isi Catatan Harian */}
              {item.notes && (
                <div className="mt-3">
                  <p className={`text-xs leading-relaxed ${isKitabTheme ? 'text-[#26150a]' : 'text-slate-300'} ${isExpanded ? '' : 'line-clamp-3'}`}>
                    {item.notes}
                  </p>
                </div>
              )}

              {/* KONTEN DETAIL EXPANDED */}
              {isExpanded && (
                <div className="mt-4 pt-3 border-t border-[#dfcfb0] dark:border-slate-800 space-y-3 animate-in fade-in">
                  {/* Temuan Harian */}
                  {item.findings && (
                    <div className={`p-3.5 rounded-xl border ${
                      isKitabTheme ? 'bg-[#faf2e3] border-[#d4b886]' : 'bg-amber-950/20 border-amber-500/30'
                    }`}>
                      <div className={`text-xs font-bold flex items-center gap-1.5 mb-1 ${
                        isKitabTheme ? 'text-[#9e2a2b]' : 'text-amber-400'
                      }`}>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>💡 Temuan Harian (Insights):</span>
                      </div>
                      <p className={`text-xs italic font-serif leading-relaxed ${
                        isKitabTheme ? 'text-[#26150a]' : 'text-slate-200'
                      }`}>
                        "{item.findings}"
                      </p>
                    </div>
                  )}

                  {/* Evaluasi Diri */}
                  {item.evaluation && (
                    <div className={`p-3.5 rounded-xl border ${
                      isKitabTheme ? 'bg-[#fdfaf3] border-[#cbb38b]' : 'bg-sky-950/20 border-sky-500/30'
                    }`}>
                      <div className={`text-xs font-bold mb-1 ${
                        isKitabTheme ? 'text-[#3a2211]' : 'text-sky-400'
                      }`}>
                        🎯 Evaluasi Diri:
                      </div>
                      <p className={`text-xs leading-relaxed ${
                        isKitabTheme ? 'text-[#26150a]' : 'text-slate-200'
                      }`}>
                        {item.evaluation}
                      </p>
                    </div>
                  )}

                  {/* Lampiran Gambar */}
                  {item.imageUrl && (
                    <div className="space-y-1">
                      <span className={`text-[11px] font-bold flex items-center gap-1 ${
                        isKitabTheme ? 'text-[#543516]' : 'text-slate-400'
                      }`}>
                        <ImageIcon className="w-3.5 h-3.5 text-emerald-600" /> Foto Lampiran:
                      </span>
                      <a href={item.imageUrl} target="_blank" rel="noreferrer" className="block">
                        <img
                          src={item.imageUrl}
                          alt="Lampiran Diary"
                          className="w-full max-h-64 object-cover rounded-xl border border-slate-300 dark:border-slate-800"
                        />
                      </a>
                    </div>
                  )}

                  {/* Lampiran Video YouTube */}
                  {item.youtubeUrl && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-bold flex items-center gap-1 ${
                          isKitabTheme ? 'text-[#543516]' : 'text-slate-400'
                        }`}>
                          <Film className="w-3.5 h-3.5 text-red-500" /> Video YouTube Terkait:
                        </span>
                        <a
                          href={item.youtubeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-bold text-sky-600 hover:underline flex items-center gap-0.5"
                        >
                          <span>Buka YouTube</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-slate-800">
                        <iframe
                          src={formatYouTubeEmbedUrl(item.youtubeUrl)}
                          title="YouTube Media"
                          className="w-full h-full border-0"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}

                  {/* Lampiran Google Drive */}
                  {item.gdriveUrl && (
                    <div className="pt-1">
                      <a
                        href={item.gdriveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          isKitabTheme
                            ? 'bg-[#dbeef0] text-[#1b6b55] border-[#b0d9d3] hover:bg-[#cbeae4]'
                            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                        }`}
                      >
                        <Cloud className="w-4 h-4 text-blue-500" />
                        <span>Buka File Dokumen Google Drive</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
