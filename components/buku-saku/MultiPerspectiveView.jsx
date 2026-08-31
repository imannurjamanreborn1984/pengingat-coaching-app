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
    <div className="space-y-6 pb-12">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke 14 Akar</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => onToggleBookmark(root.id, e)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
              isBookmarked
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
            <span>{isBookmarked ? 'Tersimpan' : 'Simpan'}</span>
          </button>

          <button
            onClick={() => onOpenQuickAdd(root.id, activeTab === 'sains' ? 'sains' : activeTab === 'kitab' ? 'kitab' : activeTab === 'popculture' ? 'popculture' : 'sains')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tambah Bahan Akar Ini</span>
          </button>
        </div>
      </div>

      {/* Root Hero Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <div
          className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl ${root.colorTheme.gradient} rounded-full blur-3xl pointer-events-none opacity-60`}
        />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2.5 mb-3">
            <span className="w-8 h-8 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-extrabold text-sm flex items-center justify-center shadow-xs">
              #{root.number}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${root.colorTheme.badgeBg} ${root.colorTheme.badgeBorder}`}>
              Elemen {root.element}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Arketipe: <strong className="text-slate-700 dark:text-slate-200">{root.archetype}</strong>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {root.name}
          </h1>
          <p className="text-sm sm:text-base text-rose-600 dark:text-rose-400 font-semibold mt-1">
            {root.alias}
          </p>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-4 max-w-3xl leading-relaxed">
            {root.summary}
          </p>

          {/* Quick Keyword Pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            {root.coreKeywords.map((kw, i) => (
              <span
                key={i}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
              >
                #{kw}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Perspective Tabs Bar */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none border-b border-slate-200 dark:border-slate-800">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === t.id
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
            {t.count !== undefined && t.count > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === t.id
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
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
          <div className="bg-gradient-to-br from-amber-500/5 via-white to-amber-500/10 dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900 border border-amber-500/20 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400 mb-3">
                <Sun className="w-5 h-5" />
                <h3 className="text-base font-bold uppercase tracking-wider">
                  Sisi Terang (Gift & Potensi Murni)
                </h3>
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {root.lightAspect.title}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                {root.lightAspect.description}
              </p>

              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Karakteristik Utama:
                </p>
                {root.lightAspect.traits.map((trait, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{trait}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300">
              💡 Saat akar ini selaras, ia memancarkan vitalitas tanpa membebani ego.
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-500/5 via-white to-slate-500/10 dark:from-slate-800/30 dark:via-slate-900 dark:to-slate-900 border border-slate-300/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400 mb-3">
                <Moon className="w-5 h-5" />
                <h3 className="text-base font-bold uppercase tracking-wider">
                  Sisi Bayangan (Shadow & Jebakan Batin)
                </h3>
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {root.shadowAspect.title}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                {root.shadowAspect.description}
              </p>

              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Tanda Jebakan / Distorsi:
                </p>
                {root.shadowAspect.pitfalls.map((pitfall, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                    <span>{pitfall}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
              🔍 Sisi bayangan bukan untuk ditolak, melainkan untuk diamati dan diintegrasikan.
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SAINS */}
      {activeTab === 'sains' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Menjelaskan mekanisme biologis, neurobiologi, dan epigenetika di balik pengalaman akar ini.
            </p>
            <button
              onClick={() => onOpenQuickAdd(root.id, 'sains')}
              className="text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Input Jurnal/Riset Baru</span>
            </button>
          </div>

          {root.sainsEpigenetika?.length === 0 ? (
            <div className="bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center">
              <Dna className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Belum ada data riset sains</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Koleksi temuan jurnal epigenetika atau neurobiologi bisa langsung kamu input di sini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {root.sainsEpigenetika.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        {item.field}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                      {item.summary}
                    </p>

                    {item.mechanism && (
                      <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-[11px]">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Jalur Mekanisme: </span>
                        <span className="text-slate-600 dark:text-slate-400">{item.mechanism}</span>
                      </div>
                    )}
                  </div>

                  {item.sourceCitation && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                      <span className="truncate">Sumber: {item.sourceCitation}</span>
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
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Rujukan teks klasik spiritual, tasawuf, falsafah Nusantara, dan kitab kearifan universal.
            </p>
            <button
              onClick={() => onOpenQuickAdd(root.id, 'kitab')}
              className="text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Input Rujukan Kitab Baru</span>
            </button>
          </div>

          {root.kitabKearifan?.length === 0 ? (
            <div className="bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center">
              <BookMarked className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Belum ada kutipan kitab</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Tambahkan kutipan Ihya, Al-Hikam, Serat Centhini, dll.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {root.kitabKearifan.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs"
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                      {item.tradition}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      📖 {item.source}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3">
                    {item.title}
                  </h4>

                  {item.quote && (
                    <div className="relative my-3 p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border-l-4 border-amber-500 text-slate-800 dark:text-slate-200 italic text-xs sm:text-sm leading-relaxed font-serif">
                      "{item.quote}"
                    </div>
                  )}

                  <div className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs mb-1">
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
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Analisis analogis melalui media film, anime, novel, dan cerita rakyat nusantara.
            </p>
            <button
              onClick={() => onOpenQuickAdd(root.id, 'popculture')}
              className="text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Input Referensi Film/Cerita</span>
            </button>
          </div>

          {root.popCultureFolklore?.length === 0 ? (
            <div className="bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center">
              <Film className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Belum ada rujukan pop culture</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Masukkan analogi karakter film, anime, atau cerita rakyat.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {root.popCultureFolklore.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 capitalize">
                        {item.type}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        {item.referenceTitle}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {item.title}
                    </h4>
                    <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mt-1">
                      Karakter / Simbol: {item.characterOrSymbol}
                    </p>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
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
            <div className="bg-gradient-to-br from-rose-500/5 via-white to-orange-500/5 dark:from-rose-950/20 dark:via-slate-900 dark:to-slate-900 border border-rose-500/20 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                    Latihan Gerak Somatik
                  </span>
                  <Activity className="w-4 h-4 text-rose-500" />
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {root.panduanLatihan.dynamicMeditation.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  🎯 <strong>Tujuan:</strong> {root.panduanLatihan.dynamicMeditation.objective}
                </p>

                <div className="mt-4 space-y-2">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Langkah Gerak:</p>
                  {root.panduanLatihan.dynamicMeditation.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                      <span className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 text-xs">
                  <span className="font-bold text-rose-600 dark:text-rose-400">Fokus Sensasi Tubuh: </span>
                  <span className="text-slate-600 dark:text-slate-300">{root.panduanLatihan.dynamicMeditation.somaticFocus}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-rose-500/20">
                <button
                  onClick={() => onStartPractice(root, 'dynamic_meditation')}
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-98 text-white text-xs font-bold shadow-sm shadow-rose-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Timer className="w-4 h-4" />
                  <span>Mulai & Catat ke Jurnal</span>
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-500/5 via-white to-blue-500/5 dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-900 border border-indigo-500/20 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    Praktek Khalwat & Hening
                  </span>
                  <Timer className="w-4 h-4 text-indigo-500" />
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {root.panduanLatihan.khalwat.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  ⏱️ Rekomendasi Durasi: <strong>{root.panduanLatihan.khalwat.durationRecommended}</strong>
                </p>

                <div className="mt-4 p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-500/20">
                  <p className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5 mb-1">
                    <Quote className="w-3.5 h-3.5" />
                    Pertanyaan Pemantik Kontemplasi:
                  </p>
                  <p className="text-xs text-indigo-800 dark:text-indigo-200 italic font-serif">
                    "{root.panduanLatihan.khalwat.promptContemplation}"
                  </p>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <p className="font-bold text-slate-700 dark:text-slate-200">Panduan Kesendirian:</p>
                  <p className="leading-relaxed">{root.panduanLatihan.khalwat.solitudePractice}</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-indigo-500/20">
                <button
                  onClick={() => onStartPractice(root, 'khalwat')}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs font-bold shadow-sm shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Timer className="w-4 h-4" />
                  <span>Mulai Sesi Khalwat</span>
                </button>
              </div>
            </div>
          </div>

          {root.panduanLatihan.afirmasiHarian?.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                🌟 Afirmasi / Wirid Kesadaran Harian:
              </h4>
              <div className="space-y-1.5">
                {root.panduanLatihan.afirmasiHarian.map((af, idx) => (
                  <p key={idx} className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic">
                    • "{af}"
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
