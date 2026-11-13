"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppNavbar, AppSidebar, SUPER_ADMIN_EMAILS } from '@/components/layout/AppNavbar';
import { getSavedDeviceUser, savePermanentDeviceUser } from '@/lib/authHelper';
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
  ChevronRight,
  RefreshCw,
  Award,
  Zap,
  BookOpen,
  ArrowLeft,
  Heart,
  Scroll,
  Printer
} from 'lucide-react';

export default function WiridKhususPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Tab: 'wirid_harian' | 'afirmasi' | 'barier' | 'kasyaf'
  const [activeTab, setActiveTab] = useState('wirid_harian');
  
  // Tasbih Counter untuk 33 Ruang Kasyaf
  const [counterKasyaf, setCounterKasyaf] = useState(0);
  const [totalKasyafRounds, setTotalKasyafRounds] = useState(0);

  // Status Aktivasi Barier
  const [barierActive, setBarierActive] = useState(false);
  const [barierActivatedAt, setBarierActivatedAt] = useState(null);

  // Status Centang Log Pribadi
  const [dailyLog, setDailyLog] = useState({});

  useEffect(() => {
    try {
      const user = getSavedDeviceUser();
      if (user) {
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

  // State PIN / Key Unlock
  const [adminKeyInput, setAdminKeyInput] = useState('');
  const [keyError, setKeyError] = useState('');
  const [showUnlockForm, setShowUnlockForm] = useState(false);

  const handleUnlockAdmin = (e) => {
    e.preventDefault();
    const cleanKey = adminKeyInput.trim().toLowerCase();

    // Validasi PIN Rahasia atau Email Super Admin
    if (
      cleanKey === '1984' ||
      cleanKey === '313' ||
      cleanKey === 'kangiman' ||
      cleanKey === 'buku-saku-admin-2026' ||
      SUPER_ADMIN_EMAILS.includes(cleanKey)
    ) {
      const superAdminUser = {
        id: currentUser?.id || 'super-admin-kang-iman',
        email: cleanKey.includes('@') ? cleanKey : 'imannnurjanan84@gmail.com',
        name: 'Kang Iman (Super Admin)',
        role: 'super_admin'
      };

      savePermanentDeviceUser(superAdminUser);
      setCurrentUser(superAdminUser);
      setKeyError('');
      alert('Alhamdulillah! Kunci Ruang Privat Terbuka.');
    } else {
      setKeyError('Kunci / PIN atau email tidak cocok. Silakan periksa kembali.');
    }
  };

  // Jika Bukan Super Admin, Tampilkan Layar Kunci yang Bersih dan Formal
  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-900">
        <AppNavbar 
          onToggleSidebar={() => setIsSidebarOpen(true)}
          currentUser={currentUser}
          activeTitle="Ruang Pribadi Terkunci"
        />
        <div className="flex-1 max-w-md w-full mx-auto p-4 sm:p-6 flex flex-col items-center justify-center text-center space-y-5 animate-in fade-in">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center border border-slate-300 bg-white text-slate-900 shadow-sm">
            <Lock className="w-8 h-8 text-slate-800" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-black">
              Ruang Riyadhoh Pribadi Terkunci
            </h2>
            <p className="text-xs leading-relaxed max-w-sm mx-auto text-slate-600">
              Halaman ini khusus memuat rancangan batin, wirid harian, afirmasi paten, dan protokol suluk pribadi Kang Iman.
            </p>
          </div>

          {/* Form Pembuka Kunci Khusus Kang Iman */}
          <div className="w-full p-6 rounded-2xl border border-slate-300 bg-white text-left space-y-3 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
              <Crown className="w-4 h-4 text-amber-700" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Buka Kunci Akses Kang Iman
              </h3>
            </div>

            <form onSubmit={handleUnlockAdmin} className="space-y-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold mb-1 text-slate-800">
                  Masukkan Email Gmail Admin / PIN Akses:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PIN 1984 / 313 atau Email Gmail"
                  value={adminKeyInput}
                  onChange={(e) => {
                    setAdminKeyInput(e.target.value);
                    if (keyError) setKeyError('');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:border-slate-800 transition"
                />
              </div>

              {keyError && (
                <p className="text-[11px] font-semibold text-rose-700 bg-rose-50 p-2 rounded-xl border border-rose-200">
                  {keyError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-black shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Buka Kunci Sekarang</span>
              </button>
            </form>
          </div>

          <Link
            href="/npt"
            className="px-5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-black hover:bg-slate-200 transition"
          >
            ← Kembali ke Portal NPT
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-100 text-slate-950">
      {/* Top Navbar & Sidebar */}
      <AppNavbar 
        onToggleSidebar={() => setIsSidebarOpen(true)}
        currentUser={currentUser}
        activeTitle="Klaster 4: Ruang Privat Kang Iman"
      />
      <AppSidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentUser={currentUser}
        activePath="/wirid-khusus"
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-6 pb-24 space-y-6">
        
        {/* KLASTER 4 SWITCHER BAR (PUTIH BERSIH) */}
        <div className="p-3.5 rounded-2xl border border-slate-300 bg-white shadow-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider bg-slate-900 text-white">
              👑 Klaster 4: Ruang Privat Kang Iman
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/wirid-khusus"
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white shadow-xs"
            >
              📿 Riyadhoh & Wirid Khusus
            </Link>
            <Link
              href="/admin/maktabah"
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 transition"
            >
              📚 Dapur Ngaji & Maktabah Kitab
            </Link>
            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-black hover:bg-slate-100 transition"
            >
              🏠 Portal 4 Klaster
            </Link>
          </div>
        </div>
        
        {/* HEADER KHUSUS KANG IMAN (PUTIH FORMAL BUKU) */}
        <div className="p-6 sm:p-8 rounded-2xl border border-slate-300 bg-white shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold border border-slate-300 bg-slate-50 text-slate-900 flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-600" />
                  <span>Koleksi Rahasia Pribadi • Khusus Kang Iman</span>
                </span>
                <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                  barierActive 
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300' 
                    : 'bg-amber-50 text-amber-900 border-amber-300'
                }`}>
                  {barierActive ? `🛡️ Barier Aktif (${barierActivatedAt})` : '⚠️ Barier Belum Aktif'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black mt-3 tracking-tight text-black font-serif">
                Kitab Riyadhoh, Amalan Harian & Afirmasi Paten
              </h1>
              <p className="text-xs sm:text-sm mt-1.5 text-slate-700 italic">
                "Untaian Wirid Mahabbah, Munajat Kebajikan, Sholawat Pembuka (Al-Fatih), Barier 24 Jam & 33 Ruang Kasyaf."
              </p>
            </div>

            <div className="text-xs text-slate-500 font-semibold self-start sm:self-auto bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              📖 Format Naskah Formal (Kontras Tinggi)
            </div>
          </div>

          {/* Navigasi 4 Bagian Wirid (Tabs Kontras Tinggi) */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={() => setActiveTab('wirid_harian')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                activeTab === 'wirid_harian'
                  ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                  : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
              }`}
            >
              <Heart className="w-4 h-4 text-rose-600" />
              <span>1. Amalan & Munajat Harian</span>
              <span className="px-1.5 py-0.5 bg-amber-400 text-black text-[9px] font-black rounded-md">UTAMA</span>
            </button>

            <button
              onClick={() => setActiveTab('afirmasi')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                activeTab === 'afirmasi'
                  ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                  : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>2. Afirmasi Paten Level 5 (4 Perintah)</span>
            </button>

            <button
              onClick={() => setActiveTab('barier')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                activeTab === 'barier'
                  ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                  : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>3. Aktivasi Barier Pagi</span>
            </button>

            <button
              onClick={() => setActiveTab('kasyaf')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                activeTab === 'kasyaf'
                  ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                  : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
              }`}
            >
              <Compass className="w-4 h-4 text-sky-600" />
              <span>4. 33 Ruang Kasyaf (Tasbih)</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BAGIAN 1: AMALAN & MUNAJAT HARIAN KANG IMAN (PUTIH TOTAL, TEKS HITAM)     */}
        {/* ========================================================================= */}
        {activeTab === 'wirid_harian' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* KOTAK PEMBUKA: SYAHADAT, AL-IKHLAS 4X & ISTIGHFAR */}
            <div className="p-6 sm:p-8 rounded-2xl border border-slate-300 bg-white shadow-sm space-y-4">
              <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                    FASAL 1 — PEMBUKA GERBANG RUHANIAH
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-black font-serif mt-0.5">
                    Syahadatain, Al-Ikhlas (4x), Istighfar & Husnul Khotimah
                  </h3>
                </div>
                <span className="text-2xl">📿</span>
              </div>

              {/* Teks Arab Syahadat & Al-Ikhlas */}
              <div className="space-y-4">
                <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-300 text-slate-950 text-right font-kitab-arabic text-2xl sm:text-3xl leading-loose font-bold">
                  أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللَّهِ
                </div>

                <div className="p-5 rounded-xl bg-slate-50 border border-slate-300 text-slate-950 text-sm leading-relaxed space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <strong className="text-black text-sm">Surah Al-Ikhlas (Dibaca 4x):</strong>
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded bg-slate-200 text-slate-900 border border-slate-300">
                      4 KALI
                    </span>
                  </div>
                  <div className="font-kitab-arabic text-right text-2xl sm:text-3xl text-black font-bold pt-1 leading-loose">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ<br />
                    قُلْ هُوَ اللَّهُ أَحَدٌ • اللَّهُ الصَّمَدُ • لَمْ يَلِدْ وَلَمْ يُولَدْ • وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-slate-50 border border-slate-300 text-slate-950 text-sm leading-relaxed space-y-3">
                  <strong className="text-black text-sm block border-b border-slate-200 pb-2">
                    Istighfar & Doa Husnul Khotimah:
                  </strong>
                  <div className="font-kitab-arabic text-right text-2xl sm:text-3xl text-black font-bold leading-loose">
                    أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ
                  </div>
                  <div className="font-kitab-arabic text-right text-2xl sm:text-3xl text-rose-900 font-bold pt-1 leading-loose">
                    يَا اللَّهُ بِهَا • يَا اللَّهُ بِهَا • يَا اللَّهُ بِحُسْنِ الْخَاتِمَةِ
                  </div>
                </div>
              </div>
            </div>

            {/* KOTAK UNTAIAN SHOLAWAT AGUNG */}
            <div className="p-6 sm:p-8 rounded-2xl border border-slate-300 bg-white shadow-sm space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                  FASAL 2 — UNTAIAN SHOLAWAT KHUSUS & NUR MUHAMMAD
                </span>
                <h3 className="text-lg sm:text-xl font-black text-black font-serif mt-0.5">
                  Sholawat Ya Ahad, Sholawat Adrikni & Sholawat Nuris Sari
                </h3>
              </div>

              <div className="space-y-4">
                {/* Sholawat Ya Ahad */}
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-300 space-y-2">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wide block border-b border-slate-200 pb-1">
                    1. Sholawat Ya Ahad:
                  </span>
                  <div className="font-kitab-arabic text-right text-xl sm:text-2xl text-black font-bold leading-loose">
                    اللَّهُمَّ يَا أَحَدُ صَلِّ عَلَى سَيِّدِنَا أَحْمَدَ<br />
                    اللَّهُمَّ يَا أَحَدُ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ<br />
                    اللَّهُمَّ يَا أَحَدُ صَلِّ عَلَى الْمَهْدِيِّ خَلِيفَتِكَ يَا أَحَدُ
                  </div>
                </div>

                {/* Sholawat Awwalin & Adrikni */}
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-300 space-y-2">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wide block border-b border-slate-200 pb-1">
                    2. Sholawat Awwalin & Sholawat Adrikni:
                  </span>
                  <div className="font-kitab-arabic text-right text-xl sm:text-2xl text-black font-bold leading-loose">
                    اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ فِي الْأَوَّلِينَ وَالْآخِرِينَ فِي الْمَلَإِ الْأَعْلَى إِلَىٰ يَوْمِ الدِّينِ<br />
                    اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ قَدْ ضَاقَتْ حِيلَتِي أَدْرِكْنِي يَا رَسُولَ اللَّهِ
                  </div>
                </div>

                {/* Sholawat Nuris Sari */}
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-300 space-y-2">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wide block border-b border-slate-200 pb-1">
                    3. Sholawat Nuris Sari (Penyatu Segala Athwar):
                  </span>
                  <div className="font-kitab-arabic text-right text-xl sm:text-2xl text-black font-bold leading-loose">
                    اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ نُورِكَ السَّارِي وَمَدَدِكَ الْجَارِي وَاجْمَعْنِي بِهِ فِي كُلِّ أَطْوَارِي وَعَلَىٰ آلِهِ وَصَحْبِهِ يَا نُورُ
                  </div>
                </div>
              </div>
            </div>

            {/* KOTAK MUNAJAT PERLINDUNGAN & PEMBIMBING RUHANI (KINI PUTIH BERSIH & TEKS HITAM PEKAT) */}
            <div className="p-6 sm:p-8 rounded-2xl border border-slate-300 bg-white shadow-sm space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                  FASAL 3 — MUNAJAT PENJAGAAN KELUARGA & GURU RUHANI
                </span>
                <h3 className="text-lg sm:text-xl font-black text-black font-serif mt-0.5">
                  Permohonan Putusnya Harapan Syaitan & Pembimbing Rijalul Ghaib
                </h3>
              </div>

              <div className="space-y-4 text-slate-950 font-serif">
                {/* Pemutus Godaan Syaitan */}
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-300 space-y-2">
                  <strong className="text-slate-950 font-sans text-sm font-bold flex items-center gap-1.5 border-b border-slate-200 pb-2">
                    🛡️ Pemutus Godaan Syaitan untuk Keturunan:
                  </strong>
                  <p className="text-slate-950 text-sm sm:text-base leading-relaxed pt-1">
                    "Ya Allah, hamba meminta: <strong>putuskanlah harapan syaitan untuk menggoda kami (aku, istri, dan keturunan kami)</strong>, sebagaimana syaitan telah putus harapannya dari mengharapkan rahmat-Mu."
                  </p>
                </div>

                {/* Pembimbing Ruhani */}
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-300 space-y-3">
                  <strong className="text-slate-950 font-sans text-sm font-bold flex items-center gap-1.5 border-b border-slate-200 pb-2">
                    👑 Pembimbing Ruhani & Pengurusan Jenazah:
                  </strong>
                  <p className="text-slate-950 text-sm sm:text-base leading-relaxed">
                    "Aku mohon Ya Allah, jadikanlah <strong>Rasulullah SAW, Sayyidina Jibril, Sayyidina Muqorrobin, Imam Mahdi, Nabi Khidir AS, Al-Ghaust, Qutubuzzaman, Shohibud Dark, Shohibul Waqt, Shohibul Balad, dan Shohibul Wilayah</strong> sebagai pembimbing dan guru kami..."
                  </p>
                  <p className="text-slate-950 text-sm sm:text-base leading-relaxed">
                    "Serta jadikanlah saat kami meninggal kelak, <strong>merekalah yang menyolatkan kami dan mengurus jenazah kami</strong> sebelum semua habib, masyarakat, serta pejabat mensholati kami. Dan saat kami meninggal, jadikanlah agar kami tetap bisa bermanfaat untuk semua orang seperti halnya Rasulullah SAW, serta sandingkanlah kami bersama para Waliyullah dan Rasulullah SAW."
                  </p>
                </div>
              </div>
            </div>

            {/* KOTAK MUNAJAT KEBERLIMPAHAN DUNIA & KEZUHUDAN (PUTIH BERSIH & TEKS HITAM) */}
            <div className="p-6 sm:p-8 rounded-2xl border border-slate-300 bg-white shadow-sm space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                  FASAL 4 — KEBERLIMPAHAN HARTA ANAS BIN MALIK & DERAJAT ABUL HASAN ASY-SYADZILI
                </span>
                <h3 className="text-lg sm:text-xl font-black text-black font-serif mt-0.5">
                  Kaya Tanpa Lelah Bekerja, Pintar Tanpa Belajar & Doa Secepat Petir
                </h3>
              </div>

              <div className="space-y-4 text-slate-950 font-serif">
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-300">
                  <p className="text-slate-950 text-sm sm:text-base leading-relaxed">
                    "Ya Allah, limpahkanlah semasa hidup kami <strong>semua kenikmatan dunia yang terbaik dan tidak pernah surut seperti halnya harta Anas bin Malik</strong>, serta buatlah hati kami <strong>Zuhud terhadap dunia</strong>, sebagaimana Engkau memberikan keberlimpahan Iman, Islam, Ihsan, rezeki, harta, tahta, kesehatan, ilmu dan kezuhudan kepada <strong>Syeikh Abu Hasan Asy-Syadzili</strong>."
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-slate-50 border border-slate-300 space-y-2.5">
                  <strong className="text-slate-950 font-sans text-sm font-bold flex items-center gap-1.5 border-b border-slate-200 pb-2">
                    ⚡ Rahasia Karomah Doa Habib Sholeh Tanggul & Kyai Asrory:
                  </strong>
                  <p className="text-slate-950 text-sm sm:text-base leading-relaxed pt-1">
                    "Ya Allah Robb, jadikanlah kami <strong>kaya tanpa bekerja</strong>, jadikanlah kami <strong>pintar tanpa belajar</strong>, dan jadikanlah doa-doa kami <strong>terkabul lebih cepat dari kilatan petir</strong>, sebagaimana Habib Sholeh berdoa dan sebagaimana Engkau memberikan keistimewaan ini kepada <strong>Habib Sholeh Tanggul</strong>."
                  </p>
                  <p className="text-slate-950 text-sm sm:text-base leading-relaxed">
                    "Ya Allah, jadikanlah aku berdoa seperti halnya <strong>Kyai Asrory Al-Ishaqi</strong> berdoa kepada-MU."
                  </p>
                </div>
              </div>
            </div>

            {/* KOTAK DZIKIR ASMA PENGABUL HAJAT & SHOLAWAT FATIH */}
            <div className="p-6 sm:p-8 rounded-2xl border border-slate-300 bg-white shadow-sm space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                  FASAL 5 — ASMA PENGABUL HAJAT & SHOLAWATUL FATIH PEMBUKA KUNCI
                </span>
                <h3 className="text-lg sm:text-xl font-black text-black font-serif mt-0.5">
                  Qodhiyal Hajat, Hasbunallah & Sholawatul Fatih
                </h3>
              </div>

              <div className="space-y-4">
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-300 space-y-3">
                  <div className="font-kitab-arabic text-right text-2xl sm:text-3xl text-black font-bold leading-loose">
                    اللَّهُمَّ يَا قَاضِيَ الْحَاجَاتِ (٣x)<br />
                    اللَّهُمَّ يَا كَافِيَ الْمُهِمَّاتِ • اللَّهُمَّ يَا رَافِعَ الدَّرَجَاتِ<br />
                    اللَّهُمَّ يَا شَافِيَ الْأَمْرَاضِ • اللَّهُمَّ يَا أَرْحَمَ الرَّاحِمِينَ
                  </div>

                  <div className="font-kitab-arabic text-right text-2xl sm:text-3xl text-emerald-950 font-bold pt-2 border-t border-slate-200 leading-loose">
                    حَسْبُنَا اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ
                  </div>
                </div>

                {/* SHOLAWATUL FATIH LENGKAP */}
                <div className="p-5 sm:p-6 rounded-xl bg-slate-50 border border-slate-300 text-slate-950 text-right font-kitab-arabic text-2xl sm:text-3xl leading-loose font-bold">
                  اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ الْفَاتِحِ لِمَا أُغْلِقَ، وَالْخَاتِمِ لِمَا سَبَقَ، نَاصِرِ الْحَقِّ بِالْحَقِّ، وَالْهَادِي إِلَىٰ صِرَاطِكَ الْمُسْتَقِيمِ، صَلَّى اللَّهُ عَلَيْهِ وَعَلَىٰ آلِهِ وَأَصْحَابِهِ حَقَّ قَدْرِهِ وَمِقْدَارِهِ الْعَظِيمِ
                </div>

                {/* SHOLAWAT MAQ'ADUL MUQORROB & PENUTUP */}
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-300 space-y-3 text-center">
                  <div className="font-kitab-arabic text-2xl sm:text-3xl text-black font-bold leading-loose">
                    اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَأَنْزِلْهُ الْمَقْعَدَ الْمُقَرَّبَ عِنْدَكَ يَوْمَ الْقِيَامَةِ<br />
                    يَا رَبِّ صَلِّ عَلَىٰ مُحَمَّدٍ وَافْتَحْ مِنَ الْخَيْرِ كُلَّ مُغْلَقٍ
                  </div>
                  <p className="text-xs sm:text-sm italic font-serif text-slate-800">
                    "Ya Rabbi Sholli 'Ala Muhammad Waftah Minal Khoiri Kulla Mughlaq (Wahai Tuhanku, limpahkanlah sholawat atas Nabi Muhammad dan bukakanlah segala pintu kebaikan yang terkunci)."
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* BAGIAN 2: AFIRMASI PATEN LEVEL 5 (LENGKAP & KONTRAST TINGGI)             */}
        {/* ========================================================================= */}
        {activeTab === 'afirmasi' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* KOTAK PANDUAN PENGANTAR */}
            <div className="p-6 rounded-2xl border border-slate-300 bg-white shadow-sm space-y-2.5 text-xs sm:text-sm leading-relaxed text-slate-900">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold flex items-center gap-1.5 text-slate-950">
                  <BookOpen className="w-4 h-4 text-amber-700" />
                  <span>Petunjuk Eksekusi Mantra & Afirmasi Harian:</span>
                </span>
                <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                  Minimal 2 Minggu Sekali / Tiap Pagi-Petang
                </span>
              </div>
              <ul className="list-disc list-inside space-y-1 pt-1 text-slate-800">
                <li>Setiap pagi/petang niatkan, perintahkan, serta <strong>dapatkan SINYAL</strong>.</li>
                <li>Setiap bacaan Arab & Asma bukan hanya sebuah bacaan, namun <strong>rasakan seperti MANTRA</strong> yang menghasilkan sensasi berbeda di tubuh Anda.</li>
                <li>Lambat laun afirmasi panjang akan berganti cukup dengan membaca <strong>MANTRA PENDEK</strong>.</li>
              </ul>
            </div>

            {/* MATAN 1: SINYAL & PENYERAPAN BIO UNSUR */}
            <div className="p-6 sm:p-8 rounded-2xl border border-slate-300 bg-white shadow-sm space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                  LANGKAH 1 — SINYAL & KETENANGAN PRIMORDIAL
                </span>
                <h3 className="text-lg sm:text-xl font-black text-black font-serif mt-0.5">
                  Inisiasi Sinyal & Penyerapan Bio Unsur Tubuh
                </h3>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 text-center font-kitab-arabic text-2xl text-black font-bold">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </div>

              <div className="p-5 rounded-xl bg-slate-50 border border-slate-300 text-slate-950 text-sm leading-relaxed space-y-2">
                <p className="font-bold text-black text-sm">SINYAL (Dzikir + Merasakan Ketenangan Sampai Mengalir):</p>
                <div className="font-kitab-arabic text-right text-2xl text-black font-bold">
                  يَا اللَّهُ يَا رَحْمَٰنُ يَا رَحِيمُ
                </div>
                <p className="italic font-serif text-sm sm:text-base pt-1">
                  "Aku menghirup dan menyerap <strong>bio unsur</strong> UNTUK mengembalikan <strong>7 martabat alam tubuhku</strong> sesuai kodrat-NYA."
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-50 border border-slate-300 text-slate-950 text-sm leading-relaxed space-y-2">
                <div className="font-kitab-arabic text-right text-2xl text-black font-bold">
                  إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ • لَا إِلَٰهَ إِلَّا اللَّهُ
                </div>
                <div className="space-y-1 pt-1 italic font-serif text-sm sm:text-base">
                  <p>• Tidak ada yang memberi kecuali Allah, Tidak ada yang memudaratkan kecuali Allah.</p>
                  <p>• Tidak ada yang memuliakan kecuali Allah, Tidak ada yang menghinakan kecuali Allah.</p>
                  <p>• Tidak ada yang memberi kecuali Allah, Tidak ada yang mencegah kecuali Allah.</p>
                </div>
                <div className="font-kitab-arabic text-right text-2xl text-black font-bold pt-2 border-t border-slate-200">
                  هُوَ ... أَنْتَ ... (يَا اللَّهُ يَا وَاجِدُ يَا غَنِيُّ يَا مُغْنِي يَا حَيُّ يَا قَيُّومُ)
                </div>
              </div>
            </div>

            {/* MATAN 2: NIAT PENETAPAN 5 PERAN / ARTIKETIPE DIRI */}
            <div className="p-6 sm:p-8 rounded-2xl border border-slate-300 bg-white shadow-sm space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                  LANGKAH 2 — PENETAPAN EKSISTENSI (5 MAQOM DIRI)
                </span>
                <h3 className="text-lg sm:text-xl font-black text-black font-serif mt-0.5">
                  Sholawat & Penetapan Peran di Latifah Diri
                </h3>
              </div>

              <div className="p-5 sm:p-6 rounded-xl bg-slate-50 border border-slate-300 text-slate-950 text-sm space-y-3.5">
                <p className="font-bold text-black text-sm uppercase tracking-wide border-b border-slate-200 pb-2">
                  JADIKAN DIRIKU INI MENJADI SEORANG :
                </p>
                <div className="space-y-2.5 leading-relaxed">
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                      1
                    </span>
                    <p className="text-sm sm:text-base"><strong>SEORANG "HAMBA Al-Waarist"</strong> yang taat & mewarisi 124 ribu rezeki, ilmu dan kehendak tekad para wali (di latifahku).</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                      2
                    </span>
                    <p className="text-sm sm:text-base"><strong>SEORANG "KHALIFAH Al-Awwal wa Dzul Jalaali wal Ikram"</strong> yang mengikuti jejak Rasulullah MUHAMMAD SAW.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                      3
                    </span>
                    <p className="text-sm sm:text-base"><strong>SEORANG "GURU An-Nuur wal Haadi wal Ghaniy"</strong> yang menerangi dan membimbing sesama.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                      4
                    </span>
                    <p className="text-sm sm:text-base"><strong>SEORANG "SUAMI Ar-Rasyiid wal Ghaniy"</strong> yang memimpin keluarga dengan bijaksana & berlimpah.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                      5
                    </span>
                    <p className="text-sm sm:text-base"><strong>SEORANG "AYAH An-Naafi' wal Ghaniy"</strong> yang memberi kemanfaatan besar & perlindungan bagi anak-anakku.</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-300 text-xs sm:text-sm italic font-serif text-slate-800">
                  *Bawa rasa ke dalam: Syahadat (Rasakan ALIF LAM MIM) • Sholawat • Al-Fatihah, Al-Ikhlas, Al-Falaq & Ayat Kursi.<br />
                  <strong className="text-black font-sans not-italic">"Terima kasih atas pertemuan ini ya Allah... Ya Rasulullah..."</strong>
                </div>
              </div>
            </div>

            {/* MATAN 3: TAWASUL & SALAM KOSMIK */}
            <div className="p-6 sm:p-8 rounded-2xl border border-slate-300 bg-white shadow-sm space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                  LANGKAH 3 — SALAM PENGHUBUNG FREKUENSI KOSMIK & RUHANI
                </span>
                <h3 className="text-lg sm:text-xl font-black text-black font-serif mt-0.5">
                  Untaian Assalamualaika (Transmisi 313 Jalur Ruh)
                </h3>
              </div>

              <div className="p-5 sm:p-6 rounded-xl bg-slate-50 border border-slate-300 text-slate-950 text-sm sm:text-base leading-loose space-y-1 font-serif">
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
            <div className="p-6 sm:p-8 rounded-2xl border border-slate-300 bg-white shadow-sm space-y-5">
              <div className="border-b border-slate-200 pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                  LANGKAH 4 — INSTRUKSI 4 PERINTAH ENERGI ILAHI
                </span>
                <h3 className="text-lg sm:text-xl font-black text-black font-serif mt-0.5">
                  Deklarasi Perintah Energi Ilahi (Surrun)
                </h3>
                <p className="text-xs sm:text-sm mt-1.5 text-slate-700 italic">
                  "Bismillah... Ya Allah Ya Waliy, Ya Muhyi, Ya Hayyu Ya Qoyyum yang melindungi, memerintah serta tepat waktu & tepat sasaran. Dengan nama-Mu Ya Allah, izinkan aku memberi perintah kepada semua makhluk: Wahai Energi Ilahi, dengarkan & laksanakan secara sempurna dan cepat!"
                </p>
              </div>

              {/* PERINTAH 1 */}
              <div className="p-5 sm:p-6 rounded-xl bg-slate-50 border border-slate-300 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="px-2.5 py-1 rounded bg-slate-900 text-white text-[11px] font-black uppercase">
                    PERINTAH KE-1 • KONTROL SYSTEM & 8 MERIDIAN
                  </span>
                  <span className="text-xs font-black text-amber-900 font-mono">SURRUN</span>
                </div>
                <div className="font-kitab-arabic text-right text-2xl text-black font-bold">
                  يَا اللَّهُ يَا عَزِيزُ يَا بَارِئُ يَا حَيُّ يَا قَيُّومُ
                </div>
                <p className="text-sm sm:text-base leading-relaxed text-slate-950 font-serif">
                  "Saya perintahkan Energi Ilahi untuk: <strong>Membuka System Art Kontrol, Power Kontrol, Skill Kontrol, Divine Kontrol, Magic Kontrol, System, Root System, Energi, Gate (Barier) Kontrol, 8 Jalur Gerbang Meridian Khusus (8 Pintu Rezeki) dan Gerbang Quantum Ruang serta Quantum Waktu-ku</strong> secara cepat dan sempurna... SEMUANYA SALING SINKRON DAN BERSATU serta membantu aku secara cepat dan sempurna."
                </p>
              </div>

              {/* PERINTAH 2 */}
              <div className="p-5 sm:p-6 rounded-xl bg-slate-50 border border-slate-300 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="px-2.5 py-1 rounded bg-slate-900 text-white text-[11px] font-black uppercase">
                    PERINTAH KE-2 • REALISASI KUN HAJAT & UNSUR BOSON
                  </span>
                  <span className="text-xs font-black text-amber-900 font-mono">SURRUN</span>
                </div>
                <div className="font-kitab-arabic text-right text-2xl text-black font-bold">
                  يَا مَالِكُ يَا قُدُّوسُ يَا حَيُّ يَا قَيُّومُ • يَا رَزَّاقُ يَا فَتَّاحُ يَا بَاسِطُ يَا شَكُورُ يَا مُقِيتُ
                </div>
                <div className="text-sm sm:text-base leading-relaxed space-y-2 text-slate-950 font-serif">
                  <p>"SAYA PERINTAHKAN ENERGI ILAHI (Unsur Boson) UNTUK MENGHANTARKAN (realisasi KUN ALLAH) SEMUA HAJAT-HAJATKU DAN SEMUA KEINGINAN KAMI SECARA SEMPURNA SAMPAI KE TANGAN KAMI SECARA CEPAT DAN SEMPURNA SAAT INI JUGA TANPA MENJADIKAN SEBUAH MASALAH DI KEMUDIAN HARI:"</p>
                  <ul className="list-disc list-inside pl-2 space-y-1 font-semibold text-slate-900">
                    <li>Keberlimpahan dan kemapanan materi dalam hidup kami.</li>
                    <li>Keberlimpahan saat ini menjadikan kami makhluk cahaya yang selamat dunia akhirat.</li>
                    <li>Menjauhkan kami dari orang-orang yang memiliki niatan jahat.</li>
                    <li>Mendekatkan dan dikelilingi orang-orang yang tulus mencintai kami di manapun dan kapanpun kami berada.</li>
                  </ul>
                </div>
              </div>

              {/* PERINTAH 3 */}
              <div className="p-5 sm:p-6 rounded-xl bg-slate-50 border border-slate-300 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="px-2.5 py-1 rounded bg-slate-900 text-white text-[11px] font-black uppercase">
                    PERINTAH KE-3 • PERCEPATAN QUANTUM RUANG & WAKTU
                  </span>
                  <span className="text-xs font-black text-amber-900 font-mono">SURRUN</span>
                </div>
                <div className="font-kitab-arabic text-right text-2xl text-black font-bold">
                  يَا حَسِيبُ يَا بَدِيعُ يَا حَيُّ يَا قَيُّومُ
                </div>
                <div className="text-sm sm:text-base leading-relaxed space-y-2 text-slate-950 font-serif">
                  <p>"Izinkan kami memberikan perintah kepada ENERGI ILAHI: Saat ini AKU PERINTAHKAN KALIAN UNTUK MERUBAH QUANTUM RUANG & WAKTU-KU:"</p>
                  <ul className="list-disc list-inside pl-2 space-y-1 text-slate-900">
                    <li>Berikan pemahaman dan kebenaran yang mendalam tentang semua hak dan semua hal.</li>
                    <li>Jadikan semua proses yang terjadi, seberapa lamanya menuju sempurna, maka <strong>ubahlah dalam Quantum Waktu-ku ini hanya sekejap saja: TERJADILAH PERCEPATAN!</strong></li>
                    <li>Jadikan kekuatan Quantum Ruang & Waktu kami ini berjalan dalam <strong>24 jam (continue) sampai selamanya</strong> (sampai kami bertemu dengan-NYA baik di dunia dan di akhirat nanti).</li>
                    <li>Jadikan 24 jam ini selalu dalam keadaan <strong>terpelihara dan terlindungi</strong>.</li>
                    <li>Serta jadikan tubuh fisik kami saat ini (aku, pasangan, anak-anak) berada di surga dunia dan bisa menikmati segala fasilitasnya sebagai ladang dakwah serta perjalanan suluk kami.</li>
                  </ul>
                </div>
              </div>

              {/* PERINTAH 4 */}
              <div className="p-5 sm:p-6 rounded-xl bg-slate-50 border border-slate-300 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="px-2.5 py-1 rounded bg-slate-900 text-white text-[11px] font-black uppercase">
                    PERINTAH KE-4 • STANDARISASI NPT & 7 TUBUH CAHAYA
                  </span>
                  <span className="text-xs font-black text-amber-900 font-mono">SURRUN</span>
                </div>
                <div className="font-kitab-arabic text-right text-2xl text-black font-bold">
                  يَا قَوِيُّ يَا حَيُّ يَا قَيُّومُ • يَا جَامِعُ
                </div>
                <div className="text-sm sm:text-base leading-relaxed space-y-2 text-slate-950 font-serif">
                  <p>"Saya perintahkan ENERGI ILAHI untuk: <strong>Membuka 7 kemampuan tubuh kami, membersihkan kotoran sampai sisa pembakaran, memperbaiki sampai sempurna seperti halnya Rasulullah SAW, mengobati, mengembangkan, menyempurnakan sampai tingkatan khawasul khawas (manusia cahaya), memurnikan & memadatkan semua unsur, menata sistem dan root system kami sampai SEMPURNA:</strong>"</p>
                  <ol className="list-decimal list-inside pl-2 space-y-1 font-medium text-slate-900">
                    <li>Sempurna gerak batin kami dan sempurna kehidupan dunia kami.</li>
                    <li>Pancaran proyeksi batin yang busuk + aib biarlah tetap tersembunyi (sembari dimurnikan menjadi energi murni) tanpa mengganggu makhluk lain.</li>
                    <li>Pancaran batin yang baik / niat baik mawujud ke dunia kami secara sempurna dan disempurnakan oleh-NYA.</li>
                    <li>Terwujudnya materialisasi hajat kami & aktifnya kasyaf-kasyaf kami.</li>
                    <li>Kesehatan serta transmutasi di 7 tubuh kami melebihi para leluhur kami.</li>
                  </ol>
                </div>
              </div>

              {/* PENUTUP MANTRA & KUN FAYAKUN */}
              <div className="p-6 rounded-xl border border-slate-300 bg-slate-50 text-center space-y-3">
                <p className="text-sm sm:text-base font-bold text-slate-900">
                  "Ya Allah Ya Rahman, dengan semua kuasa yang KAU miliki maka jadikan Perintah 1, 2, 3, 4 BISA BERFUSI DAN TERWUJUD semua NIAT, AFIRMASI, PERINTAH dan SINYAL KAMI!"
                </p>
                <div className="font-kitab-arabic text-2xl sm:text-3xl font-black text-black leading-loose pt-1">
                  كُنْ اللَّهُ • فَيَكُونُ رَسُولُ اللَّهِ • بِرَبِّكُمُ جِبْرِيلُ وَمِيكَائِيلُ مَلَائِكَةُ اللَّهِ<br />
                  أَنَا خَلِيفَةُ اللَّهِ • أَنَا حَبِيبُ اللَّهِ • أَنَا خَلِيلُ اللَّهِ<br />
                  <span className="text-3xl text-amber-900">سُرٌّ (SURRUN...)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* BAGIAN 3: PROTOKOL BARIER HARIAN (TIAP PAGI)                              */}
        {/* ========================================================================= */}
        {activeTab === 'barier' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 sm:p-8 rounded-2xl border border-slate-300 bg-white shadow-sm text-center space-y-5">
              <div className="max-w-xl mx-auto space-y-2">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto border ${
                  barierActive 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                    : 'bg-slate-100 text-slate-800 border-slate-300'
                }`}>
                  <ShieldCheck className="w-9 h-9" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-black font-serif">
                  Protokol Barier Harian (Tiap Pagi)
                </h2>
                <p className="text-xs sm:text-sm text-slate-700">
                  Dibaca setiap pagi sembari membaca <strong>Ayat Kursi</strong> untuk mengunci pelindung 24 jam & mengaktifkan proses penyempurnaan tubuh.
                </p>
              </div>

              {/* MATAN BARIER */}
              <div className="max-w-2xl mx-auto p-6 rounded-xl border border-slate-300 bg-slate-50 text-left space-y-4">
                <div className="font-kitab-arabic text-right text-2xl sm:text-3xl text-black font-bold leading-loose">
                  يَا اللَّهُ يَا حَفِيظُ يَا قَوِيُّ يَا مُنْتَقِمُ • وَإِنَّرْجِي آيَةِ الْكُرْسِيِّ (يَا حَيُّ يَا قَيُّومُ)
                </div>
                <div className="text-sm sm:text-base leading-relaxed space-y-2.5 italic font-serif text-slate-900 border-t border-slate-200 pt-3">
                  <p>"Saat ini: IZINKAN SEMUA PROSES DAN PERINTAH 1, 2, 3, 4..."</p>
                  <p>"IZINKAN SEMUA PROSES PENYEMPURNAAN SISTEM, ENERGI, ROOT SYSTEM, MATERIALISASI DAN PELEPASAN LIMITER SERTA PENEMPAAN SEMUA HAL DI DALAM TUBUH."</p>
                  <p className="font-bold text-black not-italic text-base">
                    "SEMUANYA MULAI AKTIF SAAT SAYA MENGAKTIFKAN BARIER."
                  </p>
                  <p className="text-base font-black text-rose-900 not-italic">
                    "BISMILLAH... SAATNYA BARIER AKTIF!"
                  </p>
                </div>
              </div>

              {/* TOMBOL AKTIVASI BARIER */}
              <div className="pt-2">
                <button
                  onClick={handleActivateBarier}
                  className={`px-8 py-4 rounded-xl text-white font-black text-sm shadow-md transition active:scale-95 cursor-pointer ${
                    barierActive
                      ? 'bg-emerald-700 hover:bg-emerald-800'
                      : 'bg-slate-900 hover:bg-black'
                  }`}
                >
                  {barierActive ? `✅ BARIER TELAH AKTIF HARI INI (${barierActivatedAt})` : '⚡ AKTIFKAN BARIER HARI INI'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* BAGIAN 4: 33 RUANG KASYAF (TIAP PAGI & BA'DA SHOLAT)                      */}
        {/* ========================================================================= */}
        {activeTab === 'kasyaf' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 sm:p-8 rounded-2xl border border-slate-300 bg-white shadow-sm text-center space-y-6">
              <div className="max-w-xl mx-auto space-y-2">
                <span className="text-3xl">📿</span>
                <h2 className="text-xl sm:text-2xl font-black text-black font-serif">
                  Memasukkan ke 33 Ruang Kasyaf
                </h2>
                <p className="text-xs sm:text-sm text-slate-700">
                  Diamalkan <strong>setiap pagi & setiap ba'da sholat</strong> dengan membaca Asmaul Husna pengunci kasyaf:
                </p>
              </div>

              {/* BACAAN DZIKIR */}
              <div className="max-w-xl mx-auto p-4 rounded-xl bg-slate-50 border border-slate-300 text-2xl sm:text-3xl font-bold font-kitab-arabic text-black text-right leading-loose">
                يَا رَحْمَٰنُ يَا رَحِيمُ يَا حَسِيبُ
              </div>
              <p className="text-sm font-bold font-serif text-slate-900">
                "YAA ROHMAAN YAA ROHIIM YAA HASIIB"
              </p>

              {/* TASBIH DIGITAL INTERAKTIF (33 BUTIR) */}
              <div className="max-w-md mx-auto p-6 rounded-2xl border border-slate-300 bg-slate-50 space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span>Hitungan Butir Kasyaf</span>
                  <span className="text-black bg-slate-200 px-2 py-0.5 rounded">Putaran Selesai: {totalKasyafRounds}x</span>
                </div>

                {/* Counter Besar */}
                <div className="py-4">
                  <div className="text-6xl sm:text-7xl font-black font-mono tracking-tight text-black">
                    {counterKasyaf} <span className="text-2xl text-slate-500">/ 33</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 font-semibold">
                    {counterKasyaf === 0 ? "Tekan tombol di bawah untuk mulai dzikir" : `Sisa ${33 - counterKasyaf} kali bacaan`}
                  </p>
                </div>

                {/* Tombol Klik Tasbih */}
                <div className="flex gap-2">
                  <button
                    onClick={handleIncrementKasyaf}
                    className="flex-1 py-4 rounded-xl text-white font-black text-base bg-slate-900 hover:bg-black shadow-md active:scale-95 transition cursor-pointer"
                  >
                    + HITUNG (DZIKIR)
                  </button>
                  <button
                    onClick={() => setCounterKasyaf(0)}
                    className="p-4 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-black transition cursor-pointer"
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
