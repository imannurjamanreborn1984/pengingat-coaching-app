"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppNavbar, AppSidebar } from '../layout/AppNavbar';
import {
  Sparkles,
  ChevronRight,
  ArrowRight,
  Layers
} from 'lucide-react';

const NPT_LEVELS = [
  {
    level: 1,
    title: "NPT Level 1",
    subtitle: "Nafas & Relaksasi Dasar • Fondasi Kesadaran Pikiran & Jiwa",
    desc: "Membangun kesadaran awal, reprogram pola pikir bawah sadar, dan pembersihan hambatan mental.",
    status: "foundation",
    badge: "Fondasi Dasar",
    modules: [
      {
        name: "📚 Materi & Modul Pembelajaran Level 1",
        path: "/npt/1",
        desc: "Akses modul materi, panduan latihan nafas dasar, dan video penjelasan Level 1."
      }
    ]
  },
  {
    level: 2,
    title: "NPT Level 2",
    subtitle: "Olah Energi & Somatik • Penyembuhan Emosi & Self-Discovery",
    desc: "Melepaskan trauma masa lalu, rekonsiliasi batin, dan membangkitkan potensi energi internal.",
    status: "foundation",
    badge: "Somatik & Emosi",
    modules: [
      {
        name: "📚 Materi & Modul Pembelajaran Level 2",
        path: "/npt/2",
        desc: "Akses modul materi, latihan olah energi somatik, dan video penjelasan Level 2."
      }
    ]
  },
  {
    level: 3,
    title: "NPT Level 3",
    subtitle: "Power & Transcendental • Energy & Mental Mastery",
    desc: "Penguasaan fokus, sinkronisasi gelombang otak alfa-teta, dan pemrograman niat.",
    status: "foundation",
    badge: "Mental Mastery",
    modules: [
      {
        name: "📚 Materi & Modul Pembelajaran Level 3",
        path: "/npt/3",
        desc: "Akses modul materi, sinkronisasi fokus transendental, dan video penjelasan Level 3."
      }
    ]
  },
  {
    level: 4,
    title: "NPT Level 4",
    subtitle: "Self Mastery & Mindset • Spiritual Alignment",
    desc: "Menyelaraskan orientasi hidup dengan nilai ketuhanan dan ketenangan spiritual mendalam.",
    status: "foundation",
    badge: "Spiritual Alignment",
    modules: [
      {
        name: "📚 Materi & Modul Pembelajaran Level 4",
        path: "/npt/4",
        desc: "Akses modul materi, penyelarasan kesadaran spiritual, dan video penjelasan Level 4."
      }
    ]
  },
  {
    level: 5,
    title: "NPT Level 5 (Aktif)",
    subtitle: "Higher State Awareness, Cosmic Mindset & Pembahasan 14 Akar Spiritual",
    desc: "Kematangan pandangan kosmik, kepasrahan total, serta pembahasan fondasi 14 Akar Spiritualitas sebagai jembatan menuju Level 6.",
    status: "active",
    badge: "LIVE & AKTIF",
    modules: [
      {
        name: "📚 Materi & Modul Pembelajaran Level 5",
        path: "/npt/5",
        desc: "Akses 35+ modul materi, dokumen PDF/PPT/Word, dan video penjelasan resmi Level 5."
      },
      {
        name: "📖 Buku Saku 14 Akar Spiritualitas",
        path: "/buku-saku",
        desc: "Pemetaan 14 Akar Spiritual (Sains Epigenetika, Kitab Hikmah, Pop Culture & Panduan Latihan)."
      },
      {
        name: "📔 Buku Diary Temuan Harian",
        path: "/buku-saku?tab=journal",
        desc: "Catatan harian Dynamic Meditation, Khalwat, dan pengamatan akar spiritual."
      }
    ]
  },
  {
    level: 6,
    title: "NPT Level 6 (Menuju Level 6 • Aktif)",
    subtitle: "Mastery & Integrasi 14 Akar Spiritualitas, Praktik Lanjutan & Penugasan",
    desc: "Pendalaman komprehensif dan integrasi 14 Akar Spiritualitas, monitoring latihan harian, serta pembinaan coaching intensif.",
    status: "active",
    badge: "MENUJU LEVEL 6",
    modules: [
      {
        name: "📚 Materi & Modul Pembelajaran Level 6",
        path: "/npt/6",
        desc: "Akses modul materi lanjutan, dokumen PDF/PPT/Word, dan video penjelasan Level 6."
      },
      {
        name: "📖 Peta & Asesmen 14 Akar Spiritualitas",
        path: "/buku-saku",
        desc: "Pendalaman multi-perspektif 14 bab akar spiritual beserta latihan penerapannya."
      },
      {
        name: "📋 Tugas & Setoran Coaching NPT",
        path: "/dashboard",
        desc: "Laporan latihan, setor penugasan coaching harian, dan rekapan progres."
      }
    ]
  }
];

export default function NPTLevelsContainer() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isKitabTheme, setIsKitabTheme] = useState(true);

  useEffect(() => {
    try {
      const authStr = localStorage.getItem('npt_user_auth');
      if (authStr) {
        setCurrentUser(JSON.parse(authStr));
      }
    } catch (e) {}
  }, []);

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${
      isKitabTheme 
        ? 'bg-parchment text-[#231409]' 
        : 'bg-slate-950 text-slate-100 selection:bg-rose-600 selection:text-white'
    }`}>
      {/* Top Navbar & Sidebar */}
      <AppNavbar 
        onToggleSidebar={() => setIsSidebarOpen(true)}
        currentUser={currentUser}
        activeTitle="Klaster 1: Kurikulum NPT (Level 1 – 6+)"
      />
      <AppSidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentUser={currentUser}
        activePath="/npt"
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-6 pb-24 space-y-6">
        
        {/* Top Switcher Bar */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏛️</span>
            <span className={`text-xs font-bold ${isKitabTheme ? 'text-[#634224]' : 'text-slate-400'}`}>
              Klaster 1 • Kurikulum Berjenjang Neuro Programming Training
            </span>
          </div>

          <button
            onClick={() => setIsKitabTheme(!isKitabTheme)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
              isKitabTheme
                ? 'bg-[#fdfaf3] text-[#3a2211] border-[#cbb38b] hover:bg-[#ebdcc4] shadow-xs'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Ganti Mode Tampilan"
          >
            <span>{isKitabTheme ? "📜 Mode Kitab Klasik" : "🌌 Mode Gelap"}</span>
          </button>
        </div>

        {/* Header Hero */}
        <section className={`p-6 sm:p-8 rounded-3xl text-center space-y-3 relative overflow-hidden shadow-md ${
          isKitabTheme
            ? 'card-kitab-frame'
            : 'bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-950 border border-rose-500/30 shadow-2xl'
        }`}>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
            isKitabTheme
              ? 'bg-[#edd8b6] text-[#9e2a2b] border-[#cbb38b]'
              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
          }`}>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Peta Jenjang Kelas NPT</span>
          </div>

          <h1 className={`text-2xl sm:text-4xl font-black tracking-tight ${
            isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-white'
          }`}>
            Neuro Programming Training <span className={isKitabTheme ? 'text-[#9e2a2b]' : 'text-rose-500'}>(Level 1 – 6+)</span>
          </h1>

          <p className={`text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed ${
            isKitabTheme ? 'text-[#634224]' : 'text-slate-400'
          }`}>
            Kurikulum disusun bertahap mulai dari <strong>Level 1 hingga Level 6</strong> (dan terus berkembang ke level berikutnya). Pembahasan <strong>14 Akar Spiritualitas</strong> dimulai di <strong>Level 5</strong> dan dimatangkan secara utuh menuju <strong>Level 6</strong>.
          </p>
        </section>

        {/* Level List Roadmap */}
        <section className="space-y-4">
          {NPT_LEVELS.map((lvl) => {
            const isActive = lvl.status === 'active';

            return (
              <div
                key={lvl.level}
                className={`p-5 sm:p-6 rounded-3xl transition-all ${
                  isKitabTheme
                    ? isActive
                      ? 'card-kitab-frame border-2 border-[#b38b42] shadow-lg'
                      : 'bg-[#fbf7ee] border border-[#dfcfb0] hover:border-[#cbb38b]'
                    : isActive
                    ? 'bg-slate-900 border-2 border-rose-500/50 shadow-xl shadow-rose-950/40'
                    : 'bg-slate-900/60 border border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-base shrink-0 shadow-md ${
                        isKitabTheme
                          ? isActive
                            ? 'bg-gradient-to-tr from-[#9e2a2b] via-[#b38b42] to-[#8f632d] text-white shadow-amber-900/30'
                            : 'bg-[#ebdcc4] text-[#543516] border border-[#d8c3a1]'
                          : isActive
                          ? 'bg-gradient-to-tr from-rose-600 to-amber-600 text-white shadow-rose-600/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {lvl.level}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className={`font-bold text-base ${
                          isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-white'
                        }`}>
                          {lvl.title}
                        </h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                            isActive
                              ? isKitabTheme
                                ? 'bg-[#dbeef0] text-[#1b6b55] border-[#b0d9d3]'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : isKitabTheme
                              ? 'bg-[#eee3cb] text-[#634224] border-[#d8c3a1]'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {lvl.badge}
                        </span>
                      </div>
                      <p className={`text-xs font-semibold mt-0.5 ${
                        isKitabTheme ? 'text-[#8f632d]' : 'text-amber-400/90'
                      }`}>
                        {lvl.subtitle}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/npt/${lvl.level}`}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 self-end sm:self-auto shrink-0 cursor-pointer ${
                      isKitabTheme
                        ? isActive
                          ? 'bg-[#9e2a2b] text-white border-[#9e2a2b] hover:bg-[#7d2021]'
                          : 'bg-[#eee3cb] text-[#9e2a2b] border-[#cbb38b] hover:bg-[#ebdcc4]'
                        : isActive
                        ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500'
                        : 'bg-slate-800 hover:bg-slate-700 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    <span>Buka Kelas Level {lvl.level}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <p className={`text-xs mt-3 leading-relaxed ${
                  isKitabTheme ? 'text-[#543516]' : 'text-slate-400'
                }`}>
                  {lvl.desc}
                </p>

                {/* Sub-modul di setiap level */}
                {lvl.modules && lvl.modules.length > 1 && (
                  <div className={`mt-4 pt-4 border-t grid grid-cols-1 sm:grid-cols-3 gap-3 ${
                    isKitabTheme ? 'border-[#dfcfb0]' : 'border-slate-800'
                  }`}>
                    {lvl.modules.map((mod, idx) => (
                      <Link
                        key={idx}
                        href={mod.path}
                        className={`p-3.5 rounded-2xl border transition group flex items-center justify-between gap-2 ${
                          isKitabTheme
                            ? 'bg-[#fdfaf3] hover:bg-[#f5edd7] border-[#cbb38b] hover:border-[#b38b42]'
                            : 'bg-slate-950/80 hover:bg-slate-950 border border-rose-500/30 hover:border-rose-500/60'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <h4 className={`text-xs font-bold transition-colors ${
                            isKitabTheme
                              ? 'text-[#26150a] group-hover:text-[#9e2a2b]'
                              : 'text-slate-100 group-hover:text-rose-400'
                          }`}>
                            {mod.name}
                          </h4>
                          <p className={`text-[11px] leading-snug ${
                            isKitabTheme ? 'text-[#634224]' : 'text-slate-400'
                          }`}>
                            {mod.desc}
                          </p>
                        </div>
                        <ChevronRight className={`w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform ${
                          isKitabTheme ? 'text-[#9e2a2b]' : 'text-rose-500'
                        }`} />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Kartu Persiapan Level Selanjutnya (Level 7+) */}
          <div className={`p-5 rounded-3xl border border-dashed text-center space-y-1.5 ${
            isKitabTheme
              ? 'bg-[#fbf7ee]/60 border-[#cbb38b] text-[#634224]'
              : 'bg-slate-900/40 border-slate-800 text-slate-400'
          }`}>
            <div className="flex items-center justify-center gap-2 font-bold text-xs sm:text-sm">
              <Layers className="w-4 h-4 text-amber-500" />
              <span>Jenjang Lanjutan (NPT Level 7 & Seterusnya)</span>
            </div>
            <p className="text-xs max-w-xl mx-auto">
              Struktur kurikulum NPT dirancang dinamis dan siap menampung pembukaan kelas Level 7 dan jenjang lanjutan berikutnya sesuai arahan Guru NPT.
            </p>
          </div>
        </section>

      </main>
    </div>
  );
}
