"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Sparkles,
  Copy,
  Check,
  Download,
  Trash2,
  Maximize2,
  Minimize2,
  Type,
  Send,
  FileText,
  Clock,
  Layers,
  Search,
  ChevronRight,
  Bookmark,
  Share2,
  RefreshCw,
  Eye,
  AlertCircle
} from "lucide-react";
import FormattedMarkdown from "@/components/buku-saku/FormattedMarkdown";

const KITAB_OPTIONS = [
  {
    id: "shawi-jalalain",
    nama: "Tafsir Ash-Shawi & Al-Jalalain",
    icon: "📖",
    kategori: "Tafsir & Asrar",
    deskripsi: "Syarah mendalam Hasyiyah Ash-Shawi atas Matan Tafsir Jalalain (4 Jilid)",
    defaultMajlis: "Majlis Tafsir Shawi (4 Titik Rutinan)"
  },
  {
    id: "kifayatul-akhyar",
    nama: "Kifayatul Akhyar fi Halli Ghoyatil Ikhtishor",
    icon: "⚖️",
    kategori: "Fiqh Syafi'i",
    deskripsi: "Pendalaman fiqh madzhab Syafi'i karya Imam Taqiyuddin Al-Hishni",
    defaultMajlis: "Majlis Fiqh Kifayatul Akhyar"
  },
  {
    id: "hikam-selasa",
    nama: "Kitab Al-Hikam (Rutinan Malam Selasa)",
    icon: "🌙",
    kategori: "Tasawuf & Makrifat",
    deskripsi: "Kajian maqolah hikmah tasawuf karya Syekh Ibnu Atha'illah As-Sakandari",
    defaultMajlis: "Rutinan Malam Selasa (Al-Hikam)"
  },
  {
    id: "hikam-jumat",
    nama: "Kitab Al-Hikam (Rutinan Malam Jumat)",
    icon: "🌟",
    kategori: "Tasawuf & Makrifat",
    deskripsi: "Kajian maqolah hikmah tasawuf karya Syekh Ibnu Atha'illah As-Sakandari",
    defaultMajlis: "Rutinan Malam Jumat (Al-Hikam)"
  },
  {
    id: "tuhfatul-murid",
    nama: "Tuhfatul Murid 'ala Jauharatit Tauhid",
    icon: "💎",
    kategori: "Aqidah & Ilmu Tauhid",
    deskripsi: "Syarah Tauhid Asy'ariyah karya Imam Ibrahim Al-Baijuri atas Matan Jauharatut Tauhid (Bulanan)",
    defaultMajlis: "Rutinan Bulanan (Tuhfatul Murid / Jauharah)"
  },
  {
    id: "nurul-yaqin",
    nama: "Nurul Yaqin fi Sirati Sayyidil Mursalin",
    icon: "🌹",
    kategori: "Sirah Nabawiyah & Tarikh",
    deskripsi: "Perjalanan hidup & keluhuran akhlaq Nabi Muhammad SAW karya Syekh Muhammad Al-Khudhari (Bulanan)",
    defaultMajlis: "Rutinan Bulanan (Sirah Nurul Yaqin)"
  },
  {
    id: "umum",
    nama: "Kitab Kuning / Ayat Tematik Lainnya",
    icon: "📜",
    kategori: "Kajian Umum",
    deskripsi: "Bedah teks hadits, matan ilmu, dan hikmah spiritual bebas",
    defaultMajlis: "Majlis Pengajian Umum"
  }
];

const STORAGE_KEY = "maktabah_kang_iman_v1";

export default function MaktabahBedahKitabPage() {
  const [selectedKitab, setSelectedKitab] = useState("shawi-jalalain");
  const [lokasiMajlis, setLokasiMajlis] = useState("Majlis Tafsir Shawi (4 Titik Rutinan)");
  const [teksArab, setTeksArab] = useState("");
  const [targetMaqolahHikam, setTargetMaqolahHikam] = useState("Maqolah ke-36 Al-Hikam");
  const [catatanKonteks, setCatatanKonteks] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);
  const [currentResultMeta, setCurrentResultMeta] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);

  // Presenter / Mimbar Mode
  const [isMimbarMode, setIsMimbarMode] = useState(false);
  const [fontSizeLevel, setFontSizeLevel] = useState("base"); // 'base' | 'lg' | 'xl' | '2xl'

  // Arsip Riwayat
  const [arsipList, setArsipList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArsipId, setSelectedArsipId] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setArsipList(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Gagal membaca arsip:", e);
    }
  }, []);

  const saveToLocalStorage = (newList) => {
    setArsipList(newList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    } catch (e) {
      console.error("Gagal menyimpan ke localStorage:", e);
    }
  };

  const handleKitabChange = (kitabId) => {
    setSelectedKitab(kitabId);
    const found = KITAB_OPTIONS.find((k) => k.id === kitabId);
    if (found) {
      setLokasiMajlis(found.defaultMajlis);
    }
  };

  const handleBedahKitab = async (e) => {
    if (e) e.preventDefault();
    if (!teksArab.trim()) {
      setErrorMsg("Silakan masukkan potongan teks arab gundul / ayat / matan terlebih dahulu.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setCurrentResult(null);

    const activeKitabObj = KITAB_OPTIONS.find((k) => k.id === selectedKitab);

    try {
      const res = await fetch("/api/bedah-kitab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kitabRujukan: activeKitabObj?.nama || "Tafsir Ash-Shawi & Jalalain",
          lokasiMajlis,
          teksArab,
          targetMaqolahHikam,
          catatanKonteks,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Gagal membedah kitab.");
      }

      setCurrentResult(data.data);
      setCurrentResultMeta({
        id: "kajian-" + Date.now(),
        kitabId: selectedKitab,
        kitabNama: activeKitabObj?.nama,
        lokasiMajlis,
        teksArabInput: teksArab,
        targetMaqolahHikam,
        catatanKonteks,
        createdAt: new Date().toISOString(),
      });

      // Simpan otomatis ke riwayat arsip
      const newEntry = {
        id: "kajian-" + Date.now(),
        kitabId: selectedKitab,
        kitabNama: activeKitabObj?.nama,
        lokasiMajlis,
        teksArabInput: teksArab,
        targetMaqolahHikam,
        catatanKonteks,
        hasilMarkdown: data.data,
        createdAt: new Date().toISOString(),
      };

      const updated = [newEntry, ...arsipList.filter((a) => a.id !== newEntry.id)];
      saveToLocalStorage(updated);
      setSelectedArsipId(newEntry.id);
    } catch (err) {
      console.error("Error bedah kitab:", err);
      setErrorMsg(err.message || "Terjadi kesalahan saat memproses bedah kitab.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectArsip = (item) => {
    setSelectedArsipId(item.id);
    setSelectedKitab(item.kitabId || "shawi-jalalain");
    setLokasiMajlis(item.lokasiMajlis || "");
    setTeksArab(item.teksArabInput || "");
    setTargetMaqolahHikam(item.targetMaqolahHikam || "");
    setCatatanKonteks(item.catatanKonteks || "");
    setCurrentResult(item.hasilMarkdown);
    setCurrentResultMeta(item);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteArsip = (id, e) => {
    e.stopPropagation();
    if (confirm("Hapus catatan kajian ini dari arsip maktabah?")) {
      const updated = arsipList.filter((a) => a.id !== id);
      saveToLocalStorage(updated);
      if (selectedArsipId === id) {
        setSelectedArsipId(null);
        setCurrentResult(null);
      }
    }
  };

  const handleCopyResult = () => {
    if (!currentResult) return;
    navigator.clipboard.writeText(currentResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleExportWord = () => {
    if (!currentResult) return;
    const title = currentResultMeta?.lokasiMajlis || "Catatan Bedah Kitab";
    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><title>${title}</title>
      <style>
        body { font-family: 'Calibri', 'Times New Roman', serif; line-height: 1.6; color: #222; }
        h1, h2, h3 { color: #8b1e1e; }
        .arabic { font-family: 'Traditional Arabic', 'Amiri', serif; font-size: 20pt; line-height: 2; direction: rtl; text-align: right; }
        hr { border: 1px solid #cbb38b; }
      </style>
      </head>
      <body>
        <h1>${title} - Maktabah Kang Iman</h1>
        <p><strong>Kitab Rujukan:</strong> ${currentResultMeta?.kitabNama || "Tafsir Shawi & Jalalain"}</p>
        <p><strong>Target Maqolah:</strong> ${currentResultMeta?.targetMaqolahHikam || "Maqolah Al-Hikam"}</p>
        <p><strong>Tanggal:</strong> ${new Date(currentResultMeta?.createdAt || Date.now()).toLocaleDateString("id-ID")}</p>
        <hr/>
        <div>${currentResult.replace(/\n/g, "<br/>")}</div>
      </body>
      </html>
    `;
    const blob = new Blob(["\ufeff", content], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Diktat-Ngaji-${title.replace(/[^a-zA-Z0-9]/g, "-")}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredArsip = arsipList.filter((a) => {
    const q = searchQuery.toLowerCase();
    return (
      a.lokasiMajlis?.toLowerCase().includes(q) ||
      a.kitabNama?.toLowerCase().includes(q) ||
      a.targetMaqolahHikam?.toLowerCase().includes(q) ||
      a.teksArabInput?.toLowerCase().includes(q)
    );
  });

  return (
    <div className={`min-h-screen bg-parchment text-[#26150a] ${isMimbarMode ? "fixed inset-0 z-50 overflow-y-auto bg-[#faf4e6] p-6 lg:p-12" : "py-8 px-4 sm:px-6 lg:px-8"}`}>
      <div className="max-w-6xl mx-auto space-y-6">

        {/* HEADER ATAS */}
        {!isMimbarMode && (
          <div className="card-kitab-frame rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#dfcfb0] pb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#3a2211] text-amber-400 flex items-center justify-center text-2xl shadow-sm border border-[#8f632d]">
                  📚
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#eee2cb] text-[#634224] border border-[#d8c3a1]">
                      PRIVAT KANG IMAN
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-800 border border-amber-500/30">
                      Tafsir Shawi • Kifayatul Akhyar • Al-Hikam
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black font-kitab-title text-[#26150a] tracking-tight mt-1">
                    Dapur Ngaji & Maktabah Bedah Kitab
                  </h1>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/admin/dashboard"
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#ede1c7] text-[#5e3d1c] hover:bg-[#dfcdab] border border-[#cbb38b] transition"
                >
                  ← Ruang Kontrol
                </Link>
                <Link
                  href="/wirid-khusus"
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#9e2a2b] text-white hover:bg-[#852324] shadow-xs transition"
                >
                  📿 Riyadhoh Kang Iman
                </Link>
              </div>
            </div>

            <p className="text-xs text-[#634224] mt-3.5 leading-relaxed">
              Asisten khusus persiapan mengajar majlis: <strong>Pemberian Syakal Arab Gundul</strong>, <strong>Terjemah Lafdziyah per Baris</strong>, <strong>Faidah Hasyiyah Shawi / Fiqh</strong>, serta <strong>Korelasi Makrifat & Maqolah Al-Hikam (Pencarian Jati Diri)</strong>. Siap dibaca langsung di depan jama&apos;ah tanpa perlu repot.
            </p>
          </div>
        )}

        {/* CONTROLS MIMBAR MODE */}
        {isMimbarMode && (
          <div className="sticky top-0 z-40 bg-[#f4ebd5]/95 backdrop-blur-md p-3.5 rounded-2xl border border-[#d8c3a1] shadow-md flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#8b1e1e]">🎙️ Mode Mimbar Pengajian</span>
              <span className="text-xs text-[#634224] hidden sm:inline">• {currentResultMeta?.lokasiMajlis}</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-[#eee2cb] p-1 rounded-xl border border-[#d8c3a1]">
                <Type className="w-3.5 h-3.5 text-[#634224] ml-1" />
                <button
                  onClick={() => setFontSizeLevel("base")}
                  className={`px-2 py-0.5 rounded-lg text-xs font-bold ${fontSizeLevel === "base" ? "bg-[#3a2211] text-white" : "text-[#634224]"}`}
                >
                  Sedang
                </button>
                <button
                  onClick={() => setFontSizeLevel("lg")}
                  className={`px-2 py-0.5 rounded-lg text-xs font-bold ${fontSizeLevel === "lg" ? "bg-[#3a2211] text-white" : "text-[#634224]"}`}
                >
                  Besar
                </button>
                <button
                  onClick={() => setFontSizeLevel("xl")}
                  className={`px-2 py-0.5 rounded-lg text-xs font-bold ${fontSizeLevel === "xl" ? "bg-[#3a2211] text-white" : "text-[#634224]"}`}
                >
                  Sangat Besar
                </button>
              </div>

              <button
                onClick={() => setIsMimbarMode(false)}
                className="px-3 py-1.5 rounded-xl bg-[#8b1e1e] text-white text-xs font-bold flex items-center gap-1 hover:bg-[#721818]"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Keluar Mode Mimbar</span>
              </button>
            </div>
          </div>
        )}

        {/* GRID UTAMA: FORM INPUT & HASIL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* SISI KIRI: INPUT FORM (Kecuali Mimbar Mode) */}
          {!isMimbarMode && (
            <div className="lg:col-span-5 space-y-5">
              <div className="card-kitab-frame rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#dfcfb0] pb-3">
                  <h3 className="font-bold text-sm text-[#26150a] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Pilih Kitab & Input Materi</span>
                  </h3>
                  <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded-md">
                    AI Bedah Kitab
                  </span>
                </div>

                {/* PILIH KITAB */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#4a2e12] block">
                    1. Kitab Rujukan Utama:
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {KITAB_OPTIONS.map((kitab) => (
                      <button
                        key={kitab.id}
                        type="button"
                        onClick={() => handleKitabChange(kitab.id)}
                        className={`p-2.5 rounded-xl text-left border text-xs font-semibold transition cursor-pointer flex items-start gap-2.5 ${
                          selectedKitab === kitab.id
                            ? "bg-[#3a2211] text-amber-300 border-[#8f632d] shadow-xs"
                            : "bg-[#fcf7ec] text-[#4a2e12] border-[#d8c3a1] hover:bg-[#f4ebd5]"
                        }`}
                      >
                        <span className="text-lg shrink-0">{kitab.icon}</span>
                        <div>
                          <p className="font-bold leading-tight">{kitab.nama}</p>
                          <span className={`text-[10px] block mt-0.5 ${selectedKitab === kitab.id ? "text-amber-200/80" : "text-[#734822]"}`}>
                            {kitab.deskripsi}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* NAMA MAJLIS / JADWAL */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#4a2e12]">
                    2. Majlis / Jadwal Pengajian:
                  </label>
                  <input
                    type="text"
                    value={lokasiMajlis}
                    onChange={(e) => setLokasiMajlis(e.target.value)}
                    placeholder="Contoh: Majlis Tafsir Shawi Lokasi 1 / Rutinan Malam Selasa"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-[#fcf7ec] border border-[#d8c3a1] text-[#26150a] focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                {/* TARGET MAQOLAH AL-HIKAM */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#4a2e12] flex items-center justify-between">
                    <span>3. Target Sambungan Maqolah Al-Hikam:</span>
                    <span className="text-[10px] text-[#8b1e1e] font-semibold">Pencarian Jati Diri</span>
                  </label>
                  <input
                    type="text"
                    value={targetMaqolahHikam}
                    onChange={(e) => setTargetMaqolahHikam(e.target.value)}
                    placeholder="Contoh: Maqolah ke-36 Al-Hikam (Syua'ul Bashirah...)"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-[#fcf7ec] border border-[#d8c3a1] text-[#26150a] focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                {/* TEXTAREA TEKS ARAB GUNDUL / MATAN / AYAT */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#4a2e12] flex items-center justify-between">
                    <span>4. Teks Arab Gundul / Matan / Ayat:</span>
                    <span className="text-[10px] text-[#734822]">Otomatis Disyakkal</span>
                  </label>
                  <textarea
                    rows={6}
                    value={teksArab}
                    onChange={(e) => setTeksArab(e.target.value)}
                    placeholder="Paste teks Arab gundul Tafsir Shawi / Matan Jalalain / Fiqh Kifayatul Akhyar di sini... (atau ayat Quran yang sedang dibahas)"
                    dir="auto"
                    className="w-full p-3 rounded-xl text-sm bg-[#fcf7ec] border border-[#d8c3a1] text-[#26150a] font-serif leading-relaxed focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                {/* CATATAN TAMBAHAN */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#4a2e12]">
                    5. Catatan / Konteks Khusus (Opsional):
                  </label>
                  <input
                    type="text"
                    value={catatanKonteks}
                    onChange={(e) => setCatatanKonteks(e.target.value)}
                    placeholder="Misal: Fokuskan pada makna ikhlas batin, asrar nafsu, dll."
                    className="w-full px-3 py-2 rounded-xl text-xs bg-[#fcf7ec] border border-[#d8c3a1] text-[#26150a] focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-100 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* TOMBOL EKSEKUSI */}
                <button
                  type="button"
                  onClick={handleBedahKitab}
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-[#8b1e1e] hover:bg-[#731919] text-white shadow-md shadow-rose-950/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sedang Mensyakkal & Menyingkap Hikmah...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Bedah Teks, Syakkal & Hubungkan ke Hikam</span>
                    </>
                  )}
                </button>
              </div>

              {/* LIST ARSIP CATATAN KAJIAN TERDAHULU */}
              <div className="card-kitab-frame rounded-3xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-[#dfcfb0] pb-2.5">
                  <h3 className="font-bold text-xs text-[#26150a] flex items-center gap-2">
                    <Bookmark className="w-3.5 h-3.5 text-[#8b1e1e]" />
                    <span>Arsip Diktat Ngaji ({arsipList.length})</span>
                  </h3>
                  <span className="text-[10px] text-[#734822]">Privat di Browser</span>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari arsip majlis / ayat / maqolah..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-[#fcf7ec] border border-[#d8c3a1] text-[#26150a] focus:outline-none"
                  />
                </div>

                {filteredArsip.length === 0 ? (
                  <p className="text-center text-xs text-[#734822] py-4">Belum ada arsip kajian tersimpan.</p>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {filteredArsip.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectArsip(item)}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer transition flex items-start justify-between gap-2 ${
                          selectedArsipId === item.id
                            ? "bg-[#3a2211] text-amber-300 border-[#8f632d]"
                            : "bg-[#fcf7ec] text-[#3d2514] border-[#d8c3a1] hover:bg-[#f4ebd5]"
                        }`}
                      >
                        <div className="space-y-0.5 overflow-hidden">
                          <p className="font-bold truncate">{item.lokasiMajlis || item.kitabNama}</p>
                          <p className="text-[10px] opacity-80 truncate">{item.targetMaqolahHikam}</p>
                          <span className="text-[9px] opacity-60 block">
                            {new Date(item.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                        <button
                          onClick={(e) => handleDeleteArsip(item.id, e)}
                          className="p-1 rounded-lg hover:bg-rose-500/20 text-rose-600 shrink-0"
                          title="Hapus dari arsip"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SISI KANAN: HASIL BEDAH KITAB & PRESENTATION VIEW */}
          <div className={isMimbarMode ? "lg:col-span-12" : "lg:col-span-7"}>
            {currentResult ? (
              <div className="card-kitab-frame rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                
                {/* TOOLBAR ATAS HASIL */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dfcfb0] pb-4">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#eee2cb] text-[#634224] border border-[#d8c3a1]">
                      {currentResultMeta?.kitabNama}
                    </span>
                    <h2 className="text-lg font-black text-[#26150a] font-kitab-title mt-1">
                      {currentResultMeta?.lokasiMajlis}
                    </h2>
                    <p className="text-xs text-[#8b1e1e] font-bold">
                      🔗 {currentResultMeta?.targetMaqolahHikam}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Mode Mimbar Fullscreen */}
                    <button
                      onClick={() => setIsMimbarMode(!isMimbarMode)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#3a2211] text-amber-300 border border-[#8f632d] flex items-center gap-1.5 shadow-xs hover:bg-[#2c1a0d]"
                      title="Buka Mode Layar Penuh untuk Mengajar"
                    >
                      {isMimbarMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                      <span>{isMimbarMode ? "Normal" : "Mode Mimbar"}</span>
                    </button>

                    {/* Salin Rangkuman */}
                    <button
                      onClick={handleCopyResult}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#ede1c7] text-[#5e3d1c] border border-[#cbb38b] hover:bg-[#dfcdab] flex items-center gap-1"
                      title="Salin Naskah untuk Dibagikan ke Jamaah"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? "Tersalin!" : "Salin"}</span>
                    </button>

                    {/* Ekspor Word */}
                    <button
                      onClick={handleExportWord}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#1b6b55] hover:bg-[#155644] text-white flex items-center gap-1 shadow-xs"
                      title="Download Diktat Word (.doc)"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Ekspor Word</span>
                    </button>
                  </div>
                </div>

                {/* KONTEN BEDAH KITAB DALAM MARKDOWN */}
                <div className={`prose-kitab leading-relaxed ${
                  fontSizeLevel === "lg" ? "text-base leading-loose" : fontSizeLevel === "xl" ? "text-lg leading-loose" : "text-sm"
                }`}>
                  <FormattedMarkdown content={currentResult} isKitab={true} />
                </div>

                {/* FOOTER HASIL */}
                <div className="pt-4 border-t border-[#dfcfb0] flex items-center justify-between text-xs text-[#734822]">
                  <span>🗓️ Disiapkan pada: {new Date(currentResultMeta?.createdAt || Date.now()).toLocaleDateString("id-ID", { dateStyle: "full" })}</span>
                  <span className="font-semibold text-emerald-800">✅ Siap Diajarkan di Majlis</span>
                </div>

              </div>
            ) : (
              /* PLACEHOLDER KETIKA BELUM ADA HASIL */
              <div className="card-kitab-frame rounded-3xl p-12 text-center border-dashed space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#f4ebd5] text-[#8b1e1e] flex items-center justify-center text-3xl mx-auto border border-[#d8c3a1]">
                  📖
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="text-base font-bold text-[#26150a] font-kitab-title">
                    Layar Pedoman Ngaji Masih Kosong
                  </h3>
                  <p className="text-xs text-[#634224] leading-relaxed">
                    Masukkan potongan teks arab gundul (Tafsir Shawi, Jalalain, Kifayatul Akhyar, atau ayat Quran) di form sebelah kiri, lalu klik <strong>&quot;Bedah Teks, Syakkal & Hubungkan ke Hikam&quot;</strong>.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#eee2cb]/60 border border-[#d8c3a1] max-w-lg mx-auto text-left text-xs space-y-1.5 text-[#543516]">
                  <p className="font-bold text-[#26150a]">✨ Apa yang akan Anda dapatkan di layar ini:</p>
                  <p>1. Teks Arab berharakat / bersyakal lengkap (siap dibaca lantang di mimbar).</p>
                  <p>2. Terjemah per kata / kalimat (makna gandul ala pesantren).</p>
                  <p>3. Peta pembahasan & Faidah Hasyiyah Shawi / dalil fiqh.</p>
                  <p>4. Mutiara Makrifat & Sambungan ke Maqolah Al-Hikam (Pencarian Jati Diri).</p>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
