"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppNavbar, AppSidebar, SUPER_ADMIN_EMAILS } from '@/components/layout/AppNavbar';
import {
  Crown,
  Shield,
  ShieldCheck,
  Sparkles,
  Lock,
  CheckCircle2,
  Clock,
  Compass,
  Flame,
  Sun,
  Moon,
  ChevronRight,
  RefreshCw,
  Award,
  Zap,
  BookOpen,
  ArrowLeft,
  Volume2,
  VolumeX,
  Copy,
  Check
} from 'lucide-react';

export default function WiridKhususPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isKitabTheme, setIsKitabTheme] = useState(true);
  const [activeTab, setActiveTab] = useState('afirmasi'); // 'afirmasi' | 'barier' | 'kasyaf' | 'log'
  
  // Tasbih Counter untuk 33 Ruang Kasyaf
  const [counterKasyaf, setCounterKasyaf] = useState(0);
  const [totalKasyafRounds, setTotalKasyafRounds] = useState(0);

  // Status Aktivasi Barier
  const [barierActive, setBarierActive] = useState(false);
  const [barierActivatedAt, setBarierActivatedAt] = useState(null);

  // Status Centang Log Pribadi
  const [dailyLog, setDailyLog] = useState({});

  // Feedback Copy
  const [copiedSection, setCopiedSection] = useState(null);

  useEffect(() => {
    try {
      const authStr = localStorage.getItem('npt_user_auth');
      if (authStr) {
        const user = JSON.parse(authStr);
        setCurrentUser(user);
      }

      // Load Barier & Log State
      const savedBarier = localStorage.getItem('npt_barier_active_date');
      const todayStr = new Date().toISOString().split('T')[0];
      if (savedBarier) {
        const parsed = JSON.parse(savedBarier);
        if (parsed.date === todayStr) {
          setBarierActive(true);
          setBarierActivatedAt(parsed.time);
        }
      }

      const savedLog = localStorage.getItem('npt_wirid_khusus_log');
      if (savedLog) {
        setDailyLog(JSON.parse(savedLog));
      }
    } catch (e) {}
  }, []);

  const isSuperAdmin = 
    currentUser?.role === 'super_admin' || 
    (currentUser?.email && SUPER_ADMIN_EMAILS.includes(currentUser.email.toLowerCase().trim()));

  // Handler Aktivasi Barier
  const handleActivateBarier = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString('id-ID');
    setBarierActive(true);
    setBarierActivatedAt(nowTime);

    try {
      localStorage.setItem('npt_barier_active_date', JSON.stringify({
        date: todayStr,
        time: nowTime
      }));

      // Update log harian
      const updatedLog = {
        ...dailyLog,
        [todayStr]: {
          ...dailyLog[todayStr],
          barier: true,
          barierTime: nowTime
        }
      };
      setDailyLog(updatedLog);
      localStorage.setItem('npt_wirid_khusus_log', JSON.stringify(updatedLog));
    } catch (e) {}
  };

  // Handler Tasbih Kasyaf (33 Butir)
  const handleIncrementKasyaf = () => {
    if (counterKasyaf + 1 >= 33) {
      setCounterKasyaf(0);
      setTotalKasyafRounds((prev) => prev + 1);
      
      // Update Log
      const todayStr = new Date().toISOString().split('T')[0];
      const updatedLog = {
        ...dailyLog,
        [todayStr]: {
          ...dailyLog[todayStr],
          kasyafRounds: (dailyLog[todayStr]?.kasyafRounds || 0) + 1
        }
      };
      setDailyLog(updatedLog);
      try {
        localStorage.setItem('npt_wirid_khusus_log', JSON.stringify(updatedLog));
      } catch (e) {}
    } else {
      setCounterKasyaf(counterKasyaf + 1);
    }
  };

  const handleCopyText = (text, sectionName) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionName);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // Jika Bukan Super Admin, Kunci Halaman Ini Secara Mutlak
  if (!isSuperAdmin) {
    return (
      <div className={`min-h-screen flex flex-col font-sans transition-colors ${
        isKitabTheme ? 'bg-parchment text-[#231409]' : 'bg-slate-950 text-slate-100'
      }`}>
        <AppNavbar 
          onToggleSidebar={() => setIsSidebarOpen(true)}
          currentUser={currentUser}
          activeTitle="Ruang Pribadi Terkunci"
        />
        <div className="flex-1 max-w-lg w-full mx-auto p-6 flex flex-col items-center justify-center text-center space-y-4">
          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center border shadow-xl ${
            isKitabTheme ? 'bg-[#ebdcc4] text-[#9e2a2b] border-[#cbb38b]' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}>
            <Lock className="w-8 h-8" />
          </div>
          <h2 className={`text-xl font-black ${isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-white'}`}>
            Ruang Riyadhoh Pribadi Terkunci
          </h2>
          <p className={`text-xs leading-relaxed ${isKitabTheme ? 'text-[#634224]' : 'text-slate-400'}`}>
            Halaman ini khusus memuat rancangan batin, afirmasi paten, dan protokol suluk harian pribadi Kang Iman.
          </p>
          <Link
            href="/npt"
            className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition ${
              isKitabTheme ? 'bg-[#9e2a2b] hover:bg-[#852324]' : 'bg-emerald-600 hover:bg-emerald-500'
            }`}
          >
            ← Kembali ke Portal NPT
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${
      isKitabTheme 
        ? 'bg-parchment text-[#231409]' 
        : 'bg-slate-950 text-slate-100 selection:bg-amber-600 selection:text-white'
    }`}>
      {/* Top Navbar & Sidebar */}
      <AppNavbar 
        onToggleSidebar={() => setIsSidebarOpen(true)}
        currentUser={currentUser}
        activeTitle="Riyadhoh Khusus Kang Iman"
      />
      <AppSidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentUser={currentUser}
        activePath="/wirid-khusus"
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-6 pb-24 space-y-6">
        
        {/* HEADER KHUSUS KANG IMAN */}
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl relative overflow-hidden ${
          isKitabTheme ? 'card-kitab-frame border-[#cbb38b]' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-amber-500/20 via-amber-600/5 to-transparent rounded-bl-full pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 relative z-10">
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border flex items-center gap-1 ${
                  isKitabTheme ? 'bg-[#ebdcc4] text-[#9e2a2b] border-[#cbb38b]' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  <Crown className="w-3 h-3 text-amber-500" />
                  <span>Koleksi Rahasia Pribadi • Khusus Kang Iman</span>
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  barierActive 
                    ? isKitabTheme ? 'bg-[#dbeef0] text-[#1b6b55] border-[#b0d9d3]' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : isKitabTheme ? 'bg-[#ebdcc4] text-[#8f632d] border-[#cbb38b]' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {barierActive ? `🛡️ Barier Aktif (${barierActivatedAt})` : '⚠️ Barier Belum Aktif'}
                </span>
              </div>

              <h1 className={`text-xl sm:text-3xl font-black mt-2 tracking-tight leading-snug ${
                isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-white'
              }`}>
                Kitab Riyadhoh, Afirmasi Paten Level 5 & Barier Energi
              </h1>
              <p className={`text-xs mt-1 italic ${isKitabTheme ? 'text-[#734822]' : 'text-slate-400'}`}>
                "Rancangan Sesuai Diri Pribadi — Penataan 7 Martabat Alam Tubuh, 4 Perintah Energi Ilahi & 33 Ruang Kasyaf."
              </p>
            </div>

            {/* Toggle Tema */}
            <button
              onClick={() => setIsKitabTheme(!isKitabTheme)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto ${
                isKitabTheme
                  ? 'bg-[#ebdcc4] text-[#3a2211] border-[#cbb38b] hover:bg-[#dfcdab]'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              {isKitabTheme ? <Moon className="w-4 h-4 text-amber-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
              <span>{isKitabTheme ? 'Mode Gelap' : 'Mode Kitab'}</span>
            </button>
          </div>

          {/* Navigasi 3 Bagian Wirid */}
          <div className="flex flex-wrap items-center gap-2 pt-4">
            <button
              onClick={() => setActiveTab('afirmasi')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                activeTab === 'afirmasi'
                  ? isKitabTheme 
                    ? 'bg-[#3a2211] text-[#fbf6ec] border-[#8f632d] shadow-sm' 
                    : 'bg-amber-600 text-white border-amber-500 shadow-amber-600/30'
                  : isKitabTheme 
                    ? 'text-[#634224] hover:bg-[#ebdcc4] border-transparent' 
                    : 'text-slate-400 hover:text-white border-transparent'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>1. Afirmasi Paten Level 5 (4 Perintah)</span>
            </button>

            <button
              onClick={() => setActiveTab('barier')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                activeTab === 'barier'
                  ? isKitabTheme 
                    ? 'bg-[#3a2211] text-[#fbf6ec] border-[#8f632d] shadow-sm' 
                    : 'bg-amber-600 text-white border-amber-500 shadow-amber-600/30'
                  : isKitabTheme 
                    ? 'text-[#634224] hover:bg-[#ebdcc4] border-transparent' 
                    : 'text-slate-400 hover:text-white border-transparent'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>2. Aktivasi Barier Pagi</span>
            </button>

            <button
              onClick={() => setActiveTab('kasyaf')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                activeTab === 'kasyaf'
                  ? isKitabTheme 
                    ? 'bg-[#3a2211] text-[#fbf6ec] border-[#8f632d] shadow-sm' 
                    : 'bg-amber-600 text-white border-amber-500 shadow-amber-600/30'
                  : isKitabTheme 
                    ? 'text-[#634224] hover:bg-[#ebdcc4] border-transparent' 
                    : 'text-slate-400 hover:text-white border-transparent'
              }`}
            >
              <Compass className="w-4 h-4 text-rose-500" />
              <span>3. 33 Ruang Kasyaf (Tasbih)</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BAGIAN 1: AFIRMASI PATEN LEVEL 5 (LENGKAP)                                */}
        {/* ========================================================================= */}
        {activeTab === 'afirmasi' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* KOTAK PANDUAN PENGANTAR */}
            <div className={`p-5 rounded-2xl border space-y-2 text-xs leading-relaxed ${
              isKitabTheme ? 'card-kitab-frame' : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="flex items-center justify-between border-b pb-2">
                <span className={`font-bold flex items-center gap-1.5 ${isKitabTheme ? 'text-[#9e2a2b]' : 'text-amber-400'}`}>
                  <BookOpen className="w-4 h-4" />
                  <span>Petunjuk Eksekusi Mantra & Afirmasi Harian:</span>
                </span>
                <span className="text-[10px] text-slate-400">Minimal 2 Minggu Sekali / Tiap Pagi-Petang</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                <li>Setiap pagi/petang niatkan, perintahkan, serta <strong>dapatkan SINYAL</strong>.</li>
                <li>Setiap bacaan Arab & Asma bukan hanya sebuah bacaan, namun <strong>rasakan seperti MANTRA</strong> yang menghasilkan sensasi berbeda di tubuh Anda.</li>
                <li>Lambat laun afirmasi panjang akan berganti cukup dengan membaca <strong>MANTRA PENDEK</strong>.</li>
              </ul>
            </div>

            {/* MATAN 1: SINYAL & PENYERAPAN BIO UNSUR */}
            <div className={`p-6 sm:p-8 rounded-3xl border space-y-4 shadow-sm ${
              isKitabTheme ? 'card-kitab-frame' : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="border-b pb-3">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isKitabTheme ? 'text-[#8f632d]' : 'text-amber-400'}`}>
                  LANGKAH 1 — SINYAL & KETENANGAN PRIMORDIAL
                </span>
                <h3 className={`text-base sm:text-lg font-bold ${isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-white'}`}>
                  Inisiasi Sinyal & Penyerapan Bio Unsur Tubuh
                </h3>
              </div>

              <div className="arabic-quote-box">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </div>

              <div className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed space-y-2 ${
                isKitabTheme ? 'bg-[#faf2e3] border-[#dfcfb0] text-[#2c1810]' : 'bg-slate-950 border-slate-800 text-slate-200'
              }`}>
                <p className="font-bold text-amber-700">SINYAL (Dzikir + Merasakan Ketenangan Sampai Mengalir):</p>
                <div className="font-kitab-arabic arabic-text text-xl">
                  يَا اللَّهُ يَا رَحْمَٰنُ يَا رَحِيمُ
                </div>
                <p className="italic font-serif">
                  "Aku menghirup dan menyerap <strong>bio unsur</strong> UNTUK mengembalikan <strong>7 martabat alam tubuhku</strong> sesuai kodrat-NYA."
                </p>
              </div>

              <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1.5 ${
                isKitabTheme ? 'bg-[#f4ebd5] border-[#d8c3a1]' : 'bg-slate-950 border-slate-800'
              }`}>
                <div className="font-kitab-arabic arabic-text">
                  إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ • لَا إِلَٰهَ إِلَّا اللَّهُ
                </div>
                <div className="space-y-1 pt-1 italic font-serif">
                  <p>• Tidak ada yang memberi kecuali Allah, Tidak ada yang memudaratkan kecuali Allah.</p>
                  <p>• Tidak ada yang memuliakan kecuali Allah, Tidak ada yang menghinakan kecuali Allah.</p>
                  <p>• Tidak ada yang memberi kecuali Allah, Tidak ada yang mencegah kecuali Allah.</p>
                </div>
                <div className="font-kitab-arabic arabic-text text-xl pt-2">
                  هُوَ ... أَنْتَ ... (يَا اللَّهُ يَا وَاجِدُ يَا غَنِيُّ يَا مُغْنِي يَا حَيُّ يَا قَيُّومُ)
                </div>
              </div>
            </div>

            {/* MATAN 2: NIAT PENETAPAN 5 PERAN / ARTIKETIPE DIRI */}
            <div className={`p-6 sm:p-8 rounded-3xl border space-y-4 shadow-sm ${
              isKitabTheme ? 'card-kitab-frame' : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="border-b pb-3">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isKitabTheme ? 'text-[#8f632d]' : 'text-amber-400'}`}>
                  LANGKAH 2 — PENETAPAN EKSISTENSI (5 MAQOM DIRI)
                </span>
                <h3 className={`text-base sm:text-lg font-bold ${isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-white'}`}>
                  Sholawat & Penetapan Peran di Latifah Diri
                </h3>
              </div>

              <div className={`p-4 sm:p-5 rounded-2xl border text-xs sm:text-sm space-y-3 ${
                isKitabTheme ? 'bg-[#faf2e3] border-[#dfcfb0] text-[#2c1810]' : 'bg-slate-950 border-slate-800 text-slate-200'
              }`}>
                <p className="font-bold text-amber-700">JADIKAN DIRIKU INI MENJADI SEORANG :</p>
                <div className="space-y-2 leading-relaxed">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-md bg-[#3a2211] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                    <p><strong>SEORANG "HAMBA Al-Waarist"</strong> yang taat & mewarisi 124 ribu rezeki, ilmu dan kehendak tekad para wali (di latifahku).</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-md bg-[#3a2211] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                    <p><strong>SEORANG "KHALIFAH Al-Awwal wa Dzul Jalaali wal Ikram"</strong> yang mengikuti jejak Rasulullah MUHAMMAD SAW.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-md bg-[#3a2211] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                    <p><strong>SEORANG "GURU An-Nuur wal Haadi wal Ghaniy"</strong> yang menerangi dan membimbing sesama.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-md bg-[#3a2211] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">4</span>
                    <p><strong>SEORANG "SUAMI Ar-Rasyiid wal Ghaniy"</strong> yang memimpin keluarga dengan bijaksana & berlimpah.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-md bg-[#3a2211] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">5</span>
                    <p><strong>SEORANG "AYAH An-Naafi' wal Ghaniy"</strong> yang memberi kemanfaatan besar & perlindungan bagi anak-anakku.</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-300 dark:border-slate-800 text-[11px] italic font-serif">
                  *Bawa rasa ke dalam: Syahadat (Rasakan ALIF LAM MIM) • Sholawat • Al-Fatihah, Al-Ikhlas, Al-Falaq & Ayat Kursi.<br />
                  <strong>"Terima kasih atas pertemuan ini ya Allah... Ya Rasulullah..."</strong>
                </div>
              </div>
            </div>

            {/* MATAN 3: TAWASUL & SALAM KOSMIK */}
            <div className={`p-6 sm:p-8 rounded-3xl border space-y-4 shadow-sm ${
              isKitabTheme ? 'card-kitab-frame' : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="border-b pb-3">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isKitabTheme ? 'text-[#8f632d]' : 'text-amber-400'}`}>
                  LANGKAH 3 — SALAM PENGHUBUNG FREKUENSI KOSMIK & RUHANI
                </span>
                <h3 className={`text-base sm:text-lg font-bold ${isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-white'}`}>
                  Untaian Assalamualaika (Transmisi 313 Jalur Ruh)
                </h3>
              </div>

              <div className={`p-4 sm:p-5 rounded-2xl border text-xs sm:text-sm leading-loose space-y-1 font-serif ${
                isKitabTheme ? 'bg-[#faf2e3] border-[#dfcfb0] text-[#2c1810]' : 'bg-slate-950 border-slate-800 text-slate-200'
              }`}>
                <p>• <strong>Assalamu’alaika</strong> ya Abbati ya RASULULLAH SAW</p>
                <p>• <strong>Assalamu’alaika</strong> ya Sayyidina Jibril wa Mikail</p>
                <p>• <strong>Assalamu’alaika</strong> ya Sayyidina Khidir Balya bin Malkan Abbal Abbas</p>
                <p>• <strong>Assalamu’alaika</strong> ya Sayyidina Al-Mahdi ya Khalifatullah</p>
                <p>• <strong>Assalamu’alaika</strong> ya Sayyidina Al-Ghaust wa Quthb共にzaman</p>
                <p>• <strong>Assalamu’alaika</strong> ya Shohibul Waket wa Shohibut Darek</p>
                <p>• <strong>Assalamu’alaika</strong> ya Shohibul Wilayah wa Shohibul Balad</p>
                <p>• <strong>Assalamu’alaika</strong> ya Birrul Walidain wa Ahlil Baits</p>
                <p>• <strong>Assalamu’alaika</strong> ya Arwahi wal Jazadi fi Qolbi Pasangan (Istri) dan Anak-anakku</p>
                <p>• <strong>Assalamu’alaika</strong> ya Arwahi Muslimin Muslimat wal Mukminina wal Mukminat</p>
                <p>• <strong>Assalamu’alaika</strong> ya Arwahi Makhluk Cicing, ya Makhluk Eling, ya Makhluk Nyaring</p>
                <p>• <strong>Assalamu’alaina wa ‘ala ‘ibadillahis sholihin</strong> (Sholawat)</p>
              </div>
            </div>

            {/* MATAN 4: 4 PERINTAH ENERGI ILAHI (MAHAKARYA SULUK) */}
            <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 shadow-sm ${
              isKitabTheme ? 'card-kitab-frame' : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="border-b pb-3">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isKitabTheme ? 'text-[#8f632d]' : 'text-amber-400'}`}>
                  LANGKAH 4 — INSTRUKSI 4 PERINTAH ENERGI ILAHI
                </span>
                <h3 className={`text-base sm:text-xl font-bold ${isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-white'}`}>
                  Deklarasi Perintah Energi Ilahi (Surrun)
                </h3>
                <p className={`text-xs mt-1 ${isKitabTheme ? 'text-[#634224]' : 'text-slate-400'}`}>
                  "Bismillah... Ya Allah Ya Waliy, Ya Muhyi, Ya Hayyu Ya Qoyyum yang melindungi, memerintah serta tepat waktu & tepat sasaran. Dengan nama-Mu Ya Allah, izinkan aku memberi perintah kepada semua makhluk: Wahai Energi Ilahi, dengarkan & laksanakan secara sempurna dan cepat!"
                </p>
              </div>

              {/* PERINTAH 1 */}
              <div className={`p-5 rounded-2xl border space-y-2.5 ${
                isKitabTheme ? 'bg-[#fbf7ee] border-[#dfcfb0]' : 'bg-slate-950 border-slate-800'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-600 text-white text-[10px] font-black uppercase">
                    PERINTAH KE-1 • KONTROL SYSTEM & 8 MERIDIAN
                  </span>
                  <span className="text-xs font-bold text-amber-700 font-mono">SURRUN</span>
                </div>
                <div className="font-kitab-arabic arabic-text">
                  يَا اللَّهُ يَا عَزِيزُ يَا بَارِئُ يَا حَيُّ يَا قَيُّومُ
                </div>
                <p className="text-xs sm:text-sm leading-relaxed">
                  "Saya perintahkan Energi Ilahi untuk: <strong>Membuka System Art Kontrol, Power Kontrol, Skill Kontrol, Divine Kontrol, Magic Kontrol, System, Root System, Energi, Gate (Barier) Kontrol, 8 Jalur Gerbang Meridian Khusus (8 Pintu Rezeki) dan Gerbang Quantum Ruang serta Quantum Waktu-ku</strong> secara cepat dan sempurna... SEMUANYA SALING SINKRON DAN BERSATU serta membantu aku secara cepat dan sempurna."
                </p>
              </div>

              {/* PERINTAH 2 */}
              <div className={`p-5 rounded-2xl border space-y-2.5 ${
                isKitabTheme ? 'bg-[#fbf7ee] border-[#dfcfb0]' : 'bg-slate-950 border-slate-800'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-black uppercase">
                    PERINTAH KE-2 • REALISASI KUN HAJAT & UNSUR BOSON
                  </span>
                  <span className="text-xs font-bold text-amber-700 font-mono">SURRUN</span>
                </div>
                <div className="font-kitab-arabic arabic-text">
                  يَا مَالِكُ يَا قُدُّوسُ يَا حَيُّ يَا قَيُّومُ • يَا رَزَّاقُ يَا فَتَّاحُ يَا بَاسِطُ يَا شَكُورُ يَا مُقِيتُ
                </div>
                <div className="text-xs sm:text-sm leading-relaxed space-y-1.5">
                  <p>"SAYA PERINTAHKAN ENERGI ILAHI (Unsur Boson) UNTUK MENGHANTARKAN (realisasi KUN ALLAH) SEMUA HAJAT-HAJATKU DAN SEMUA KEINGINAN KAMI SECARA SEMPURNA SAMPAI KE TANGAN KAMI SECARA CEPAT DAN SEMPURNA SAAT INI JUGA TANPA MENJADIKAN SEBUAH MASALAH DI KEMUDIAN HARI:"</p>
                  <ul className="list-disc list-inside pl-2 space-y-1 font-semibold">
                    <li>Keberlimpahan dan kemapanan materi dalam hidup kami.</li>
                    <li>Keberlimpahan saat ini menjadikan kami makhluk cahaya yang selamat dunia akhirat.</li>
                    <li>Menjauhkan kami dari orang-orang yang memiliki niatan jahat.</li>
                    <li>Mendekatkan dan dikelilingi orang-orang yang tulus mencintai kami di manapun dan kapanpun kami berada.</li>
                  </ul>
                </div>
              </div>

              {/* PERINTAH 3 */}
              <div className={`p-5 rounded-2xl border space-y-2.5 ${
                isKitabTheme ? 'bg-[#fbf7ee] border-[#dfcfb0]' : 'bg-slate-950 border-slate-800'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md bg-sky-600 text-white text-[10px] font-black uppercase">
                    PERINTAH KE-3 • PERCEPATAN QUANTUM RUANG & WAKTU
                  </span>
                  <span className="text-xs font-bold text-amber-700 font-mono">SURRUN</span>
                </div>
                <div className="font-kitab-arabic arabic-text">
                  يَا حَسِيبُ يَا بَدِيعُ يَا حَيُّ يَا قَيُّومُ
                </div>
                <div className="text-xs sm:text-sm leading-relaxed space-y-1.5">
                  <p>"Izinkan kami memberikan perintah kepada ENERGI ILAHI: Saat ini AKU PERINTAHKAN KALIAN UNTUK MERUBAH QUANTUM RUANG & WAKTU-KU:"</p>
                  <ul className="list-disc list-inside pl-2 space-y-1">
                    <li>Berikan pemahaman dan kebenaran yang mendalam tentang semua hak dan semua hal.</li>
                    <li>Jadikan semua proses yang terjadi, seberapa lamanya menuju sempurna, maka <strong>ubahlah dalam Quantum Waktu-ku ini hanya sekejap saja: TERJADILAH PERCEPATAN!</strong></li>
                    <li>Jadikan kekuatan Quantum Ruang & Waktu kami ini berjalan dalam <strong>24 jam (continue) sampai selamanya</strong> (sampai kami bertemu dengan-NYA baik di dunia dan di akhirat nanti).</li>
                    <li>Jadikan 24 jam ini selalu dalam keadaan <strong>terpelihara dan terlindungi</strong>.</li>
                    <li>Serta jadikan tubuh fisik kami saat ini (aku, pasangan, anak-anak) berada di surga dunia dan bisa menikmati segala fasilitasnya sebagai ladang dakwah serta perjalanan suluk kami.</li>
                  </ul>
                </div>
              </div>

              {/* PERINTAH 4 */}
              <div className={`p-5 rounded-2xl border space-y-2.5 ${
                isKitabTheme ? 'bg-[#fbf7ee] border-[#dfcfb0]' : 'bg-slate-950 border-slate-800'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-black uppercase">
                    PERINTAH KE-4 • STANDARISASI NPT & 7 TUBUH CAHAYA
                  </span>
                  <span className="text-xs font-bold text-amber-700 font-mono">SURRUN</span>
                </div>
                <div className="font-kitab-arabic arabic-text">
                  يَا قَوِيُّ يَا حَيُّ يَا قَيُّومُ • يَا جَامِعُ
                </div>
                <div className="text-xs sm:text-sm leading-relaxed space-y-1.5">
                  <p>"Saya perintahkan ENERGI ILAHI untuk: <strong>Membuka 7 kemampuan tubuh kami, membersihkan kotoran sampai sisa pembakaran, memperbaiki sampai sempurna seperti halnya Rasulullah SAW, mengobati, mengembangkan, menyempurnakan sampai tingkatan khawasul khawas (manusia cahaya), memurnikan & memadatkan semua unsur, menata sistem dan root system kami sampai SEMPURNA:</strong>"</p>
                  <ol className="list-decimal list-inside pl-2 space-y-1 font-medium">
                    <li>Sempurna gerak batin kami dan sempurna kehidupan dunia kami.</li>
                    <li>Pancaran proyeksi batin yang busuk + aib biarlah tetap tersembunyi (sembari dimurnikan menjadi energi murni) tanpa mengganggu makhluk lain.</li>
                    <li>Pancaran batin yang baik / niat baik mawujud ke dunia kami secara sempurna dan disempurnakan oleh-NYA.</li>
                    <li>Terwujudnya materialisasi hajat kami & aktifnya kasyaf-kasyaf kami.</li>
                    <li>Kesehatan serta transmutasi di 7 tubuh kami melebihi para leluhur kami.</li>
                  </ol>
                </div>
              </div>

              {/* PENUTUP MANTRA & KUN FAYAKUN */}
              <div className={`p-5 rounded-2xl border text-center space-y-3 ${
                isKitabTheme ? 'bg-[#f4ebd5] border-[#cbb38b]' : 'bg-slate-950 border-amber-500/30'
              }`}>
                <p className="text-xs sm:text-sm font-semibold">
                  "Ya Allah Ya Rahman, dengan semua kuasa yang KAU miliki maka jadikan Perintah 1, 2, 3, 4 BISA BERFUSI DAN TERWUJUD semua NIAT, AFIRMASI, PERINTAH dan SINYAL KAMI!"
                </p>
                <div className="font-kitab-arabic arabic-text text-xl sm:text-2xl font-bold text-amber-800 dark:text-amber-300">
                  كُنْ اللَّهُ • فَيَكُونُ رَسُولُ اللَّهِ • بِرَبِّكُمُ جِبْرِيلُ وَمِيكَائِيلُ مَلَائِكَةُ اللَّهِ<br />
                  أَنَا خَلِيفَةُ اللَّهِ • أَنَا حَبِيبُ اللَّهِ • أَنَا خَلِيلُ اللَّهِ<br />
                  <span className="text-2xl">سُرٌّ (SURRUN...)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* BAGIAN 2: PROTOKOL BARIER HARIAN (TIAP PAGI)                              */}
        {/* ========================================================================= */}
        {activeTab === 'barier' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl text-center space-y-5 ${
              isKitabTheme ? 'card-kitab-frame' : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="max-w-xl mx-auto space-y-2">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto border shadow-md ${
                  barierActive 
                    ? isKitabTheme ? 'bg-[#dbeef0] text-[#1b6b55] border-[#b0d9d3]' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : isKitabTheme ? 'bg-[#ebdcc4] text-[#9e2a2b] border-[#cbb38b]' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                }`}>
                  <ShieldCheck className="w-9 h-9" />
                </div>
                <h2 className={`text-xl sm:text-2xl font-black ${isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-white'}`}>
                  Protokol Barier Harian (Tiap Pagi)
                </h2>
                <p className={`text-xs ${isKitabTheme ? 'text-[#634224]' : 'text-slate-400'}`}>
                  Dibaca setiap pagi sembari membaca <strong>Ayat Kursi</strong> untuk mengunci pelindung 24 jam & mengaktifkan proses penyempurnaan tubuh.
                </p>
              </div>

              {/* MATAN BARIER */}
              <div className={`max-w-2xl mx-auto p-5 sm:p-6 rounded-2xl border text-left space-y-3 ${
                isKitabTheme ? 'bg-[#faf2e3] border-[#dfcfb0] text-[#2c1810]' : 'bg-slate-950 border-slate-800 text-slate-200'
              }`}>
                <div className="font-kitab-arabic arabic-text text-xl">
                  يَا اللَّهُ يَا حَفِيظُ يَا قَوِيُّ يَا مُنْتَقِمُ • وَإِنَّرْجِي آيَةِ الْكُرْسِيِّ (يَا حَيُّ يَا قَيُّومُ)
                </div>
                <div className="text-xs sm:text-sm leading-relaxed space-y-2 italic font-serif">
                  <p>"Saat ini: IZINKAN SEMUA PROSES DAN PERINTAH 1, 2, 3, 4..."</p>
                  <p>"IZINKAN SEMUA PROSES PENYEMPURNAAN SISTEM, ENERGI, ROOT SYSTEM, MATERIALISASI DAN PELEPASAN LIMITER SERTA PENEMPAAN SEMUA HAL DI DALAM TUBUH."</p>
                  <p className="font-bold text-amber-800 dark:text-amber-400 not-italic">
                    "SEMUANYA MULAI AKTIF SAAT SAYA MENGAKTIFKAN BARIER."
                  </p>
                  <p className="text-sm font-black text-rose-700 dark:text-rose-400 not-italic">
                    "BISMILLAH... SAATNYA BARIER AKTIF!"
                  </p>
                </div>
              </div>

              {/* TOMBOL AKTIVASI BARIER */}
              <div className="pt-2">
                <button
                  onClick={handleActivateBarier}
                  className={`px-8 py-4 rounded-2xl text-white font-black text-sm shadow-xl transition active:scale-95 cursor-pointer ${
                    barierActive
                      ? isKitabTheme ? 'bg-[#1b6b55] hover:bg-[#155644]' : 'bg-emerald-600 hover:bg-emerald-500'
                      : isKitabTheme ? 'bg-[#9e2a2b] hover:bg-[#852324]' : 'bg-gradient-to-r from-amber-500 to-rose-600'
                  }`}
                >
                  {barierActive ? `✅ BARIER TELAH AKTIF HARI INI (${barierActivatedAt})` : '⚡ AKTIFKAN BARIER HARI INI'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* BAGIAN 3: 33 RUANG KASYAF (TIAP PAGI & BA'DA SHOLAT)                      */}
        {/* ========================================================================= */}
        {activeTab === 'kasyaf' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl text-center space-y-6 ${
              isKitabTheme ? 'card-kitab-frame' : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="max-w-xl mx-auto space-y-2">
                <span className="text-3xl">📿</span>
                <h2 className={`text-xl sm:text-2xl font-black ${isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-white'}`}>
                  Memasukkan ke 33 Ruang Kasyaf
                </h2>
                <p className={`text-xs ${isKitabTheme ? 'text-[#634224]' : 'text-slate-400'}`}>
                  Diamalkan <strong>setiap pagi & setiap ba'da sholat</strong> dengan membaca Asmaul Husna pengunci kasyaf:
                </p>
              </div>

              {/* BACAAN DZIKIR */}
              <div className="arabic-quote-box max-w-xl mx-auto text-2xl sm:text-3xl font-bold">
                يَا رَحْمَٰنُ يَا رَحِيمُ يَا حَسِيبُ
              </div>
              <p className="text-xs sm:text-sm italic font-serif text-amber-800 dark:text-amber-300">
                "YAA ROHMAAN YAA ROHIIM YAA HASIIB"
              </p>

              {/* TASBIH DIGITAL INTERAKTIF (33 BUTIR) */}
              <div className={`max-w-md mx-auto p-6 rounded-3xl border space-y-4 ${
                isKitabTheme ? 'bg-[#faf2e3] border-[#dfcfb0]' : 'bg-slate-950 border-slate-800'
              }`}>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>Hitungan Butir Kasyaf</span>
                  <span className="text-amber-700 dark:text-amber-400">Putaran Selesai: {totalKasyafRounds}x</span>
                </div>

                {/* Counter Besar */}
                <div className="py-4">
                  <div className={`text-6xl sm:text-7xl font-black font-mono tracking-tight ${
                    isKitabTheme ? 'text-[#9e2a2b]' : 'text-amber-400'
                  }`}>
                    {counterKasyaf} <span className="text-2xl text-slate-400">/ 33</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {counterKasyaf === 0 ? "Tekan tombol di bawah untuk mulai dzikir" : `Sisa ${33 - counterKasyaf} kali bacaan`}
                  </p>
                </div>

                {/* Tombol Klik Tasbih */}
                <div className="flex gap-2">
                  <button
                    onClick={handleIncrementKasyaf}
                    className={`flex-1 py-4 rounded-2xl text-white font-black text-base shadow-xl active:scale-95 transition cursor-pointer ${
                      isKitabTheme ? 'bg-[#3a2211] hover:bg-[#26150a]' : 'bg-emerald-600 hover:bg-emerald-500'
                    }`}
                  >
                    + HITUNG (DZIKIR)
                  </button>
                  <button
                    onClick={() => setCounterKasyaf(0)}
                    className={`p-4 rounded-2xl border text-xs font-bold transition cursor-pointer ${
                      isKitabTheme ? 'bg-[#eee3cb] border-[#d8c3a1] text-[#634224]' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                    title="Reset Hitungan"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
