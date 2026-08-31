"use client";

import React, { useState } from 'react';
import { Sparkles, Save, X } from 'lucide-react';

const COMMON_SOMATIC_SENSATIONS = [
  'Dada terasa hangat & lapang',
  'Pundak & leher rileks',
  'Tulang belakang tegak & kokoh',
  'Detak jantung melambat & stabil',
  'Sensasi kesemutan halus di tangan',
  'Pikiran hening (zero chatter)',
  'Energi mengalir deras di ulu hati',
  'Kaki menancap kuat ke bumi (grounded)',
  'Ruang kepala terasa sejuk & terang',
];

export const JournalForm = ({
  roots,
  selectedRoot,
  initialPracticeType = 'dynamic_meditation',
  initialDuration = 15,
  onSave,
  onCancel,
}) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [practiceType, setPracticeType] = useState(initialPracticeType);
  const [targetRootId, setTargetRootId] = useState(selectedRoot?.id || roots[0]?.id || '');
  const [durationMinutes, setDurationMinutes] = useState(initialDuration);
  const [energyLevelBefore, setEnergyLevelBefore] = useState(2);
  const [energyLevelAfter, setEnergyLevelAfter] = useState(4);
  const [selectedSensations, setSelectedSensations] = useState([
    'Dada terasa hangat & lapang',
    'Pikiran hening (zero chatter)',
  ]);
  const [customSensation, setCustomSensation] = useState('');
  const [notes, setNotes] = useState('');
  const [breakthroughInsights, setBreakthroughInsights] = useState('');

  const toggleSensation = (item) => {
    if (selectedSensations.includes(item)) {
      setSelectedSensations(selectedSensations.filter((s) => s !== item));
    } else {
      setSelectedSensations([...selectedSensations, item]);
    }
  };

  const handleAddCustomSensation = (e) => {
    e.preventDefault();
    if (customSensation.trim() && !selectedSensations.includes(customSensation.trim())) {
      setSelectedSensations([...selectedSensations, customSensation.trim()]);
      setCustomSensation('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const rootObj = roots.find((r) => r.id === targetRootId);
    onSave({
      date,
      practiceType,
      targetRootId,
      targetRootName: rootObj ? `${rootObj.name} (${rootObj.alias})` : 'Umum',
      durationMinutes,
      energyLevelBefore,
      energyLevelAfter,
      somaticSensations: selectedSensations,
      notes,
      breakthroughInsights,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Catat Sesi Latihan & Refleksi
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Dokumentasikan sensasi somatik dan hikmah batin dari latihanmu.
          </p>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Tanggal Sesi
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Jenis Latihan
          </label>
          <select
            value={practiceType}
            onChange={(e) => setPracticeType(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
          >
            <option value="dynamic_meditation">Dynamic Meditation (Gerak Somatik)</option>
            <option value="khalwat">Khalwat (Hening & Kontemplasi Mandiri)</option>
            <option value="refleksi_harian">Refleksi Harian / Muhasabah</option>
            <option value="observasi_akar">Observasi Dinamika Akar dalam Aktivitas</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Fokus Akar Spiritual yang Dilatih
          </label>
          <select
            value={targetRootId}
            onChange={(e) => setTargetRootId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
          >
            {roots.map((r) => (
              <option key={r.id} value={r.id}>
                #{r.number} - {r.name} ({r.element})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Durasi Latihan (Menit)
          </label>
          <input
            type="number"
            min="1"
            max="360"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
            required
          />
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            <span>Level Energi Sebelum:</span>
            <span className="font-bold text-rose-600 dark:text-rose-400">{energyLevelBefore} / 5</span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            value={energyLevelBefore}
            onChange={(e) => setEnergyLevelBefore(parseInt(e.target.value))}
            className="w-full accent-rose-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>1 (Lesu/Lelah)</span>
            <span>5 (Penuh Vitalitas)</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            <span>Level Energi Sesudah:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{energyLevelAfter} / 5</span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            value={energyLevelAfter}
            onChange={(e) => setEnergyLevelAfter(parseInt(e.target.value))}
            className="w-full accent-emerald-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>1 (Lesu)</span>
            <span>5 (Sangat Bugar & Hening)</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Sensasi Somatik yang Dirasakan Tubuh:
        </label>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_SOMATIC_SENSATIONS.map((sensation, idx) => {
            const isSelected = selectedSensations.includes(sensation);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => toggleSensation(sensation)}
                className={`text-[11px] px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 font-semibold'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {isSelected ? '✓ ' : '+ '} {sensation}
              </button>
            );
          })}
        </div>

        <div className="mt-2 flex gap-2">
          <input
            type="text"
            placeholder="Tambah sensasi fisik lainnya..."
            value={customSensation}
            onChange={(e) => setCustomSensation(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
          <button
            type="button"
            onClick={handleAddCustomSensation}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            Tambah
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          Catatan Proses / Dinamika Emosi
        </label>
        <textarea
          rows={3}
          placeholder="Ceritakan apa yang dialami selama latihan, hambatan pikiran, atau perubahan detak nafas..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none leading-relaxed"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-rose-600 dark:text-rose-400 mb-1.5 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Hikmah / Breakthrough Kesadaran (Opsional)</span>
        </label>
        <textarea
          rows={2}
          placeholder="Satu kalimat hikmah pencerahan atau pemahaman baru yang kamu dapatkan..."
          value={breakthroughInsights}
          onChange={(e) => setBreakthroughInsights(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-rose-500/30 bg-rose-50/20 dark:bg-rose-950/20 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none leading-relaxed italic"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Batal
          </button>
        )}
        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold shadow-sm shadow-rose-600/30 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Simpan ke Jurnal Saku</span>
        </button>
      </div>
    </form>
  );
};
