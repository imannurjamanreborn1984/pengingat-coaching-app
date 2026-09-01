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
  ShieldCheck
} from "lucide-react";

export default function NPTLevelDetailPage() {
  const params = useParams();
  const levelNum = Number(params?.level) || 1;

  const [currentUser, setCurrentUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [inputName, setInputName] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  const [inputPhone, setInputPhone] = useState("");
  const [authStatus, setAuthStatus] = useState(null); // null | 'checking' | 'pending'

  const isApproved = currentUser?.status === "approved" || currentUser?.role === "super_admin";

  useEffect(() => {
    try {
      const authStr = localStorage.getItem("npt_user_auth");
      if (authStr) {
        setCurrentUser(JSON.parse(authStr));
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

        if (!error && data && data.length > 0) {
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
        localStorage.setItem("npt_user_auth", JSON.stringify(userData));
        localStorage.setItem("participant_name", userData.name);
        setIsAuthModalOpen(false);
        setAuthStatus(null);
        alert("✅ Akses Member Terverifikasi! Seluruh dokumen dan video sekarang terbuka.");
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
        return <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">📄 PDF Dokumen</span>;
      case "ppt":
        return <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">📊 Slide (PPT)</span>;
      case "docx":
        return <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold">📝 Dokumen Word</span>;
      case "gdrive":
        return <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">☁️ Google Drive</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-bold">📎 Lampiran</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-600 selection:text-white">
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
        <div className="flex items-center justify-between">
          <Link
            href="/npt"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Roadmap NPT (1 – 6)</span>
          </Link>

          <div className="flex items-center gap-2">
            {isApproved ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Member VIP Terbuka
              </span>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold hover:bg-rose-500/20 transition flex items-center gap-1 cursor-pointer"
              >
                <Lock className="w-3 h-3 text-rose-400" /> Buka Akses Member
              </button>
            )}
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-black">
              LEVEL {levelNum}
            </span>
          </div>
        </div>

        {/* Level Header Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-2 shadow-xl">
          <h1 className="text-xl sm:text-3xl font-black text-white">
            Materi & Modul Pembelajaran NPT Level {levelNum}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Akses materi bacaan, file presentasi PPT, modul PDF, dokumen Word, serta video penjelasan resmi.
          </p>
        </div>

        {/* Material Items */}
        {isLoading ? (
          <div className="py-16 text-center text-xs text-slate-400">
            Memuat materi pembelajaran...
          </div>
        ) : materials.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-slate-200">
              Materi NPT Level {levelNum} Segera Diupload
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Materi dan kurikulum untuk jenjang ini sedang dalam proses finalisasi oleh Master Trainer. Silakan pantau berkala atau pelajari modul yang sudah aktif.
            </p>
            <div className="pt-2">
              <Link
                href="/buku-saku"
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-md shadow-rose-600/30 inline-flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Buka Buku Saku 14 Akar (Level 6 Aktif)</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {materials.map((mat, idx) => (
              <div
                key={mat.id || idx}
                className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition shadow-xl space-y-4 text-left"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <h2 className="text-base font-extrabold text-white">
                      {mat.title}
                    </h2>
                    {mat.subtitle && (
                      <p className="text-xs text-amber-400 font-medium mt-0.5">
                        {mat.subtitle}
                      </p>
                    )}
                  </div>
                  {mat.file_type && mat.file_url && getFileBadge(mat.file_type)}
                </div>

                {mat.content && (
                  <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                    {mat.content}
                  </div>
                )}

                {/* MEMBER LOCK VS FULL ACCESS */}
                {isApproved ? (
                  /* MEMBER APPROVED: FULL VIDEO & FILE DOWNLOAD ACCESS */
                  <div className="space-y-4 pt-2">
                    {mat.youtube_url && (
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
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
                          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
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
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-950 to-slate-950 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20 shrink-0">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-100">
                          Lampiran Dokumen & Video Terkunci
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Khusus member terdaftar. Masuk untuk mengunduh <strong>{mat.file_name || "file dokumen"}</strong> dan memutar video.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsAuthModalOpen(true)}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition shrink-0 cursor-pointer"
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
    </div>
  );
}
