"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { 
  Sparkles, 
  Compass, 
  Shield, 
  Layers, 
  Crown, 
  Film, 
  BookOpen, 
  Bell, 
  Users, 
  X, 
  ChevronRight, 
  Lock, 
  Key, 
  ArrowRight,
  ShieldCheck,
  User,
  Mail,
  UserCheck,
  HelpCircle
} from 'lucide-react';

const SUPER_ADMIN_EMAILS = [
  'imannurjamanreborn@gmail.com',
  'admin@nptcentre.id',
  'admin@neuroprogrammingtraining.id'
];

export default function CosmicGatewayPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);

  // Modal State
  const [isGatewayModalOpen, setIsGatewayModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState('menu'); // 'menu' | 'member_login' | 'not_registered_dialog'
  
  // Login Form State
  const [inputName, setInputName] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginMessage, setLoginMessage] = useState('');

  // Pintu Rahasia Super Admin Modal
  const [isSecretModalOpen, setIsSecretModalOpen] = useState(false);

  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem('npt_user_auth');
      if (savedAuth) {
        setCurrentUser(JSON.parse(savedAuth));
      }
    } catch (e) {}
  }, []);

  // 1. Aksi Ketuk Layar Utama
  const handleTapScreen = () => {
    setIsGatewayModalOpen(true);
    setActiveModalTab('menu');
  };

  // 2. Aksi Masuk Langsung Sebagai Pengunjung Umum
  const handleEnterAsGuest = () => {
    setIsGatewayModalOpen(false);
    router.push('/hakekat-cinta');
  };

  // 3. Aksi Login Member
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

    // A. Jika Super Admin Resmi
    if (isAdmin) {
      const userData = {
        email: cleanEmail,
        name: cleanName,
        role: 'super_admin',
        status: 'approved',
        loggedInAt: new Date().toISOString()
      };
      setCurrentUser(userData);
      localStorage.setItem('npt_user_auth', JSON.stringify(userData));
      localStorage.setItem('participant_name', cleanName);
      setLoginMessage('👑 Akses Super Admin Terverifikasi!');
      setTimeout(() => {
        router.push('/admin/members');
      }, 600);
      return;
    }

    // B. Cek Database Supabase untuk Member Terdaftar
    try {
      let query = supabase.from('profiles').select('*').eq('email', cleanEmail);
      const { data: existingProfiles, error } = await query;
      const existingProfile = existingProfiles && existingProfiles.length > 0 ? existingProfiles[0] : null;

      if (existingProfile) {
        if (existingProfile.status === 'approved') {
          // Member Approved -> Langsung Masuk!
          const userData = {
            id: existingProfile.id,
            email: cleanEmail,
            name: existingProfile.full_name || cleanName,
            role: existingProfile.role || 'member',
            status: 'approved'
          };
          setCurrentUser(userData);
          localStorage.setItem('npt_user_auth', JSON.stringify(userData));
          localStorage.setItem('participant_name', userData.name);
          setLoginMessage('✅ Selamat Datang Member NPT!');
          setTimeout(() => {
            router.push('/hakekat-cinta');
          }, 600);
        } else {
          // Member Pending Approval
          setLoginMessage('⏳ Akun Anda masih dalam antrean persetujuan Admin.');
        }
      } else {
        // EMAIL BELUM TERDAFTAR -> Tampilkan Dialog Pilihan: Mau jadi Member atau Pengunjung?
        setActiveModalTab('not_registered_dialog');
      }
    } catch (err) {
      console.error(err);
      setActiveModalTab('not_registered_dialog');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Aksi Daftar Jadi Member Baru (Status Pending di Supabase)
  const handleConfirmRegisterNewMember = async () => {
    setIsSubmitting(true);
    const cleanEmail = inputEmail.trim().toLowerCase();
    const cleanName = inputName.trim() || cleanEmail.split('@')[0];

    try {
      if (supabase) {
        await supabase.from('profiles').insert([
          {
            full_name: cleanName,
            email: cleanEmail,
            role: 'member',
            status: 'pending'
          }
        ]);
      }
      alert(`Alhamdulillah permohonan Anda (${cleanEmail}) berhasil dikirim! Menunggu konfirmasi Admin NPT.`);
    } catch (e) {
      console.warn(e);
    } finally {
      setIsSubmitting(false);
      setIsGatewayModalOpen(false);
      router.push('/hakekat-cinta');
    }
  };

  return (
    <div 
      onClick={handleTapScreen}
      className="relative min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col items-center justify-center select-none overflow-hidden cursor-pointer font-sans"
    >
      {/* Background Batik Watermark Mistik & Sufistik */}
      <div 
        className="absolute inset-0 bg-repeat opacity-[0.07] pointer-events-none mix-blend-screen scale-105"
        style={{ backgroundImage: "url('/bg-batik.png')", backgroundSize: '480px 480px' }}
      />

      {/* Cosmic Vignette & Ambient Radial Glows */}
      <div className="absolute inset-0 bg-radial from-rose-950/20 via-slate-950/80 to-slate-950 pointer-events-none" />
      <div className="absolute w-[450px] sm:w-[650px] h-[450px] sm:h-[650px] rounded-full bg-radial from-rose-600/15 via-red-700/5 to-transparent blur-3xl pointer-events-none animate-pulse duration-1000" />

      {/* Pintu Rahasia Easter Egg di Pojok Kanan Atas (Untuk Khadim / Super Admin) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsSecretModalOpen(true);
        }}
        title="Ruang Khadim & Admin"
        className="absolute top-5 right-5 z-20 p-2.5 rounded-2xl text-slate-700 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-300 cursor-pointer"
      >
        <Layers className="w-5 h-5 opacity-40 hover:opacity-100 transition-opacity" />
      </button>

      {/* 4 Cosmic Corner Glyphs */}
      <div className="absolute top-6 left-6 text-slate-700 pointer-events-none">
        <Sparkles className="w-5 h-5 opacity-30" />
      </div>
      <div className="absolute bottom-6 left-6 text-slate-700 pointer-events-none">
        <Compass className="w-5 h-5 opacity-30" />
      </div>
      <div className="absolute bottom-6 right-6 text-slate-700 pointer-events-none">
        <Shield className="w-5 h-5 opacity-30" />
      </div>

      {/* CENTERPIECE: RUBY LOGO NPT SAJA */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-12">
        <div className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-tr from-rose-600/30 via-red-500/20 to-amber-500/30 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-700 animate-pulse" />
          
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-white p-3 shadow-2xl shadow-rose-950/80 flex items-center justify-center transform group-hover:scale-105 transition duration-500">
            <Image
              src="/logo.png"
              alt="Logo NPT"
              width={140}
              height={140}
              priority
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Action Text */}
        <div className="text-center">
          <p className="text-[11px] sm:text-xs font-black tracking-[0.25em] text-slate-400 uppercase drop-shadow-md animate-pulse">
            Ketuk Layar Untuk Masuk Ke Portal Informasi
          </p>
        </div>
      </div>

      {/* MODAL PILIHAN GERBANG UTAMA: PENGUNJUNG ATAU MEMBER */}
      {isGatewayModalOpen && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="w-full max-w-md bg-slate-900 border border-rose-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-rose-500/15 via-amber-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-rose-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                  🔴
                </div>
                <span className="text-xs font-black tracking-wider uppercase text-white">
                  NPT Centre • Pintu Masuk
                </span>
              </div>

              <button
                onClick={() => setIsGatewayModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* TAB 1: PILIHAN UTAMA (PENGUNJUNG ATAU MEMBER) */}
            {activeModalTab === 'menu' && (
              <div className="space-y-4 text-left">
                <div className="text-center space-y-1">
                  <h3 className="text-base font-bold text-white">Selamat Datang di NPT Centre</h3>
                  <p className="text-xs text-slate-400">Silakan pilih cara Anda menjelajahi portal:</p>
                </div>

                <div className="space-y-3 pt-2">
                  {/* Opsi 1: Pengunjung Umum */}
                  <button
                    onClick={handleEnterAsGuest}
                    className="w-full p-4 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 group-hover:bg-slate-700 text-slate-200 flex items-center justify-center shrink-0">
                        <Compass className="w-5 h-5 text-sky-400" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">
                          Hanya Pengunjung Umum
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Jelajahi info NPT, EMT Guru, & Kajian Al-Hikam bebas tanpa login.
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* Opsi 2: Member Terdaftar */}
                  <button
                    onClick={() => setActiveModalTab('member_login')}
                    className="w-full p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-950 to-slate-950 hover:bg-slate-800/80 border border-rose-500/40 hover:border-rose-500/70 transition flex items-center justify-between group cursor-pointer shadow-lg shadow-rose-950/30"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0 border border-rose-500/30">
                        <Key className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors">
                          Masuk Sebagai Member NPT
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Buka dokumen PDF/PPT, tugas coaching, & full video eksklusif.
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-rose-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: FORM LOGIN MEMBER (HANYA NAMA & EMAIL) */}
            {activeModalTab === 'member_login' && (
              <div className="space-y-4 text-left">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setActiveModalTab('menu')}
                    className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
                  >
                    ← Kembali ke Pilihan
                  </button>
                  <span className="text-[10px] font-bold text-amber-400">Login Member</span>
                </div>

                <form onSubmit={handleMemberLoginSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Nama Lengkap Anda:
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        autoComplete="off"
                        required
                        placeholder="Masukkan nama lengkap Anda..."
                        value={inputName}
                        onChange={(e) => setInputName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Alamat Email Gmail Terdaftar:
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        autoComplete="off"
                        required
                        placeholder="contoh: nama@gmail.com"
                        value={inputEmail}
                        onChange={(e) => setInputEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-rose-500"
                      />
                    </div>
                  </div>

                  {loginMessage && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                      {loginMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>{isSubmitting ? "Memeriksa Status..." : "Masuk ke Portal Member"}</span>
                  </button>
                </form>
              </div>
            )}

            {/* TAB 3: DIALOG KETIKA EMAIL BELUM TERDAFTAR */}
            {activeModalTab === 'not_registered_dialog' && (
              <div className="space-y-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
                  <HelpCircle className="w-6 h-6" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-white">
                    Email Belum Terdaftar Sebagai Member
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                    Email <strong>{inputEmail}</strong> belum ada di database member resmi NPT. Mau lanjut sebagai apa?
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  <button
                    onClick={handleConfirmRegisterNewMember}
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>📝 Ya, Ajukan Sebagai Member Baru</span>
                  </button>

                  <button
                    onClick={handleEnterAsGuest}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                  >
                    🌐 Lanjut Sebagai Pengunjung Saja
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* MODAL PINTU RAHASIA SUPER ADMIN */}
      {isSecretModalOpen && (
        <div 
          onClick={() => setIsSecretModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl space-y-4 text-left"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Ruang Khadim & Admin</h3>
              </div>
              <button
                onClick={() => setIsSecretModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleMemberLoginSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Email Admin Utama
                </label>
                <input
                  type="email"
                  autoComplete="off"
                  required
                  placeholder="imannurjamanreborn@gmail.com"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition"
              >
                Buka Ruang Admin
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
