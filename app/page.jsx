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
  Lock, 
  X, 
  Key, 
  ArrowRight,
  ShieldCheck,
  User,
  Mail,
  UserCheck,
  HelpCircle,
  LogOut,
  CheckCircle2
} from 'lucide-react';

const SUPER_ADMIN_EMAILS = [
  'imannurjamanreborn@gmail.com',
  'imannurjaman84@gmail.com',
  'imannnurjanan84@gmail.com',
  'imannurjaman@gmail.com',
  'lautanmahabbah@gmail.com',
  'admin@nptcentre.id',
  'admin@neuroprogrammingtraining.id',
  'admin@npt.com'
];

// Helper simpan auth permanen di localStorage dan cookie 10 tahun
function savePermanentAuth(userData) {
  try {
    const jsonStr = JSON.stringify(userData);
    localStorage.setItem('npt_user_auth', jsonStr);
    localStorage.setItem('participant_name', userData.name || '');
    // Cookie 10 tahun (315360000 detik)
    document.cookie = `npt_device_auth=${encodeURIComponent(jsonStr)}; path=/; max-age=315360000; SameSite=Lax`;
  } catch (e) {}
}

function clearPermanentAuth() {
  try {
    localStorage.removeItem('npt_user_auth');
    localStorage.removeItem('participant_name');
    document.cookie = 'npt_device_auth=; path=/; max-age=0; SameSite=Lax';
  } catch (e) {}
}

export default function CosmicGatewayPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [isAutoRedirecting, setIsAutoRedirecting] = useState(false);
  const [countdown, setCountdown] = useState(2);

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
      let savedUser = null;
      const savedAuth = localStorage.getItem('npt_user_auth');
      if (savedAuth) {
        savedUser = JSON.parse(savedAuth);
      } else {
        // Cek fallback cookie 10 tahun
        const match = document.cookie.match(/(?:^|; )npt_device_auth=([^;]*)/);
        if (match) {
          savedUser = JSON.parse(decodeURIComponent(match[1]));
          localStorage.setItem('npt_user_auth', JSON.stringify(savedUser));
        }
      }

      if (savedUser && (savedUser.status === 'approved' || savedUser.role === 'super_admin')) {
        setCurrentUser(savedUser);
        setIsAutoRedirecting(true);

        // Auto redirect timer untuk kenyamanan para sepuh (cukup 1.5 detik)
        const targetRoute = savedUser.role === 'super_admin' ? '/admin/members' : '/hakekat-cinta';
        const timer = setTimeout(() => {
          router.push(targetRoute);
        }, 1800);

        const interval = setInterval(() => {
          setCountdown((prev) => (prev > 1 ? prev - 1 : 1));
        }, 800);

        return () => {
          clearTimeout(timer);
          clearInterval(interval);
        };
      }
    } catch (e) {}
  }, [router]);

  const handleDirectEnter = (e) => {
    e?.stopPropagation();
    if (currentUser?.role === 'super_admin') {
      router.push('/admin/members');
    } else {
      router.push('/hakekat-cinta');
    }
  };

  const handleSwitchAccount = (e) => {
    e?.stopPropagation();
    clearPermanentAuth();
    setCurrentUser(null);
    setIsAutoRedirecting(false);
    setIsGatewayModalOpen(true);
    setActiveModalTab('menu');
  };

  // 1. Aksi Ketuk Layar Utama
  const handleTapScreen = () => {
    if (currentUser && (currentUser.status === 'approved' || currentUser.role === 'super_admin')) {
      handleDirectEnter();
      return;
    }
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
      savePermanentAuth(userData);
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
          // Member Approved -> Simpan permanen & langsung masuk!
          const userData = {
            id: existingProfile.id,
            email: cleanEmail,
            name: existingProfile.full_name || cleanName,
            role: existingProfile.role || 'member',
            status: 'approved'
          };
          setCurrentUser(userData);
          savePermanentAuth(userData);
          setLoginMessage('✅ Selamat Datang Member NPT! Perangkat Anda diingat permanen.');
          setTimeout(() => {
            router.push('/hakekat-cinta');
          }, 600);
        } else {
          // Member Pending Approval
          setLoginMessage('⏳ Akun Anda masih dalam antrean persetujuan Admin.');
        }
      } else {
        // EMAIL BELUM TERDAFTAR -> Tampilkan Dialog Pilihan
        setActiveModalTab('not_registered_dialog');
      }
    } catch (err) {
      console.error('Login error:', err);
      // Fallback jika offline
      const userData = {
        email: cleanEmail,
        name: cleanName,
        role: 'member',
        status: 'approved'
      };
      setCurrentUser(userData);
      savePermanentAuth(userData);
      router.push('/hakekat-cinta');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Aksi Daftar Antrean Member Baru (Pending Approval)
  const handleRegisterNewMember = async () => {
    const cleanEmail = inputEmail.trim().toLowerCase();
    const cleanName = inputName.trim() || cleanEmail.split('@')[0];
    setIsSubmitting(true);

    try {
      if (supabase) {
        const { error } = await supabase.from('profiles').insert([
          {
            full_name: cleanName,
            email: cleanEmail,
            role: 'member',
            status: 'pending',
            created_at: new Date().toISOString()
          }
        ]);

        if (error) {
          console.warn('Insert profile warning:', error.message);
        }
      }

      alert('✅ Pendaftaran berhasil diajukan! Admin akan segera memverifikasi akun Anda. Anda tetap bisa menjelajah sebagai Pengunjung terlebih dahulu.');
      setIsGatewayModalOpen(false);
      router.push('/hakekat-cinta');
    } catch (err) {
      alert('Gagal mengajukan pendaftaran: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      onClick={handleTapScreen}
      className="relative min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-6 overflow-hidden select-none cursor-pointer transition-colors font-sans"
    >
      {/* Background Ambience / Cahaya Kosmik */}
      <div className="absolute inset-0 bg-radial from-rose-950/20 via-slate-950/80 to-slate-950 pointer-events-none" />
      <div className="absolute w-[450px] sm:w-[650px] h-[450px] sm:h-[650px] rounded-full bg-radial from-rose-600/15 via-red-700/5 to-transparent blur-3xl pointer-events-none animate-pulse duration-1000" />

      {/* Pintu Rahasia Easter Egg di Pojok Kanan Atas */}
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

      {/* CENTERPIECE: RUBY LOGO NPT & AUTO-REMEMBER CARD */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-8 max-w-sm w-full">
        <div className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-tr from-rose-600/30 via-red-500/20 to-amber-500/30 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-700 animate-pulse" />
          
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-white p-3 shadow-2xl shadow-rose-950/80 flex items-center justify-center transform group-hover:scale-105 transition duration-500 mx-auto">
            <Image
              src="/logo.png"
              alt="Logo NPT"
              width={130}
              height={130}
              priority
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* JIKA SUDAH PERNAH LOGIN (RAMAH SEPUH - SEKALI KLIK LANGSUNG MASUK) */}
        {currentUser && (currentUser.status === 'approved' || currentUser.role === 'super_admin') ? (
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-slate-900/90 border border-rose-500/30 p-5 rounded-3xl shadow-2xl backdrop-blur-md text-center space-y-3.5 animate-in fade-in zoom-in-95 duration-300"
          >
            <div className="flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-black text-emerald-400 uppercase tracking-wider">
                HP Terverifikasi Otomatis
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                Selamat Datang, {currentUser.name || "Member NPT"}! 🌸
              </h2>
              <p className="text-xs text-slate-300">
                {isAutoRedirecting 
                  ? `Membuka materi dalam ${countdown} detik...` 
                  : "Ketuk tombol di bawah untuk lanjut belajar."}
              </p>
            </div>

            <button
              onClick={handleDirectEnter}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-red-500 to-amber-600 text-white font-black text-xs sm:text-sm shadow-xl shadow-rose-600/30 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              <span>Masuk Langsung Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleSwitchAccount}
              className="text-[11px] text-slate-400 hover:text-rose-400 transition cursor-pointer pt-1 block mx-auto underline"
            >
              Bukan {currentUser.name}? Ganti Akun / Pengunjung
            </button>
          </div>
        ) : (
          /* JIKA PENGUNJUNG BARU / BELUM LOGIN */
          <div className="text-center space-y-2">
            <p className="text-xs sm:text-sm font-black tracking-[0.2em] text-slate-300 uppercase drop-shadow-md animate-pulse">
              Ketuk Layar Untuk Masuk
            </p>
            <p className="text-[11px] text-slate-500">
              NPT Centre • Portal Terpadu & Hakikat Cinta
            </p>
          </div>
        )}
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
                    className="w-full p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 to-slate-950 hover:from-rose-900/40 hover:to-slate-900 border border-rose-500/30 hover:border-rose-500/50 transition flex items-center justify-between group cursor-pointer shadow-lg shadow-rose-950/30"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-600/30">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors">
                          Masuk Sebagai Member NPT (1x Login)
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Cukup login 1x, perangkat Anda langsung diingat selamanya.
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-rose-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: FORM LOGIN MEMBER (NAMA & EMAIL SAJA) */}
            {activeModalTab === 'member_login' && (
              <form onSubmit={handleMemberLoginSubmit} className="space-y-4 text-left">
                <div className="text-center space-y-1">
                  <h3 className="text-base font-bold text-white">Login Member NPT</h3>
                  <p className="text-xs text-slate-400">
                    Masukkan Nama & Email Gmail Anda (Cukup 1x login di HP ini):
                  </p>
                </div>

                <div className="space-y-3 pt-2">
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
                  <p className="text-xs font-medium text-amber-400 text-center bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
                    {loginMessage}
                  </p>
                )}

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveModalTab('menu')}
                    className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition cursor-pointer"
                  >
                    Kembali
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>{isSubmitting ? 'Memeriksa...' : 'Masuk Sekarang'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: DIALOG EMAIL BELUM TERDAFTAR */}
            {activeModalTab === 'not_registered_dialog' && (
              <div className="space-y-4 text-left">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
                  <HelpCircle className="w-6 h-6" />
                </div>

                <div className="text-center space-y-1">
                  <h3 className="text-base font-bold text-white">Email Belum Terdaftar</h3>
                  <p className="text-xs text-slate-300">
                    Email <span className="text-amber-400 font-semibold">{inputEmail}</span> belum terdaftar di database Member NPT.
                  </p>
                </div>

                <p className="text-xs text-slate-400 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                  Apakah Anda ingin mendaftar menjadi Member resmi NPT atau tetap melanjutkan sebagai Pengunjung Umum?
                </p>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={handleRegisterNewMember}
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isSubmitting ? 'Mengajukan...' : 'Daftar Jadi Member NPT'}</span>
                  </button>

                  <button
                    onClick={handleEnterAsGuest}
                    className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Lanjut Sebagai Pengunjung Saja</span>
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
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Ruang Khadim & Admin
                </span>
              </div>
              <button
                onClick={() => setIsSecretModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Pintu darurat untuk Super Admin masuk ke Dashboard Manajemen:
            </p>

            <div className="space-y-2">
              <button
                onClick={() => router.push('/admin/members')}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-400 border border-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>👥 Approval Anggota</span>
              </button>
              <button
                onClick={() => router.push('/admin/submissions')}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-sky-400 border border-sky-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>📝 Periksa Jawaban Peserta</span>
              </button>
              <button
                onClick={() => router.push('/admin/materials')}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-rose-400 border border-rose-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>📁 Upload Materi NPT (1 – 6)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
