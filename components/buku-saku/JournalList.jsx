"use client";

import React, { useState } from 'react';
import { Trash2, Sparkles, Calendar, Clock, Activity, Zap, ChevronDown, ChevronUp } from 'lucide-react';

export const JournalList = ({ journals, onDeleteJournal }) => {
  const [filterType, setFilterType] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const filtered = journals.filter((j) => {
    if (filterType === 'all') return true;
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
        return { label: 'Observasi Akar', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' };
    }
  };

  if (journals.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 text-center">
        <Activity className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Belum ada riwayat jurnal</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          Mulai sesi dynamic meditation atau khalwat pertamamu dan catat sensasi tubuh serta wawasan batinmu.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              filterType === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Semua ({journals.length})
          </button>
          <button
            onClick={() => setFilterType('dynamic_meditation')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              filterType === 'dynamic_meditation'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Dynamic Meditation
          </button>
          <button
            onClick={() => setFilterType('khalwat')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              filterType === 'khalwat'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Khalwat
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((item) => {
          const typeBadge = getPracticeLabel(item.practiceType);
          const isExpanded = expandedId === item.id;

          return (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${typeBadge.color}`}>
                      {typeBadge.label}
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {item.targetRootName}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {item.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {item.durationMinutes} menit
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <Zap className="w-3.5 h-3.5" />
                      Energi: {item.energyLevelBefore} → {item.energyLevelAfter}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    title={isExpanded ? 'Tutup Detail' : 'Lihat Detail Lengkap'}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Hapus catatan latihan ini?')) {
                        onDeleteJournal(item.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                    title="Hapus Catatan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {item.somaticSensations?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {item.somaticSensations.map((sens, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium"
                    >
                      {sens}
                    </span>
                  ))}
                </div>
              )}

              <p className={`text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                {item.notes}
              </p>

              {item.breakthroughInsights && (
                <div className="mt-3 p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border-l-3 border-amber-500 text-slate-800 dark:text-slate-200 text-xs italic font-serif flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>"{item.breakthroughInsights}"</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
