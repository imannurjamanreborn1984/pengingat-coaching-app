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
  ChevronUp,
  Unlock
} from "lucide-react";
import ImageLightboxModal from "@/components/ui/ImageLightboxModal";
import { parseUserAccess, formatRoleLabel, NPT_LEVEL_CONFIG } from "@/lib/authHelper";

function formatYouTubeEmbedUrl(url) {
  if (!url || typeof url !== "string") return "";
  const cleanUrl = url.trim();
  if (!cleanUrl) return "";

  // 1. YouTube Shorts: /shorts/VIDEO_ID
  const shortsMatch = cleanUrl.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
  if (shortsMatch && shortsMatch[1]) {
    return `https://www.youtube.com/embed/${shortsMatch[1]}`;
  }

  // 2. YouTu.be short links: youtu.be/VIDEO_ID
  const youtuMatch = cleanUrl.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (youtuMatch && youtuMatch[1]) {
    return `https://www.youtube.com/embed/${youtuMatch[1]}`;
  }

  // 3. Standard watch?v=VIDEO_ID or m.youtube.com/watch?v=VIDEO_ID
  const watchMatch = cleanUrl.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watchMatch && watchMatch[1]) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }

  // 4. If already an embed link with query params
  if (cleanUrl.includes("/embed/")) {
    return cleanUrl;
  }

  return cleanUrl;
}

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
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isKitabTheme, setIsKitabTheme] = useState(true);

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [inputName, setInputName] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  const [inputPhone, setInputPhone] = useState("");
  const [authProgram, setAuthProgram] = useState("npt");
  const [authLevel, setAuthLevel] = useState(levelNum);
  const [authStatus, setAuthStatus] = useState(null); // null | 'checking' | 'pending'

  // Access check
  const access = parseUserAccess(currentUser);
  const isApproved = access.isApproved;
  const hasLevelAccess = access.canAccessNptLevel(levelNum);

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
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          setMaterials(data);
          // Default: Hanya materi terupdate/teratas (index 0) yang terbuka
          setExpandedIds(new Set([data[0].id]));
          setIsLoading(false);
          return;
        } else if (!error && data && data.length === 0) {
          setMaterials([]);
          setExpandedIds(new Set());
          setIsLoading(false);
          return;
        }
      }
    } catch (e) {}

    // Fallback Local
    try {
      const localData = localStorage.getItem(`npt_materials_level_${levelNum}`);
      if (localData) {
        const parsed = JSON.parse(localData);
        parsed.sort((a, b) => new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0));
        setMaterials(parsed);
        if (parsed.length > 0) {
          setExpandedIds(new Set([parsed[0].id || 0]));
        }
      } else {
        setMaterials([]);
      }
    } catch (e) {}
    setIsLoading(false);
  };

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(materials.map((m, i) => m.id || i)));
  };

  const collapseOlder = () => {
    if (materials.length > 0) {
      setExpandedIds(new Set([materials[0].id || 0]));
    } else {
      setExpandedIds(new Set());
    }
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
        alert("✅ Akses Member Terverifikasi! Perangkat Anda tersimpan.");
      } else {
        if (!profile) {
          const roleTarget = authProgram === 'emt' ? 'emt' : `npt_${authLevel}`;
          await supabase.from("profiles").insert([
            {
              full_name: cleanName,
              email: cleanEmail || null,
              phone_number: formattedPhone || null,
              role: roleTarget,
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

  const levelInfo = NPT_LEVEL_CONFIG[levelNum] || { name: `Level ${levelNum}` };

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

          <div className="flex items-center gap-2 flex-wrap">
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
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {access.badgeText}
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

        {/* Hero Header Level */}
        <div className={`p-6 sm:p-8 rounded-3xl border space-y-3 relative overflow-hidden shadow-sm ${
          isKitabTheme ? 'card-kitab-frame' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider uppercase bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                  🔴⚪ Kurikulum Asuhan Sang Guru
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Level {levelNum} dari 6
                </span>
              </div>
              <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${
                isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-white'
              }`}>
                {levelInfo.name}
              </h1>
              <p className={`text-xs sm:text-sm font-medium ${
                isKitabTheme ? 'text-[#8f632d]' : 'text-amber-400'
              }`}>
                {levelInfo.focus}
              </p>
            </div>

            {/* Status Akses User */}
            <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
              {hasLevelAccess ? (
                <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Akses Penuh Level {levelNum}</span>
                </div>
              ) : isApproved ? (
                <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Pratinjau Terbatas</span>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition cursor-pointer"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Buka Akses</span>
                </button>
              )}
            </div>
          </div>

          <p className={`text-xs sm:text-sm leading-relaxed ${
            isKitabTheme ? 'text-[#543516]' : 'text-slate-300'
          }`}>
            {levelInfo.desc}
          </p>
        </div>

        {/* ========================================================================= */}
        {/* DAFTAR MATERI KURIKULUM & VIDEO                                           */}
        {/* ========================================================================= */}
        {isLoading ? (
          <div className={`p-12 text-center text-xs space-y-2 ${isKitabTheme ? 'text-[#8f632d]' : 'text-slate-400'}`}>
            <div className="w-6 h-6 border-2 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Memuat kurikulum dan video pembelajaran...</p>
          </div>
        ) : coreMaterials.length === 0 && peerInsights.length === 0 ? (
          <div className={`p-12 rounded-3xl border text-center space-y-3 shadow-xs ${
            isKitabTheme ? 'card-kitab-frame' : 'bg-slate-900 border-slate-800'
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
            {/* Header Toolbar Info & Toggle All */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-1">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold ${isKitabTheme ? 'text-[#4a2e12]' : 'text-slate-300'}`}>
                  📚 {coreMaterials.length} Modul & Materi Inti
                </span>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                  isKitabTheme ? 'bg-[#eee2cb] text-[#634224] border border-[#d8c3a1]' : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}>
                  Urutan: Terbaru di Paling Atas
                </span>
              </div>
              {coreMaterials.length > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={expandAll}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer border ${
                      isKitabTheme
                        ? 'bg-[#ede1c7] text-[#5e3d1c] hover:bg-[#dfcdab] border-[#cbb38b]'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
                    }`}
                  >
                    Buka Semua
                  </button>
                  <button
                    type="button"
                    onClick={collapseOlder}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer border ${
                      isKitabTheme
                        ? 'bg-[#ede1c7] text-[#5e3d1c] hover:bg-[#dfcdab] border-[#cbb38b]'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
                    }`}
                  >
                    Tutup Yang Lama
                  </button>
                </div>
              )}
            </div>

            {/* List Materi */}
            {coreMaterials.map((mat, idx) => {
              const isExpanded = expandedIds.has(mat.id || idx);
              const isLatest = idx === 0;

              return (
                <div
                  key={mat.id || idx}
                  className={`rounded-3xl transition duration-200 overflow-hidden text-left ${
                    isKitabTheme
                      ? isLatest && isExpanded
                        ? 'card-kitab-frame shadow-md ring-1 ring-[#8f632d]/40'
                        : 'card-kitab-frame shadow-xs'
                      : isLatest && isExpanded
                        ? 'bg-slate-900 border border-rose-500/40 shadow-xl'
                        : 'bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-md'
                  }`}
                >
                  {/* BARIS JUDUL / ACCORDION HEADER */}
                  <div
                    onClick={() => toggleExpand(mat.id || idx)}
                    className={`p-5 sm:p-6 transition cursor-pointer select-none flex items-center justify-between gap-3 ${
                      isExpanded
                        ? isKitabTheme
                          ? 'border-b border-[#dfcfb0] bg-[#f7eedc]/50'
                          : 'border-b border-slate-800 bg-slate-950/40'
                        : isKitabTheme
                          ? 'hover:bg-[#f5ebd7]/60'
                          : 'hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-lg border shadow-xs ${
                        isLatest
                          ? isKitabTheme
                            ? 'bg-[#3a2211] text-amber-300 border-[#8f632d]'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : isKitabTheme
                            ? 'bg-[#ede1c7] text-[#634224] border-[#d8c3a1]'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {isLatest ? '✨' : '📖'}
                      </div>

                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {isLatest && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-700 text-white shadow-xs">
                              TERBARU / TERUPDATE
                            </span>
                          )}
                          {mat.created_at && (
                            <span className={`text-[10px] font-medium flex items-center gap-1 ${
                              isKitabTheme ? 'text-[#82613d]' : 'text-slate-400'
                            }`}>
                              <Clock className="w-3 h-3" />
                              {new Date(mat.created_at).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric"
                              })}
                            </span>
                          )}
                          {mat.file_type && mat.file_url && getFileBadge(mat.file_type)}
                        </div>

                        <h2 className={`text-base sm:text-lg font-black leading-snug tracking-tight ${
                          isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-white'
                        }`}>
                          {mat.title}
                        </h2>

                        {mat.subtitle && (
                          <p className={`text-xs font-medium truncate ${
                            isKitabTheme ? 'text-[#8f632d]' : 'text-amber-400'
                          }`}>
                            {mat.subtitle}
                          </p>
                        )}

                        {!isExpanded && (
                          <p className={`text-[11px] font-semibold flex items-center gap-1 pt-0.5 ${
                            isKitabTheme ? 'text-[#9e2a2b]' : 'text-sky-400'
                          }`}>
                            <span>👉 Klik judul untuk membuka & mengakses materi lengkap...</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Tombol Chevron */}
                    <div className="shrink-0 flex items-center gap-2">
                      <div
                        className={`p-2 rounded-xl border transition flex items-center justify-center ${
                          isExpanded
                            ? isKitabTheme
                              ? 'bg-[#3a2211] text-amber-300 border-[#8f632d]'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : isKitabTheme
                              ? 'bg-[#ebdcc4] text-[#5e3d1c] border-[#cbb38b]'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* KONTEN LENGKAP HANYA JIKA TERBUKA / EXPANDED */}
                  {isExpanded && (
                    <div className="p-6 space-y-4 animate-in fade-in duration-200">
                      {mat.content && <ExpandableContent content={mat.content} isKitabTheme={isKitabTheme} />}

                      {/* 1. GAMBAR LAMPIRAN */}
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

                      {/* 2. VIDEO YOUTUBE (BEBAS DIAKSES SEMUA MEMBER NPT/APPROVED) */}
                      {mat.youtube_url && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold flex items-center gap-1.5 ${
                              isKitabTheme ? 'text-[#3a2211]' : 'text-slate-300'
                            }`}>
                              <Film className="w-4 h-4 text-red-500" />
                              <span>Video Siaran Ulang YouTube:</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                                isKitabTheme ? 'bg-[#dbeef0] text-[#1b6b55] border-[#b0d9d3]' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              }`}>
                                Bebas Diakses Semua Member
                              </span>
                            </span>
                            <a
                              href={mat.youtube_url}
                              target="_blank"
                              rel="noreferrer"
                              className={`text-[11px] font-bold flex items-center gap-1 hover:underline ${
                                isKitabTheme ? 'text-[#9e2a2b]' : 'text-sky-400'
                              }`}
                            >
                              <span>Buka di YouTube</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>

                          {isApproved ? (
                            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-md">
                              <iframe
                                src={formatYouTubeEmbedUrl(mat.youtube_url)}
                                title={mat.title}
                                className="w-full h-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                              />
                            </div>
                          ) : (
                            <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                              isKitabTheme ? 'bg-[#f5ebd7] border-[#d8c3a1]' : 'bg-slate-900 border-slate-800'
                            }`}>
                              <div className="flex items-center gap-2.5">
                                <Lock className="w-4 h-4 text-amber-600" />
                                <span className={`text-xs ${isKitabTheme ? 'text-[#543516]' : 'text-slate-300'}`}>
                                  Masuk sebagai member untuk menonton video siaran ulang ini.
                                </span>
                              </div>
                              <button
                                onClick={() => setIsAuthModalOpen(true)}
                                className="px-3 py-1.5 rounded-xl text-white text-xs font-bold bg-[#9e2a2b] hover:bg-[#852324] shrink-0"
                              >
                                Masuk Member
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 3. DOKUMEN / FILE DOWNLOAD (LEVEL-GATED) */}
                      {mat.file_url && (
                        <div className="pt-2">
                          {hasLevelAccess ? (
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
                          ) : isApproved ? (
                            /* Member Approved tapi level belum mencukupi */
                            <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                              isKitabTheme
                                ? 'bg-[#ebdcc4]/70 border-[#d8c3a1]'
                                : 'bg-slate-900 border-amber-500/30'
                            }`}>
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                                  isKitabTheme
                                    ? 'bg-[#fdfaf3] text-[#8f632d] border-[#cbb38b]'
                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                }`}>
                                  <Lock className="w-4 h-4" />
                                </div>
                                <div>
                                  <h4 className={`text-xs font-bold ${isKitabTheme ? 'text-[#26150a]' : 'text-slate-100'}`}>
                                    Berkas Dokumen Khusus NPT Level {levelNum}
                                  </h4>
                                  <p className={`text-[11px] ${isKitabTheme ? 'text-[#634224]' : 'text-slate-400'}`}>
                                    Anda terdaftar di <strong>{access.badgeText}</strong>. Video YouTube di atas bebas Anda simak. Untuk mengunduh modul PDF/PPT ini, silakan ajukan upgrade jenjang level.
                                  </p>
                                </div>
                              </div>
                              <a
                                href={`https://wa.me/628123456789?text=${encodeURIComponent(`Assalamu'alaikum Admin NPT, saya *${currentUser?.name || "Member"}* ingin konfirmasi upgrade ke NPT Level ${levelNum}.`)}`}
                                target="_blank"
                                rel="noreferrer"
                                className={`px-4 py-2 rounded-xl text-white text-xs font-bold shrink-0 text-center transition ${
                                  isKitabTheme ? 'bg-[#9e2a2b] hover:bg-[#852324]' : 'bg-amber-600 hover:bg-amber-500'
                                }`}
                              >
                                Upgrade ke Level {levelNum}
                              </a>
                            </div>
                          ) : (
                            /* Non-member / Belum login */
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
                                    Lampiran Dokumen Terkunci
                                  </h4>
                                  <p className={`text-[11px] ${isKitabTheme ? 'text-[#634224]' : 'text-slate-400'}`}>
                                    Khusus member terdaftar. Masuk untuk mengunduh <strong>{mat.file_name || "file dokumen"}</strong>.
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
                      )}

                      {/* Tombol Tutup / Lipat Materi */}
                      <div className="pt-2 flex justify-end border-t border-[#dfcfb0]/40">
                        <button
                          type="button"
                          onClick={() => toggleExpand(mat.id || idx)}
                          className={`text-xs font-bold flex items-center gap-1.5 py-1.5 px-3 rounded-xl transition cursor-pointer ${
                            isKitabTheme
                              ? 'text-[#9e2a2b] hover:bg-[#ebdcc4]'
                              : 'text-amber-400 hover:bg-amber-500/10'
                          }`}
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                          <span>Tutup / Lipat Materi Ini</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* ========================================================================= */}
            {/* BAGIAN 2: 🌟 INSPIRASI & TEMUAN SAHABAT SE-LEVEL (DRAF BUKU NPT)          */}
            {/* ========================================================================= */}
            {peerInsights.length > 0 && (
              <div className="pt-6 space-y-4">
                <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isKitabTheme ? 'bg-[#f4ebd5] border-[#d8c3a1]' : 'bg-slate-900 border-slate-800'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🌟</span>
                    <div>
                      <h3 className={`text-sm sm:text-base font-bold flex items-center gap-2 ${
                        isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-white'
                      }`}>
                        <span>Temuan & Refleksi Sahabat Se-Level ({peerInsights.length})</span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                          Draf Pembukuan
                        </span>
                      </h3>
                      <p className={`text-xs mt-0.5 ${isKitabTheme ? 'text-[#634224]' : 'text-slate-400'}`}>
                        Catatan diary & pengalaman batin sesama peserta Level {levelNum} yang telah dikurasi oleh Guru/Admin.
                      </p>
                    </div>
                  </div>
                </div>

                {/* List Peer Insights */}
                <div className="grid grid-cols-1 gap-4">
                  {peerInsights.map((insight, pIdx) => {
                    const isExp = expandedIds.has(insight.id || `peer-${pIdx}`);

                    return (
                      <div
                        key={insight.id || `peer-${pIdx}`}
                        className={`rounded-3xl border transition overflow-hidden text-left ${
                          isKitabTheme
                            ? 'bg-[#fdfbf6] border-[#d8c3a1] shadow-sm'
                            : 'bg-slate-900/90 border-slate-800 shadow-md'
                        }`}
                      >
                        {/* Header Accordion */}
                        <div
                          onClick={() => toggleExpand(insight.id || `peer-${pIdx}`)}
                          className={`p-5 flex items-center justify-between gap-3 transition cursor-pointer select-none ${
                            isExp
                              ? isKitabTheme ? 'bg-[#f7eedc] border-b border-[#dfcfb0]' : 'bg-slate-950 border-b border-slate-800'
                              : isKitabTheme ? 'hover:bg-[#f5ebd7]' : 'hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0 border border-amber-500/20 text-base">
                              ✍️
                            </div>
                            <div className="space-y-0.5 flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                                  📖 Temuan Sahabat
                                </span>
                                {insight.created_at && (
                                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(insight.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                  </span>
                                )}
                              </div>
                              <h4 className={`text-sm sm:text-base font-bold leading-snug ${
                                isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-white'
                              }`}>
                                {insight.title?.replace('[Inspirasi Sahabat]', '').trim() || insight.title}
                              </h4>
                              {insight.subtitle && (
                                <p className={`text-xs font-semibold ${isKitabTheme ? 'text-[#8f632d]' : 'text-amber-400'}`}>
                                  {insight.subtitle}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="shrink-0 p-1.5 rounded-xl border border-slate-700/30 text-slate-400">
                            {isExp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {isExp && (
                          <div className="p-5 sm:p-6 space-y-4 animate-in fade-in duration-200">
                            {insight.content && (
                              <div className={`text-xs sm:text-sm leading-relaxed whitespace-pre-line p-4 sm:p-5 rounded-2xl border font-sans ${
                                isKitabTheme ? 'bg-[#fbf7ee] text-[#2c1810] border-[#dfcfb0]' : 'bg-slate-950 text-slate-300 border-slate-800'
                              }`}>
                                {insight.content}
                              </div>
                            )}

                            {insight.image_url && (
                              <div
                                onClick={() => setActiveLightbox({ url: insight.image_url, title: insight.title })}
                                className="relative w-full max-h-80 rounded-2xl overflow-hidden border flex items-center justify-center cursor-zoom-in group shadow-sm bg-black/5"
                              >
                                <img
                                  src={insight.image_url}
                                  alt={insight.title}
                                  className="w-full h-auto max-h-80 object-contain rounded-2xl"
                                />
                                <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-900/80 text-white flex items-center gap-1">
                                  <ZoomIn className="w-3 h-3 text-amber-400" />
                                  <span>Perbesar Foto</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
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
                    Pilih Program / Jenjang Level
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setAuthProgram("npt")}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                        authProgram === "npt"
                          ? "bg-sky-600 text-white border-sky-500"
                          : "bg-slate-950 text-slate-400 border-slate-800"
                      }`}
                    >
                      🏛️ NPT
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthProgram("emt")}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                        authProgram === "emt"
                          ? "bg-rose-600 text-white border-rose-500"
                          : "bg-slate-950 text-slate-400 border-slate-800"
                      }`}
                    >
                      🎓 EMT
                    </button>
                  </div>

                  {authProgram === "npt" && (
                    <select
                      value={authLevel}
                      onChange={(e) => setAuthLevel(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-rose-500"
                    >
                      <option value={1}>NPT Level 1</option>
                      <option value={2}>NPT Level 2</option>
                      <option value={3}>NPT Level 3</option>
                      <option value={4}>NPT Level 4</option>
                      <option value={5}>NPT Level 5</option>
                      <option value={6}>NPT Level 6</option>
                    </select>
                  )}
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
