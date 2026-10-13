"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { 
  Sparkles, 
  Compass, 
  Shield, 
  Layers, 
  Lock, 
  X, 
  ArrowRight,
  ShieldCheck,
  User,
  Mail,
  UserCheck,
  LogOut,
  Activity,
  Phone,
  GraduationCap,
  UserPlus,
  BookOpen,
  Film,
  PenTool,
  Bell,
  Crown,
  FileText,
  Users,
  ChevronRight,
  Play,
  Settings
} from 'lucide-react';
import {
  SUPER_ADMIN_EMAILS,
  getSavedDeviceUser,
  savePermanentDeviceUser,
  clearPermanentDeviceUser,
  syncDeviceUserApproval
} from '@/lib/authHelper';

export default function CosmicGatewayPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);

  // Modal Auth State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState('member_login'); // 'member_login' | 'not_registered_dialog'
  
  // Login Form State
  const [inputName, setInputName] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginMessage, setLoginMessage] = useState('');

  // State Registrasi Program & Level
  const [selectedProgram, setSelectedProgram] = useState('npt'); // 'npt' | 'emt'
  const [selectedLevel, setSelectedLevel] = useState(5); // Default 5/6
  const [inputPhone, setInputPhone] = useState('');

  // Pintu Rahasia Super Admin Modal (jika belum login sbg Kang Iman)
  const [isSecretModalOpen, setIsSecretModalOpen] = useState(false);

  useEffect(() => {
    const saved = getSavedDeviceUser();
    if (saved) {
      setCurrentUser(saved);
      syncDeviceUserApproval(supabase, saved).then((synced) => {
        if (synced) setCurrentUser(synced);
      });
    }
  }, []);

  const isSuperAdmin =
    currentUser?.role === 'super_admin' ||
    (currentUser?.email && SUPER_ADMIN_EMAILS.includes(currentUser.email.toLowerCase().trim()));

  const handleLogout = () => {
    clearPermanentDeviceUser();
    setCurrentUser(null);
  };

  // Aksi Login Member / Admin
  const handleMemberLoginSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = inputEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      alert('Silakan masukkan alamat email Gmail yang valid!');
      return;
    }

    const cleanName = inputName.trim() || cleanEmail.split('@')[0];
    const isAdmin = SUPER_ADMIN_EMAILS.includes(cleanEmail);

    setIsSubmitting(true);
    setLoginMessage('');

    // A. Jika Super Admin Resmi (Kang Iman)
    if (isAdmin) {
      const userData = {
        email: cleanEmail,
        name: cleanName || 'Kang Iman',
        role: 'super_admin',
        status: 'approved',
        loggedInAt: new Date().toISOString()
      };
      setCurrentUser(userData);
      savePermanentDeviceUser(userData);
      setLoginMessage('👑 Akses Super Admin & Ruang Privat Kang Iman Aktif!');
      setTimeout(() => {
        setIsAuthModalOpen(false);
        setLoginMessage('');
      }, 700);
      setIsSubmitting(false);
      return;
    }

    // B. Cek Database Supabase untuk Member Terdaftar
    try {
      let query = supabase.from('profiles').select('*').eq('email', cleanEmail);
      const { data: existingProfiles } = await query;
      const existingProfile = existingProfiles && existingProfiles.length > 0 ? existingProfiles[0] : null;

      if (existingProfile) {
        const userData = {
          id: existingProfile.id,
          email: cleanEmail,
          phone_number: existingProfile.phone_number || null,
          name: existingProfile.full_name || cleanName,
          role: existingProfile.role || 'member',
          status: existingProfile.status || 'approved'
        };
        setCurrentUser(userData);
        savePermanentDeviceUser(userData);

        if (existingProfile.status === 'approved') {
          setLoginMessage('✅ Selamat Datang Member NPT! Perangkat Anda diingat permanen.');
          setTimeout(() => {
            setIsAuthModalOpen(false);
            setLoginMessage('');
          }, 700);
        } else {
          setLoginMessage('⏳ Perangkat Anda telah diingat. Begitu disetujui Admin, akses otomatis terbuka tanpa perlu login ulang.');
        }
      } else {
        setActiveModalTab('not_registered_dialog');
      }
    } catch (err) {
      console.error('Login error:', err);
      const userData = {
        email: cleanEmail,
        name: cleanName,
        role: 'member',
        status: 'approved'
      };
      setCurrentUser(userData);
      savePermanentDeviceUser(userData);
      setIsAuthModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Aksi Daftar Antrean Member Baru
  const handleRegisterNewMember = async (e) => {
    if (e) e.preventDefault();
    const cleanEmail = inputEmail.trim().toLowerCase();
    const cleanName = inputName.trim() || cleanEmail.split('@')[0];
    
    let formattedPhone = inputPhone ? inputPhone.replace(/[^0-9]/g, "") : "";
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "62" + formattedPhone.slice(1);
    }

    setIsSubmitting(true);
    const roleTarget = selectedProgram === 'emt' ? 'emt' : `npt_${selectedLevel}`;

    try {
      if (supabase) {
        const { error } = await supabase.from('profiles').insert([
          {
            full_name: cleanName,
            email: cleanEmail,
            phone_number: formattedPhone || null,
            role: roleTarget,
            status: 'pending',
            created_at: new Date().toISOString()
          }
        ]);

        if (error) {
          console.warn('Insert profile warning:', error.message);
        }
      }

      // Simpan identitas perangkat agar saat Admin approve langsung aktif otomatis tanpa login ulang!
      const pendingUser = {
        email: cleanEmail,
        phone_number: formattedPhone || null,
        name: cleanName,
        role: roleTarget,
        status: 'pending'
      };
      setCurrentUser(pendingUser);
      savePermanentDeviceUser(pendingUser);

      const programLabel = selectedProgram === 'emt' 
        ? '🎓 EMT (Pelatihan Emosi Guru)' 
        : `🏛️ NPT Level ${selectedLevel}`;

      alert(`✅ Pendaftaran untuk ${programLabel} berhasil diajukan & perangkat Anda telah diingat! Begitu Admin memverifikasi akun Anda, akses seluruh materi akan langsung terbuka otomatis tanpa perlu login lagi.`);
      setIsAuthModalOpen(false);
    } catch (err) {
      alert('Gagal mengajukan pendaftaran: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col font-sans overflow-x-hidden selection:bg-rose-600 selection:text-white">
      {/* Background Ambience */}
      <div className="fixed inset-0 bg-radial from-rose-950/20 via-slate-950/90 to-slate-950 pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] sm:w-[750px] h-[350px] rounded-full bg-radial from-rose-600/10 via-amber-600/5 to-transparent blur-3xl pointer-events-none" />

      {/* Top Bar Portal: Identitas & Status Login */}
      <header className="relative z-20 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white p-1.5 shadow-md shadow-rose-950/50 flex items-center justify-center shrink-0">
              <Image
                src="/logo.png"
                alt="Logo NPT"
                width={40}
                height={40}
                priority
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                  NPT Centre
                </span>
                <span className="hidden xs:inline-block px-2 py-0.5 text-[10px] font-bold bg-rose-500/15 text-rose-300 rounded-full border border-rose-500/30">
                  Portal Terpadu
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Neuro Programming Training • EMT • Hakikat Cinta
              </p>
            </div>
          </div>

          {/* Status Akun / Tombol Login */}
          <div className="flex items-center gap-2">
            {currentUser ? (
              <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-2xl">
                <div className="w-6 h-6 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center justify-center">
                  {currentUser.name?.charAt(0) || 'N'}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-white leading-none">
                    {currentUser.name || currentUser.email?.split('@')[0]}
                  </p>
                  <p className="text-[10px] text-amber-400 font-semibold mt-0.5">
                    {isSuperAdmin ? '👑 Kang Iman (Super Admin)' : '⭐ Member Terverifikasi'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveModalTab('member_login');
                    setIsAuthModalOpen(true);
                  }}
                  className="text-[11px] font-semibold text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                  title="Ganti Akun"
                >
                  Ganti
                </button>
                <button
                  onClick={handleLogout}
                  className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition cursor-pointer"
                  title="Keluar Akun"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveModalTab('member_login');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Login / Daftar Member</span>
                </button>

                <button
                  onClick={() => setIsSecretModalOpen(true)}
                  title="Pintu Privat & Khadim"
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-amber-400 hover:border-amber-500/30 transition cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content: Hero & 4 Klaster Utama */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        
        {/* Hero Section */}
        <section className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Ekosistem Pembelajaran & Transformasi Kesadaran</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            Selamat Datang di Portal Resmi <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-400">NPT Centre</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Silakan pilih klaster ruang belajar yang ingin Anda masuki. Seluruh materi, latihan akar spiritual, evaluasi emosi, dan kajian tersusun rapi di masing-masing klaster.
          </p>
        </section>

        {/* ===================================================================== */}
        {/* GRID KLASTER UTAMA (3 KLASTER PUBLIK/MEMBER + 1 KLASTER PRIVAT)       */}
        {/* ===================================================================== */}
        <section className={`grid grid-cols-1 ${isSuperAdmin ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} gap-5`}>
          
          {/* ----------------------------------------------------------------- */}
          {/* KLASTER 1: NPT (NEURO PROGRAMMING TRAINING)                       */}
          {/* ----------------------------------------------------------------- */}
          <div className="rounded-3xl bg-gradient-to-b from-rose-950/35 via-slate-900/95 to-slate-900 border border-rose-500/30 hover:border-rose-500/60 p-6 shadow-xl flex flex-col justify-between space-y-5 transition-all">
            <div className="space-y-4">
              {/* Header Klaster 1 */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 shrink-0">
                    <span className="text-xl">🏛️</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 block">
                      Klaster 1 • Kurikulum Berjenjang
                    </span>
                    <h2 className="text-lg font-extrabold text-white leading-snug">
                      Neuro Programming Training (NPT)
                    </h2>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-500/15 text-rose-300 border border-rose-500/30 shrink-0">
                  Level 1 – 6+
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Pendidikan kesadaran pikiran, olah nafas, dan spiritualitas berjenjang dari <strong>Level 1 hingga Level 6</strong> (dan level lanjutan). Di <strong>Level 5 menuju Level 6</strong> mencakup pendalaman <strong>14 Akar Spiritual</strong>.
              </p>

              {/* Bar Akses Cepat Level 1 - 6 */}
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-300">Pilih Cepat Kelas Level NPT:</span>
                  <span className="text-[10px] text-amber-400 font-semibold">Fokus Aktif: Lvl 5 → Lvl 6</span>
                </div>
                <div className="grid grid-cols-6 gap-1.5">
                  {[1, 2, 3, 4, 5, 6].map((lvl) => {
                    const isFocus = lvl === 5 || lvl === 6;
                    return (
                      <Link
                        key={lvl}
                        href={`/npt/${lvl}`}
                        className={`py-2 rounded-xl text-center text-xs font-extrabold border transition ${
                          isFocus
                            ? 'bg-rose-600/20 hover:bg-rose-600 text-rose-200 hover:text-white border-rose-500/40'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                        }`}
                      >
                        Lvl {lvl}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Sub-Menu Fokus Level 5 & Menuju Level 6 (Akar Spiritual & Diary) */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90 px-1">
                  🌿 Fokus Level 5 Menuju Level 6 (Akar Spiritual & Praktik):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Link
                    href="/buku-saku"
                    className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-200 text-xs font-bold flex items-center gap-2 transition"
                  >
                    <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate">14 Akar Spiritual</span>
                  </Link>
                  <Link
                    href="/buku-saku?tab=journal"
                    className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 text-xs font-bold flex items-center gap-2 transition"
                  >
                    <PenTool className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="truncate">Buku Diary Harian</span>
                  </Link>
                  <Link
                    href="/dashboard"
                    className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-200 text-xs font-bold flex items-center gap-2 transition"
                  >
                    <Bell className="w-4 h-4 text-rose-400 shrink-0" />
                    <span className="truncate">Tugas & Setoran</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* CTA Utama Klaster 1 */}
            <Link
              href="/npt"
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 transition"
            >
              <span>Masuk ke Kurikulum NPT (Level 1–6)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* KLASTER 2: EMT (EMOTIONAL MASTERY TRAINING)                       */}
          {/* ----------------------------------------------------------------- */}
          <div className="rounded-3xl bg-gradient-to-b from-emerald-950/35 via-slate-900/95 to-slate-900 border border-emerald-500/30 hover:border-emerald-500/60 p-6 shadow-xl flex flex-col justify-between space-y-5 transition-all">
            <div className="space-y-4">
              {/* Header Klaster 2 */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 shrink-0">
                    <span className="text-xl">🏫</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
                      Klaster 2 • Asuhan Kang Iman
                    </span>
                    <h2 className="text-lg font-extrabold text-white leading-snug">
                      Emotional Mastery Training (EMT)
                    </h2>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shrink-0">
                  Guru & Reguler
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Pelatihan kesadaran emosi untuk pendidik dan praktisi umum, pembersihan luka batin, program terapi mandiri <strong>21 Hari Self-Healing</strong>, serta lembar jurnal evaluasi batin.
              </p>

              {/* Modul di dalam Klaster EMT */}
              <div className="space-y-2 pt-1">
                <Link
                  href="/emt"
                  className="p-3 rounded-2xl bg-slate-950/70 hover:bg-slate-950 border border-slate-800 hover:border-emerald-500/40 flex items-center justify-between transition group"
                >
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-emerald-300">
                        Ruang Kelas & Jurnal Refleksi EMT
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Materi modul emosi guru & setoran evaluasi batin
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
                </Link>

                <Link
                  href="/emt?tab=selfhealing"
                  className="p-3 rounded-2xl bg-slate-950/70 hover:bg-slate-950 border border-slate-800 hover:border-emerald-500/40 flex items-center justify-between transition group"
                >
                  <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-emerald-300">
                        Program 21 Hari Self-Healing
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Panduan pemulihan emosi & pelacakan progres harian
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
                </Link>
              </div>
            </div>

            {/* CTA Utama Klaster 2 */}
            <Link
              href="/emt"
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition"
            >
              <span>Masuk ke Ruang EMT</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* KLASTER 3: PORTAL VIDEO YOUTUBE HAKIKAT CINTA                     */}
          {/* ----------------------------------------------------------------- */}
          <div className="rounded-3xl bg-gradient-to-b from-purple-950/35 via-slate-900/95 to-slate-900 border border-purple-500/30 hover:border-purple-500/60 p-6 shadow-xl flex flex-col justify-between space-y-5 transition-all">
            <div className="space-y-4">
              {/* Header Klaster 3 */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 shrink-0">
                    <Film className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 block">
                      Klaster 3 • Portal Video & Kajian
                    </span>
                    <h2 className="text-lg font-extrabold text-white leading-snug">
                      Portal YouTube Hakikat Cinta
                    </h2>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-purple-500/15 text-purple-300 border border-purple-500/30 shrink-0">
                  Video & Kitab
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Arsip terpadu rekaman video YouTube kajian rutin <strong>Kitab Al-Hikam</strong>, <strong>Kajian Malam Jumat (Misykatul Anwar)</strong>, <strong>Private Coaching NPT</strong>, beserta ringkasan bab buku.
              </p>

              {/* Kategori Playlist di dalam Hakikat Cinta */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/hakekat-cinta"
                  className="p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-950 border border-slate-800 hover:border-purple-500/40 text-xs font-bold text-slate-200 flex items-center gap-2 transition"
                >
                  <span>📚</span>
                  <span className="truncate">Kajian Al-Hikam</span>
                </Link>
                <Link
                  href="/hakekat-cinta"
                  className="p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-950 border border-slate-800 hover:border-purple-500/40 text-xs font-bold text-slate-200 flex items-center gap-2 transition"
                >
                  <span>🕌</span>
                  <span className="truncate">Malam Jumat</span>
                </Link>
                <Link
                  href="/hakekat-cinta"
                  className="p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-950 border border-slate-800 hover:border-purple-500/40 text-xs font-bold text-slate-200 flex items-center gap-2 transition"
                >
                  <span>✨</span>
                  <span className="truncate">Private Coaching</span>
                </Link>
                <Link
                  href="/hakekat-cinta"
                  className="p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-950 border border-slate-800 hover:border-purple-500/40 text-xs font-bold text-slate-200 flex items-center gap-2 transition"
                >
                  <span>📖</span>
                  <span className="truncate">Draf Bab Buku</span>
                </Link>
              </div>
            </div>

            {/* CTA Utama Klaster 3 */}
            <Link
              href="/hakekat-cinta"
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 transition"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Buka Portal Video Hakikat Cinta</span>
            </Link>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* KLASTER 4: HALAMAN PRIVAT KANG IMAN (DI LUAR ADMIN)               */}
          {/* Hanya muncul jika akun Kang Iman / Super Admin sedang aktif       */}
          {/* ----------------------------------------------------------------- */}
          {isSuperAdmin && (
            <div className="rounded-3xl bg-gradient-to-b from-amber-950/40 via-slate-900/95 to-slate-900 border-2 border-amber-500/40 hover:border-amber-400 p-6 shadow-xl flex flex-col justify-between space-y-5 transition-all">
              <div className="space-y-4">
                {/* Header Klaster 4 */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
                      <span className="text-xl">📿</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                        Klaster 4 • Ruang Pribadi (Non-Admin)
                      </span>
                      <h2 className="text-lg font-extrabold text-white leading-snug">
                        Halaman Privat Kang Iman
                      </h2>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 shrink-0">
                    PRIVAT
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Ruang khalwat digital, amalan wirid/afirmasi paten pribadi, serta dapur telaah & terjemah kitab kuning berharakat (terpisah dari panel manajemen admin teknis).
                </p>

                {/* 2 Ruang Utama di Klaster Privat Kang Iman */}
                <div className="space-y-2.5 pt-1">
                  <Link
                    href="/wirid-khusus"
                    className="p-3.5 rounded-2xl bg-slate-950/80 hover:bg-amber-950/40 border border-amber-500/30 hover:border-amber-400 flex items-center justify-between transition group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">📿</span>
                      <div>
                        <p className="text-xs font-extrabold text-amber-300 group-hover:text-amber-200">
                          Riyadhoh & Wirid Khusus Kang Iman
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Afirmasi Paten Level 5, Barier, & Dzikir Pribadi
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-400" />
                  </Link>

                  <Link
                    href="/admin/maktabah"
                    className="p-3.5 rounded-2xl bg-slate-950/80 hover:bg-amber-950/40 border border-amber-500/30 hover:border-amber-400 flex items-center justify-between transition group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">📚</span>
                      <div>
                        <p className="text-xs font-extrabold text-amber-300 group-hover:text-amber-200">
                          Dapur Ngaji & Maktabah Bedah Kitab
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Syakal Otomatis, Terjemah Per Kata, & Syarah Al-Hikam
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-400" />
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  href="/wirid-khusus"
                  className="py-3 px-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 transition"
                >
                  <span>📿 Buka Wirid Khusus</span>
                </Link>
                <Link
                  href="/admin/maktabah"
                  className="py-3 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-extrabold flex items-center justify-center gap-1.5 transition"
                >
                  <span>📚 Buka Dapur Ngaji</span>
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* ===================================================================== */}
        {/* PANEL MANAJEMEN ADMIN TEKNIS (TERPISAH DARI 4 KLASTER DI ATAS)        */}
        {/* ===================================================================== */}
        {isSuperAdmin && (
          <section className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">
                    Panel Admin Operasional (Manajemen Sistem)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Khusus pengelolaan pendaftaran anggota, upload modul materi, dan pemeriksaan tugas peserta.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 self-start sm:self-auto">
                ⚙️ Ruang Pengelola Teknis
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Link
                href="/admin/members"
                className="p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 flex items-center justify-between transition"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-white">Approval Member</p>
                    <p className="text-[10px] text-slate-400">Verifikasi akses akun</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </Link>

              <Link
                href="/admin/materials"
                className="p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-rose-500/40 flex items-center justify-between transition"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-rose-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-white">Kelola Materi NPT</p>
                    <p className="text-[10px] text-slate-400">Upload modul Level 1–6</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </Link>

              <Link
                href="/admin/submissions"
                className="p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-sky-500/40 flex items-center justify-between transition"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-sky-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-white">Rekap Diary & Tugas</p>
                    <p className="text-[10px] text-slate-400">Setoran peserta & Export</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </Link>

              <Link
                href="/admin/emt"
                className="p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 flex items-center justify-between transition"
              >
                <div className="flex items-center gap-2.5">
                  <GraduationCap className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-white">Kelola Kelas EMT</p>
                    <p className="text-[10px] text-slate-400">Jurnal & peserta EMT</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </Link>
            </div>
          </section>
        )}
      </main>

      {/* Footer Ringkas */}
      <footer className="relative z-10 border-t border-slate-900 py-5 px-4 text-center text-[11px] text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>NPT Centre • Neuro Programming Training & Emotional Mastery Training</span>
          {!isSuperAdmin && (
            <button
              onClick={() => setIsSecretModalOpen(true)}
              className="text-slate-600 hover:text-amber-400 transition cursor-pointer"
            >
              Akses Privat Kang Iman / Admin
            </button>
          )}
        </div>
      </footer>

      {/* ===================================================================== */}
      {/* MODAL LOGIN & REGISTRASI MEMBER                                       */}
      {/* ===================================================================== */}
      {isAuthModalOpen && (
        <div 
          onClick={() => setIsAuthModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-slate-900 border border-rose-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-center relative overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-rose-600 text-white font-extrabold text-xs flex items-center justify-center">
                  🔴
                </div>
                <span className="text-xs font-black tracking-wider uppercase text-white">
                  Akses Member & Admin NPT
                </span>
              </div>

              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* TAB LOGIN MEMBER */}
            {activeModalTab === 'member_login' && (
              <form onSubmit={handleMemberLoginSubmit} className="space-y-4 text-left">
                <div className="text-center space-y-1">
                  <h3 className="text-base font-bold text-white">Masuk Akun</h3>
                  <p className="text-xs text-slate-400">
                    Masukkan Nama & Email Gmail Anda (Cukup 1x login di perangkat ini):
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-rose-400" /> Nama Lengkap / Panggilan
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Budi Santoso"
                      value={inputName}
                      onChange={(e) => setInputName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-rose-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-amber-400" /> Alamat Email Gmail
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="namaanda@gmail.com"
                      value={inputEmail}
                      onChange={(e) => setInputEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-rose-500 transition"
                    />
                  </div>
                </div>

                {loginMessage && (
                  <p className="text-xs font-medium text-amber-400 text-center bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                    {loginMessage}
                  </p>
                )}

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>{isSubmitting ? 'Memeriksa...' : 'Masuk Sekarang'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveModalTab('not_registered_dialog')}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition cursor-pointer"
                  >
                    Belum terdaftar? Daftar Member Baru
                  </button>
                </div>
              </form>
            )}

            {/* TAB REGISTRASI ANGGOTA BARU */}
            {activeModalTab === 'not_registered_dialog' && (
              <form onSubmit={handleRegisterNewMember} className="space-y-4 text-left animate-in fade-in">
                <div className="text-center space-y-1">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Pendaftaran Member Baru</h3>
                  <p className="text-xs text-slate-400">
                    Pilih klaster program dan level yang Anda ikuti:
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Pilihan Klaster Pelatihan *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedProgram('npt')}
                        className={`p-3 rounded-2xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                          selectedProgram === 'npt'
                            ? 'bg-rose-950/40 border-rose-500 text-white shadow-xs ring-1 ring-rose-500'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <Sparkles className="w-4 h-4 text-rose-400" />
                          <span className={selectedProgram === 'npt' ? 'text-rose-300' : ''}>🏛️ NPT</span>
                        </div>
                        <span className="text-[10px] text-slate-400 leading-tight">
                          Neuro Programming Training (Level 1–6)
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedProgram('emt')}
                        className={`p-3 rounded-2xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                          selectedProgram === 'emt'
                            ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-xs ring-1 ring-emerald-500'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <GraduationCap className="w-4 h-4 text-emerald-400" />
                          <span className={selectedProgram === 'emt' ? 'text-emerald-300' : ''}>🎓 EMT</span>
                        </div>
                        <span className="text-[10px] text-slate-400 leading-tight">
                          Pelatihan Emosi Guru & Praktisi
                        </span>
                      </button>
                    </div>
                  </div>

                  {selectedProgram === 'npt' && (
                    <div className="space-y-1 p-3 rounded-2xl bg-slate-950 border border-slate-800 animate-in fade-in">
                      <label className="block text-[11px] font-bold text-amber-400">
                        Tingkatan Level NPT yang Diikuti *
                      </label>
                      <select
                        value={selectedLevel}
                        onChange={(e) => setSelectedLevel(parseInt(e.target.value, 10))}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-rose-500"
                      >
                        <option value={1}>🏛️ Level 1: Nafas & Relaksasi Dasar</option>
                        <option value={2}>⚡ Level 2: Olah Energi & Somatik</option>
                        <option value={3}>🔥 Level 3: Power & Transcendental</option>
                        <option value={4}>🧠 Level 4: Self Mastery & Mindset</option>
                        <option value={5}>👁️ Level 5: Higher State Awareness & Akar Spiritual</option>
                        <option value={6}>🌿 Level 6: Mastery & Integrasi 14 Akar Spiritual</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-rose-400" /> Nama Lengkap
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nama lengkap Anda"
                      value={inputName}
                      onChange={(e) => setInputName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-amber-400" /> Alamat Email Gmail
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="namaanda@gmail.com"
                      value={inputEmail}
                      onChange={(e) => setInputEmail(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" /> Nomor WhatsApp Aktif (Opsional)
                    </label>
                    <input
                      type="tel"
                      placeholder="08123456789"
                      value={inputPhone}
                      onChange={(e) => setInputPhone(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>
                      {isSubmitting 
                        ? 'Mengajukan...' 
                        : `Kirim Pendaftaran (${selectedProgram === 'emt' ? 'EMT' : `NPT Lvl ${selectedLevel}`})`
                      }
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveModalTab('member_login')}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                  >
                    ← Kembali ke Login
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL AKSES CEPAT RUANG PRIVAT KANG IMAN & ADMIN                      */}
      {/* ===================================================================== */}
      {isSecretModalOpen && (
        <div 
          onClick={() => setIsSecretModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 text-left"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Pintu Khusus Kang Iman & Admin
                </span>
              </div>
              <button
                onClick={() => setIsSecretModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* BAGIAN 1: KLASTER 4 (HALAMAN PRIVAT KANG IMAN - DI LUAR ADMIN) */}
            <div className="space-y-2">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400">
                📿 Klaster 4: Halaman Privat Kang Iman (Non-Admin)
              </p>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => router.push('/wirid-khusus')}
                  className="w-full p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-left border border-amber-500/30 transition flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-bold text-amber-300">📿 Riyadhoh & Wirid Khusus Kang Iman</p>
                    <p className="text-[10px] text-slate-400">Afirmasi Paten Level 5 & Barier Pribadi</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-400" />
                </button>
                <button
                  onClick={() => router.push('/admin/maktabah')}
                  className="w-full p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-left border border-amber-500/30 transition flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-bold text-amber-300">📚 Dapur Ngaji & Maktabah Bedah Kitab</p>
                    <p className="text-[10px] text-slate-400">Syakal, Terjemah Kitab & Syarah Al-Hikam</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>

            {/* BAGIAN 2: PANEL MANAJEMEN ADMIN TEKNIS */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                ⚙️ Panel Admin Operasional (Teknis)
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => router.push('/admin/members')}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-300 border border-slate-700 transition cursor-pointer"
                >
                  👥 Approval Member
                </button>
                <button
                  onClick={() => router.push('/admin/materials')}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-rose-300 border border-slate-700 transition cursor-pointer"
                >
                  📁 Upload Materi NPT
                </button>
                <button
                  onClick={() => router.push('/admin/submissions')}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-sky-300 border border-slate-700 transition cursor-pointer"
                >
                  📝 Rekap Tugas/Diary
                </button>
                <button
                  onClick={() => router.push('/admin/emt')}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-emerald-300 border border-slate-700 transition cursor-pointer"
                >
                  🎓 Admin Kelas EMT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
