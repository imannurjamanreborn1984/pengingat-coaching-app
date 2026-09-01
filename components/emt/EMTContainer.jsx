"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { AppNavbar, AppSidebar } from '../layout/AppNavbar';
import {
  GraduationCap,
  Sparkles,
  Heart,
  Brain,
  Compass,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  Send,
  Users,
  BookOpen,
  Award,
  Building,
  Phone,
  Mail,
  ShieldCheck,
  ChevronRight,
  User,
  Star,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

export default function EMTContainer() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'program' | 'event' | 'ekosistem'

  // Form State
  const [formData, setFormData] = useState({
    nama: '',
    sekolah: '',
    jabatan: '',
    wa: '',
    email: '',
    jumlah: 1,
    pembayaran: 'Transfer Bank'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Check login user
  useEffect(() => {
    try {
      const authStr = localStorage.getItem('npt_user_auth');
      if (authStr) {
        setCurrentUser(JSON.parse(authStr));
      }
    } catch (e) {}
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    let formattedPhone = formData.wa ? formData.wa.replace(/[^0-9]/g, "") : "";
    if (formattedPhone.startsWith("0")) formattedPhone = "62" + formattedPhone.slice(1);

    try {
      // 1. Simpan ke database Supabase jika belum ada
      if (supabase) {
        await supabase.from("profiles").insert([
          {
            full_name: formData.nama,
            email: formData.email ? formData.email.trim().toLowerCase() : null,
            phone_number: formattedPhone || null,
            role: "member",
            status: "pending"
          }
        ]);
      }
    } catch (err) {
      console.warn("Info: Data form diproses offline/langsung ke WhatsApp.");
    } finally {
      setIsSubmitting(false);
      setSubmitSuccess(true);

      // 2. Format pesan WhatsApp
      const noAdmin = "6289658496343"; // Teh Al Hanifah
      const pesan = `Halo Teh Al Hanifah (Admin EMT NPT),

Saya ingin mendaftar Program *EMT For Teacher* (Sabtu, 5 Sept 2026).

*--- Data Pendaftar ---*
👤 *Nama Lengkap:* ${formData.nama}
🏫 *Asal Sekolah/Instansi:* ${formData.sekolah}
💼 *Jabatan:* ${formData.jabatan}
📱 *No. WhatsApp:* ${formData.wa}
✉️ *Email:* ${formData.email}
👥 *Jumlah Peserta:* ${formData.jumlah} Orang
💳 *Metode Pembayaran:* ${formData.pembayaran}

Mohon informasi mengenai prosedur registrasi dan pembayarannya. Terima kasih!`;

      const urlWA = `https://wa.me/${noAdmin}?text=${encodeURIComponent(pesan)}`;
      window.open(urlWA, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      {/* Top Navbar & Sidebar */}
      <AppNavbar 
        onToggleSidebar={() => setIsSidebarOpen(true)}
        currentUser={currentUser}
        activeTitle="EMT - Pelatihan Emosi Guru"
      />
      <AppSidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentUser={currentUser}
        activePath="/emt"
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 pb-24 space-y-8">
        
        {/* HERO BANNER: EMERALD & GOLD LUXURY */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 border border-emerald-500/30 p-6 sm:p-10 shadow-2xl shadow-emerald-950/50">
          <div className="absolute top-0 right-0 w-96 h-96 bg-radial from-amber-500/15 via-emerald-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-radial from-emerald-600/20 to-transparent rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold tracking-wide uppercase shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Sayap Pendidik NPT • EMT for Teacher</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Emotion Management Training <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-emerald-300">(EMT)</span>
            </h1>

            <p className="text-emerald-100/90 text-sm sm:text-base font-medium italic">
              "Untuk Guru Hebat, Kelas Bermanfaat"
            </p>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
              Program pelatihan dan pembinaan kesadaran emosi khusus guru & praktisi pendidikan. Mengintegrasikan prinsip <em>Neuro Programming Training</em> untuk melahirkan guru yang tenang, penuh cinta, dan mampu menghadirkan atmosfer kelas yang bahagia serta bermakna bagi murid.
            </p>

            {/* Quick CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="#event-daftar"
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-extrabold shadow-lg shadow-amber-500/30 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-slate-950" />
                <span>Daftar Workshop Terdekat</span>
              </a>

              <a
                href="#program-level"
                className="px-4 py-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-emerald-300 text-xs font-bold border border-emerald-500/30 transition-all flex items-center gap-2"
              >
                <GraduationCap className="w-4 h-4 text-amber-400" />
                <span>Jelajahi 3 Level Program</span>
              </a>
            </div>
          </div>
        </section>

        {/* QUOTE CARD */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-emerald-500/20 flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-semibold text-slate-200 italic">
              "Guru yang tenang akan melahirkan kelas yang nyaman. Kelas yang nyaman akan melahirkan generasi yang hebat."
            </p>
            <p className="text-[11px] text-amber-400 font-bold mt-0.5">
              — Iman Nurjaman, M.Pd (Praktisi NPT & Founder EMT)
            </p>
          </div>
        </div>

        {/* 4 PILAR FILOSOFI EMT */}
        <section className="space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
              4 Nilai Filosofi & Transformasi EMT
            </h2>
            <p className="text-xs text-slate-400 max-w-lg mx-auto">
              Bagaimana EMT mentransformasikan suasana batin guru dan murid di ruang kelas:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Brain className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-bold text-sm text-white">Self-Awareness</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Mengenali pemicu stres, kelelahan mental, dan gelombang emosi diri sebelum menginjakkan kaki di kelas.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <Compass className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-bold text-sm text-white">Self-Regulation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Teknik olah nafas dan jeda sadar untuk meredakan amarah serta respons reaktif saat menghadapi perilaku murid.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
                <Heart className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-bold text-sm text-white">Compassionate Teaching</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Mengajar dengan pancaran kasih sayang tulus sehingga materi pelajaran mudah menembus hati murid.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
                <Users className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-bold text-sm text-white">Classroom Resonance</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Membangun iklim kelas yang aman, bebas intimidasi, dan mendukung tumbuhnya kreativitas siswa.
              </p>
            </div>
          </div>
        </section>

        {/* 3 LEVEL PROGRAM TRAINING */}
        <section id="program-level" className="space-y-4 pt-4">
          <div className="text-center space-y-1">
            <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
              Jenjang Kurikulum Pelatihan EMT
            </h2>
            <p className="text-xs text-slate-400">
              Dirancang berjenjang untuk memastikan perubahan nyata pada kepribadian dan keterampilan guru:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Level 1 */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-4 shadow-xl">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    LEVEL 1
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">1 Hari Intensif</span>
                </div>
                <h3 className="text-base font-extrabold text-white">
                  Basic Emotional Awareness
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Fondasi pemahaman cara kerja otak emosi (Amigdala & Prefrontal Cortex), mengenali luka batin pendidik, dan teknik regulasi awal.
                </p>
                <ul className="space-y-2 pt-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Mindful Breathing for Teachers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Pemetaan Emosi & Pemicu Kemarahan</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Latihan Melepaskan Burnout Harian</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Level 2 */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-900/90 border-2 border-amber-500/40 relative flex flex-col justify-between space-y-4 shadow-xl shadow-amber-500/10">
              <div className="absolute -top-3 right-6 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black tracking-wider uppercase shadow-md">
                Paling Diminati
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    LEVEL 2
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">2 Hari Workshop</span>
                </div>
                <h3 className="text-base font-extrabold text-white">
                  Classroom Emotional Management
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Penerapan praktis di ruang kelas: komunikasi empati tanpa membentak, de-eskalasi amukan siswa, dan membangun budaya belajar menyenangkan.
                </p>
                <ul className="space-y-2 pt-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Bahasa Kasih Guru & Komunikasi Tanpa Kekerasan</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Handling Kasus Siswa Sulit & Tantrum</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Ice Breaking Penstabil Gelombang Otak</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Level 3 */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-4 shadow-xl">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    LEVEL 3
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">Mastery & Sertifikasi</span>
                </div>
                <h3 className="text-base font-extrabold text-white">
                  Teacher as Emotional Coach
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Membekali guru menjadi konselor dan coach emosi bagi murid, rekan sejawat, serta pendampingan budaya sekolah (*School Emotional Culture*).
                </p>
                <ul className="space-y-2 pt-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Teknik Coaching 1-on-1 dengan Siswa</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Audit Budaya Emosi Sekolah</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Sertifikat Lisensi Fasilitator EMT</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* EVENT TERDEKAT & FORM PENDAFTARAN */}
        <section id="event-daftar" className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
          
          {/* Left Column: Event Information Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-900 border border-amber-500/30 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-amber-400">
                <Calendar className="w-5 h-5" />
                <span className="text-xs font-black tracking-wider uppercase">Event Mendatang</span>
              </div>

              <h3 className="text-xl font-black text-white">
                Workshop EMT For Teacher
              </h3>
              <p className="text-xs text-emerald-200 italic">
                "Untuk Guru Hebat, Kelas Bermanfaat"
              </p>

              <div className="space-y-3 text-xs text-slate-300 pt-2 border-t border-slate-800">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Lokasi Pelaksanaan:</strong>
                    <p className="text-slate-400">Alhambra Hotel & Convention Hall</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Hari / Tanggal:</strong>
                    <p className="text-slate-400">Sabtu, 5 September 2026</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Waktu:</strong>
                    <p className="text-slate-400">08.00 – 12.30 WIB</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <User className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Narasumber Utama:</strong>
                    <p className="text-amber-300 font-bold">IMAN NURJAMAN, M.Pd</p>
                    <p className="text-[11px] text-slate-400">Praktisi NPT & Direktur Edusee</p>
                  </div>
                </div>
              </div>

              {/* Price Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Investasi Normal:</span>
                  <del className="text-xs text-slate-500 font-bold">Rp 500.000</del>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[9px] font-black uppercase">
                    SPECIAL PRICE
                  </span>
                  <div className="text-lg font-black text-amber-400">Rp 250.000</div>
                  <span className="text-[10px] text-amber-500/90 font-medium block">*Khusus 30 Pendaftar Pertama</span>
                </div>
              </div>

              {/* Contact Person */}
              <div className="pt-2 text-xs space-y-1.5 text-slate-400 border-t border-slate-800">
                <span className="font-bold text-slate-300">📞 Kontak Admin Pendaftaran:</span>
                <div className="flex flex-wrap gap-3 text-emerald-400 font-semibold">
                  <a href="https://wa.me/6289658496343" target="_blank" className="hover:underline flex items-center gap-1">
                    <span>• Teh Al Hanifah: 0896-5849-6343</span>
                  </a>
                  <a href="https://wa.me/6282119279986" target="_blank" className="hover:underline flex items-center gap-1">
                    <span>• Teh Nia: 0821-1927-9986</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Registration Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4 text-left">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Formulir Registrasi Peserta Guru
                </h3>
                <p className="text-xs text-slate-400">
                  Lengkapi data Anda di bawah ini untuk konfirmasi tiket dan otomatis terhubung ke WhatsApp Admin:
                </p>
              </div>

              {submitSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Data Anda berhasil diproses! WhatsApp konfirmasi pendaftaran sedang terbuka.</span>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Nama Lengkap & Gelar *
                    </label>
                    <input
                      type="text"
                      name="nama"
                      required
                      value={formData.nama}
                      onChange={handleChange}
                      placeholder="Contoh: Siti Rahmawati, S.Pd"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Asal Sekolah / Instansi *
                    </label>
                    <input
                      type="text"
                      name="sekolah"
                      required
                      value={formData.sekolah}
                      onChange={handleChange}
                      placeholder="Contoh: SMAN 1 Tasikmalaya"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Jabatan / Peran di Sekolah *
                    </label>
                    <input
                      type="text"
                      name="jabatan"
                      required
                      value={formData.jabatan}
                      onChange={handleChange}
                      placeholder="Contoh: Guru Kelas / Guru BK / Kepala Sekolah"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Nomor WhatsApp Aktif *
                    </label>
                    <input
                      type="tel"
                      name="wa"
                      required
                      value={formData.wa}
                      onChange={handleChange}
                      placeholder="08123456789"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Alamat Email Gmail *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="nama@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Jumlah Peserta
                    </label>
                    <input
                      type="number"
                      name="jumlah"
                      min="1"
                      value={formData.jumlah}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Rencana Metode Pembayaran
                  </label>
                  <select
                    name="pembayaran"
                    value={formData.pembayaran}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                  >
                    <option value="Transfer Bank">Transfer Bank (BCA / Mandiri / BSI)</option>
                    <option value="QRIS">QRIS Instan</option>
                    <option value="Tunai di Lokasi">Tunai di Meja Registrasi</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-600 hover:from-emerald-500 hover:to-amber-500 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-emerald-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? "Memproses Data..." : "DAFTAR SEKARANG VIA WHATSAPP RESMI"}</span>
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* EKOSISTEM & LAYANAN LANJUTAN ALUMNI GURU EMT */}
        <section className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
              Ekosistem & Layanan Berkelanjutan EMT
            </h2>
            <p className="text-xs text-slate-400 max-w-lg mx-auto">
              Setelah pelatihan, para guru dan alumni mendapatkan akses pendampingan terpadu melalui NPT Centre:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Users className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-white">Komunitas Guru EMT</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Forum diskusi bulanan untuk saling berbagi studi kasus dan teknik penanganan dinamika emosi murid di kelas.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <BookOpen className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-white">E-Library & Resource</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Akses worksheet regulasi emosi, template jurnal refleksi mengajar harian, serta panduan praktis untuk alumni.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
                <Award className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-white">E-Sertifikat Terverifikasi</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Sistem validasi kelulusan dan sertifikat resmi digital berbasis kode unik verifikasi portal.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
                <Building className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-white">Konsultasi Sekolah</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Layanan in-house training dan pendampingan transformasi budaya emosi lembaga/sekolah secara menyeluruh.
              </p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
