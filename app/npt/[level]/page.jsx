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
  Layers
} from "lucide-react";

export default function NPTLevelDetailPage() {
  const params = useParams();
  const levelNum = Number(params?.level) || 1;

  const [currentUser, setCurrentUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const getFileBadge = (type) => {
    switch (type) {
      case "pdf":
        return <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">📄 PDF Dokumen</span>;
      case "ppt":
        return <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">📊 Slide Presentasi (PPT)</span>;
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
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/npt"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Roadmap NPT (1 – 6)</span>
          </Link>
          <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-black">
            LEVEL {levelNum}
          </span>
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

                {/* Video Player if YouTube URL provided */}
                {mat.youtube_url && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Film className="w-4 h-4 text-red-500" />
                      <span>Video Penjelasan:</span>
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

                {/* File Download Action Button */}
                {mat.file_url && (
                  <div className="pt-2">
                    <a
                      href={mat.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Buka / Unduh Lampiran: {mat.file_name || "Download Dokumen"}</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-70 ml-1" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
