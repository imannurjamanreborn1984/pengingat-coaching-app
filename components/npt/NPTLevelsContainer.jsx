"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppNavbar, AppSidebar } from '../layout/AppNavbar';
import {
  Sparkles,
  BookOpen,
  Bell,
  CheckCircle2,
  Lock,
  ChevronRight,
  ShieldCheck,
  Award,
  Compass,
  Brain,
  Flame,
  Layers,
  ArrowRight
} from 'lucide-react';

const NPT_LEVELS = [
  {
    level: 1,
    title: "NPT Level 1",
    subtitle: "Fondasi Kesadaran Pikiran & Jiwa",
    desc: "Membangun kesadaran awal, reprogram pola pikir bawah sadar, dan pembersihan hambatan mental.",
    status: "upcoming",
    badge: "Segera Hadir"
  },
  {
    level: 2,
    title: "NPT Level 2",
    subtitle: "Penyembuhan Emosi & Self-Discovery",
    desc: "Melepaskan trauma masa lalu, rekonsiliasi batin, dan membangkitkan potensi energi internal.",
    status: "upcoming",
    badge: "Segera Hadir"
  },
  {
    level: 3,
    title: "NPT Level 3",
    subtitle: "Energy & Mental Mastery",
    desc: "Penguasaan fokus, sinkronisasi gelombang otak alfa-teta, dan pemrograman niat.",
    status: "upcoming",
    badge: "Segera Hadir"
  },
  {
    level: 4,
    title: "NPT Level 4",
    subtitle: "Spiritual Alignment & Higher Consciousness",
    desc: "Menyelaraskan orientasi hidup dengan nilai ketuhanan dan ketenangan spiritual mendalam.",
    status: "upcoming",
    badge: "Segera Hadir"
  },
  {
    level: 5,
    title: "NPT Level 5",
    subtitle: "Cosmic Awareness & Sufistic Mindset",
    desc: "Kematangan pandangan kosmik, kepasrahan total, dan kesadaran hakikat keberadaan.",
    status: "upcoming",
    badge: "Segera Hadir"
  },
  {
    level: 6,
    title: "NPT Level 6 (Aktif)",
    subtitle: "Mastery 14 Akar Spiritualitas & Penugasan",
    desc: "Pendalaman komprehensif 14 Akar Spiritualitas, monitoring latihan harian, dan pembinaan coaching intensif.",
    status: "active",
    badge: "LIVE & AKTIF",
    modules: [
      {
        name: "📖 Buku Saku 14 Akar Spiritualitas",
        path: "/buku-saku",
        desc: "Kompilasi panduan praktis 14 bab akar spiritual beserta latihan penerapannya."
      },
      {
        name: "📋 Reminder & Penugasan Peserta",
        path: "/dashboard",
        desc: "Laporan latihan, setor penugasan coaching harian, dan rekapan nilai."
      }
    ]
  }
];

export default function NPTLevelsContainer() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    try {
      const authStr = localStorage.getItem('npt_user_auth');
      if (authStr) {
        setCurrentUser(JSON.parse(authStr));
      }
    } catch (e) {}
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-600 selection:text-white">
      {/* Top Navbar & Sidebar */}
      <AppNavbar 
        onToggleSidebar={() => setIsSidebarOpen(true)}
        currentUser={currentUser}
        activeTitle="NPT Multi-Level (Level 1 – 6)"
      />
      <AppSidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentUser={currentUser}
        activePath="/npt"
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-6 pb-24 space-y-8">
        
        {/* Header Hero */}
        <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-950 border border-rose-500/30 text-center space-y-3 relative overflow-hidden shadow-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Roadmap Pendidikan NPT</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Neuro Programming Training <span className="text-rose-500">(NPT)</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            Kurikulum berjenjang dari <strong>Level 1 hingga Level 6</strong> serta level lanjutan mendatang untuk transformasi kesadaran diri, pembersihan emosi, dan kedalaman spiritual.
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
                  isActive
                    ? 'bg-slate-900 border-2 border-rose-500/50 shadow-xl shadow-rose-950/40'
                    : 'bg-slate-900/60 border border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-base shrink-0 shadow-md ${
                        isActive
                          ? 'bg-gradient-to-tr from-rose-600 to-amber-600 text-white shadow-rose-600/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {lvl.level}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-white">{lvl.title}</h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            isActive
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {lvl.badge}
                        </span>
                      </div>
                      <p className="text-xs text-amber-400/90 font-medium">{lvl.subtitle}</p>
                    </div>
                  </div>

                  {!isActive && (
                    <span className="text-[11px] text-slate-500 italic self-end sm:self-auto">
                      Materi & isi akan segera diupload
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                  {lvl.desc}
                </p>

                {/* Sub-modul Level 6 Aktif */}
                {isActive && lvl.modules && (
                  <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {lvl.modules.map((mod, idx) => (
                      <Link
                        key={idx}
                        href={mod.path}
                        className="p-3.5 rounded-2xl bg-slate-950/80 hover:bg-slate-950 border border-rose-500/30 hover:border-rose-500/60 transition group flex items-center justify-between gap-2"
                      >
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-slate-100 group-hover:text-rose-400 transition-colors">
                            {mod.name}
                          </h4>
                          <p className="text-[11px] text-slate-400">{mod.desc}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-rose-500 shrink-0 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </section>

      </main>
    </div>
  );
}
