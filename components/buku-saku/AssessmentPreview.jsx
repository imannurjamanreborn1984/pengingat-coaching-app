"use client";

import React, { useState } from 'react';
import { Sparkles, CheckCircle2, Compass, Target, ArrowRight } from 'lucide-react';

export const AssessmentPreview = ({
  roots,
  onNavigateToRoot,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);

  const sampleQuestions = [
    {
      id: 1,
      question: 'Ketika menghadapi tekanan hidup yang berat, respon otomatis tubuh dan batinmu adalah...',
      options: [
        { text: 'Merasa letih lesu, kehilangan daya dorong fisik dan motivasi.', rootSlug: 'akar-hayah-vitalitas', rootNum: 1 },
        { text: 'Cenderung ragu-ragu dan menyerahkan keputusan pada situasi luar.', rootSlug: 'akar-qudrah-kedaulatan', rootNum: 2 },
        { text: 'Pikiran terpecah ke ratusan arah tanpa bisa fokus pada prioritas.', rootSlug: 'akar-iradah-arah-fokus', rootNum: 3 },
        { text: 'Mencoba menahan amarah hingga dada terasa sesak dan tenggorokan tersumbat.', rootSlug: 'akar-kalam-sabda-otentik', rootNum: 7 },
      ],
    },
    {
      id: 2,
      question: 'Kondisi ruang batin yang paling kamu rindukan saat ini adalah...',
      options: [
        { text: 'Vitalitas membuncah dan kesegaran raga yang berenergi.', rootSlug: 'akar-hayah-vitalitas', rootNum: 1 },
        { text: 'Kejernihan berpikir dan pemahaman hakiki tanpa prasangka.', rootSlug: 'akar-ilm-kejernihan-gnosis', rootNum: 4 },
        { text: 'Kedamaian titik hening (sakinah) di tengah badai kehidupan.', rootSlug: 'akar-salam-kedamaian-hening', rootNum: 9 },
        { text: 'Hati yang lapang untuk memaafkan luka masa lalu dan mencintai tanpa syarat.', rootSlug: 'akar-rahmah-welas-asih', rootNum: 8 },
      ],
    },
  ];

  const handleSelectOption = (qIdx, optIdx) => {
    const updated = { ...answers, [qIdx]: optIdx };
    setAnswers(updated);

    if (qIdx + 1 < sampleQuestions.length) {
      setCurrentStep(qIdx + 1);
    } else {
      setShowResult(true);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentStep(0);
    setShowResult(false);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      <div className="rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 border border-indigo-800/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Roadmap Fitur Tahap 3</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Self-Assessment: Radar Pemetaan 14 Akar Spiritual
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
            Fitur kuisioner komprehensif ini dirancang untuk mendeteksi akar mana yang sedang berada di <em>Sisi Terang (Gift)</em>, dan akar mana yang sedang tersumbat dalam <em>Sisi Bayangan (Shadow)</em>.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Compass className="w-4 h-4 text-indigo-500" />
          <span>Status Pengembangan Bertahap (Incremental Development):</span>
        </h3>

        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-emerald-800 dark:text-emerald-300">Tahap 1 (Selesai): Wadah & Rumah Dinamis</strong>
              <p className="text-emerald-700 dark:text-emerald-400 mt-0.5">
                Katalog 14 Akar + Form Catatan Jurnal Dynamic Meditation & Khalwat + Sistem Input Modular.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-800 dark:text-amber-300">Tahap 2 (Sedang Berjalan): Pengkayaan Multi-Perspektif</strong>
              <p className="text-amber-700 dark:text-amber-400 mt-0.5">
                Teman-teman NPT menginput temuan riset sains epigenetika, tafsir kitab, dan analogi pop culture.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs">
            <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-indigo-800 dark:text-indigo-300">Tahap 3 (Setelah Indikator Matang): Peluncuran Asesmen Penuh</strong>
              <p className="text-indigo-700 dark:text-indigo-400 mt-0.5">
                Kuisioner 42 butir diagnostik otomatis + grafik radar 14 akar personal.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Uji Coba Mini Diagnostic (Simulasi Teaser)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pertanyaan sampel untuk mengidentifikasi akar yang perlu mendapat perhatian latihan hari ini.
            </p>
          </div>

          <button
            onClick={handleReset}
            className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
          >
            Ulangi
          </button>
        </div>

        {!showResult ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span>Pertanyaan {currentStep + 1} dari {sampleQuestions.length}</span>
              <span>Langkah {currentStep + 1}</span>
            </div>

            <h4 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
              {sampleQuestions[currentStep].question}
            </h4>

            <div className="space-y-2.5">
              {sampleQuestions[currentStep].options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(currentStep, idx)}
                  className="w-full text-left p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/60 dark:hover:border-indigo-500/60 bg-slate-50/50 dark:bg-slate-950/40 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium transition-all hover:translate-x-1 cursor-pointer"
                >
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-2">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-500/30 text-center space-y-4 animate-in fade-in duration-300">
            <div className="w-12 h-12 rounded-full bg-indigo-500 text-white flex items-center justify-center mx-auto shadow-md shadow-indigo-500/30">
              <Sparkles className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Akar Prioritas yang Perlu Dikuatkan:
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-md mx-auto">
                Berdasarkan pilihanmu, kamu disarankan melakukan sesi Dynamic Breathwork atau Khalwat untuk menyeimbangkan akar ini:
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 max-w-sm mx-auto shadow-xs text-left">
              <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">
                Rekomendasi Latihan Hari Ini:
              </span>
              <h5 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {roots[0]?.name}
              </h5>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {roots[0]?.summary}
              </p>

              <button
                onClick={() => onNavigateToRoot(roots[0])}
                className="mt-3 w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Buka Panduan Latihan Akar Ini</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
