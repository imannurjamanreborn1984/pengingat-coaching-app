"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  Play, 
  BookOpen, 
  Sparkles, 
  Download, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  Film, 
  Search, 
  ChevronRight,
  Bookmark,
  Bell,
  Layers,
  FileText,
  Lock,
  LogOut,
  ShieldCheck,
  Crown,
  Key
} from 'lucide-react';

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || "";
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

const PLAYLIST_IDS = {
  hikam: 'PLdu5HXhJxO4r1irMN1OsomtJs3AxntFca',
  malam_jumat: 'PLdu5HXhJxO4rfSConDrw2OKIh-Lb0Gofu',
  npt: 'PLdu5HXhJxO4oBGrdypO65UbIoAkqGUfL3',
  super_eksklusif: 'PLdu5HXhJxO4oBGrdypO65UbIoAkqGUfL3' // Placeholder untuk playlist baru
};

const INFO_KATEGORI = {
  hikam: { 
    nama: 'Kajian Al-Hikam', 
    icon: '📚', 
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', 
    deskripsi: 'Kumpulan kajian kitab Al-Hikam rutin setiap pekan' 
  },
  malam_jumat: { 
    nama: 'Malam Jumat', 
    icon: '🕌', 
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', 
    deskripsi: 'Misykatul Anwar, olah nafas, dan pembersihan jiwa' 
  },
  npt: { 
    nama: 'Private Coaching NPT', 
    icon: '✨', 
    badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20', 
    deskripsi: 'Materi bimbingan khusus Private Coaching Nafas, Power & Transcendental' 
  },
  super_eksklusif: { 
    nama: 'Pendalaman Khusus (Super VIP)', 
    icon: '👑', 
    badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20', 
    deskripsi: 'Arsip rekaman khusus tingkat lanjut untuk praktisi inti NPT' 
  }
};

export default function HakekatCintaContainer() {
  // Auth state
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Video State
  const [semuaVideo, setSemuaVideo] = useState([]);
  const [kategoriAktif, setKategoriAktif] = useState('hikam');
  const [videoAktif, setVideoAktif] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPageToken, setNextPageToken] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sedangMerangkum, setSedangMerangkum] = useState(false);
  const [activeTab, setActiveTab] = useState('video'); // 'video' | 'draft_buku'

  // Draft Buku
  const [koleksiBuku, setKoleksiBuku] = useState({});

  // Cek Sesi Auth Supabase
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setCurrentUser(session?.user || null);
      } catch (err) {
        console.error('Error fetching session:', err);
      } finally {
        setIsAuthLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    try {
      const drafTersimpan = localStorage.getItem('draf_buku_hakekat_cinta');
      if (drafTersimpan) {
        setKoleksiBuku(JSON.parse(drafTersimpan));
      }
    } catch (e) {
      console.error('Failed to parse draft book:', e);
    }
  }, []);

  const saveKoleksiBuku = (newCollection) => {
    setKoleksiBuku(newCollection);
    if (typeof window !== 'undefined') {
      localStorage.setItem('draf_buku_hakekat_cinta', JSON.stringify(newCollection));
    }
  };

  // Google OAuth Login
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/hakekat-cinta` : undefined,
        },
      });
      if (error) throw error;
    } catch (err) {
      alert(`Gagal login dengan Google: ${err.message}`);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const ambilDataPlaylistYouTube = async (tokenHalaman = '') => {
    if (!currentUser) return; // Hanya ambil video jika sudah login

    try {
      if (tokenHalaman === '') setLoading(true);
      else setLoadingMore(true);

      const idPlaylistSaatIni = PLAYLIST_IDS[kategoriAktif];
      let url = `https://www.googleapis.com/youtube/v3/playlistItems?key=${YOUTUBE_API_KEY}&playlistId=${idPlaylistSaatIni}&part=snippet&maxResults=50`;
      
      if (tokenHalaman) {
        url += `&pageToken=${tokenHalaman}`;
      }
      
      const respon = await fetch(url);
      const hasil = await respon.json();

      if (hasil.items && hasil.items.length > 0) {
        const listVideoMapped = hasil.items.map((item) => ({
          id_video: item.snippet.resourceId.videoId,
          judul: item.snippet.title || 'Kajian Tanpa Judul',
          deskripsi: item.snippet.description || '',
          thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || '',
          tanggal: item.snippet.publishedAt?.split('T')[0] || '',
          kategori: kategoriAktif
        }));

        setNextPageToken(hasil.nextPageToken || '');

        if (tokenHalaman === '') {
          setSemuaVideo(listVideoMapped);
          if (listVideoMapped.length > 0) {
            setVideoAktif(listVideoMapped[0]);
          }
        } else {
          setSemuaVideo((prev) => [...prev, ...listVideoMapped]);
        }
      } else {
        if (tokenHalaman === '') setSemuaVideo([]);
      }
    } catch (err) {
      console.error('Gagal memuat data playlist dari YouTube:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      setNextPageToken('');
      setSemuaVideo([]);
      setVideoAktif(null);
      ambilDataPlaylistYouTube('');
    }
  }, [kategoriAktif, currentUser]);

  // AI Generator Bab Buku
  const handleProsesBabOtomatis = async () => {
    if (!videoAktif) return;

    setSedangMerangkum(true);
    const judulVideo = videoAktif.judul;

    try {
      let teksMentahKajian = '';

      // Lapis 1: Ambil transkrip lewat proxy
      try {
        const urlAsliTranskrip = `https://subtitles-youtube.vercel.app/api/transcript?v=${videoAktif.id_video}`;
        const urlBypassProxy = `https://api.allorigins.win/get?url=${encodeURIComponent(urlAsliTranskrip)}`;
        
        const responProxy = await fetch(urlBypassProxy);
        const dataProxy = await responProxy.json();
        const dataTranskrip = JSON.parse(dataProxy.contents);

        if (dataTranskrip && dataTranskrip.transcript) {
          teksMentahKajian = dataTranskrip.transcript.map((t) => t.text).join(' ');
        }
      } catch (e) {
        console.log('Fallback to description for AI synthesis');
      }

      // Lapis 2: Deskripsi video
      if (!teksMentahKajian || teksMentahKajian.trim().length < 10) {
        teksMentahKajian = videoAktif.deskripsi;
      }

      // Lapis 3: Judul video
      if (!teksMentahKajian || teksMentahKajian.trim().length < 10) {
        teksMentahKajian = `Kembangkan tulisan naskah spiritual Islam secara komprehensif murni berdasarkan esensi dari judul kajian ini: ${judulVideo}.`;
      }

      const ai = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const instruksiPrompt = `
        Kamu adalah seorang Editor Buku Islami profesional, tasawuf, dan spiritual mendalam. 
        Tugasmu adalah menyusun sebuah bab buku yang rapi, mengalir, puitis, dan padat ilmu berdasarkan bahan kajian di bawah ini.
        
        Judul Bab Buku: ${judulVideo}
        Kategori Kajian: ${INFO_KATEGORI[kategoriAktif].nama}

        Bahan Mentah Sumber Kajian:
        "${teksMentahKajian}"

        Aturan Penulisan Bab Buku:
        1. Tulis hasil akhirnya langsung ke isi materinya dalam bentuk paragraf buku yang mengalir indah dan enak dibaca (buat minimal 3-4 paragraf panjang berbobot). JANGAN hanya menulis poin ringkas atau resume pendek!
        2. Buang kata-kata lisan yang berulang, sapaan santai, link media sosial, jualan, atau teks timestamp.
        3. Rapikan penulisan istilah spiritual/arab agar baku dan bermartabat (misal: Tazkiyatun Nafs, Hakikat, Syariat, Qalbu, Ma'rifat, Fana, Baqa, 14 Akar Spiritual).
        4. Hidupkan suasana pengajaran yang menyentuh jiwa, bijaksana, mendalam, dan membimbing pembaca menuju ketenangan transcendental batin.
      `;

      const hasilGemini = await model.generateContent(instruksiPrompt);
      const teksHasilBuku = hasilGemini.response.text();

      const updatedCollection = {
        ...koleksiBuku,
        [videoAktif.id_video]: {
          judul: judulVideo,
          isi: teksHasilBuku,
          kategori: INFO_KATEGORI[kategoriAktif].nama,
          tanggal: new Date().toLocaleDateString('id-ID'),
        },
      };

      saveKoleksiBuku(updatedCollection);
      alert(`✨ Alhamdulillah! Bab "${judulVideo}" berhasil dirangkum oleh AI Gemini dan masuk Draft Buku.`);
    } catch (error) {
      console.error('Gagal memproses AI:', error);
      alert('❌ Gagal memproses AI Gemini. Cek koneksi internet.');
    } finally {
      setSedangMerangkum(false);
    }
  };

  const handleUnduhDraftBuku = () => {
    const daftarBab = Object.values(koleksiBuku);
    if (daftarBab.length === 0) {
      alert('⚠️ Belum ada bab yang dikumpulkan untuk diunduh!');
      return;
    }

    let isiFileBuku = `==================================================\n`;
    isiFileBuku += `         DRAFT BUKU: HAKEKAT CINTA & SPIRITUALITAS NPT\n`;
    isiFileBuku += `==================================================\n\n`;

    daftarBab.forEach((bab, idx) => {
      isiFileBuku += `--------------------------------------------------\n`;
      isiFileBuku += `BAB ${idx + 1}: ${bab.judul}\n`;
      isiFileBuku += `Kategori: ${bab.kategori || '-'}\n`;
      isiFileBuku += `--------------------------------------------------\n\n`;
      isiFileBuku += `${bab.isi}\n\n\n`;
    });

    const blob = new Blob([isiFileBuku], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Draft_Buku_Hakekat_Cinta_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteBab = (videoId) => {
    if (confirm('Hapus bab ini dari draf buku?')) {
      const updated = { ...koleksiBuku };
      delete updated[videoId];
      saveKoleksiBuku(updated);
    }
  };

  const filteredVideos = semuaVideo.filter((v) => {
    if (!searchQuery.trim()) return true;
    return v.judul.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const totalDrafBab = Object.keys(koleksiBuku).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/85 dark:bg-slate-950/85 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link 
              href="/hakekat-cinta"
              className="flex items-center gap-2.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-pink-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
                <Film className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base tracking-tight leading-none">
                    Hakikat Cinta & Rekaman Live
                  </span>
                  <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full border border-rose-500/20">
                    VIP NPT
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                  Arsip Siaran Ulang Eksklusif & AI Naskah Buku
                </p>
              </div>
            </Link>
          </div>

          {/* User Auth Info & Navigation Links */}
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 transition-colors"
              title="Dashboard Reminder"
            >
              <Bell className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Reminder Tugas</span>
            </Link>

            <Link
              href="/buku-saku"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-xs transition-all"
              title="Buka Buku Saku 14 Akar Spiritual"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Buku Saku 14 Akar</span>
            </Link>

            {currentUser && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300 hidden md:inline truncate max-w-[120px]">
                  {currentUser.user_metadata?.full_name || currentUser.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Keluar / Logout Akun Google"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 pb-20 md:pb-8 space-y-6">
        {isAuthLoading ? (
          <div className="py-24 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-rose-500 animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Memeriksa hak akses anggota...</p>
          </div>
        ) : !currentUser ? (
          /* AUTH GATE / GEMBOK LOGIN GOOGLE */
          <div className="max-w-md mx-auto my-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-60 h-60 bg-gradient-to-bl from-rose-500/10 via-amber-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

            <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Akses Eksklusif Rekaman Live NPT
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Kajian siaran ulang Hakikat Cinta & Olah Nafas hanya diperuntukkan bagi peserta yang berkomitmen menyimak materi secara mendalam.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-left space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Manfaat Masuk dengan Akun Google:</span>
              </div>
              <ul className="space-y-1.5 text-[11px] pl-6 list-disc text-slate-500 dark:text-slate-400">
                <li>Membuka seluruh video playlist unlisted YouTube.</li>
                <li>Menyimpan draf buku hasil rangkuman AI secara personal.</li>
                <li>Akses playlist pendalaman khusus (Super VIP).</li>
              </ul>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full py-3 px-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-3 cursor-pointer active:scale-95"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Lanjutkan Masuk dengan Google (Gmail)</span>
            </button>
          </div>
        ) : (
          /* KONTEN VIDEO AKTIF SETELAH LOGIN */
          <>
            {/* Category Playlist Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {Object.entries(INFO_KATEGORI).map(([key, info]) => (
                  <button
                    key={key}
                    onClick={() => setKategoriAktif(key)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                      kategoriAktif === key
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md shadow-slate-900/20'
                        : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{info.icon}</span>
                    <span>{info.nama}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab(activeTab === 'video' ? 'draft_buku' : 'video')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    activeTab === 'draft_buku'
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Draf Buku AI ({totalDrafBab} Bab)</span>
                </button>
              </div>
            </div>

            {activeTab === 'video' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Main Player & Info */}
                <div className="lg:col-span-2 space-y-4">
                  {videoAktif ? (
                    <div className="space-y-4">
                      {/* YouTube Embed Player */}
                      <div className="relative aspect-video w-full rounded-3xl overflow-hidden shadow-2xl bg-black border border-slate-800">
                        <iframe
                          src={`https://www.youtube.com/embed/${videoAktif.id_video}?autoplay=1&rel=0`}
                          title={videoAktif.judul}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="absolute inset-0 w-full h-full border-0"
                        />
                      </div>

                      {/* Video Metadata & AI Action Card */}
                      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${INFO_KATEGORI[kategoriAktif].badge}`}>
                              {INFO_KATEGORI[kategoriAktif].nama}
                            </span>
                            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mt-1.5 leading-snug">
                              {videoAktif.judul}
                            </h2>
                          </div>

                          {/* AI Summarize Button */}
                          <button
                            onClick={handleProsesBabOtomatis}
                            disabled={sedangMerangkum}
                            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:opacity-90 active:scale-95 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                          >
                            <Sparkles className={`w-4 h-4 ${sedangMerangkum ? 'animate-spin' : ''}`} />
                            <span>{sedangMerangkum ? 'AI Sedang Menyusun...' : 'Rangkum Jadi Bab Buku AI'}</span>
                          </button>
                        </div>

                        {/* Jika bab ini sudah pernah dirangkum */}
                        {koleksiBuku[videoAktif.id_video] && (
                          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-500/30 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <span>Bab Buku Tersimpan (Disusun oleh AI):</span>
                              </span>
                              <button
                                onClick={() => setActiveTab('draft_buku')}
                                className="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                              >
                                Buka Draft Buku →
                              </button>
                            </div>
                            <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-3 leading-relaxed italic">
                              "{koleksiBuku[videoAktif.id_video].isi.slice(0, 220)}..."
                            </p>
                          </div>
                        )}

                        {videoAktif.deskripsi && (
                          <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Deskripsi Rekaman:</span>
                            <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto">
                              {videoAktif.deskripsi}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : loading ? (
                    <div className="aspect-video w-full rounded-3xl bg-slate-900 flex flex-col items-center justify-center text-center p-8 space-y-3">
                      <RefreshCw className="w-8 h-8 text-rose-500 animate-spin" />
                      <p className="text-xs text-slate-400">Memuat video siaran ulang...</p>
                    </div>
                  ) : (
                    <div className="aspect-video w-full rounded-3xl bg-slate-900 flex flex-col items-center justify-center text-center p-8">
                      <Film className="w-12 h-12 text-slate-700 mb-2" />
                      <p className="text-sm font-bold text-slate-400">Pilih video dari playlist di samping</p>
                    </div>
                  )}
                </div>

                {/* Right 1 Col: Video Playlist List */}
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari judul rekaman live..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm space-y-2 max-h-[600px] overflow-y-auto">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      <span>Daftar Video ({filteredVideos.length})</span>
                      <span>{INFO_KATEGORI[kategoriAktif].nama}</span>
                    </div>

                    {loading ? (
                      <div className="py-12 text-center text-xs text-slate-400">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-rose-500" />
                        <span>Menyinkronkan playlist...</span>
                      </div>
                    ) : filteredVideos.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400">
                        Tidak ada video ditemukan.
                      </div>
                    ) : (
                      filteredVideos.map((vid, idx) => {
                        const isSelected = videoAktif?.id_video === vid.id_video;
                        const hasDraft = !!koleksiBuku[vid.id_video];

                        return (
                          <div
                            key={vid.id_video}
                            onClick={() => setVideoAktif(vid)}
                            className={`p-3 rounded-2xl border transition-all cursor-pointer flex gap-3 items-start group ${
                              isSelected
                                ? 'bg-rose-500/10 border-rose-500/40 text-slate-900 dark:text-slate-100'
                                : 'border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                            }`}
                          >
                            <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                              isSelected ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}>
                              {idx + 1}
                            </span>

                            <div className="flex-1 min-w-0 space-y-1">
                              <h4 className="text-xs font-bold line-clamp-2 leading-snug group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                                {vid.judul}
                              </h4>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                {vid.tanggal && <span>📅 {vid.tanggal}</span>}
                                {hasDraft && (
                                  <span className="text-amber-500 font-semibold flex items-center gap-0.5">
                                    <Sparkles className="w-3 h-3" /> Ada Draf
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}

                    {nextPageToken && (
                      <button
                        onClick={() => ambilDataPlaylistYouTube(nextPageToken)}
                        disabled={loadingMore}
                        className="w-full py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer mt-2"
                      >
                        {loadingMore ? 'Memuat...' : 'Muat Lebih Banyak Video'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* DRAFT BUKU VIEW */
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      📖 Kumpulan Naskah & Draf Buku "Hakikat Cinta"
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Bab-bab buku yang disusun dan disarikan secara otomatis oleh AI Gemini dari rekaman siaran langsung.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleUnduhDraftBuku}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm shadow-rose-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Unduh Semua Naskah (.txt)</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('video')}
                      className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      Kembali ke Video
                    </button>
                  </div>
                </div>

                {totalDrafBab === 0 ? (
                  <div className="py-16 text-center space-y-2">
                    <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Belum ada bab buku tersimpan</h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Pilih salah satu video rekaman live, lalu klik tombol "Rangkum Jadi Bab Buku AI" untuk mulai menyusun naskah.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(koleksiBuku).map(([vidId, bab], idx) => (
                      <div
                        key={vidId}
                        className="p-6 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                              BAB {idx + 1} • {bab.kategori || 'Kajian NPT'}
                            </span>
                            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                              {bab.judul}
                            </h4>
                          </div>
                          <button
                            onClick={() => handleDeleteBab(vidId)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                            title="Hapus Bab"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed font-serif bg-white dark:bg-slate-900/80 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60">
                          {bab.isi}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
