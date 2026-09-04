"use client";

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Dna, 
  BookMarked, 
  Film, 
  Activity, 
  Sparkles, 
  Sun, 
  Moon, 
  Quote, 
  PlusCircle, 
  Timer,
  CheckCircle2,
  Bookmark,
} from 'lucide-react';

export const MultiPerspectiveView = ({
  root,
  onBack,
  onOpenQuickAdd,
  onStartPractice,
  isBookmarked,
  onToggleBookmark,
  isKitabTheme = true,
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Esensi & Karakter', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'sains', label: 'Sains & Epigenetika', icon: <Dna className="w-4 h-4" />, count: root.sainsEpigenetika?.length || 0 },
    { id: 'kitab', label: 'Kitab & Tradisi Hikmah', icon: <BookMarked className="w-4 h-4" />, count: root.kitabKearifan?.length || 0 },
    { id: 'popculture', label: 'Film & Cerita Rakyat', icon: <Film className="w-4 h-4" />, count: root.popCultureFolklore?.length || 0 },
    { id: 'latihan', label: 'Panduan Latihan', icon: <Activity className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            isKitabTheme
              ? 'bg-[#ede1c7] text-[#4a2e12] hover:bg-[#dfcdab] border border-[#cbb38b]'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke 14 Akar</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => onToggleBookmark(root.id, e)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              isBookmarked
                ? 'bg-amber-100 text-amber-900 border-amber-400'
                : isKitabTheme
                ? 'bg-[#ede1c7] text-[#5e3d1c] border-[#cbb38b] hover:bg-[#dfcdab]'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
            <span>{isBookmarked ? 'Tersimpan di Kitab' : 'Simpan'}</span>
          </button>

          <button
            onClick={() => onOpenQuickAdd(root.id, activeTab === 'sains' ? 'sains' : activeTab === 'kitab' ? 'kitab' : activeTab === 'popculture' ? 'popculture' : 'sains')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#9e2a2b] hover:bg-[#852324] text-white shadow-md shadow-rose-950/20 transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tambah Bahan Akar Ini</span>
          </button>
        </div>
      </div>

      {/* Root Hero Header Card */}
      <div className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 shadow-sm ${
        isKitabTheme ? 'card-kitab-frame' : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800'
      }`}>
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2.5 mb-3">
            <span className="w-8 h-8 rounded-xl bg-[#3a2211] text-[#fbf6ec] font-extrabold text-sm flex items-center justify-center shadow-xs border border-[#8f632d]">
              #{root.number}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#eee2cb] text-[#4a2e12] border border-[#cbb38b]">
              Elemen {root.element}
            </span>
            <span className="text-xs text-[#734822] font-semibold">
              Arketipe Batin: <strong className="text-[#26150a]">{root.archetype}</strong>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#26150a] tracking-tight font-kitab-title">
            {root.name}
          </h1>
          <p className="text-sm sm:text-base text-[#9e2a2b] font-bold mt-1 font-serif italic">
            ~ {root.alias} ~
          </p>

          <p className="text-xs sm:text-sm text-[#3d2514] mt-4 max-w-3xl leading-relaxed font-sans font-medium">
            {root.summary}
          </p>

          {/* Quick Keyword Pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            {root.coreKeywords.map((kw, i) => (
              <span
                key={i}
                className="text-xs px-2.5 py-1 rounded-lg bg-[#eee3cb] text-[#543516] font-semibold border border-[#dfcfb0]"
              >
                #{kw}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Perspective Tabs Bar */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none border-b border-[#d4b886]">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === t.id
                ? 'bg-[#3a2211] text-[#fbf6ec] shadow-md border border-[#8f632d]'
                : 'bg-[#eee4cf] text-[#5a381b] hover:bg-[#dfcdab] border border-[#d8c3a1]'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
            {t.count !== undefined && t.count > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  activeTab === t.id
                    ? 'bg-[#9e2a2b] text-white'
                    : 'bg-[#d8c3a1] text-[#3a2211]'
                }`}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: ESENSI & KARAKTER */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
          <div className="card-kitab-frame rounded-3xl p-6 shadow-sm flex flex-col justify-between border-amber-600/30">
            <div>
              <div className="flex items-center gap-2.5 text-amber-800 mb-3">
                <Sun className="w-5 h-5" />
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider font-kitab-title">
                  Sisi Terang (Gift & Potensi Murni)
                </h3>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-[#26150a] font-serif">
                {root.lightAspect.title}
              </h4>
              <p className="text-xs sm:text-sm text-[#3d2514] mt-2 leading-relaxed font-sans">
                {root.lightAspect.description}
              </p>

              <div className="mt-4 space-y-2">
                <p className="text-xs font-bold text-[#694827]">
                  Karakteristik Utama:
                </p>
                {root.lightAspect.traits.map((trait, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-[#2b170a] font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>{trait}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#dfcfb0] text-[11px] text-[#734822] font-semibold italic">
              💡 Saat akar ini selaras, ia memancarkan vitalitas tanpa membebani ego.
            </div>
          </div>

          <div className="card-kitab-frame rounded-3xl p-6 shadow-sm flex flex-col justify-between border-stone-600/30">
            <div>
              <div className="flex items-center gap-2.5 text-[#5e3d1c] mb-3">
                <Moon className="w-5 h-5" />
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider font-kitab-title">
                  Sisi Bayangan (Shadow & Jebakan Batin)
                </h3>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-[#26150a] font-serif">
                {root.shadowAspect.title}
              </h4>
              <p className="text-xs sm:text-sm text-[#3d2514] mt-2 leading-relaxed font-sans">
                {root.shadowAspect.description}
              </p>

              <div className="mt-4 space-y-2">
                <p className="text-xs font-bold text-[#694827]">
                  Tanda Jebakan / Distorsi:
                </p>
                {root.shadowAspect.pitfalls.map((pitfall, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-[#2b170a] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-700 shrink-0 mt-1.5" />
                    <span>{pitfall}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#dfcfb0] text-[11px] text-[#734822] font-semibold italic">
              🔍 Sisi bayangan bukan untuk ditolak, melainkan untuk diamati dan diintegrasikan.
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SAINS */}
      {activeTab === 'sains' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#694827] font-semibold">
              Menjelaskan mekanisme biologis, neurobiologi, dan epigenetika di balik pengalaman akar ini.
            </p>
            <button
              onClick={() => onOpenQuickAdd(root.id, 'sains')}
              className="text-xs text-[#9e2a2b] font-bold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Input Jurnal/Riset Baru</span>
            </button>
          </div>

          {root.sainsEpigenetika?.length === 0 ? (
            <div className="card-kitab-frame rounded-2xl p-8 text-center border-dashed">
              <Dna className="w-8 h-8 text-[#82613d] mx-auto mb-2 opacity-60" />
              <p className="text-sm font-bold text-[#26150a]">Belum ada data riset sains</p>
              <p className="text-xs text-[#734822] mt-1">Koleksi temuan jurnal epigenetika atau neurobiologi bisa langsung kamu input di sini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {root.sainsEpigenetika.map((item) => (
                <div
                  key={item.id}
                  className="card-kitab-frame rounded-2xl p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
                        {item.field}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-[#26150a] font-serif">
                      {item.title}
                    </h4>
                    <p className="text-xs text-[#3d2514] mt-2 leading-relaxed">
                      {item.summary}
                    </p>

                    {item.mechanism && (
                      <div className="mt-3 p-3 rounded-xl bg-[#eee2cb] border border-[#d8c3a1] text-[11px]">
                        <span className="font-bold text-[#26150a]">Jalur Mekanisme: </span>
                        <span className="text-[#543516]">{item.mechanism}</span>
                      </div>
                    )}
                  </div>

                  {item.sourceCitation && (
                    <div className="mt-4 pt-3 border-t border-[#dfcfb0] text-[10px] text-[#734822] flex items-center justify-between">
                      <span className="truncate font-semibold">Sumber: {item.sourceCitation}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: KITAB */}
      {activeTab === 'kitab' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#694827] font-semibold">
              Rujukan teks klasik spiritual, tasawuf, falsafah Nusantara, dan kitab kearifan universal.
            </p>
            <button
              onClick={() => onOpenQuickAdd(root.id, 'kitab')}
              className="text-xs text-[#9e2a2b] font-bold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Input Rujukan Kitab Baru</span>
            </button>
          </div>

          {root.kitabKearifan?.length === 0 ? (
            <div className="card-kitab-frame rounded-2xl p-8 text-center border-dashed">
              <BookMarked className="w-8 h-8 text-[#82613d] mx-auto mb-2 opacity-60" />
              <p className="text-sm font-bold text-[#26150a]">Belum ada kutipan kitab</p>
              <p className="text-xs text-[#734822] mt-1">Tambahkan kutipan Ihya, Al-Hikam, Serat Centhini, dll.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {root.kitabKearifan.map((item) => (
                <div
                  key={item.id}
                  className="card-kitab-frame rounded-2xl p-6 shadow-xs"
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#eee2cb] text-[#4a2e12] border border-[#cbb38b]">
                      {item.tradition}
                    </span>
                    <span className="text-xs font-bold text-[#734822]">
                      📖 {item.source}
                    </span>
                  </div>

                  <h4 className="text-base sm:text-lg font-bold text-[#26150a] mb-3 font-serif">
                    {item.title}
                  </h4>

                  {item.quote && (
                    <div className="relative my-3 p-4 rounded-xl bg-[#faf2e3] border-l-4 border-[#b38b42] text-[#26150a] italic text-xs sm:text-sm leading-relaxed font-serif">
                      "{item.quote}"
                    </div>
                  )}

                  <div className="mt-3 text-xs sm:text-sm text-[#3d2514] leading-relaxed">
                    <p className="font-bold text-[#26150a] text-xs mb-1 font-serif">
                      Tafsir / Ulasan Filosofis:
                    </p>
                    {item.commentary}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: POP CULTURE */}
      {activeTab === 'popculture' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#694827] font-semibold">
              Analisis analogis melalui media film, anime, novel, dan cerita rakyat nusantara.
            </p>
            <button
              onClick={() => onOpenQuickAdd(root.id, 'popculture')}
              className="text-xs text-[#9e2a2b] font-bold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Input Referensi Film/Cerita</span>
            </button>
          </div>

          {root.popCultureFolklore?.length === 0 ? (
            <div className="card-kitab-frame rounded-2xl p-8 text-center border-dashed">
              <Film className="w-8 h-8 text-[#82613d] mx-auto mb-2 opacity-60" />
              <p className="text-sm font-bold text-[#26150a]">Belum ada rujukan pop culture</p>
              <p className="text-xs text-[#734822] mt-1">Masukkan analogi karakter film, anime, atau cerita rakyat.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {root.popCultureFolklore.map((item) => (
                <div
                  key={item.id}
                  className="card-kitab-frame rounded-2xl p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300 capitalize">
                        {item.type}
                      </span>
                      <span className="text-[11px] font-bold text-[#734822]">
                        {item.referenceTitle}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-[#26150a] font-serif">
                      {item.title}
                    </h4>
                    <p className="text-xs font-bold text-[#9e2a2b] mt-1">
                      Karakter / Simbol: {item.characterOrSymbol}
                    </p>

                    <p className="text-xs text-[#3d2514] mt-3 leading-relaxed">
                      {item.analysis}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: PANDUAN LATIHAN */}
      {activeTab === 'latihan' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card-kitab-frame rounded-3xl p-6 shadow-sm flex flex-col justify-between border-rose-600/30">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300">
                    Latihan Gerak Somatik
                  </span>
                  <Activity className="w-4 h-4 text-rose-700" />
                </div>

                <h3 className="text-base sm:text-lg font-bold text-[#26150a] font-serif">
                  {root.panduanLatihan.dynamicMeditation.title}
                </h3>
                <p className="text-xs text-[#734822] mt-1 font-semibold">
                  🎯 <strong>Tujuan:</strong> {root.panduanLatihan.dynamicMeditation.objective}
                </p>

                <div className="mt-4 space-y-2">
                  <p className="text-xs font-bold text-[#26150a]">Langkah Gerak:</p>
                  {root.panduanLatihan.dynamicMeditation.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-[#3d2514]">
                      <span className="w-5 h-5 rounded-full bg-[#3a2211] text-[#fbf6ec] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 rounded-xl bg-[#faf2e3] border border-[#d4b886] text-xs">
                  <span className="font-bold text-[#9e2a2b]">Fokus Sensasi Tubuh: </span>
                  <span className="text-[#3d2514]">{root.panduanLatihan.dynamicMeditation.somaticFocus}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#dfcfb0]">
                <button
                  onClick={() => onStartPractice(root, 'dynamic_meditation')}
                  className="w-full py-2.5 rounded-xl bg-[#9e2a2b] hover:bg-[#852324] active:scale-98 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Timer className="w-4 h-4" />
                  <span>Mulai & Catat ke Jurnal</span>
                </button>
              </div>
            </div>

            <div className="card-kitab-frame rounded-3xl p-6 shadow-sm flex flex-col justify-between border-blue-600/30">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
                    Olah Nafas & Pranayama
                  </span>
                  <Activity className="w-4 h-4 text-blue-700" />
                </div>

                <h3 className="text-base sm:text-lg font-bold text-[#26150a] font-serif">
                  {root.panduanLatihan.breathwork.title}
                </h3>
                <p className="text-xs text-[#734822] mt-1 font-semibold">
                  🎯 <strong>Tujuan:</strong> {root.panduanLatihan.breathwork.objective}
                </p>

                <div className="mt-4 p-3 rounded-xl bg-[#eee2cb] border border-[#d8c3a1] text-xs">
                  <p className="font-bold text-[#26150a]">Pola Ritme Nafas:</p>
                  <p className="text-sm font-black text-[#9e2a2b] mt-0.5 font-mono">{root.panduanLatihan.breathwork.pattern}</p>
                </div>

                <div className="mt-4 space-y-2">
                  <p className="text-xs font-bold text-[#26150a]">Instruksi Pelaksanaan:</p>
                  {root.panduanLatihan.breathwork.instructions.map((inst, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-[#3d2514]">
                      <span className="w-5 h-5 rounded-full bg-[#3a2211] text-[#fbf6ec] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{inst}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#dfcfb0]">
                <button
                  onClick={() => onStartPractice(root, 'breathwork')}
                  className="w-full py-2.5 rounded-xl bg-[#3a2211] hover:bg-[#26150a] active:scale-98 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Timer className="w-4 h-4" />
                  <span>Mulai & Catat ke Jurnal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
