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
  ShieldCheck
} from 'lucide-react';

const SUPER_ADMIN_EMAILS = [
  'imannurjamanreborn@gmail.com',
  'admin@nptcentre.id',
  'admin@neuroprogrammingtraining.id'
];

export default function CosmicGatewayPage() {
  const router = useRouter();
  const [isSecretModalOpen, setIsSecretModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [inputEmail, setInputEmail] = useState('');
  const [inputName, setInputName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginMessage, setLoginMessage] = useState('');

  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem('npt_user_auth');
      if (savedAuth) {
        setCurrentUser(JSON.parse(savedAuth));
      }
    } catch (e) {
      console.error('Error reading auth:', e);
    }
  }, []);

  // Masuk ke Portal Utama (Pengunjung Umum)
  const handleEnterPortal = () => {
    router.push('/hakekat-cinta');
  };

  // Login Pintu Rahasia Khadim / Admin
  const handleSecretLogin = async (e) => {
    e.preventDefault();
    const cleanEmail = inputEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      alert('Masukkan alamat email Gmail yang valid!');
      return;
    }

    const cleanName = inputName.trim() || cleanEmail.split('@')[0];
    const isAdmin = SUPER_ADMIN_EMAILS.includes(cleanEmail);

    setIsSubmitting(true);
    setLoginMessage('');

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
      setLoginMessage('👑 Akses Super Admin Terbuka!');
      setTimeout(() => {
        router.push('/admin/members');
      }, 700);
      return;
    }

    // Untuk Member / Khadim
    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (existingProfile && existingProfile.status === 'approved') {
        const userData = {
          id: existingProfile.id,
          email: cleanEmail,
          name: existingProfile.full_name || cleanName,
          role: 'member',
          status: 'approved'
        };
        setCurrentUser(userData);
        localStorage.setItem('npt_user_auth', JSON.stringify(userData));
        localStorage.setItem('participant_name', userData.name);
        setLoginMessage('⭐ Akses Khadim & Member Aktif!');
        setTimeout(() => {
          router.push('/hakekat-cinta');
        }, 700);
      } else {
        // Daftarkan pending jika belum ada
        if (!existingProfile) {
          await supabase.from('profiles').insert([
            {
              full_name: cleanName,
              email: cleanEmail,
              role: 'member',
              status: 'pending'
            }
          ]);
        }
        setLoginMessage('⏳ Akun dalam antrean persetujuan admin.');
      }
    } catch (err) {
      console.error(err);
      setLoginMessage('Terjadi kesalahan koneksi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      onClick={handleEnterPortal}
      className="relative min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col items-center justify-center select-none overflow-hidden cursor-pointer font-sans"
    >
      {/* Background Batik Watermark Mistik & Sufistik */}
      <div 
        className="absolute inset-0 z-0 opacity-15 bg-center bg-cover pointer-events-none transition-opacity duration-1000"
        style={{ backgroundImage: "url('/bg-batik.png')" }}
      />

      {/* Cosmic Radial Glow Aura */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(225,29,72,0.18)_0%,rgba(2,6,23,0.85)_55%,rgba(2,6,23,0.98)_100%)] pointer-events-none" />

      {/* 4 Ikon Penjuru Kosmik (Easter Egg) */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Top Left: Bintang Kosmik */}
        <div className="absolute top-4 left-4 p-3 text-slate-400/30 hover:text-slate-200 transition-colors">
          <Sparkles className="w-5 h-5" />
        </div>

        {/* Top Right: Pintu Rahasia Khadim & Admin (ACTIVE) */}
        <div 
          onClick={(e) => {
            e.stopPropagation();
            setIsSecretModalOpen(true);
          }}
          className="absolute top-4 right-4 p-3 text-slate-400/40 hover:text-amber-400 hover:scale-125 transition-all duration-300 pointer-events-auto cursor-pointer group"
          title="Pintu Masuk Khadim & Admin"
        >
          <Layers className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="absolute -bottom-1 right-2 w-1.5 h-1.5 rounded-full bg-amber-400/0 group-hover:bg-amber-400 transition-colors" />
        </div>

        {/* Bottom Left: Kompas Batin */}
        <div className="absolute bottom-4 left-4 p-3 text-slate-400/30 hover:text-slate-200 transition-colors">
          <Compass className="w-5 h-5" />
        </div>

        {/* Bottom Right: Perisai Hakikat */}
        <div className="absolute bottom-4 right-4 p-3 text-slate-400/30 hover:text-slate-200 transition-colors">
          <Shield className="w-5 h-5" />
        </div>
      </div>

      {/* Pusat Simbol & Identitas Sufistik NPT */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-lg space-y-6">
        {/* Logo Lingkaran Merah NPT dengan Denyut Napas Kosmik */}
        <div className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-tr from-rose-600/30 via-red-500/20 to-amber-500/30 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-1000 animate-pulse" />
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-slate-900/90 border border-rose-500/30 p-3 shadow-2xl shadow-rose-950 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-500">
            <Image
              src="/iconnpt-512x512.png"
              alt="Logo Resmi NPT"
              width={110}
              height={110}
              className="object-contain filter drop-shadow-md"
              priority
            />
          </div>
        </div>

        {/* Judul & Makna Sufistik */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold tracking-widest uppercase">
            <span>🔴⚪ Merah Putih NPT</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-serif">
            NPT CENTRE
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium tracking-wide">
            Nalungtik Titik Manggih Diri • Hakikat Cinta & 14 Akar Spiritual
          </p>
        </div>

        {/* Petunjuk Masuk Beranimasi Lembut */}
        <div className="pt-6 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-rose-300/90 animate-bounce">
            <span>✨ Ketuk layar untuk memasuki ruang kesadaran</span>
            <ArrowRight className="w-4 h-4" />
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            neuroprogrammingtraining.id
          </p>
        </div>
      </div>

      {/* MODAL PINTU RAHASIA KHADIM & ADMIN */}
      {isSecretModalOpen && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-sm bg-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl shadow-amber-950/50 space-y-5">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Crown className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">
                    Gerbang Khadim & Admin
                  </h3>
                  <p className="text-[10px] text-amber-400/80 font-mono">
                    Pintu Akses Ruang Approval & VIP
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsSecretModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Link jika sudah ada sesi admin */}
            {currentUser?.role === 'super_admin' ? (
              <div className="space-y-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Sesi Super Admin Terdeteksi</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Login aktif: <span className="font-mono text-white">{currentUser.email}</span>
                </p>
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => router.push('/admin/members')}
                    className="w-full py-2 px-3 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-between cursor-pointer"
                  >
                    <span>👥 Buka Ruang Approval Member</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => router.push('/admin/submissions')}
                    className="w-full py-2 px-3 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-between cursor-pointer"
                  >
                    <span>📊 Rekap Jawaban Peserta</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Form Login Email Cepat */
              <form onSubmit={handleSecretLogin} className="space-y-3 text-left">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    placeholder="Nama Anda..."
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Email Gmail Akun
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="contoh: imannurjamanreborn@gmail.com"
                    value={inputEmail}
                    onChange={(e) => setInputEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                {loginMessage && (
                  <p className="text-xs font-semibold text-amber-400 animate-pulse">
                    {loginMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white shadow-md shadow-amber-600/20 transition-all cursor-pointer"
                >
                  {isSubmitting ? 'Memeriksa Kunci...' : 'Buka Gerbang Khadim / Admin'}
                </button>
              </form>
            )}

            {/* Shortcut Navigasi Pengunjung */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Pengunjung Umum:</span>
              <button
                onClick={handleEnterPortal}
                className="text-rose-400 hover:underline font-bold cursor-pointer"
              >
                Masuk Langsung ➔
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
