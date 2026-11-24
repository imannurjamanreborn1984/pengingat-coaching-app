"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import ShareButton from "@/components/ui/ShareButton";
import MaterialVideoPlayer from "@/components/ui/MaterialVideoPlayer";
import MaterialDocumentViewer from "@/components/ui/MaterialDocumentViewer";
import MaterialCommentsSection from "@/components/npt/MaterialCommentsSection";
import MaterialViewerTracker from "@/components/npt/MaterialViewerTracker";
import {
  recordMaterialView,
  fetchLevelMaterialViews,
  fetchLevelEnrolledMembers
} from "@/lib/utils/materialTracker";
import { parseImageUrls } from "@/lib/utils/materialImages";
import {
  parseUserAccess,
  NPT_LEVEL_CONFIG,
  SUPER_ADMIN_EMAILS,
  getSavedDeviceUser,
  savePermanentDeviceUser,
  syncDeviceUserApproval
} from "@/lib/authHelper";

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
        : 'bg-slate-950 border border-slate-800'
    }`}>
      <div
        className={`text-xs sm:text-sm leading-relaxed whitespace-pre-line p-4 sm:p-5 transition-all duration-300 font-sans ${
          isKitabTheme ? 'text-[#2c1810]' : 'text-slate-100 font-medium'
        } ${!isExpanded ? "max-h-44 overflow-hidden relative" : ""}`}
      >
        {content}
        {!isExpanded && (
          <div className={`absolute inset-x-0 bottom-0 h-24 pointer-events-none ${
            isKitabTheme
              ? 'bg-gradient-to-t from-[#fbf7ee] via-[#fbf7ee]/90 to-transparent'
              : 'bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent'
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

  const [currentUser, setCurrentUser] = useState(() => getSavedDeviceUser());
  const [activeLightbox, setActiveLightbox] = useState(null); // { url, title }
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isKitabTheme, setIsKitabTheme] = useState(false);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('npt_theme');
      if (savedTheme === 'kitab') setIsKitabTheme(true);
      else if (savedTheme === 'dark') setIsKitabTheme(false);
    } catch (e) {}
  }, []);

  const toggleTheme = () => {
    const nextTheme = !isKitabTheme;
    setIsKitabTheme(nextTheme);
    try {
      localStorage.setItem('npt_theme', nextTheme ? 'kitab' : 'dark');
    } catch (e) {}
  };

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [inputName, setInputName] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  const [inputPhone, setInputPhone] = useState("");
  const [authProgram, setAuthProgram] = useState("npt");
  const [authLevel, setAuthLevel] = useState(levelNum);
  const [authStatus, setAuthStatus] = useState(null); // null | 'checking' | 'pending'

  useEffect(() => {
    const saved = getSavedDeviceUser();
    if (saved) {
      setCurrentUser(saved);
      syncDeviceUserApproval(supabase, saved).then((synced) => {
        if (synced) setCurrentUser(synced);
      });
    }

    // Auto-rotate ke landscape saat video di-maximize di layar HP
    const handleFullscreenChange = async () => {
      const isFs = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );

      if (isFs) {
        if (screen.orientation && typeof screen.orientation.lock === 'function') {
          try {
            await screen.orientation.lock('landscape');
          } catch (e) {}
        }
      } else {
        if (screen.orientation && typeof screen.orientation.unlock === 'function') {
          try {
            screen.orientation.unlock();
          } catch (e) {}
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Access check
  const access = parseUserAccess(currentUser);
  const isSuperAdmin = Boolean(access.isSuperAdmin);
  const isApproved = access.isApproved;
  const hasLevelAccess = access.canAccessNptLevel(levelNum);

  // Admin-only: Tracking Pembaca Materi
  const [levelViews, setLevelViews] = useState({});
  const [enrolledMembers, setEnrolledMembers] = useState([]);

  const loadAdminTrackingData = useCallback(async () => {
    if (!isSuperAdmin) return;
    try {
      const [views, members] = await Promise.all([
        fetchLevelMaterialViews(levelNum),
        fetchLevelEnrolledMembers(levelNum)
      ]);
      setLevelViews(views || {});
      setEnrolledMembers(members || []);
    } catch (e) {
      console.warn("Gagal memuat tracking pembaca:", e.message);
    }
  }, [isSuperAdmin, levelNum]);

  useEffect(() => {
    loadAdminTrackingData();
  }, [loadAdminTrackingData]);

  const fetchLevelMaterials = useCallback(async () => {
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
  }, [levelNum]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLevelMaterials();
  }, [fetchLevelMaterials]);

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

  // State Progres Belajar Selesai (Mastery Progression)
  const [completedMaterialIds, setCompletedMaterialIds] = useState(() => {
    try {
      const saved = localStorage.getItem(`npt_completed_materials_${levelNum}`);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
      return new Set();
    }
  });

  const toggleCompleteMaterial = (e, matId) => {
    e.stopPropagation();
    setCompletedMaterialIds((prev) => {
      const next = new Set(prev);
      if (next.has(matId)) {
        next.delete(matId);
      } else {
        next.add(matId);
      }
      try {
        localStorage.setItem(
          `npt_completed_materials_${levelNum}`,
          JSON.stringify(Array.from(next))
        );
      } catch (err) {}
      return next;
    });
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
    if (cleanEmail && SUPER_ADMIN_EMAILS.includes(cleanEmail)) {
      const adminData = {
        email: cleanEmail,
        name: cleanName || "Kang Iman",
        role: "super_admin",
        status: "approved"
      };
      setCurrentUser(adminData);
      savePermanentDeviceUser(adminData);
      setIsAuthModalOpen(false);
      setAuthStatus(null);
      return;
    }

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
        savePermanentDeviceUser(userData);
        setIsAuthModalOpen(false);
        setAuthStatus(null);
        alert("✅ Akses Member Terverifikasi! Perangkat Anda tersimpan permanen.");
      } else {
        const roleTarget = authProgram === 'emt' ? 'emt' : `npt_${authLevel}`;
        if (!profile) {
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
        const pendingUser = {
          email: cleanEmail || null,
          phone_number: formattedPhone || null,
          name: cleanName,
          role: roleTarget,
          status: "pending"
        };
        setCurrentUser(pendingUser);
        savePermanentDeviceUser(pendingUser);
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

  const levelInfo = NPT_LEVEL_CONFIG[levelNum] || {
    level: levelNum,
    name: `NPT Level ${levelNum}`,
    subtitle: `Kurikulum Neuro Programming Training Level ${levelNum}`,
    focus: `Pendalaman Materi Level ${levelNum}`,
    desc: `Materi resmi, video penjelasan, dan dokumen kurikulum Level ${levelNum}.`,
    icon: '📚'
  };

  const coreMaterials = (materials || []).filter(
    (m) => !m?.title?.includes("[Inspirasi Sahabat]")
  );
  const peerInsights = (materials || []).filter(
    (m) => m?.title?.includes("[Inspirasi Sahabat]")
  );

  // Rekam aktivitas membaca/membuka materi untuk modul yang sedang terbuka (expanded)
  useEffect(() => {
    if (!currentUser) return;
    (coreMaterials || []).forEach((mat, idx) => {
      const matKey = mat.id || idx;
      if (expandedIds.has(matKey)) {
        recordMaterialView({
          materialId: mat.id || `modul-${mat.order_index || idx}`,
          materialTitle: mat.title,
          levelNum,
          currentUser
        });
      }
    });

    (peerInsights || []).forEach((insight, idx) => {
      const insightKey = insight.id || `peer-${idx}`;
      if (expandedIds.has(insightKey)) {
        recordMaterialView({
          materialId: insight.id || `insight-${idx}`,
          materialTitle: insight.title,
          levelNum,
          currentUser
        });
      }
    });
  }, [expandedIds, coreMaterials, peerInsights, currentUser, levelNum]);

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
              onClick={toggleTheme}
              className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                isKitabTheme
                  ? 'bg-[#fdfaf3] text-[#3a2211] border-[#cbb38b] hover:bg-[#ebdcc4] shadow-xs'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title={isKitabTheme ? "Beralih ke Mode Gelap Sanctuary" : "Beralih ke Mode Kitab Klasik"}
            >
              <span>{isKitabTheme ? "🌌 Mode Gelap" : "📜 Mode Kitab Klasik"}</span>
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

          {/* Navigasi Cepat Antar Level (1 - 6) */}
          <div className={`pt-3 border-t flex flex-wrap items-center justify-between gap-2 ${
            isKitabTheme ? 'border-[#dfcfb0]' : 'border-slate-800'
          }`}>
            <span className={`text-[11px] font-bold ${isKitabTheme ? 'text-[#634224]' : 'text-slate-400'}`}>
              Pindah Cepat Kelas Level:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none touch-pan-x -mx-1 px-1 sm:flex-wrap">
              {[1, 2, 3, 4, 5, 6].map((lvl) => {
                const isAccessible = access.canAccessNptLevel(lvl);
                return (
                  <Link
                    key={lvl}
                    href={`/npt/${lvl}`}
                    className={`px-2.5 py-1 rounded-lg text-xs font-extrabold border transition flex items-center gap-1 ${
                      levelNum === lvl
                        ? isKitabTheme
                          ? 'bg-[#9e2a2b] text-white border-[#9e2a2b] shadow-xs'
                          : 'bg-rose-600 text-white border-rose-500 shadow-xs'
                        : isAccessible
                          ? isKitabTheme
                            ? 'bg-[#fbf7ee] text-[#543516] border-[#cbb38b] hover:bg-[#ebdcc4]'
                            : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
                          : isKitabTheme
                            ? 'bg-[#ebdcc4]/60 text-[#82613d] border-[#d8c3a1]'
                            : 'bg-slate-950/60 text-slate-500 border-slate-800'
                    }`}
                    title={isAccessible ? `Level ${lvl} Terbuka Otomatis` : `Level ${lvl} Terkunci (Butuh Training Offline)`}
                  >
                    <span>Level {lvl}</span>
                    {!isAccessible && <Lock className="w-3 h-3 text-amber-500/80" />}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Integrasi Khusus Level 5 & Level 6: 14 Akar Spiritual, Buku Diary, & Setoran Tugas */}
          {levelNum >= 5 && (
            <div className={`p-3.5 rounded-2xl border space-y-2 ${
              isKitabTheme
                ? 'bg-[#fdfaf3] border-[#cbb38b]'
                : 'bg-slate-950/80 border-rose-500/30'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-extrabold uppercase tracking-wider ${
                  isKitabTheme ? 'text-[#9e2a2b]' : 'text-amber-400'
                }`}>
                  🌿 Ruang Praktik Terpadu Level {levelNum} (14 Akar Spiritual & Jurnal):
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Link
                  href="/buku-saku"
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition ${
                    isKitabTheme
                      ? 'bg-[#f5ebd7] hover:bg-[#ebdcc4] text-[#3a2211] border-[#cbb38b]'
                      : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                >
                  <span>📖 14 Akar Spiritualitas</span>
                  <span>→</span>
                </Link>
                <Link
                  href="/buku-saku?tab=journal"
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition ${
                    isKitabTheme
                      ? 'bg-[#f5ebd7] hover:bg-[#ebdcc4] text-[#3a2211] border-[#cbb38b]'
                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  <span>📔 Buku Diary Harian</span>
                  <span>→</span>
                </Link>
                <Link
                  href="/dashboard"
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition ${
                    isKitabTheme
                      ? 'bg-[#f5ebd7] hover:bg-[#ebdcc4] text-[#3a2211] border-[#cbb38b]'
                      : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}
                >
                  <span>📋 Tugas & Setoran NPT</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* DAFTAR MATERI KURIKULUM & VIDEO                                           */}
        {/* ========================================================================= */}
        {isLoading ? (
          <div className={`p-12 text-center text-xs space-y-2 ${isKitabTheme ? 'text-[#8f632d]' : 'text-slate-400'}`}>
            <div className="w-6 h-6 border-2 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Memuat kurikulum dan video pembelajaran...</p>
          </div>
        ) : !hasLevelAccess ? (
          /* ======================================================================= */
          /* TAMPILAN TERKUNCI (HANYA ALUMNI OFFLINE BERSAMA GURU YANG DAPAT AKSES)   */
          /* ======================================================================= */
          <div className={`p-8 sm:p-12 rounded-3xl border text-center space-y-6 shadow-xl ${
            isKitabTheme ? 'card-kitab-frame' : 'bg-slate-900/90 border-amber-500/30'
          }`}>
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto border shadow-lg ${
              isKitabTheme
                ? 'bg-gradient-to-tr from-[#edd8b6] to-[#ebdcc4] text-[#9e2a2b] border-[#cbb38b]'
                : 'bg-gradient-to-tr from-amber-500/20 to-rose-500/20 text-amber-400 border-amber-500/40 shadow-amber-500/10'
            }`}>
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider border inline-block ${
                isKitabTheme ? 'bg-[#edd8b6] text-[#9e2a2b] border-[#cbb38b]' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}>
                🔒 Jenjang Khusus Murid Offline
              </span>
              <h2 className={`text-xl sm:text-2xl font-black ${
                isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-white'
              }`}>
                Materi NPT Level {levelNum} Belum Terbuka
              </h2>
              <p className={`text-xs sm:text-sm leading-relaxed ${
                isKitabTheme ? 'text-[#634224]' : 'text-slate-300'
              }`}>
                Kurikulum keilmuan <strong>Neuro Programming Training (NPT)</strong> berfokus pada transmisi batin dan pembersihan somatik langsung bersama <strong>Sang Guru</strong>. Seluruh modul, video pendalaman, dan setoran tugas Level {levelNum} ini dikhususkan bagi sahabat yang telah menyelesaikan sesi tatap muka (offline training).
              </p>
            </div>

            {/* Kotak Info Status Jenjang User */}
            <div className={`p-4 rounded-2xl max-w-md mx-auto border text-xs space-y-2 ${
              isKitabTheme ? 'bg-[#fbf7ee] border-[#dfcfb0] text-[#3a2211]' : 'bg-slate-950/80 border-slate-800 text-slate-300'
            }`}>
              <div className="flex items-center justify-between">
                <span className={isKitabTheme ? 'text-[#82613d]' : 'text-slate-400'}>Status Akun Perangkat:</span>
                <span className="font-bold">{access.badgeText}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={isKitabTheme ? 'text-[#82613d]' : 'text-slate-400'}>Akses Level Anda:</span>
                <span className="font-bold text-amber-500">
                  {access.allowedLevels?.length > 0 ? `Level ${access.allowedLevels.join(', ')}` : `Level ${access.maxLevel}`}
                </span>
              </div>
              <p className={`text-[11px] pt-1.5 border-t leading-relaxed ${
                isKitabTheme ? 'text-[#82613d] border-[#dfcfb0]' : 'text-slate-400 border-slate-800/80'
              }`}>
                Setelah menghadiri offline training Level {levelNum}, Admin akan memperbarui akses akun Anda dan seluruh modul otomatis terbuka di perangkat ini.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {access.allowedLevels?.length > 0 && (
                <Link
                  href={`/npt/${access.allowedLevels[0]}`}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-md shadow-rose-600/20"
                >
                  ← Buka Kelas Level Terbuka (Level {access.allowedLevels[0]})
                </Link>
              )}
              <a
                href={`https://wa.me/6281234567890?text=${encodeURIComponent(`Assalamu'alaikum Admin NPT, saya ${currentUser?.name || 'Murid'} (${currentUser?.email || ''}) ingin menanyakan jadwal Offline Training terdekat untuk Level ${levelNum}.`)}`}
                target="_blank"
                rel="noreferrer"
                className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
                  isKitabTheme
                    ? 'bg-[#dbeef0] text-[#1b6b55] border-[#b0d9d3] hover:bg-[#cbeae4]'
                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Info Jadwal Offline Level {levelNum}</span>
              </a>
              <Link
                href="/npt"
                className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition ${
                  isKitabTheme
                    ? 'bg-[#eee3cb] text-[#543516] border-[#d8c3a1] hover:bg-[#dfcdab]'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                Peta Kurikulum Lengkap
              </Link>
            </div>
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

            {/* MASTERY LEVEL PROGRESS TRACKER */}
            {coreMaterials.length > 0 && (
              <div
                className={`p-4 sm:p-5 rounded-3xl border transition shadow-md ${
                  isKitabTheme
                    ? "bg-[#f7eedc] border-[#dfcfb0]"
                    : "bg-slate-900/90 border-slate-800"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-lg ${
                      isKitabTheme ? "bg-[#ede1c7] text-[#634224]" : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                    }`}>
                      🏆
                    </div>
                    <div>
                      <h3
                        className={`text-xs sm:text-sm font-bold ${
                          isKitabTheme ? "text-[#26150a]" : "text-white"
                        }`}
                      >
                        Progres Pembelajaran NPT Level {levelNum}
                      </h3>
                      <p
                        className={`text-[11px] ${
                          isKitabTheme ? "text-[#8f632d]" : "text-slate-400"
                        }`}
                      >
                        Tandai tombol &ldquo;Selesai&rdquo; pada materi yang telah Anda kaji dan amalkan.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span
                      className={`text-xs font-black px-3 py-1 rounded-xl font-mono border ${
                        completedMaterialIds.size === coreMaterials.length && coreMaterials.length > 0
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          : isKitabTheme
                          ? "bg-[#ede1c7] text-[#634224] border-[#cbb38b]"
                          : "bg-slate-800 text-rose-300 border-slate-700"
                      }`}
                    >
                      {completedMaterialIds.size} / {coreMaterials.length} Modul ({Math.round((completedMaterialIds.size / (coreMaterials.length || 1)) * 100)}%)
                    </span>
                  </div>
                </div>

                {/* Animated Progress Bar */}
                <div
                  className={`w-full h-2 rounded-full overflow-hidden ${
                    isKitabTheme ? "bg-[#e8d8bd]" : "bg-slate-950"
                  }`}
                >
                  <div
                    className="h-full bg-gradient-to-r from-rose-600 via-amber-500 to-emerald-500 transition-all duration-500 ease-out rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round(
                          (completedMaterialIds.size / (coreMaterials.length || 1)) * 100
                        )
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* List Materi */}
            {coreMaterials.map((mat, idx) => {
              const isExpanded = expandedIds.has(mat.id || idx);
              const isLatest = idx === 0;
              const isCompleted = completedMaterialIds.has(mat.id || idx);

              return (
                <div
                  key={mat.id || idx}
                  className={`rounded-3xl transition duration-200 overflow-hidden text-left ${
                    isKitabTheme
                      ? isCompleted
                        ? 'card-kitab-frame shadow-md ring-1 ring-emerald-600/40'
                        : isLatest && isExpanded
                        ? 'card-kitab-frame shadow-md ring-1 ring-[#8f632d]/40'
                        : 'card-kitab-frame shadow-xs'
                      : isCompleted
                        ? 'bg-slate-900 border border-emerald-500/30 shadow-xl'
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
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : isLatest
                          ? isKitabTheme
                            ? 'bg-[#3a2211] text-amber-300 border-[#8f632d]'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : isKitabTheme
                            ? 'bg-[#ede1c7] text-[#634224] border-[#d8c3a1]'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {isCompleted ? '✅' : isLatest ? '✨' : '📖'}
                      </div>

                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-wider ${
                            isKitabTheme ? 'bg-[#ede1c7] text-[#634224]' : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}>
                            MODUL {String(coreMaterials.length - idx).padStart(2, '0')}
                          </span>

                          {isCompleted ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shadow-xs">
                              <CheckCircle2 className="w-3 h-3" /> SELESAI
                            </span>
                          ) : isLatest ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-700 text-white shadow-xs">
                              TERBARU
                            </span>
                          ) : null}

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

                          {/* BADGE PEMBACA (KHUSUS GURU & ADMIN) */}
                          {isSuperAdmin && (
                            <MaterialViewerTracker
                              material={mat}
                              levelNum={levelNum}
                              isSuperAdmin={isSuperAdmin}
                              viewsList={levelViews[String(mat.id || `modul-${mat.order_index || idx}`)] || []}
                              enrolledMembers={enrolledMembers}
                              isKitabTheme={isKitabTheme}
                              onRefresh={loadAdminTrackingData}
                              renderMode="badge"
                            />
                          )}
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

                    {/* Tombol Checklist Selesai & Chevron */}
                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => toggleCompleteMaterial(e, mat.id || idx)}
                        className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition flex items-center gap-1 border shadow-xs cursor-pointer ${
                          isCompleted
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : isKitabTheme
                            ? 'bg-[#ede1c7] text-[#5e3d1c] border-[#cbb38b] hover:bg-[#dfcdab]'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-700'
                        }`}
                        title={isCompleted ? 'Klik untuk membatalkan status selesai' : 'Tandai modul ini sudah dipelajari'}
                      >
                        <CheckCircle2 className={`w-3.5 h-3.5 ${isCompleted ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <span className="hidden sm:inline">{isCompleted ? 'Selesai' : 'Tandai Selesai'}</span>
                      </button>

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

                      {/* 1. GAMBAR LAMPIRAN (MENDUKUNG 1 - 3 GAMBAR) */}
                      {(() => {
                        const images = parseImageUrls(mat.image_url);
                        if (!images.length) return null;
                        return (
                          <div className="space-y-2">
                            {images.length === 1 ? (
                              <div
                                onClick={() => setActiveLightbox({ url: images[0], title: mat.title })}
                                className={`relative w-full max-h-96 rounded-2xl overflow-hidden border flex items-center justify-center cursor-zoom-in group shadow-lg ${
                                  isKitabTheme ? 'bg-[#f4ebd5] border-[#d4b886]' : 'bg-slate-950 border-slate-800'
                                }`}
                                title="Klik untuk Perbesar Gambar (Zoom In / Out)"
                              >
                                <img
                                  src={images[0]}
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
                            ) : (
                              <div className={`grid gap-3 ${images.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'}`}>
                                {images.map((imgUrl, idx) => (
                                  <div
                                    key={idx}
                                    onClick={() => setActiveLightbox({ url: imgUrl, title: `${mat.title} (Gambar ${idx + 1} dari ${images.length})` })}
                                    className={`relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border flex items-center justify-center cursor-zoom-in group shadow-md ${
                                      isKitabTheme ? 'bg-[#f4ebd5] border-[#d4b886]' : 'bg-slate-950 border-slate-800'
                                    }`}
                                    title={`Klik untuk Perbesar Gambar #${idx + 1}`}
                                  >
                                    <img
                                      src={imgUrl}
                                      alt={`${mat.title} - ${idx + 1}`}
                                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                                    />
                                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-slate-950/80 text-white text-[10px] font-bold border border-slate-700">
                                      Gambar #{idx + 1}
                                    </div>
                                    <div className={`absolute bottom-2 right-2 px-2.5 py-1 rounded-xl border text-[10px] font-bold flex items-center gap-1 shadow-lg ${
                                      isKitabTheme
                                        ? 'bg-[#fdfaf3]/90 text-[#3a2211] border-[#cbb38b]'
                                        : 'bg-slate-900/85 backdrop-blur-md border-slate-700/80 text-white'
                                    }`}>
                                      <ZoomIn className={`w-3 h-3 ${isKitabTheme ? 'text-[#9e2a2b]' : 'text-amber-400'}`} />
                                      <span>Zoom</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* 2. VIDEO YOUTUBE (MENDUKUNG 1 - 3 VIDEO / PART) */}
                      <MaterialVideoPlayer
                        youtubeUrl={mat.youtube_url}
                        title={mat.title}
                        isKitabTheme={isKitabTheme}
                        isApproved={isApproved}
                        onOpenAuthModal={() => setIsAuthModalOpen(true)}
                      />

                      {/* 3. DOKUMEN / FILE VIEWER (INTERAKTIF & LEVEL-GATED) */}
                      {mat.file_url && (
                        <div className="pt-2">
                          <MaterialDocumentViewer
                            fileUrl={mat.file_url}
                            fileName={mat.file_name || "Buka Lampiran Dokumen"}
                            fileType={mat.file_type || "pdf"}
                            isKitabTheme={isKitabTheme}
                            hasLevelAccess={hasLevelAccess}
                            isApproved={isApproved}
                            levelNum={levelNum}
                            badgeText={access.badgeText}
                            currentUser={currentUser}
                            onOpenAuthModal={() => setIsAuthModalOpen(true)}
                          />
                        </div>
                      )}

                      {/* Tombol Bagikan / Share Materi */}
                      <ShareButton
                        title={mat.title}
                        snippet={mat.subtitle || mat.content}
                        path={`/npt/${levelNum}`}
                        category={`NPT Level ${levelNum}`}
                        isKitabTheme={isKitabTheme}
                      />

                      {/* PANTAUAN PEMBACA (KHUSUS GURU & ADMIN) */}
                      {isSuperAdmin && (
                        <div className="pt-2">
                          <MaterialViewerTracker
                            material={mat}
                            levelNum={levelNum}
                            isSuperAdmin={isSuperAdmin}
                            viewsList={levelViews[String(mat.id || `modul-${mat.order_index || idx}`)] || []}
                            enrolledMembers={enrolledMembers}
                            isKitabTheme={isKitabTheme}
                            onRefresh={loadAdminTrackingData}
                            renderMode="card"
                          />
                        </div>
                      )}

                      {/* 4. RUANG KOMENTAR & TANYA JAWAB MATERI */}
                      <div className="pt-2">
                        <MaterialCommentsSection
                          materialId={mat.id || `modul-${mat.order_index || idx}`}
                          materialTitle={mat.title}
                          levelNum={levelNum}
                          isKitabTheme={isKitabTheme}
                          currentUser={currentUser}
                          isApproved={isApproved}
                          onOpenAuthModal={() => setIsAuthModalOpen(true)}
                        />
                      </div>

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

                                {/* BADGE PEMBACA (KHUSUS GURU & ADMIN) */}
                                {isSuperAdmin && (
                                  <MaterialViewerTracker
                                    material={insight}
                                    levelNum={levelNum}
                                    isSuperAdmin={isSuperAdmin}
                                    viewsList={levelViews[String(insight.id || `insight-${pIdx}`)] || []}
                                    enrolledMembers={enrolledMembers}
                                    isKitabTheme={isKitabTheme}
                                    onRefresh={loadAdminTrackingData}
                                    renderMode="badge"
                                  />
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

                            {/* Tombol Bagikan Catatan Sahabat */}
                            <ShareButton
                              title={insight.title}
                              snippet={insight.content}
                              path={`/npt/${levelNum}`}
                              category={`Refleksi Sahabat NPT Level ${levelNum}`}
                              isKitabTheme={isKitabTheme}
                            />

                            {/* PANTAUAN PEMBACA (KHUSUS GURU & ADMIN) */}
                            {isSuperAdmin && (
                              <div className="pt-2">
                                <MaterialViewerTracker
                                  material={insight}
                                  levelNum={levelNum}
                                  isSuperAdmin={isSuperAdmin}
                                  viewsList={levelViews[String(insight.id || `insight-${pIdx}`)] || []}
                                  enrolledMembers={enrolledMembers}
                                  isKitabTheme={isKitabTheme}
                                  onRefresh={loadAdminTrackingData}
                                  renderMode="card"
                                />
                              </div>
                            )}

                            {/* Ruang Komentar Catatan Sahabat */}
                            <div className="pt-2">
                              <MaterialCommentsSection
                                materialId={insight.id || `insight-${idx}`}
                                materialTitle={insight.title}
                                levelNum={levelNum}
                                isKitabTheme={isKitabTheme}
                                currentUser={currentUser}
                                isApproved={isApproved}
                                onOpenAuthModal={() => setIsAuthModalOpen(true)}
                              />
                            </div>
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
