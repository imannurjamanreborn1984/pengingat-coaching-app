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
  MessageSquare,
  FileText,
  Lock,
  PlusCircle,
  Flame,
  Activity,
  CheckSquare,
  Square,
  Download,
  Share2,
  RefreshCw,
  Sun,
  Moon,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Daftar Angkatan EMT
const DAFTAR_ANGKATAN = [
  {
    id: 'batch-1',
    nama: 'EMT Batch 1 — Khusus Pendidik & Guru Hebat',
    tipe: 'Pendidik / Sekolah',
    periode: 'September – Oktober 2026',
    pesertaCount: 32,
    deskripsi: 'Program pembinaan kesadaran emosi guru untuk menghadirkan kelas bahagia, tenang, dan bermakna.',
    status: 'Aktif Berjalan'
  },
  {
    id: 'batch-2',
    nama: 'EMT Batch 2 — Emotional Mastery (Reguler & Umum)',
    tipe: 'Reguler / Umum',
    periode: 'Oktober – November 2026',
    pesertaCount: 24,
    deskripsi: 'Pelatihan regulasi emosi personal, pelepasan trauma bawah sadar, dan komunikasi relasional.',
    status: 'Segera Dibuka'
  },
  {
    id: 'batch-3',
    nama: 'EMT Batch 3 — Energy Flow & Somatic Healing',
    tipe: 'Pendalaman Lanjut',
    periode: 'November – Desember 2026',
    pesertaCount: 18,
    deskripsi: 'Pendalaman olah energi nafas batin, neuro-somatic release, dan pendampingan coaching intensif.',
    status: 'Persiapan'
  }
];

// 4 Modul Pembelajaran per Angkatan
const MODUL_KELAS = [
  {
    sesi: 1,
    judul: 'Sesi 1: Self-Awareness & Peta Deteksi Emosi Diri',
    durasi: '120 Menit',
    youtubeUrl: 'https://youtube.com/watch?v=rq5WTh99k7M',
    ringkasan: 'Mengenali pemicu stres, kelelahan mental, dan gelombang emosi tersembunyi sebelum mengajar atau berinteraksi.',
    tugas: 'Lakukan audit emosi pagi dan catat 3 pemicu rasa tidak nyaman hari ini di lembar jurnal.'
  },
  {
    sesi: 2,
    judul: 'Sesi 2: Somatic Release & Regulasi Saraf Vagus',
    durasi: '90 Menit',
    youtubeUrl: '',
    ringkasan: 'Teknik olah nafas 4-4-8 dan somatic grounding untuk meredakan amarah serta respon reaktif saat menghadapi situasi menantang.',
    tugas: 'Praktikkan 15 menit pernapasan ritmik somatik saat jeda siang atau sore hari.'
  },
  {
    sesi: 3,
    judul: 'Sesi 3: Compassionate Teaching & Komunikasi Hati',
    durasi: '100 Menit',
    youtubeUrl: '',
    ringkasan: 'Menyalurkan frekuensi kasih sayang tulus agar materi dan interaksi mampu menembus hati murid tanpa paksaan.',
    tugas: 'Terapkan teknik mendengarkan penuh (deep listening) tanpa menghakimi kepada minimal 1 murid/rekan.'
  },
  {
    sesi: 4,
    judul: 'Sesi 4: Classroom Resonance & Integrasi Cinta Semesta',
    durasi: '120 Menit',
    youtubeUrl: '',
    ringkasan: 'Membangun atmosfer kelas yang aman, bebas intimidasi, dan mendukung kreativitas serta ketenangan batin bersama.',
    tugas: 'Buat rencana aksi kelas bahagia (Classroom Joy Plan) untuk 1 bulan ke depan.'
  }
];

// Template 21 Hari Self-Healing
const INITIAL_21_DAYS = Array.from({ length: 21 }, (_, i) => {
  const day = i + 1;
  let fase = 1;
  let faseName = "Fase 1: Rilis & Detoks Emosi";
  let prompt = "Pelepasan beban pikiran & emosi tertahan";

  if (day > 14) {
    fase = 3;
    faseName = "Fase 3: Transformasi Cinta & Istiqomah";
    prompt = "Pancaran kasih sayang, kedamaian & integrasi batin";
  } else if (day > 7) {
    fase = 2;
    faseName = "Fase 2: Rekalibrasi Somatik & Keheningan";
    prompt = "Penyelarasan nafas dada & saraf vagus parasimpatis";
  }

  return {
    day,
    fase,
    faseName,
    prompt,
    completed: false,
    completedAt: null,
    note: ''
  };
});

export default function EMTContainer() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isKitabTheme, setIsKitabTheme] = useState(true);
  
  // Tab Utama: 'overview' | 'kelas' | 'selfhealing' | 'event'
  const [activeTab, setActiveTab] = useState('overview');

  // Tab di dalam Ruang Kelas: 'modul' | 'jurnal' | 'peserta'
  const [subTabKelas, setSubTabKelas] = useState('jurnal');

  // Angkatan Terpilih
  const [selectedBatch, setSelectedBatch] = useState('batch-1');

  // Form Registrasi Workshop
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

  // State Jurnal Refleksi Batin EMT
  const [journalForm, setJournalForm] = useState({
    nama: '',
    tanggal: new Date().toISOString().split('T')[0],
    kondisiEmosi: 'Bahagia',
    triggerEmosi: '',
    responTubuh: '',
    teknikPraktik: 'Nafas Ritmik 4-4-8',
    kesadaranBaru: ''
  });
  const [journalEntries, setJournalEntries] = useState([]);
  const [isSavingJournal, setIsSavingJournal] = useState(false);

  // State 21-Day Self Healing Tracker
  const [healingDays, setHealingDays] = useState(INITIAL_21_DAYS);
  const [activeDayEdit, setActiveDayEdit] = useState(null);
  const [dayNoteInput, setDayNoteInput] = useState('');

  // Cek Auth & Load Data Tersimpan
  useEffect(() => {
    try {
      const authStr = localStorage.getItem('npt_user_auth');
      if (authStr) {
        const user = JSON.parse(authStr);
        setCurrentUser(user);
        if (user.name) {
          setJournalForm((prev) => ({ ...prev, nama: user.name }));
        }
      }

      // Load Jurnal Tersimpan
      const savedJournals = localStorage.getItem('emt_journal_entries');
      if (savedJournals) {
        setJournalEntries(JSON.parse(savedJournals));
      }

      // Load 21 Days Tracker
      const userKey = currentUser?.email || 'default_user';
      const savedDays = localStorage.getItem(`emt_selfhealing_21_days_${userKey}`);
      if (savedDays) {
        setHealingDays(JSON.parse(savedDays));
      }
    } catch (e) {}
  }, []);

  // Simpan 21 Days Tracker ke LocalStorage setiap kali berubah
  const handleToggleDay = (dayNum) => {
    const userKey = currentUser?.email || 'default_user';
    const updated = healingDays.map((item) => {
      if (item.day === dayNum) {
        const nextState = !item.completed;
        return {
          ...item,
          completed: nextState,
          completedAt: nextState ? new Date().toLocaleString('id-ID') : null
        };
      }
      return item;
    });
    setHealingDays(updated);
    try {
      localStorage.setItem(`emt_selfhealing_21_days_${userKey}`, JSON.stringify(updated));
    } catch (e) {}
  };

  const handleSaveDayNote = (dayNum) => {
    const userKey = currentUser?.email || 'default_user';
    const updated = healingDays.map((item) => {
      if (item.day === dayNum) {
        return {
          ...item,
          note: dayNoteInput,
          completed: true,
          completedAt: item.completedAt || new Date().toLocaleString('id-ID')
        };
      }
      return item;
    });
    setHealingDays(updated);
    try {
      localStorage.setItem(`emt_selfhealing_21_days_${userKey}`, JSON.stringify(updated));
    } catch (e) {}
    setActiveDayEdit(null);
    setDayNoteInput('');
  };

  // Hitung Progress 21 Hari
  const completedCount = healingDays.filter((d) => d.completed).length;
  const progressPercent = Math.round((completedCount / 21) * 100);

  // Simpan Form Jurnal Refleksi
  const handleSaveJournal = async (e) => {
    e.preventDefault();
    if (!journalForm.nama.trim()) return alert("Nama peserta wajib diisi!");
    if (!journalForm.kesadaranBaru.trim()) return alert("Tuliskan kesadaran / hikmah yang Anda peroleh!");

    setIsSavingJournal(true);
    const newEntry = {
      id: `emt-jurnal-${Date.now()}`,
      batchId: selectedBatch,
      ...journalForm,
      createdAt: new Date().toISOString()
    };

    const updated = [newEntry, ...journalEntries];
    setJournalEntries(updated);
    try {
      localStorage.setItem('emt_journal_entries', JSON.stringify(updated));
      
      // Kirim juga ke Supabase jika online
      if (supabase) {
        await supabase.from("submissions").insert([
          {
            user_name: journalForm.nama,
            answer_text: `[JURNAL EMT - ${selectedBatch.toUpperCase()}]\nKondisi Emosi: ${journalForm.kondisiEmosi}\nTrigger: ${journalForm.triggerEmosi}\nRespon Tubuh: ${journalForm.responTubuh}\nTeknik: ${journalForm.teknikPraktik}\nHikmah/Kesadaran Baru:\n${journalForm.kesadaranBaru}`
          }
        ]);
      }
    } catch (err) {
      console.warn("Jurnal disimpan lokal:", err.message);
    } finally {
      setIsSavingJournal(false);
      alert("✅ Jurnal Refleksi EMT Berhasil Disetor!");
      setJournalForm((prev) => ({
        ...prev,
        triggerEmosi: '',
        responTubuh: '',
        kesadaranBaru: ''
      }));
    }
  };

  // Salin / Kirim Progress 21 Hari ke WA Mentor
  const handleShare21DaysToWA = () => {
    const activeBatchData = DAFTAR_ANGKATAN.find(b => b.id === selectedBatch);
    const namaUser = currentUser?.name || journalForm.nama || "Peserta EMT";
    
    let text = `*LAPORAN CHECKLIST SELF-HEALING 21 HARI EMT*\n`;
    text += `👤 *Nama Peserta:* ${namaUser}\n`;
    text += `🏫 *Angkatan:* ${activeBatchData?.nama || selectedBatch}\n`;
    text += `📊 *Kemajuan:* ${completedCount}/21 Hari (${progressPercent}% Selesai)\n\n`;
    text += `*--- Rincian Catatan Latihan ---*\n`;

    healingDays.forEach((d) => {
      if (d.completed) {
        text += `✅ *Hari ke-${d.day}* (${d.faseName}): ${d.note ? `"${d.note}"` : 'Terlaksana'} [${d.completedAt || 'Selesai'}]\n`;
      }
    });

    const noMentor = "6289658496343"; // Kontak Mentor / Admin EMT
    window.open(`https://wa.me/${noMentor}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    let formattedPhone = formData.wa ? formData.wa.replace(/[^0-9]/g, "") : "";
    if (formattedPhone.startsWith("0")) formattedPhone = "62" + formattedPhone.slice(1);

    try {
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
      console.warn("Info: Form diproses langsung ke WA.");
    } finally {
      setIsSubmitting(false);
      setSubmitSuccess(true);

      const noAdmin = "6289658496343";
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

      window.open(`https://wa.me/${noAdmin}?text=${encodeURIComponent(pesan)}`, "_blank");
    }
  };

  const activeBatchData = DAFTAR_ANGKATAN.find(b => b.id === selectedBatch) || DAFTAR_ANGKATAN[0];

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${
      isKitabTheme 
        ? 'bg-parchment text-[#231409]' 
        : 'bg-slate-950 text-slate-100 selection:bg-emerald-600 selection:text-white'
    }`}>
      {/* Top Navbar & Sidebar */}
      <AppNavbar 
        onToggleSidebar={() => setIsSidebarOpen(true)}
        currentUser={currentUser || { name: "Peserta EMT", role: "member" }}
        activeTitle="EMT - Pelatihan Emosi Guru"
      />
      <AppSidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentUser={currentUser || { name: "Peserta EMT", role: "member" }}
        activePath="/emt"
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 pb-24 space-y-6">
        
        {/* NAVIGASI TAB UTAMA EMT */}
        <div className={`p-2 rounded-2xl flex flex-wrap items-center justify-between gap-2 border shadow-xs ${
          isKitabTheme 
            ? 'bg-[#f4ebd5] border-[#d8c3a1]' 
            : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                activeTab === 'overview'
                  ? isKitabTheme 
                    ? 'bg-[#3a2211] text-[#fbf6ec] border-[#8f632d] shadow-sm' 
                    : 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/30'
                  : isKitabTheme 
                    ? 'text-[#634224] hover:bg-[#ebdcc4] border-transparent' 
                    : 'text-slate-400 hover:text-white border-transparent'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Profil & Kurikulum EMT</span>
            </button>

            <button
              onClick={() => setActiveTab('kelas')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                activeTab === 'kelas'
                  ? isKitabTheme 
                    ? 'bg-[#3a2211] text-[#fbf6ec] border-[#8f632d] shadow-sm' 
                    : 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/30'
                  : isKitabTheme 
                    ? 'text-[#634224] hover:bg-[#ebdcc4] border-transparent' 
                    : 'text-slate-400 hover:text-white border-transparent'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-amber-500" />
              <span>Ruang Kelas Angkatan & Jurnal</span>
              <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full">
                HOT
              </span>
            </button>

            <button
              onClick={() => setActiveTab('selfhealing')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                activeTab === 'selfhealing'
                  ? isKitabTheme 
                    ? 'bg-[#3a2211] text-[#fbf6ec] border-[#8f632d] shadow-sm' 
                    : 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/30'
                  : isKitabTheme 
                    ? 'text-[#634224] hover:bg-[#ebdcc4] border-transparent' 
                    : 'text-slate-400 hover:text-white border-transparent'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-rose-500" />
              <span>Checklist Self-Healing 21 Hari ({progressPercent}%)</span>
            </button>

            <button
              onClick={() => setActiveTab('event')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                activeTab === 'event'
                  ? isKitabTheme 
                    ? 'bg-[#3a2211] text-[#fbf6ec] border-[#8f632d] shadow-sm' 
                    : 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/30'
                  : isKitabTheme 
                    ? 'text-[#634224] hover:bg-[#ebdcc4] border-transparent' 
                    : 'text-slate-400 hover:text-white border-transparent'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Jadwal Workshop & Registrasi</span>
            </button>
          </div>

          {/* Toggle Mode Kitab */}
          <button
            onClick={() => setIsKitabTheme(!isKitabTheme)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition cursor-pointer ${
              isKitabTheme
                ? 'bg-[#ebdcc4] text-[#3a2211] border-[#cbb38b] hover:bg-[#dfcdab]'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            {isKitabTheme ? <Moon className="w-3.5 h-3.5 text-amber-700" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isKitabTheme ? 'Mode Gelap' : 'Mode Kitab'}</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW & FILOSOFI EMT                                            */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* HERO BANNER */}
            <section className={`relative overflow-hidden rounded-3xl p-6 sm:p-10 shadow-xl ${
              isKitabTheme
                ? 'card-kitab-frame border-[#cbb38b]'
                : 'bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 border border-emerald-500/30'
            }`}>
              <div className="relative z-10 max-w-3xl space-y-4">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase border ${
                  isKitabTheme
                    ? 'bg-[#ebdcc4] text-[#4a2e12] border-[#cbb38b]'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                }`}>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Sayap Pendidik NPT • EMT for Teacher</span>
                </div>

                <h1 className={`text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight ${
                  isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-white'
                }`}>
                  Emotion Management Training <span className={isKitabTheme ? 'text-[#9e2a2b]' : 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-emerald-300'}>(EMT)</span>
                </h1>

                <p className={`text-sm sm:text-base font-medium italic ${
                  isKitabTheme ? 'text-[#734822]' : 'text-emerald-100/90'
                }`}>
                  "Untuk Guru Hebat, Kelas Bermanfaat"
                </p>

                <p className={`text-xs sm:text-sm leading-relaxed max-w-2xl ${
                  isKitabTheme ? 'text-[#3d2514]' : 'text-slate-300'
                }`}>
                  Program pelatihan dan pembinaan kesadaran emosi khusus guru & praktisi pendidikan. Mengintegrasikan prinsip <em>Neuro Programming Training</em> untuk melahirkan guru yang tenang, penuh cinta, dan mampu menghadirkan atmosfer kelas yang bahagia serta bermakna bagi murid.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setActiveTab('kelas')}
                    className={`px-5 py-3 rounded-2xl text-xs font-bold shadow-md active:scale-95 transition flex items-center gap-2 cursor-pointer ${
                      isKitabTheme
                        ? 'bg-[#9e2a2b] hover:bg-[#852324] text-white'
                        : 'bg-gradient-to-r from-emerald-600 to-amber-600 text-white shadow-emerald-600/30'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Masuk Ruang Kelas Angkatan</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('selfhealing')}
                    className={`px-4 py-3 rounded-2xl text-xs font-bold border transition flex items-center gap-2 cursor-pointer ${
                      isKitabTheme
                        ? 'bg-[#eee3cb] text-[#543516] border-[#d8c3a1] hover:bg-[#dfcdab]'
                        : 'bg-slate-900 hover:bg-slate-800 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    <Activity className="w-4 h-4 text-rose-500" />
                    <span>Buka Checklist Self-Healing 21 Hari</span>
                  </button>
                </div>
              </div>
            </section>

            {/* QUOTE CARD */}
            <div className={`p-5 rounded-2xl flex items-center gap-3.5 shadow-sm border ${
              isKitabTheme ? 'card-kitab-frame' : 'bg-slate-900/60 border-emerald-500/20'
            }`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                isKitabTheme ? 'bg-[#ebdcc4] text-[#8f632d] border-[#cbb38b]' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <p className={`text-xs sm:text-sm font-semibold italic ${
                  isKitabTheme ? 'text-[#26150a]' : 'text-slate-200'
                }`}>
                  "Guru yang tenang akan melahirkan kelas yang nyaman. Kelas yang nyaman akan melahirkan generasi yang hebat."
                </p>
                <p className={`text-[11px] font-bold mt-0.5 ${
                  isKitabTheme ? 'text-[#9e2a2b]' : 'text-amber-400'
                }`}>
                  — Iman Nurjaman, M.Pd (Praktisi NPT & Founder EMT)
                </p>
              </div>
            </div>

            {/* 4 PILAR FILOSOFI EMT */}
            <section className="space-y-4">
              <h2 className={`text-lg sm:text-xl font-bold ${
                isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-white'
              }`}>
                4 Pilar Transformasi Batin EMT
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: Brain, title: "Self-Awareness", desc: "Mengenali pemicu stres, kelelahan mental, dan gelombang emosi diri sebelum masuk kelas." },
                  { icon: Compass, title: "Self-Regulation", desc: "Teknik olah nafas dan jeda sadar untuk meredakan amarah saat menghadapi murid." },
                  { icon: Heart, title: "Compassionate Teaching", desc: "Mengajar dengan pancaran kasih sayang tulus sehingga materi menembus kalbu siswa." },
                  { icon: Users, title: "Classroom Resonance", desc: "Membangun iklim kelas yang aman, bebas intimidasi, dan menyenangkan." }
                ].map((item, idx) => (
                  <div key={idx} className={`p-5 rounded-2xl border space-y-2.5 ${
                    isKitabTheme ? 'card-kitab-frame' : 'bg-slate-900 border-slate-800'
                  }`}>
                    <item.icon className={`w-6 h-6 ${isKitabTheme ? 'text-[#9e2a2b]' : 'text-emerald-400'}`} />
                    <h3 className={`font-bold text-sm ${isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-white'}`}>{item.title}</h3>
                    <p className={`text-xs leading-relaxed ${isKitabTheme ? 'text-[#634224]' : 'text-slate-400'}`}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: RUANG KELAS ANGKATAN & JURNAL REFLEKSI                             */}
        {/* ========================================================================= */}
        {activeTab === 'kelas' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* SELECTOR ANGKATAN */}
            <div className={`p-5 rounded-3xl border space-y-3 ${
              isKitabTheme ? 'card-kitab-frame' : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    isKitabTheme ? 'text-[#8f632d]' : 'text-emerald-400'
                  }`}>
                    🏛️ Ruang Kelas Angkatan EMT
                  </span>
                  <h2 className={`text-base sm:text-xl font-bold ${
                    isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-white'
                  }`}>
                    {activeBatchData.nama}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <label className={`text-xs font-semibold ${isKitabTheme ? 'text-[#634224]' : 'text-slate-400'}`}>Pilih Angkatan:</label>
                  <select
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border focus:outline-hidden ${
                      isKitabTheme
                        ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b]'
                        : 'bg-slate-950 text-white border-slate-800'
                    }`}
                  >
                    {DAFTAR_ANGKATAN.map((b) => (
                      <option key={b.id} value={b.id}>{b.nama}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs">
                <span className={`flex items-center gap-1 font-semibold ${isKitabTheme ? 'text-[#634224]' : 'text-slate-400'}`}>
                  <Calendar className="w-3.5 h-3.5 text-amber-600" /> Periode: <strong>{activeBatchData.periode}</strong>
                </span>
                <span className={`flex items-center gap-1 font-semibold ${isKitabTheme ? 'text-[#634224]' : 'text-slate-400'}`}>
                  <Users className="w-3.5 h-3.5 text-emerald-600" /> Terdaftar: <strong>{activeBatchData.pesertaCount} Peserta</strong>
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  isKitabTheme ? 'bg-[#dbeef0] text-[#1b6b55] border-[#b0d9d3]' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}>
                  {activeBatchData.status}
                </span>
              </div>
            </div>

            {/* SUB-TABS KELAS */}
            <div className="flex items-center gap-2 border-b pb-2">
              <button
                onClick={() => setSubTabKelas('jurnal')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                  subTabKelas === 'jurnal'
                    ? isKitabTheme ? 'bg-[#3a2211] text-white border-[#8f632d]' : 'bg-emerald-600 text-white border-emerald-500'
                    : isKitabTheme ? 'text-[#634224] hover:bg-[#ebdcc4] border-transparent' : 'text-slate-400 hover:text-white border-transparent'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>📝 Setor Jurnal & Refleksi Batin</span>
              </button>

              <button
                onClick={() => setSubTabKelas('modul')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                  subTabKelas === 'modul'
                    ? isKitabTheme ? 'bg-[#3a2211] text-white border-[#8f632d]' : 'bg-emerald-600 text-white border-emerald-500'
                    : isKitabTheme ? 'text-[#634224] hover:bg-[#ebdcc4] border-transparent' : 'text-slate-400 hover:text-white border-transparent'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>📚 Modul & Rekaman Sesi (4 Modul)</span>
              </button>

              <button
                onClick={() => setActiveTab('selfhealing')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                  isKitabTheme ? 'bg-[#ebdcc4] text-[#9e2a2b] border-[#cbb38b]' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>🧘 Checklist Self-Healing 21 Hari</span>
              </button>
            </div>

            {/* SUB CONTENT 1: SETOR JURNAL REFLEKSI */}
            {subTabKelas === 'jurnal' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form Input Jurnal */}
                <div className={`lg:col-span-6 p-6 rounded-3xl border space-y-4 ${
                  isKitabTheme ? 'card-kitab-frame' : 'bg-slate-900 border-slate-800'
                }`}>
                  <div>
                    <h3 className={`text-base font-bold flex items-center gap-2 ${
                      isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-white'
                    }`}>
                      <FileText className={`w-5 h-5 ${isKitabTheme ? 'text-[#9e2a2b]' : 'text-emerald-400'}`} />
                      <span>Lembar Refleksi Emosi & Latihan Harian</span>
                    </h3>
                    <p className={`text-xs mt-0.5 ${isKitabTheme ? 'text-[#634224]' : 'text-slate-400'}`}>
                      Kirimkan hasil pengamatan batin Anda untuk dievaluasi oleh Kang Iman (Mentor EMT).
                    </p>
                  </div>

                  <form onSubmit={handleSaveJournal} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-xs font-semibold mb-1 ${isKitabTheme ? 'text-[#3a2211]' : 'text-slate-300'}`}>
                          Nama Peserta *
                        </label>
                        <input
                          type="text"
                          required
                          value={journalForm.nama}
                          onChange={(e) => setJournalForm({ ...journalForm, nama: e.target.value })}
                          className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-hidden ${
                            isKitabTheme ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b]' : 'bg-slate-950 text-white border-slate-800'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-xs font-semibold mb-1 ${isKitabTheme ? 'text-[#3a2211]' : 'text-slate-300'}`}>
                          Tanggal Praktik
                        </label>
                        <input
                          type="date"
                          value={journalForm.tanggal}
                          onChange={(e) => setJournalForm({ ...journalForm, tanggal: e.target.value })}
                          className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-hidden ${
                            isKitabTheme ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b]' : 'bg-slate-950 text-white border-slate-800'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-xs font-semibold mb-1 ${isKitabTheme ? 'text-[#3a2211]' : 'text-slate-300'}`}>
                          Dominasi Rasa Emosi
                        </label>
                        <select
                          value={journalForm.kondisiEmosi}
                          onChange={(e) => setJournalForm({ ...journalForm, kondisiEmosi: e.target.value })}
                          className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold focus:outline-hidden ${
                            isKitabTheme ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b]' : 'bg-slate-950 text-white border-slate-800'
                          }`}
                        >
                          <option value="Takut">😨 Takut (Fear / Cemas / Was-was)</option>
                          <option value="Jijik">🤢 Jijik (Disgust / Muak / Menolak)</option>
                          <option value="Sedih">😢 Sedih (Sadness / Kecewa / Terpuruk)</option>
                          <option value="Bahagia">😊 Bahagia (Joy / Sukacita / Syukur)</option>
                          <option value="Marah">😡 Marah (Anger / Jengkel / Terbakar)</option>
                        </select>
                      </div>

                      <div>
                        <label className={`block text-xs font-semibold mb-1 ${isKitabTheme ? 'text-[#3a2211]' : 'text-slate-300'}`}>
                          Teknik EMT yang Dipakai
                        </label>
                        <select
                          value={journalForm.teknikPraktik}
                          onChange={(e) => setJournalForm({ ...journalForm, teknikPraktik: e.target.value })}
                          className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-hidden ${
                            isKitabTheme ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b]' : 'bg-slate-950 text-white border-slate-800'
                          }`}
                        >
                          <option value="Nafas Ritmik 4-4-8">🌬️ Olah Nafas 4-4-8 Dada</option>
                          <option value="Somatic Grounding">🌱 Somatic Grounding Tubuh</option>
                          <option value="Jeda Sadar 3 Menit">⏸️ Jeda Sadar 3 Menit</option>
                          <option value="Deep Listening Kelas">👂 Deep Listening / Menyimak</option>
                          <option value="Afirmasi Cinta Guru">💖 Afirmasi Kasih Sayang</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${isKitabTheme ? 'text-[#3a2211]' : 'text-slate-300'}`}>
                        Pemicu / Situasi yang Dihadapi (*Trigger*)
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Menghadapi murid yang gaduh di jam pelajaran terakhir..."
                        value={journalForm.triggerEmosi}
                        onChange={(e) => setJournalForm({ ...journalForm, triggerEmosi: e.target.value })}
                        className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-hidden ${
                          isKitabTheme ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b]' : 'bg-slate-950 text-white border-slate-800'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${isKitabTheme ? 'text-[#3a2211]' : 'text-slate-300'}`}>
                        Respon Somatik Tubuh (*Sensasi Fisik*)
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Jantung berdegup kencang, bahu tegang, nafas pendek..."
                        value={journalForm.responTubuh}
                        onChange={(e) => setJournalForm({ ...journalForm, responTubuh: e.target.value })}
                        className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-hidden ${
                          isKitabTheme ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b]' : 'bg-slate-950 text-white border-slate-800'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${isKitabTheme ? 'text-[#3a2211]' : 'text-slate-300'}`}>
                        Kesadaran & Hikmah Baru yang Didapat *
                      </label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Tuliskan hikmah batin, pergeseran rasa, atau hasil latihan setelah menerapkan teknik EMT..."
                        value={journalForm.kesadaranBaru}
                        onChange={(e) => setJournalForm({ ...journalForm, kesadaranBaru: e.target.value })}
                        className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-hidden leading-relaxed ${
                          isKitabTheme ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b]' : 'bg-slate-950 text-white border-slate-800'
                        }`}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingJournal}
                      className={`w-full py-3 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer ${
                        isKitabTheme ? 'bg-[#9e2a2b] hover:bg-[#852324]' : 'bg-emerald-600 hover:bg-emerald-500'
                      }`}
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSavingJournal ? "Menyimpan Jurnal..." : "Setor Jurnal Refleksi ke Mentor"}</span>
                    </button>
                  </form>
                </div>

                {/* Log Riwayat Jurnal Terkirim */}
                <div className={`lg:col-span-6 p-6 rounded-3xl border space-y-4 ${
                  isKitabTheme ? 'card-kitab-frame' : 'bg-slate-900 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className={`text-base font-bold ${
                      isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-white'
                    }`}>
                      📖 Riwayat Setoran Jurnal ({journalEntries.length})
                    </h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isKitabTheme ? 'bg-[#eee3cb] text-[#634224] border-[#d8c3a1]' : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {selectedBatch.toUpperCase()}
                    </span>
                  </div>

                  {journalEntries.length === 0 ? (
                    <div className="py-12 text-center text-xs space-y-2 text-slate-400">
                      <FileText className="w-8 h-8 mx-auto opacity-50 text-amber-500" />
                      <p className="font-semibold">Belum ada jurnal yang disetor untuk angkatan ini.</p>
                      <p className="text-[11px]">Silakan isi form di samping untuk mulai mencatat perjalanan batin Anda.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                      {journalEntries.map((j) => (
                        <div key={j.id} className={`p-4 rounded-2xl border space-y-2 ${
                          isKitabTheme ? 'bg-[#fdfbf6] border-[#decba4]' : 'bg-slate-950 border-slate-800'
                        }`}>
                          <div className="flex items-center justify-between text-xs border-b pb-1.5 gap-2">
                            <span className="font-bold text-emerald-600 truncate">{j.nama}</span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                j.kondisiEmosi === 'Takut'
                                  ? 'bg-amber-500/15 text-amber-700 border-amber-500/30'
                                  : j.kondisiEmosi === 'Jijik'
                                  ? 'bg-purple-500/15 text-purple-700 border-purple-500/30'
                                  : j.kondisiEmosi === 'Sedih'
                                  ? 'bg-blue-500/15 text-blue-700 border-blue-500/30'
                                  : j.kondisiEmosi === 'Marah'
                                  ? 'bg-rose-500/15 text-rose-700 border-rose-500/30'
                                  : 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30'
                              }`}>
                                {j.kondisiEmosi === 'Takut' ? '😨 Takut' :
                                 j.kondisiEmosi === 'Jijik' ? '🤢 Jijik' :
                                 j.kondisiEmosi === 'Sedih' ? '😢 Sedih' :
                                 j.kondisiEmosi === 'Marah' ? '😡 Marah' :
                                 j.kondisiEmosi === 'Bahagia' ? '😊 Bahagia' : j.kondisiEmosi}
                              </span>
                              <span className="text-[10px] text-slate-400">{j.tanggal}</span>
                            </div>
                          </div>

                          {j.triggerEmosi && (
                            <p className="text-xs text-slate-500">
                              <strong>Pemicu:</strong> {j.triggerEmosi}
                            </p>
                          )}

                          <div className="text-xs whitespace-pre-line leading-relaxed pt-1">
                            <strong className="text-amber-700">Hikmah & Refleksi:</strong>
                            <p className="mt-0.5">{j.kesadaranBaru}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUB CONTENT 2: MODUL KELAS */}
            {subTabKelas === 'modul' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MODUL_KELAS.map((m) => (
                  <div key={m.sesi} className={`p-6 rounded-3xl border space-y-3 ${
                    isKitabTheme ? 'card-kitab-frame' : 'bg-slate-900 border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs border ${
                        isKitabTheme ? 'bg-[#3a2211] text-white border-[#8f632d]' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}>
                        {m.sesi}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {m.durasi}
                      </span>
                    </div>

                    <h4 className={`text-base font-bold ${
                      isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-white'
                    }`}>
                      {m.judul}
                    </h4>

                    <p className={`text-xs leading-relaxed ${isKitabTheme ? 'text-[#543516]' : 'text-slate-300'}`}>
                      {m.ringkasan}
                    </p>

                    <div className={`p-3 rounded-xl border text-[11px] space-y-1 ${
                      isKitabTheme ? 'bg-[#f4ebd5] border-[#d8c3a1]' : 'bg-slate-950 border-slate-800'
                    }`}>
                      <strong className={isKitabTheme ? 'text-[#9e2a2b]' : 'text-amber-400'}>📝 Panduan Tugas Sesi:</strong>
                      <p>{m.tugas}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: CHECKLIST SELF-HEALING 21 HARI EMT                                 */}
        {/* ========================================================================= */}
        {activeTab === 'selfhealing' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header Tracker & Progress Bar */}
            <div className={`p-6 sm:p-8 rounded-3xl border space-y-4 ${
              isKitabTheme ? 'card-kitab-frame' : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🧘</span>
                    <h2 className={`text-xl sm:text-2xl font-black ${
                      isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-white'
                    }`}>
                      Protokol & Checklist Self-Healing 21 Hari
                    </h2>
                  </div>
                  <p className={`text-xs mt-1 max-w-xl ${isKitabTheme ? 'text-[#634224]' : 'text-slate-400'}`}>
                    Disiplin 21 hari pembentukan kebiasaan batin baru (*Neuro-Somatic Habit Rewiring*). Centang latihan setiap hari dan catat sensasi tubuh Anda.
                  </p>
                </div>

                <button
                  onClick={handleShare21DaysToWA}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-md flex items-center gap-2 transition cursor-pointer self-start sm:self-auto ${
                    isKitabTheme ? 'bg-[#1b6b55] hover:bg-[#155644]' : 'bg-emerald-600 hover:bg-emerald-500'
                  }`}
                >
                  <Share2 className="w-4 h-4" />
                  <span>Setor Laporan 21 Hari ke WA Mentor</span>
                </button>
              </div>

              {/* Progress Tracker Card */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className={isKitabTheme ? 'text-[#26150a]' : 'text-slate-200'}>
                    Kemajuan Disiplin: <strong>{completedCount} dari 21 Hari</strong>
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full border ${
                    progressPercent === 100
                      ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500'
                      : isKitabTheme ? 'bg-[#ebdcc4] text-[#9e2a2b] border-[#cbb38b]' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    {progressPercent}% Selesai {progressPercent === 100 ? '🎉 ISTIQOMAH' : ''}
                  </span>
                </div>

                <div className="w-full h-3.5 rounded-full bg-slate-950/40 border border-slate-700/50 overflow-hidden p-0.5">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* 3 Milestone Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
                  completedCount >= 7 
                    ? isKitabTheme ? 'bg-[#dbeef0] border-[#b0d9d3] text-[#1b6b55]' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : isKitabTheme ? 'bg-[#f4ebd5] border-[#dfcfb0] opacity-60 text-[#634224]' : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}>
                  <span className="text-xl">🥉</span>
                  <div>
                    <strong className="text-xs block">Fase 1 (Hari 1–7)</strong>
                    <span className="text-[10px]">Detoks & Rilis Emosi</span>
                  </div>
                </div>

                <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
                  completedCount >= 14 
                    ? isKitabTheme ? 'bg-[#dbeef0] border-[#b0d9d3] text-[#1b6b55]' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : isKitabTheme ? 'bg-[#f4ebd5] border-[#dfcfb0] opacity-60 text-[#634224]' : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}>
                  <span className="text-xl">🥈</span>
                  <div>
                    <strong className="text-xs block">Fase 2 (Hari 8–14)</strong>
                    <span className="text-[10px]">Rekalibrasi Somatik</span>
                  </div>
                </div>

                <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
                  completedCount >= 21 
                    ? isKitabTheme ? 'bg-[#dbeef0] border-[#b0d9d3] text-[#1b6b55]' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : isKitabTheme ? 'bg-[#f4ebd5] border-[#dfcfb0] opacity-60 text-[#634224]' : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}>
                  <span className="text-xl">🥇</span>
                  <div>
                    <strong className="text-xs block">Fase 3 (Hari 15–21)</strong>
                    <span className="text-[10px]">Transformasi Cinta</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid 21 Hari Interaktif */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {healingDays.map((item) => (
                <div
                  key={item.day}
                  className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                    item.completed
                      ? isKitabTheme 
                        ? 'bg-[#f5fbf7] border-[#a3d9bc] shadow-xs' 
                        : 'bg-emerald-950/20 border-emerald-500/40'
                      : isKitabTheme 
                        ? 'card-kitab-frame' 
                        : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleToggleDay(item.day)}
                      className="flex items-center gap-2.5 cursor-pointer text-left group"
                    >
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition border ${
                        item.completed
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : isKitabTheme ? 'border-[#cbb38b] bg-white group-hover:bg-[#f4ebd5]' : 'border-slate-700 bg-slate-950'
                      }`}>
                        {item.completed && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className={`text-xs font-black ${
                          isKitabTheme ? 'text-[#26150a]' : 'text-white'
                        }`}>
                          Hari ke-{item.day}
                        </span>
                        <span className={`text-[10px] block font-semibold ${
                          item.fase === 1 ? 'text-amber-700' : item.fase === 2 ? 'text-sky-700' : 'text-emerald-700'
                        }`}>
                          {item.faseName.split(':')[0]}
                        </span>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setActiveDayEdit(activeDayEdit === item.day ? null : item.day);
                        setDayNoteInput(item.note || '');
                      }}
                      className={`p-1.5 rounded-lg border text-[10px] font-bold transition cursor-pointer ${
                        isKitabTheme 
                          ? 'bg-[#eee3cb] text-[#634224] border-[#d8c3a1] hover:bg-[#dfcdab]' 
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                      title="Tulis Catatan Rasa Somatik"
                    >
                      {item.note ? '✏️ Edit Catatan' : '+ Catatan'}
                    </button>
                  </div>

                  <p className={`text-[11px] leading-relaxed italic ${
                    isKitabTheme ? 'text-[#543516]' : 'text-slate-400'
                  }`}>
                    "{item.prompt}"
                  </p>

                  {item.note && (
                    <div className={`p-2.5 rounded-xl border text-[11px] leading-relaxed ${
                      isKitabTheme ? 'bg-[#f4ebd5] border-[#d8c3a1] text-[#2c1810]' : 'bg-slate-950 border-slate-800 text-emerald-300'
                    }`}>
                      <strong className="block text-[10px] text-amber-700">Catatan Rasa:</strong>
                      "{item.note}"
                    </div>
                  )}

                  {/* Input Dialog Inline jika diklik */}
                  {activeDayEdit === item.day && (
                    <div className="pt-2 space-y-2 border-t border-slate-700/40 animate-in fade-in">
                      <textarea
                        rows={2}
                        placeholder="Contoh: Terasa lega di dada, nafas lebih lapang, emosi mereda..."
                        value={dayNoteInput}
                        onChange={(e) => setDayNoteInput(e.target.value)}
                        className={`w-full p-2 rounded-xl text-xs border focus:outline-hidden ${
                          isKitabTheme ? 'bg-white text-[#26150a] border-[#cbb38b]' : 'bg-slate-950 text-white border-slate-800'
                        }`}
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleSaveDayNote(item.day)}
                          className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer"
                        >
                          Simpan & Centang
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveDayEdit(null)}
                          className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 text-xs font-semibold"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: JADWAL WORKSHOP & PENDAFTARAN                                      */}
        {/* ========================================================================= */}
        {activeTab === 'event' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Event Details Card */}
              <div className="lg:col-span-5 space-y-4">
                <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-5 text-left ${
                  isKitabTheme ? 'card-kitab-frame' : 'bg-slate-900 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between border-b pb-3">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 uppercase">
                      OFFLINE WORKSHOP
                    </span>
                    <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> Kuota Terbatas
                    </span>
                  </div>

                  <div>
                    <h3 className={`text-xl sm:text-2xl font-black tracking-tight ${
                      isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-white'
                    }`}>
                      Workshop Akbar EMT For Teacher
                    </h3>
                    <p className={`text-xs mt-1 ${isKitabTheme ? 'text-[#634224]' : 'text-slate-400'}`}>
                      Membangun Karakter & Ketahanan Emosi Pendidik di Era Digital
                    </p>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-start gap-2.5">
                      <Calendar className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Hari & Tanggal:</strong>
                        <p>Sabtu, 5 September 2026</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Waktu:</strong>
                        <p>08.00 – 15.30 WIB (Full Day Training)</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Lokasi Acara:</strong>
                        <p>Grand Ballroom Hotel Santika Tasikmalaya</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <User className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Narasumber Utama:</strong>
                        <p className="text-amber-700 font-bold">IMAN NURJAMAN, M.Pd</p>
                        <p className="text-[11px] text-slate-500">Praktisi NPT & Direktur Edusee</p>
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                    isKitabTheme ? 'bg-[#f4ebd5] border-[#d8c3a1]' : 'bg-slate-950 border-slate-800'
                  }`}>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Investasi Normal:</span>
                      <del className="text-xs text-slate-500 font-bold">Rp 500.000</del>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[9px] font-black uppercase">
                        SPECIAL PRICE
                      </span>
                      <div className="text-lg font-black text-amber-600">Rp 250.000</div>
                      <span className="text-[10px] text-amber-700 font-medium block">*Khusus 30 Pendaftar Pertama</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Registration Form */}
              <div className="lg:col-span-7">
                <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-4 text-left ${
                  isKitabTheme ? 'card-kitab-frame' : 'bg-slate-900 border border-slate-800'
                }`}>
                  <div>
                    <h3 className={`text-lg sm:text-xl font-bold tracking-tight ${
                      isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-white'
                    }`}>
                      Formulir Registrasi Peserta Guru
                    </h3>
                    <p className={`text-xs ${isKitabTheme ? 'text-[#634224]' : 'text-slate-400'}`}>
                      Lengkapi data Anda di bawah ini untuk konfirmasi tiket dan otomatis terhubung ke WhatsApp Admin:
                    </p>
                  </div>

                  {submitSuccess && (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Data Anda berhasil diproses! WhatsApp konfirmasi pendaftaran sedang terbuka.</span>
                    </div>
                  )}

                  <form onSubmit={handleRegister} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className={`block text-xs font-semibold mb-1 ${isKitabTheme ? 'text-[#3a2211]' : 'text-slate-300'}`}>
                          Nama Lengkap & Gelar *
                        </label>
                        <input
                          type="text"
                          name="nama"
                          required
                          value={formData.nama}
                          onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                          placeholder="Contoh: Siti Rahmawati, S.Pd"
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-hidden ${
                            isKitabTheme ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b]' : 'bg-slate-950 border-slate-800 text-white'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-xs font-semibold mb-1 ${isKitabTheme ? 'text-[#3a2211]' : 'text-slate-300'}`}>
                          Asal Sekolah / Instansi *
                        </label>
                        <input
                          type="text"
                          name="sekolah"
                          required
                          value={formData.sekolah}
                          onChange={(e) => setFormData({ ...formData, sekolah: e.target.value })}
                          placeholder="Contoh: SMAN 1 Tasikmalaya"
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-hidden ${
                            isKitabTheme ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b]' : 'bg-slate-950 border-slate-800 text-white'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className={`block text-xs font-semibold mb-1 ${isKitabTheme ? 'text-[#3a2211]' : 'text-slate-300'}`}>
                          Jabatan / Peran di Sekolah *
                        </label>
                        <input
                          type="text"
                          name="jabatan"
                          required
                          value={formData.jabatan}
                          onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                          placeholder="Contoh: Guru Kelas / Guru BK / Kepala Sekolah"
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-hidden ${
                            isKitabTheme ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b]' : 'bg-slate-950 border-slate-800 text-white'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-xs font-semibold mb-1 ${isKitabTheme ? 'text-[#3a2211]' : 'text-slate-300'}`}>
                          Nomor WhatsApp Aktif *
                        </label>
                        <input
                          type="tel"
                          name="wa"
                          required
                          value={formData.wa}
                          onChange={(e) => setFormData({ ...formData, wa: e.target.value })}
                          placeholder="08123456789"
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-hidden ${
                            isKitabTheme ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b]' : 'bg-slate-950 border-slate-800 text-white'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div className="sm:col-span-2">
                        <label className={`block text-xs font-semibold mb-1 ${isKitabTheme ? 'text-[#3a2211]' : 'text-slate-300'}`}>
                          Alamat Email Gmail *
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="nama@gmail.com"
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-hidden ${
                            isKitabTheme ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b]' : 'bg-slate-950 border-slate-800 text-white'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-xs font-semibold mb-1 ${isKitabTheme ? 'text-[#3a2211]' : 'text-slate-300'}`}>
                          Jumlah Peserta
                        </label>
                        <input
                          type="number"
                          name="jumlah"
                          min="1"
                          value={formData.jumlah}
                          onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-hidden ${
                            isKitabTheme ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b]' : 'bg-slate-950 border-slate-800 text-white'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${isKitabTheme ? 'text-[#3a2211]' : 'text-slate-300'}`}>
                        Rencana Metode Pembayaran
                      </label>
                      <select
                        name="pembayaran"
                        value={formData.pembayaran}
                        onChange={(e) => setFormData({ ...formData, pembayaran: e.target.value })}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-hidden ${
                          isKitabTheme ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b]' : 'bg-slate-950 border-slate-800 text-white'
                        }`}
                      >
                        <option value="Transfer Bank">Transfer Bank (BCA / Mandiri / BSI)</option>
                        <option value="QRIS">QRIS Instan</option>
                        <option value="Tunai di Lokasi">Tunai di Meja Registrasi</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full py-3.5 rounded-2xl text-white font-extrabold text-xs sm:text-sm shadow-md transition cursor-pointer mt-2 ${
                        isKitabTheme ? 'bg-[#1b6b55] hover:bg-[#155644]' : 'bg-gradient-to-r from-emerald-600 to-amber-600'
                      }`}
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSubmitting ? "Memproses Data..." : "DAFTAR SEKARANG VIA WHATSAPP RESMI"}</span>
                    </button>
                  </form>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
