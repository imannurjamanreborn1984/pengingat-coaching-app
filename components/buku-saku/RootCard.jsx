"use client";

import React from 'react';
import { Bookmark, BookMarked, Dna, Film, ChevronRight, Sparkles } from 'lucide-react';

export const RootCard = ({
  root,
  isBookmarked,
  onToggleBookmark,
  onSelectRoot,
  isKitabTheme = true,
}) => {
  const sainsCount = root.sainsEpigenetika?.length || 0;
  const kitabCount = root.kitabKearifan?.length || 0;
  const popCount = root.popCultureFolklore?.length || 0;

  if (isKitabTheme) {
    return (
      <div
        onClick={() => onSelectRoot(root)}
        className="group relative rounded-2xl p-5 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between card-kitab-frame card-kitab-hover"
      >
        {/* Subtle illuminated corner accent */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-400/20 via-amber-600/5 to-transparent rounded-bl-full pointer-events-none" />

        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#3a2211] text-[#fbf6ec] font-bold text-xs flex items-center justify-center shadow-xs border border-[#8f632d]">
                {root.number}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#eee2cb] text-[#4a2e12] border border-[#cbb38b]">
                {root.element}
              </span>
            </div>

            <button
              onClick={(e) => onToggleBookmark(root.id, e)}
              className={`p-1.5 rounded-lg transition-colors z-10 ${
                isBookmarked
                  ? 'text-amber-700 bg-amber-200/60 border border-amber-400'
                  : 'text-[#82613d] hover:text-[#3a2211] hover:bg-[#ebdcc4]'
              }`}
              title={isBookmarked ? 'Hapus dari Tersimpan' : 'Simpan ke Buku Saku'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>

          <h3 className="text-base sm:text-lg font-black text-[#26150a] group-hover:text-[#9e2a2b] transition-colors tracking-tight font-kitab-title">
            {root.name}
          </h3>
          <p className="text-xs text-[#734822] font-semibold line-clamp-1 mt-0.5 font-serif italic">
            ~ {root.alias} ~
          </p>

          <p className="text-xs text-[#3d2514] mt-2.5 line-clamp-2 leading-relaxed font-sans font-medium">
            {root.summary}
          </p>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {root.coreKeywords.slice(0, 3).map((kw, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded-md bg-[#eee3cb] text-[#543516] font-semibold border border-[#dfcfb0]"
              >
                #{kw}
              </span>
            ))}
            {root.coreKeywords.length > 3 && (
              <span className="text-[10px] text-[#78542d] self-center font-bold">
                +{root.coreKeywords.length - 3}
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#dfcfb0] flex items-center justify-between text-[11px] text-[#694827]">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1 font-medium" title={`${sainsCount} Data Riset Sains`}>
              <Dna className="w-3.5 h-3.5 text-blue-700" />
              <span>{sainsCount}</span>
            </span>
            <span className="flex items-center gap-1 font-medium" title={`${kitabCount} Rujukan Kitab & Tradisi`}>
              <BookMarked className="w-3.5 h-3.5 text-amber-800" />
              <span>{kitabCount}</span>
            </span>
            <span className="flex items-center gap-1 font-medium" title={`${popCount} Referensi Pop Culture / Film`}>
              <Film className="w-3.5 h-3.5 text-purple-800" />
              <span>{popCount}</span>
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-[#9e2a2b] group-hover:translate-x-0.5 transition-transform font-serif">
            <span>Buka Kitab</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    );
  }

  // Fallback Modern Dark Mode Card
  return (
    <div
      onClick={() => onSelectRoot(root)}
      className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between hover:border-rose-500/40 dark:hover:border-rose-500/40"
    >
      <div
        className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${root.colorTheme.gradient} rounded-bl-full pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity`}
      />

      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs flex items-center justify-center shadow-xs">
              {root.number}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${root.colorTheme.badgeBg} ${root.colorTheme.badgeBorder}`}
            >
              {root.element}
            </span>
          </div>

          <button
            onClick={(e) => onToggleBookmark(root.id, e)}
            className={`p-1.5 rounded-lg transition-colors z-10 ${
              isBookmarked
                ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={isBookmarked ? 'Hapus dari Tersimpan' : 'Simpan ke Buku Saku'}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors tracking-tight">
          {root.name}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-1 mt-0.5">
          {root.alias}
        </p>

        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 line-clamp-2 leading-relaxed">
          {root.summary}
        </p>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {root.coreKeywords.slice(0, 3).map((kw, i) => (
            <span
              key={i}
              className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium"
            >
              #{kw}
            </span>
          ))}
          {root.coreKeywords.length > 3 && (
            <span className="text-[10px] text-slate-400 self-center">
              +{root.coreKeywords.length - 3}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1" title={`${sainsCount} Data Riset Sains`}>
            <Dna className="w-3.5 h-3.5 text-blue-500" />
            <span>{sainsCount}</span>
          </span>
          <span className="flex items-center gap-1" title={`${kitabCount} Rujukan Kitab & Tradisi`}>
            <BookMarked className="w-3.5 h-3.5 text-amber-500" />
            <span>{kitabCount}</span>
          </span>
          <span className="flex items-center gap-1" title={`${popCount} Referensi Pop Culture / Film`}>
            <Film className="w-3.5 h-3.5 text-purple-500" />
            <span>{popCount}</span>
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 group-hover:translate-x-0.5 transition-transform">
          <span>Buka</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
