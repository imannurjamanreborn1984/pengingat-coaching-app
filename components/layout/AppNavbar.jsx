"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Menu, 
  Film, 
  BookOpen, 
  Bell, 
  Crown, 
  ShieldCheck, 
  Users, 
  Compass, 
  Sparkles, 
  LogOut, 
  User, 
  X,
  ChevronRight,
  GraduationCap,
  FileText
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
        className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Drawer */}
      <aside className="fixed top-0 left-0 bottom-0 z-50 w-80 max-w-[85vw] bg-slate-900 border-r border-slate-800 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
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
                Portal Terpadu & Hakikat Cinta
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
        <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin">
          {/* User Profile Card */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
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
                    {isSuperAdmin ? '👑 Super Admin VIP' : '⭐ Member NPT'}
                  </span>
                </div>
              </div>

              {/* Tombol Logout Cepat */}
              <button
                onClick={() => {
                  try {
                    localStorage.removeItem('npt_user_auth');
                    localStorage.removeItem('participant_name');
                  } catch (e) {}
                  window.location.href = '/';
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 transition cursor-pointer"
                title="Keluar / Logout Akun"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Tombol Kembali ke Gerbang Utama Logo */}
            <Link
              href="/"
              onClick={onClose}
              className="w-full py-1.5 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-[11px] font-semibold text-rose-300 flex items-center justify-center gap-1.5 border border-slate-800/80 transition"
            >
              <span>🏛️ Kembali ke Gerbang Awal</span>
            </Link>
          </div>

          {/* NAVIGASI DUA RUMAH UTAMA (NPT & EMT) */}
          <div className="space-y-4">
            
            {/* ========================================================================= */}
            {/* RUMAH 1: NPT CENTRE (DI BAWAH ASUHAN SANG GURU)                           */}
            {/* ========================================================================= */}
            <div className="space-y-2 p-3 rounded-2xl bg-rose-950/20 border border-rose-500/20">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">🏛️</span>
                  <span className="text-[10px] font-black tracking-wider uppercase text-rose-300">
                    RUMAH NPT (ASUHAN SANG GURU)
                  </span>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  SPIRITUAL
                </span>
              </div>

              {/* Sub-menu Tree NPT 1 s/d NPT 6 */}
              <div className="space-y-1 pl-0.5">
                <div className="grid grid-cols-5 gap-1 pt-1 pb-1.5">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <Link
                      key={lvl}
                      href={`/npt/${lvl}`}
                      onClick={onClose}
                      className={`py-1.5 rounded-lg text-center text-xs font-bold transition-all border ${
                        activePath === `/npt/${lvl}`
                          ? 'bg-rose-600 text-white border-rose-500 shadow-xs'
                          : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800 border-slate-800'
                      }`}
                    >
                      Lvl {lvl}
                    </Link>
                  ))}
                </div>

                {/* NPT 6: ROAD TO LEVEL 6 (14 AKAR SPIRITUAL & TUGAS) */}
                <div className="p-2 rounded-xl bg-slate-950/80 border border-rose-500/20 space-y-1">
                  <Link
                    href="/npt/6"
                    onClick={onClose}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activePath === '/npt/6' ? 'bg-rose-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-sky-400" />
                      <span>Modul & Video NPT 6</span>
                    </div>
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  </Link>

                  <Link
                    href="/buku-saku"
                    onClick={onClose}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activePath === '/buku-saku' ? 'bg-rose-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                      <span>14 Akar Spiritualitas</span>
                    </div>
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  </Link>

                  <Link
                    href="/dashboard"
                    onClick={onClose}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activePath === '/dashboard' ? 'bg-rose-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Bell className="w-3.5 h-3.5 text-rose-400" />
                      <span>Tugas & Setoran NPT</span>
                    </div>
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  </Link>

                  <Link
                    href="/hakekat-cinta"
                    onClick={onClose}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activePath === '/hakekat-cinta' ? 'bg-rose-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Film className="w-3.5 h-3.5 text-purple-400" />
                      <span>Hakikat Cinta (Al-Hikam)</span>
                    </div>
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  </Link>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* RUMAH 2: EMT (DI BAWAH ASUHAN KANG IMAN)                                  */}
            {/* ========================================================================= */}
            <div className="space-y-2 p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/20">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">🏫</span>
                  <span className="text-[10px] font-black tracking-wider uppercase text-emerald-300">
                    RUMAH EMT (ASUHAN KANG IMAN)
                  </span>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  GURU & EMOSI
                </span>
              </div>

              <div className="space-y-1">
                <Link
                  href="/emt"
                  onClick={onClose}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activePath === '/emt'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'bg-slate-950/60 hover:bg-slate-800 text-emerald-300 border border-emerald-500/20'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <GraduationCap className="w-4 h-4 text-amber-400" />
                    <div>
                      <p className="leading-tight">Ruang Kelas & Jurnal EMT</p>
                      <span className="text-[9px] text-emerald-400/80 font-normal">Setor Refleksi & Evaluasi Batin</span>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </Link>

                <div className="p-2 rounded-xl bg-slate-950/80 border border-emerald-500/20 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 px-1">
                    <span className="flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-rose-400" />
                      <span>Self-Healing 21 Hari</span>
                    </span>
                    <span className="text-[9px] text-amber-400 font-bold">Protokol Batin</span>
                  </div>
                  <p className="text-[10px] text-slate-400 px-1 leading-relaxed">
                    Diasuh langsung oleh Kang Iman sebelum melangkah ke asuhan Sang Guru NPT.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Admin & Ruang Approval (Hanya Tampil untuk Super Admin) */}
          {isSuperAdmin && (
            <div className="space-y-1">
              <div className="text-[10px] font-bold tracking-wider uppercase text-amber-400/80 px-3 py-1 flex items-center justify-between">
                <span>Admin & Ruang Pribadi</span>
                <Crown className="w-3 h-3 text-amber-400" />
              </div>

              {/* RUANG PRIBADI KANG IMAN (WIRID & AFIRMASI PATEN LEVEL 5) */}
              <Link
                href="/wirid-khusus"
                onClick={onClose}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-600/30 via-amber-500/20 to-rose-600/20 text-amber-200 border border-amber-500/40 shadow-md shadow-amber-950/40 transition-all cursor-pointer ${
                  activePath === '/wirid-khusus' ? 'ring-2 ring-amber-400' : ''
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">📿</span>
                  <div>
                    <p className="leading-tight text-amber-300">Riyadhoh Khusus Kang Iman</p>
                    <span className="text-[9px] text-amber-400/80 font-normal">Afirmasi Paten Level 5 & Barier</span>
                  </div>
                </div>
                <span className="px-1.5 py-0.2 rounded-md bg-amber-500 text-slate-950 text-[9px] font-black">
                  PRIVAT
                </span>
              </Link>

              {/* MAKTABAH & DAPUR NGAJI BEDAH KITAB (TAFSIR SHAWI, KIFAYATUL AKHYAR, AL-HIKAM) */}
              <Link
                href="/admin/maktabah"
                onClick={onClose}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-950/50 via-amber-900/30 to-amber-950/50 text-amber-200 border border-amber-600/40 shadow-sm transition-all cursor-pointer ${
                  activePath === '/admin/maktabah' ? 'ring-2 ring-amber-400 bg-amber-950' : 'hover:bg-amber-900/40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">📚</span>
                  <div>
                    <p className="leading-tight text-amber-300">Dapur Ngaji & Bedah Kitab</p>
                    <span className="text-[9px] text-amber-400/80 font-normal">Syakal, Terjemah, Shawi & Al-Hikam</span>
                  </div>
                </div>
                <span className="px-1.5 py-0.2 rounded-md bg-amber-500 text-slate-950 text-[9px] font-black">
                  NGAJI
                </span>
              </Link>

              {/* RUANG KONTROL & EVALUASI EMT KHUSUS KANG IMAN */}
              <Link
                href="/admin/emt"
                onClick={onClose}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 transition-all cursor-pointer ${
                  activePath === '/admin/emt' ? 'ring-2 ring-emerald-400 bg-emerald-950/50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                  <div>
                    <p className="leading-tight">Ruang Kontrol & Evaluasi EMT</p>
                    <span className="text-[9px] text-emerald-400/80 font-normal">Laporan Orang Perorang & Login</span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>

              <Link
                href="/admin/members"
                onClick={onClose}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 transition-all cursor-pointer ${
                  activePath === '/admin/members' ? 'ring-2 ring-amber-500' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Ruang Persetujuan & Anggota</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>

              <Link
                href="/admin/submissions"
                onClick={onClose}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800 transition-all cursor-pointer ${
                  activePath === '/admin/submissions' ? 'bg-slate-800 text-white' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-sky-400" />
                  <span>Rekap Jawaban Peserta</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>

              <Link
                href="/admin/materials"
                onClick={onClose}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800 transition-all cursor-pointer ${
                  activePath === '/admin/materials' ? 'bg-slate-800 text-white ring-1 ring-rose-500' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-rose-400" />
                  <span>Upload Materi NPT (1 – 6)</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>

              <Link
                href="/admin/dashboard"
                onClick={onClose}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800 transition-all cursor-pointer ${
                  activePath === '/admin/dashboard' ? 'bg-slate-800 text-white' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span>Dashboard Admin</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
            </div>
          )}
        </div>

        {/* Footer Drawer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/80">
          <span className="text-[10px] text-slate-500 font-mono">
            NPT Centre v2.0
          </span>
          <span className="text-[10px] font-bold text-rose-500">
            🔴⚪ Merah Putih NPT
          </span>
        </div>
      </aside>
    </>
  );
}

export function AppNavbar({ onToggleSidebar, currentUser, activeTitle = "Hakikat Cinta & Rekaman Live" }) {
  const isSuperAdmin = 
    currentUser?.role === 'super_admin' || 
    (currentUser?.email && SUPER_ADMIN_EMAILS.includes(currentUser.email.toLowerCase().trim()));

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-950/85 border-b border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
        {/* Left: Hamburger & Brand */}
        <div className="flex items-center gap-2 sm:gap-3.5">
          <button
            onClick={onToggleSidebar}
            title="Buka Menu & Navigasi"
            className="p-2 sm:p-2.5 rounded-xl text-slate-200 hover:bg-slate-800 active:scale-95 transition-all border border-slate-800 cursor-pointer"
            aria-label="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link 
            href="/"
            className="flex items-center gap-2.5 select-none group cursor-pointer"
            title="Kembali ke Gerbang Awal"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-rose-600 via-red-500 to-rose-700 flex items-center justify-center text-white shadow-sm shadow-rose-600/30 group-hover:scale-105 transition-transform">
              <Film className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white text-sm sm:text-base tracking-tight leading-none group-hover:text-rose-400 transition-colors">
                  {activeTitle}
                </span>
                <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold bg-rose-500/10 text-rose-400 rounded-md border border-rose-500/20">
                  🔴⚪ NPT
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium leading-none mt-1 hidden xs:block">
                NPT Centre • Portal Terpadu
              </p>
            </div>
          </Link>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {isSuperAdmin && (
            <Link
              href="/admin/members"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-colors shadow-xs"
              title="Ruang Approval Anggota"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Ruang Approval</span>
            </Link>
          )}

          <Link
            href="/dashboard"
            className="p-2 text-slate-300 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors"
            title="Reminder Penugasan"
          >
            <Bell className="w-4 h-4 text-amber-400" />
          </Link>

          <button
            onClick={onToggleSidebar}
            title={`Akun: ${currentUser?.name || currentUser?.email || 'Member'}`}
            className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
          >
            <div className="w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
              {currentUser?.name?.charAt(0) || 'N'}
            </div>
            <span className="text-[11px] font-bold text-slate-200 hidden md:inline">
              {currentUser?.name || 'Member'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
