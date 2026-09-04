"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { AppNavbar, AppSidebar } from "@/components/layout/AppNavbar";
import {
  BookOpen,
  ArrowLeft,
  FileText,
  ExternalLink,
  Film,
  Sparkles,
  CheckCircle2,
  Clock,
  Download,
  Lock,
  Mail,
  Phone,
  UserCheck,
  X,
  ShieldCheck,
  ZoomIn,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import ImageLightboxModal from "@/components/ui/ImageLightboxModal";

function ExpandableContent({ content, isKitabTheme = true }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLong = content && (content.length > 250 || content.split("\n").length > 6);

  if (!isLong) {
    return (
      <div className={`text-xs sm:text-sm leading-relaxed whitespace-pre-line p-4 sm:p-5 rounded-2xl border font-sans ${
        isKitabTheme
          ? 'bg-[#fbf7ee] text-[#2c1810] border-[#dfcfb0]'
          : 'bg-slate-950/60 text-slate-300 border-slate-800/80'
      }`}>
        {content}
      </div>
    );
  }

  return (
    <div className={`relative rounded-2xl border overflow-hidden transition-all duration-300 ${
      isKitabTheme
        ? 'bg-[#fbf7ee] border-[#dfcfb0]'
        : 'bg-slate-950/60 border-slate-800/80'
    }`}>
      <div
        className={`text-xs sm:text-sm leading-relaxed whitespace-pre-line p-4 sm:p-5 transition-all duration-300 font-sans ${
          isKitabTheme ? 'text-[#2c1810]' : 'text-slate-300'
        } ${!isExpanded ? "max-h-44 overflow-hidden relative" : ""}`}
      >
        {content}
        {!isExpanded && (
          <div className={`absolute inset-x-0 bottom-0 h-24 pointer-events-none ${
            isKitabTheme
              ? 'bg-gradient-to-t from-[#fbf7ee] via-[#fbf7ee]/90 to-transparent'
              : 'bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent'
          }`} />
        )}
      </div>

      <div className={`p-2 border-t flex justify-center ${
        isKitabTheme
          ? 'border-[#dfcfb0] bg-[#f5ebd7]'
          : 'border-slate-800/50 bg-slate-950/95'
      }`}>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`text-xs font-bold flex items-center gap-1.5 py-1.5 px-4 rounded-xl transition cursor-pointer ${
            isKitabTheme
              ? 'text-[#9e2a2b] hover:bg-[#ebdcc4]'
              : 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
          }`}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              <span>Tampilkan Lebih Sedikit</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              <span>Tampilkan Lebih Banyak (Baca Selengkapnya)...</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function NPTLevelDetailPage() {
  const params = useParams();
  const levelNum = Number(params?.level) || 1;

  const [currentUser, setCurrentUser] = useState(null);
  const [activeLightbox, setActiveLightbox] = useState(null); // { url, title }
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isKitabTheme, setIsKitabTheme] = useState(true);

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [inputName, setInputName] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  const [inputPhone, setInputPhone] = useState("");
  const [authStatus, setAuthStatus] = useState(null); // null | 'checking' | 'pending'

  const isApproved = currentUser?.status === "approved" || currentUser?.role === "super_admin";

  useEffect(() => {
    try {
      let savedUser = null;
      const authStr = localStorage.getItem("npt_user_auth");
      if (authStr) {
        savedUser = JSON.parse(authStr);
      } else {
        const match = document.cookie.match(/(?:^|; )npt_device_auth=([^;]*)/);
        if (match) {
          savedUser = JSON.parse(decodeURIComponent(match[1]));
          localStorage.setItem("npt_user_auth", JSON.stringify(savedUser));
        }
      }
      if (savedUser) {
        setCurrentUser(savedUser);
      }
    } catch (e) {}
    fetchLevelMaterials();
  }, [levelNum]);

  const fetchLevelMaterials = async () => {
    setIsLoading(true);
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from("npt_materials")
          .select("*")
          .eq("level", levelNum)
          .eq("is_published", true)
          .order("order_index", { ascending: true });

        if (!error && data) {
          setMaterials(data);
          setIsLoading(false);
          return;
        }
      }
    } catch (e) {}

    // Fallback Local
    try {
      const localData = localStorage.getItem(`npt_materials_level_${levelNum}`);
      if (localData) {
        setMaterials(JSON.parse(localData));
      } else {
        setMaterials([]);
      }
    } catch (e) {}
    setIsLoading(false);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = inputEmail.trim().toLowerCase();
    let formattedPhone = inputPhone ? inputPhone.replace(/[^0-9]/g, "") : "";
    if (formattedPhone.startsWith("0")) formattedPhone = "62" + formattedPhone.slice(1);

    if (!cleanEmail && !formattedPhone) {
      alert("Masukkan Alamat Email Gmail atau Nomor WhatsApp!");
      return;
    }

    const cleanName = inputName.trim() || (cleanEmail ? cleanEmail.split("@")[0] : formattedPhone);
    setAuthStatus("checking");

    try {
      let query = supabase.from("profiles").select("*");
      if (cleanEmail && formattedPhone) {
        query = query.or(`email.eq.${cleanEmail},phone_number.eq.${formattedPhone}`);
      } else if (cleanEmail) {
        query = query.eq("email", cleanEmail);
      } else {
        query = query.eq("phone_number", formattedPhone);
      }

      const { data: profiles } = await query;
      const profile = profiles && profiles.length > 0 ? profiles[0] : null;

      if (profile && profile.status === "approved") {
        const userData = {
          id: profile.id,
          email: cleanEmail || profile.email,
          phone_number: formattedPhone || profile.phone_number,
          name: profile.full_name || cleanName,
          role: profile.role || "member",
          status: "approved"
        };
        setCurrentUser(userData);
        const jsonStr = JSON.stringify(userData);
        localStorage.setItem("npt_user_auth", jsonStr);
        localStorage.setItem("participant_name", userData.name);
        document.cookie = `npt_device_auth=${encodeURIComponent(jsonStr)}; path=/; max-age=315360000; SameSite=Lax`;
        setIsAuthModalOpen(false);
        setAuthStatus(null);
        alert("✅ Akses Member Terverifikasi! Perangkat HP Anda tersimpan selamanya.");
      } else {
        if (!profile) {
          await supabase.from("profiles").insert([
            {
              full_name: cleanName,
              email: cleanEmail || null,
              phone_number: formattedPhone || null,
              role: "member",
              status: "pending"
            }
          ]);
        }
        setAuthStatus("pending");
      }
    } catch (err) {
      console.error(err);
      setAuthStatus("pending");
    }
  };

  const getFileBadge = (type) => {
    switch (type) {
      case "pdf":
        return (
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
            isKitabTheme
              ? 'bg-[#edd8b6] text-[#9e2a2b] border-[#cbb38b]'
              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
          }`}>
            📄 PDF Dokumen
          </span>
        );
      case "ppt":
        return (
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
            isKitabTheme
              ? 'bg-[#ebdcc4] text-[#8f632d] border-[#d8c3a1]'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
          }`}>
            📊 Slide (PPT)
          </span>
        );
      case "docx":
        return (
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
            isKitabTheme
              ? 'bg-[#e0d6c3] text-[#2c3e50] border-[#c5b8a0]'
              : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
          }`}>
            📝 Dokumen Word
          </span>
        );
      case "gdrive":
        return (
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
            isKitabTheme
              ? 'bg-[#dbeef0] text-[#1b6b55] border-[#b0d9d3]'
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
          }`}>
            ☁️ Google Drive
          </span>
        );
      default:
        return (
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
            isKitabTheme
              ? 'bg-[#eee3cb] text-[#543516] border-[#d8c3a1]'
              : 'bg-slate-800 text-slate-300 border-slate-700'
          }`}>
            📎 Lampiran
          </span>
        );
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${
      isKitabTheme 
        ? 'bg-parchment text-[#231409]' 
        : 'bg-slate-950 text-slate-100 selection:bg-rose-600 selection:text-white'
    }`}>
      <AppNavbar
        onToggleSidebar={() => setIsSidebarOpen(true)}
        currentUser={currentUser}
        activeTitle={`NPT Level ${levelNum}`}
      />
      <AppSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentUser={currentUser}
        activePath={`/npt/${levelNum}`}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-6 pb-24 space-y-6">
        
        {/* Navigation Breadcrumb & Member Status Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/npt"
            className={`inline-flex items-center gap-1.5 text-xs font-semibold transition ${
              isKitabTheme 
                ? 'text-[#634224] hover:text-[#9e2a2b]' 
                : 'text-slate-400 hover:text-rose-400'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Roadmap NPT (1 – 6)</span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={() => setIsKitabTheme(!isKitabTheme)}
              className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                isKitabTheme
                  ? 'bg-[#fdfaf3] text-[#3a2211] border-[#cbb38b] hover:bg-[#ebdcc4] shadow-xs'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title="Ganti Mode Tampilan (Kitab Klasik / Mode Gelap)"
            >
              <span>{isKitabTheme ? "📜 Mode Kitab Klasik" : "🌌 Mode Gelap"}</span>
            </button>

            {isApproved ? (
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border ${
                isKitabTheme
                  ? 'bg-[#dbeef0] text-[#1b6b55] border-[#b0d9d3]'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}>
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Member VIP Terbuka
              </span>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition flex items-center gap-1 cursor-pointer border ${
                  isKitabTheme
                    ? 'bg-[#edd8b6] text-[#9e2a2b] border-[#cbb38b] hover:bg-[#dfcdab]'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                }`}
              >
                <Lock className="w-3 h-3" /> Buka Akses Member
              </button>
            )}
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
              isKitabTheme
                ? 'bg-[#3a2211] text-[#fbf6ec] border-[#8f632d]'
                : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
            }`}>
              LEVEL {levelNum}
            </span>
          </div>
        </div>

        {/* Level Header Banner */}
        <div className={`p-6 sm:p-8 rounded-3xl space-y-2 shadow-sm ${
          isKitabTheme
            ? 'card-kitab-frame'
            : 'bg-slate-900 border border-slate-800 shadow-xl'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-xl">📜</span>
            <span className={`text-xs font-bold uppercase tracking-wider ${
              isKitabTheme ? 'text-[#9e2a2b]' : 'text-rose-400'
            }`}>
              Kurikulum Modul Resmi NPT
            </span>
          </div>
          <h1 className={`text-xl sm:text-3xl font-black ${
            isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-white'
          }`}>
            Materi & Modul Pembelajaran NPT Level {levelNum}
          </h1>
          <p className={`text-xs sm:text-sm ${
            isKitabTheme ? 'text-[#634224]' : 'text-slate-400'
          }`}>
            Akses materi bacaan, file presentasi PPT, modul PDF, dokumen Word, serta rekaman video penjelasan resmi.
          </p>
        </div>

        {/* Material Items */}
        {isLoading ? (
          <div className={`py-16 text-center text-xs ${isKitabTheme ? 'text-[#82613d]' : 'text-slate-400'}`}>
            Memuat materi pembelajaran...
          </div>
        ) : materials.length === 0 ? (
          <div className={`p-8 rounded-3xl text-center space-y-3 ${
            isKitabTheme ? 'card-kitab-frame' : 'bg-slate-900/60 border border-slate-800'
          }`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto border ${
              isKitabTheme ? 'bg-[#ebdcc4] text-[#8f632d] border-[#cbb38b]' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
            }`}>
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className={`text-base font-bold ${isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-slate-200'}`}>
              Materi NPT Level {levelNum} Segera Diupload
            </h3>
            <p className={`text-xs max-w-md mx-auto leading-relaxed ${isKitabTheme ? 'text-[#634224]' : 'text-slate-400'}`}>
              Materi dan kurikulum untuk jenjang ini sedang dalam proses finalisasi oleh Master Trainer. Silakan pantau berkala setelah diunggah oleh admin.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {materials.map((mat, idx) => (
              <div
                key={mat.id || idx}
                className={`p-6 rounded-3xl transition space-y-4 text-left ${
                  isKitabTheme
                    ? 'card-kitab-frame shadow-md'
                    : 'bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-xl'
                }`}
              >
                <div className={`flex flex-wrap items-center justify-between gap-2 border-b pb-3 ${
                  isKitabTheme ? 'border-[#dfcfb0]' : 'border-slate-800'
                }`}>
                  <div>
                    <h2 className={`text-base font-extrabold ${
                      isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-white'
                    }`}>
                      {mat.title}
                    </h2>
                    {mat.subtitle && (
                      <p className={`text-xs font-medium mt-0.5 ${
                        isKitabTheme ? 'text-[#8f632d]' : 'text-amber-400'
                      }`}>
                        {mat.subtitle}
                      </p>
                    )}
                  </div>
                  {mat.file_type && mat.file_url && getFileBadge(mat.file_type)}
                </div>

                {mat.content && <ExpandableContent content={mat.content} isKitabTheme={isKitabTheme} />}

                {/* MEMBER LOCK VS FULL ACCESS */}
                {isApproved ? (
                  /* MEMBER APPROVED: FULL VIDEO, IMAGE & FILE DOWNLOAD ACCESS */
                  <div className="space-y-4 pt-2">
                    {mat.image_url && (
                      <div className="space-y-2">
                        <div
                          onClick={() => setActiveLightbox({ url: mat.image_url, title: mat.title })}
                          className={`relative w-full max-h-96 rounded-2xl overflow-hidden border flex items-center justify-center cursor-zoom-in group shadow-lg ${
                            isKitabTheme ? 'bg-[#f4ebd5] border-[#d4b886]' : 'bg-slate-950 border-slate-800'
                          }`}
                          title="Klik untuk Perbesar Gambar (Zoom In / Out)"
                        >
                          <img
                            src={mat.image_url}
                            alt={mat.title}
                            className="w-full h-auto max-h-96 object-contain rounded-2xl transition-transform duration-300 group-hover:scale-[1.02]"
                          />
                          <div className={`absolute bottom-3 right-3 px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 shadow-xl transition-all ${
                            isKitabTheme
                              ? 'bg-[#fdfaf3]/90 text-[#3a2211] border-[#cbb38b]'
                              : 'bg-slate-900/85 backdrop-blur-md border-slate-700/80 text-white'
                          }`}>
                            <ZoomIn className={`w-3.5 h-3.5 ${isKitabTheme ? 'text-[#9e2a2b]' : 'text-amber-400'}`} />
                            <span>Perbesar / Zoom</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {mat.youtube_url && (
                      <div className="space-y-2">
                        <span className={`text-xs font-bold flex items-center gap-1.5 ${
                          isKitabTheme ? 'text-[#3a2211]' : 'text-slate-300'
                        }`}>
                          <Film className="w-4 h-4 text-red-500" />
                          <span>Video Penjelasan Resmi:</span>
                        </span>
                        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800">
                          <iframe
                            src={
                              mat.youtube_url.includes("embed/")
                                ? mat.youtube_url
                                : mat.youtube_url.includes("watch?v=")
                                ? mat.youtube_url.replace("watch?v=", "embed/")
                                : mat.youtube_url
                            }
                            title={mat.title}
                            className="w-full h-full"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    )}

                    {mat.file_url && (
                      <div className="pt-2">
                        <a
                          href={mat.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className={`w-full sm:w-auto px-5 py-3 rounded-2xl text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition cursor-pointer ${
                            isKitabTheme
                              ? 'bg-[#3a2211] hover:bg-[#26150a] border border-[#8f632d]'
                              : 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 shadow-sky-600/30'
                          }`}
                        >
                          <Download className="w-4 h-4" />
                          <span>Unduh / Buka Dokumen: {mat.file_name || "Buka Lampiran"}</span>
                          <ExternalLink className="w-3.5 h-3.5 opacity-70 ml-1" />
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  /* NON-MEMBER / GUEST: PROTECTED LOCK CARD */
                  <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isKitabTheme
                      ? 'bg-[#f5ebd7] border-[#d8c3a1]'
                      : 'bg-gradient-to-r from-rose-950/40 via-slate-950 to-slate-950 border-rose-500/30'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        isKitabTheme
                          ? 'bg-[#ebdcc4] text-[#9e2a2b] border-[#cbb38b]'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className={`text-xs font-bold ${isKitabTheme ? 'text-[#26150a]' : 'text-slate-100'}`}>
                          Lampiran Dokumen & Video Terkunci
                        </h4>
                        <p className={`text-[11px] ${isKitabTheme ? 'text-[#634224]' : 'text-slate-400'}`}>
                          Khusus member terdaftar. Masuk untuk mengunduh <strong>{mat.file_name || "file dokumen"}</strong> dan memutar video.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsAuthModalOpen(true)}
                      className={`px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition shrink-0 cursor-pointer ${
                        isKitabTheme
                          ? 'bg-[#9e2a2b] hover:bg-[#852324]'
                          : 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 shadow-rose-600/30'
                      }`}
                    >
                      🔓 Masuk / Buka Akses
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </main>

      {/* MODAL LOGIN / VERIFIKASI MEMBER CEPAT */}
      {isAuthModalOpen && (
        <div
          onClick={() => setIsAuthModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-slate-900 border border-rose-500/30 rounded-3xl p-6 shadow-2xl space-y-4 text-left"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Akses Member NPT</h3>
                  <p className="text-[10px] text-slate-400">Buka Video & Download Dokumen</p>
                </div>
              </div>
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {authStatus === "pending" ? (
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-2.5">
                <Clock className="w-8 h-8 text-amber-400 mx-auto animate-pulse" />
                <h4 className="text-xs font-bold text-amber-300">
                  Pendaftaran Berhasil Terkirim
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Data Anda sudah masuk di antrean persetujuan Admin NPT. Silakan hubungi admin via WhatsApp untuk aktivasi cepat.
                </p>
                <button
                  onClick={() => {
                    setAuthStatus(null);
                    setIsAuthModalOpen(false);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
                >
                  Tutup
                </button>
              </div>
            ) : (
              <form onSubmit={handleLoginSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nama Lengkap Anda
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    placeholder="Nama lengkap Anda..."
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Alamat Email Gmail
                  </label>
                  <input
                    type="email"
                    autoComplete="off"
                    placeholder="contoh: nama@gmail.com"
                    value={inputEmail}
                    onChange={(e) => setInputEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nomor WhatsApp
                  </label>
                  <input
                    type="tel"
                    autoComplete="off"
                    placeholder="08123456789"
                    value={inputPhone}
                    onChange={(e) => setInputPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-rose-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    *Bisa masukkan Email atau Nomor WA terdaftar.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={authStatus === "checking"}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition flex items-center justify-center gap-2 cursor-pointer mt-1"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{authStatus === "checking" ? "Memeriksa Status..." : "Masuk & Buka File Modul"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Lightbox Zoom In / Out Modal */}
      <ImageLightboxModal
        isOpen={!!activeLightbox}
        imageUrl={activeLightbox?.url}
        title={activeLightbox?.title}
        onClose={() => setActiveLightbox(null)}
      />
    </div>
  );
}
