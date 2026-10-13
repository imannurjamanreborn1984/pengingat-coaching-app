"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Menu, 
  Film, 
  BookOpen, 
  Bell, 
  Crown, 
  Users, 
  LogOut, 
  X,
  ChevronRight,
  GraduationCap,
  FileText,
  Activity,
  PenTool,
  Settings,
  Home
} from 'lucide-react';

export const SUPER_ADMIN_EMAILS = [
  'imannurjamanreborn@gmail.com',
  'imannurjaman84@gmail.com',
  'imannnurjanan84@gmail.com',
  'imannurjaman@gmail.com',
  'lautanmahabbah@gmail.com',
  'admin@nptcentre.id',
  'admin@neuroprogrammingtraining.id',
  'admin@npt.com'
];

export function AppSidebar({ isOpen, onClose, currentUser, activePath = "" }) {
  if (!isOpen) return null;

  const isSuperAdmin = 
    currentUser?.role === 'super_admin' || 
    (currentUser?.email && SUPER_ADMIN_EMAILS.includes(currentUser.email.toLowerCase().trim()));

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Drawer */}
      <aside className="fixed top-0 left-0 bottom-0 z-50 w-80 max-w-[86vw] bg-slate-900 border-r border-slate-800 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
        {/* Header Drawer */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 via-red-500 to-rose-700 flex items-center justify-center text-white shadow-md shadow-rose-600/30">
              <span className="font-extrabold text-lg">🔴</span>
            </div>
            <div>
              <h2 className="font-extrabold text-white text-base leading-tight tracking-tight">
                NPT Centre
              </h2>
              <p className="text-[11px] text-rose-400 font-semibold">
                Navigasi 4 Klaster Terpadu
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {/* User Profile Card & Tombol Beranda Portal */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-400 font-bold flex items-center justify-center text-xs border border-rose-500/20 shrink-0">
                  {currentUser?.name?.charAt(0) || 'N'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-slate-100 truncate">
                    {currentUser?.name || currentUser?.email || 'Sahabat NPT'}
                  </p>
                  <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                    {isSuperAdmin ? '👑 Kang Iman (Super Admin)' : '⭐ Member NPT'}
                  </span>
                </div>
              </div>

              {currentUser && (
                <button
                  onClick={() => {
                    try {
                      localStorage.removeItem('npt_user_auth');
                      localStorage.removeItem('participant_name');
                      document.cookie = 'npt_device_auth=; path=/; max-age=0; SameSite=Lax';
                    } catch (e) {}
                    window.location.href = '/';
                  }}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 transition cursor-pointer"
                  title="Keluar / Logout Akun"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>

            <Link
              href="/"
              onClick={onClose}
              className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-rose-300 flex items-center justify-center gap-2 border border-slate-800 transition"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Beranda Portal (4 Klaster)</span>
            </Link>
          </div>

          {/* ========================================================================= */}
          {/* KLASTER 1: NPT (NEURO PROGRAMMING TRAINING LEVEL 1-6 & AKAR SPIRITUAL)    */}
          {/* ========================================================================= */}
          <div className="space-y-2.5 p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/25">
            <div className="flex items-center justify-between px-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">🏛️</span>
                <span className="text-[10px] font-black tracking-wider uppercase text-rose-300">
                  KLASTER 1: NPT (LEVEL 1–6+)
                </span>
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                SPIRITUAL
              </span>
            </div>

            {/* Link ke Halaman Indeks Kurikulum NPT */}
            <Link
              href="/npt"
              onClick={onClose}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activePath === '/npt'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-950/70 hover:bg-slate-800 text-slate-200 border border-slate-800'
              }`}
            >
              <span>📜 Peta Kurikulum NPT (Semua Level)</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-70" />
            </Link>

            {/* Grid Pilihan Cepat Level 1 s/d Level 6 */}
            <div className="grid grid-cols-6 gap-1">
              {[1, 2, 3, 4, 5, 6].map((lvl) => (
                <Link
                  key={lvl}
                  href={`/npt/${lvl}`}
                  onClick={onClose}
                  className={`py-1.5 rounded-lg text-center text-[11px] font-extrabold transition-all border ${
                    activePath === `/npt/${lvl}`
                      ? 'bg-rose-600 text-white border-rose-500 shadow-xs'
                      : lvl >= 5
                      ? 'bg-rose-950/50 text-rose-200 hover:bg-rose-900/60 border-rose-500/30'
                      : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800 border-slate-800'
                  }`}
                >
                  L{lvl}
                </Link>
              ))}
            </div>

            {/* Fokus Level 5 Menuju Level 6: Akar Spiritual, Diary, & Setoran */}
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-rose-500/20 space-y-1">
              <div className="text-[9px] font-bold uppercase tracking-wider text-amber-400/90 px-1 pb-0.5">
                🌿 Fokus Level 5 → Level 6 (Akar Spiritual)
              </div>

              <Link
                href="/buku-saku"
                onClick={onClose}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activePath === '/buku-saku' ? 'bg-rose-600 text-white' : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>14 Akar Spiritualitas</span>
                </div>
                <ChevronRight className="w-3 h-3 opacity-60" />
              </Link>

              <Link
                href="/buku-saku?tab=journal"
                onClick={onClose}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold text-emerald-300 hover:bg-slate-800 transition-all"
              >
                <div className="flex items-center gap-2">
                  <PenTool className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Buku Diary Temuan Harian</span>
                </div>
                <ChevronRight className="w-3 h-3 opacity-60" />
              </Link>

              <Link
                href="/dashboard"
                onClick={onClose}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activePath === '/dashboard' ? 'bg-rose-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-rose-400" />
                  <span>Tugas & Setoran NPT</span>
                </div>
                <ChevronRight className="w-3 h-3 opacity-60" />
              </Link>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* KLASTER 2: EMT (EMOTIONAL MASTERY TRAINING)                               */}
          {/* ========================================================================= */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/25">
            <div className="flex items-center justify-between px-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">🏫</span>
                <span className="text-[10px] font-black tracking-wider uppercase text-emerald-300">
                  KLASTER 2: EMT (GURU & EMOSI)
                </span>
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                EMT
              </span>
            </div>

            <div className="space-y-1">
              <Link
                href="/emt"
                onClick={onClose}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  activePath === '/emt'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-950/70 hover:bg-slate-800 text-emerald-200 border border-emerald-500/20'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                  <span>Ruang Kelas & Jurnal EMT</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-70" />
              </Link>

              <Link
                href="/emt?tab=selfhealing"
                onClick={onClose}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold bg-slate-950/70 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span>Self-Healing 21 Hari</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-70" />
              </Link>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* KLASTER 3: PORTAL VIDEO YOUTUBE HAKIKAT CINTA                             */}
          {/* ========================================================================= */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/25">
            <div className="flex items-center justify-between px-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">🎬</span>
                <span className="text-[10px] font-black tracking-wider uppercase text-purple-300">
                  KLASTER 3: HAKIKAT CINTA
                </span>
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                YOUTUBE
              </span>
            </div>

            <Link
              href="/hakekat-cinta"
              onClick={onClose}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activePath === '/hakekat-cinta'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-950/70 hover:bg-slate-800 text-purple-200 border border-purple-500/20'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Film className="w-4 h-4 text-purple-400 shrink-0" />
                <div>
                  <p className="leading-tight">Portal Video Hakikat Cinta</p>
                  <p className="text-[10px] font-normal text-slate-400">Al-Hikam, Malam Jumat & Coaching</p>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-70" />
            </Link>
          </div>

          {/* ========================================================================= */}
          {/* KLASTER 4: HALAMAN PRIVAT KANG IMAN (DI LUAR ADMIN)                       */}
          {/* ========================================================================= */}
          {isSuperAdmin && (
            <div className="space-y-2 p-3.5 rounded-2xl bg-amber-950/25 border-2 border-amber-500/35">
              <div className="flex items-center justify-between px-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">📿</span>
                  <span className="text-[10px] font-black tracking-wider uppercase text-amber-300">
                    KLASTER 4: PRIVAT KANG IMAN
                  </span>
                </div>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950">
                  PRIVAT
                </span>
              </div>

              <div className="space-y-1.5 pt-0.5">
                <Link
                  href="/wirid-khusus"
                  onClick={onClose}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold bg-slate-950/85 hover:bg-amber-950/50 text-amber-200 border border-amber-500/30 transition-all ${
                    activePath === '/wirid-khusus' ? 'ring-2 ring-amber-400' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm">📿</span>
                    <div>
                      <p className="leading-tight text-amber-300">Riyadhoh & Wirid Khusus</p>
                      <span className="text-[9px] text-slate-400 font-normal">Afirmasi Paten Level 5 & Barier</span>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                </Link>

                <Link
                  href="/admin/maktabah"
                  onClick={onClose}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold bg-slate-950/85 hover:bg-amber-950/50 text-amber-200 border border-amber-500/30 transition-all ${
                    activePath === '/admin/maktabah' ? 'ring-2 ring-amber-400' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm">📚</span>
                    <div>
                      <p className="leading-tight text-amber-300">Dapur Ngaji & Bedah Kitab</p>
                      <span className="text-[9px] text-slate-400 font-normal">Syakal, Terjemah Kitab & Hikam</span>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                </Link>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PANEL ADMIN OPERASIONAL (MURNI MANAJEMEN SISTEM, DI LUAR KLASTER PRIVAT)  */}
          {/* ========================================================================= */}
          {isSuperAdmin && (
            <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800">
              <div className="flex items-center justify-between px-0.5">
                <div className="flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[10px] font-black tracking-wider uppercase text-slate-300">
                    PANEL ADMIN OPERASIONAL
                  </span>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400">
                  TEKNIS
                </span>
              </div>

              <div className="space-y-1 pt-0.5">
                <Link
                  href="/admin/members"
                  onClick={onClose}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition"
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    <span>Persetujuan Member</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </Link>

                <Link
                  href="/admin/materials"
                  onClick={onClose}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-rose-400" />
                    <span>Kelola Materi NPT (1–6)</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </Link>

                <Link
                  href="/admin/submissions"
                  onClick={onClose}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-sky-400" />
                    <span>Rekap Diary & Tugas</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </Link>

                <Link
                  href="/admin/emt"
                  onClick={onClose}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition"
                >
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Kelola Kelas EMT</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export function AppNavbar({ onToggleSidebar, currentUser, activeTitle = "Portal NPT" }) {
  const isSuperAdmin = 
    currentUser?.role === 'super_admin' || 
    (currentUser?.email && SUPER_ADMIN_EMAILS.includes(currentUser.email.toLowerCase().trim()));

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
        {/* Left Side: Drawer Toggle & Active Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1.5 shadow-xs shrink-0"
            title="Buka Menu 4 Klaster"
          >
            <Menu className="w-5 h-5 text-rose-500" />
            <span className="text-xs font-bold hidden sm:inline">Klaster</span>
          </button>

          <Link
            href="/"
            className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition shrink-0"
            title="Kembali ke Beranda Portal 4 Klaster"
          >
            <Home className="w-4 h-4 text-amber-400" />
          </Link>

          <h1 className="text-xs sm:text-sm md:text-base font-bold text-slate-100 tracking-tight truncate">
            {activeTitle}
          </h1>
        </div>

        {/* Right Side: Clean Cluster Switcher & User Badge */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Link
            href="/npt"
            className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-500/30 text-[11px] font-bold transition hidden md:flex items-center gap-1"
            title="Klaster 1: Kurikulum NPT"
          >
            <span>🏛️ NPT</span>
          </Link>

          <Link
            href="/buku-saku"
            className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/30 text-[11px] font-bold transition flex items-center gap-1"
            title="14 Akar Spiritualitas"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xs:inline">14 Akar</span>
          </Link>

          <Link
            href="/buku-saku?tab=journal"
            className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30 text-[11px] font-bold transition flex items-center gap-1"
            title="Buku Diary Temuan Harian"
          >
            <PenTool className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Diary</span>
          </Link>

          {/* User Status Badge */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 pl-1">
              <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-bold text-slate-200 hidden lg:inline">
                {currentUser.name || currentUser.email?.split('@')[0] || 'User'}
              </span>
              {isSuperAdmin ? (
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-500" />
                  <span className="hidden sm:inline">Admin</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  VIP
                </span>
              )}
            </div>
          ) : (
            <Link
              href="/"
              className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xs transition"
            >
              Masuk
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
