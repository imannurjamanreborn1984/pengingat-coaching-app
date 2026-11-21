"use client";

import React, { useState } from "react";
import {
  FileText,
  Presentation,
  FileSpreadsheet,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  Maximize2,
  Lock,
  Sparkles,
  Loader2
} from "lucide-react";
import { formatDocumentEmbedUrl } from "@/lib/utils/materialImages";

export default function MaterialDocumentViewer({
  fileUrl,
  fileName = "Lampiran Dokumen",
  fileType = "pdf",
  isKitabTheme = false,
  hasLevelAccess = true,
  isApproved = true,
  levelNum = 1,
  badgeText = "Member",
  currentUser = null,
  onOpenAuthModal = null,
  defaultOpen = false,
}) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(defaultOpen);
  const [isLoadingIframe, setIsLoadingIframe] = useState(true);

  if (!fileUrl) return null;

  const { embedUrl, isEmbeddable, provider } = formatDocumentEmbedUrl(fileUrl);

  // Badge icon & styling based on file type
  const getFileIconMeta = () => {
    const type = (fileType || "").toLowerCase();
    if (type === "ppt" || type.includes("slide") || type.includes("powerpoint") || fileName.toLowerCase().endsWith(".pptx") || fileName.toLowerCase().endsWith(".ppt")) {
      return {
        icon: Presentation,
        label: "Slide Presentasi PPT",
        colorClass: isKitabTheme
          ? "bg-amber-800/15 text-amber-900 border-amber-800/30"
          : "bg-amber-500/15 text-amber-400 border-amber-500/30",
        badgeBg: "bg-amber-600 text-white"
      };
    }
    if (type === "docx" || type === "doc" || type.includes("word") || fileName.toLowerCase().endsWith(".docx") || fileName.toLowerCase().endsWith(".doc")) {
      return {
        icon: FileText,
        label: "Dokumen Word",
        colorClass: isKitabTheme
          ? "bg-sky-800/15 text-sky-900 border-sky-800/30"
          : "bg-sky-500/15 text-sky-400 border-sky-500/30",
        badgeBg: "bg-sky-600 text-white"
      };
    }
    if (type === "sheet" || type.includes("excel") || fileName.toLowerCase().endsWith(".xlsx")) {
      return {
        icon: FileSpreadsheet,
        label: "Spreadsheet Excel",
        colorClass: isKitabTheme
          ? "bg-emerald-800/15 text-emerald-900 border-emerald-800/30"
          : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
        badgeBg: "bg-emerald-600 text-white"
      };
    }
    // Default PDF / Google Drive
    return {
      icon: FileText,
      label: type === "gdrive" ? "Google Drive" : "Modul PDF",
      colorClass: isKitabTheme
        ? "bg-rose-800/15 text-rose-900 border-rose-800/30"
        : "bg-rose-500/15 text-rose-400 border-rose-500/30",
      badgeBg: "bg-rose-600 text-white"
    };
  };

  const fileMeta = getFileIconMeta();
  const IconComponent = fileMeta.icon;

  // 1. Kondisi Belum Login / Non-Member
  if (!isApproved) {
    return (
      <div
        className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isKitabTheme
            ? "bg-[#f5ebd7] border-[#d8c3a1]"
            : "bg-gradient-to-r from-rose-950/40 via-slate-950 to-slate-950 border-rose-500/30"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              isKitabTheme
                ? "bg-[#ebdcc4] text-[#9e2a2b] border-[#cbb38b]"
                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
            }`}
          >
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4
              className={`text-xs font-bold ${
                isKitabTheme ? "text-[#26150a]" : "text-slate-100"
              }`}
            >
              Lampiran Dokumen Pembelajaran Terkunci
            </h4>
            <p
              className={`text-[11px] ${
                isKitabTheme ? "text-[#634224]" : "text-slate-400"
              }`}
            >
              Khusus member terdaftar. Masuk untuk membaca dan mengunduh{" "}
              <strong>{fileName || "file dokumen"}</strong>.
            </p>
          </div>
        </div>

        {onOpenAuthModal && (
          <button
            onClick={onOpenAuthModal}
            className={`px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition shrink-0 cursor-pointer ${
              isKitabTheme
                ? "bg-[#9e2a2b] hover:bg-[#852324]"
                : "bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 shadow-rose-600/30"
            }`}
          >
            🔓 Masuk / Buka Akses
          </button>
        )}
      </div>
    );
  }

  // 2. Kondisi Member tapi Jenjang Level Belum Mencukupi
  if (!hasLevelAccess) {
    return (
      <div
        className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isKitabTheme
            ? "bg-[#ebdcc4]/70 border-[#d8c3a1]"
            : "bg-slate-900 border-amber-500/30"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
              isKitabTheme
                ? "bg-[#fdfaf3] text-[#8f632d] border-[#cbb38b]"
                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
            }`}
          >
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h4
              className={`text-xs font-bold ${
                isKitabTheme ? "text-[#26150a]" : "text-slate-100"
              }`}
            >
              Berkas Dokumen Khusus NPT Level {levelNum}
            </h4>
            <p
              className={`text-[11px] ${
                isKitabTheme ? "text-[#634224]" : "text-slate-400"
              }`}
            >
              Anda saat ini di jenjang <strong>{badgeText}</strong>. Video materi dapat Anda tonton, namun modul dokumen ini terkunci.
            </p>
          </div>
        </div>
        <a
          href={`https://wa.me/628123456789?text=${encodeURIComponent(
            `Assalamu'alaikum Admin NPT, saya *${
              currentUser?.name || "Member"
            }* ingin konfirmasi upgrade ke NPT Level ${levelNum}.`
          )}`}
          target="_blank"
          rel="noreferrer"
          className={`px-4 py-2 rounded-xl text-white text-xs font-bold shrink-0 text-center transition ${
            isKitabTheme
              ? "bg-[#9e2a2b] hover:bg-[#852324]"
              : "bg-amber-600 hover:bg-amber-500"
          }`}
        >
          Upgrade ke Level {levelNum}
        </a>
      </div>
    );
  }

  // 3. Kondisi Akses Terbuka (Full Member with Level Access)
  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-all shadow-sm ${
        isKitabTheme
          ? "bg-[#fcf7ed] border-[#dfcfb0]"
          : "bg-slate-950/80 border-slate-800"
      }`}
    >
      {/* HEADER BAR DOKUMEN */}
      <div
        className={`p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isKitabTheme
            ? "border-b border-[#dfcfb0]/60 bg-[#f7eedc]/50"
            : "border-b border-slate-800/80 bg-slate-900/60"
        }`}
      >
        {/* Info File */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${fileMeta.colorClass}`}
          >
            <IconComponent className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${fileMeta.badgeBg}`}
              >
                {fileMeta.label}
              </span>
              <span
                className={`text-[10px] font-medium hidden sm:inline ${
                  isKitabTheme ? "text-[#8f632d]" : "text-slate-400"
                }`}
              >
                • Tersemat Interaktif
              </span>
            </div>
            <h4
              className={`text-xs sm:text-sm font-bold truncate mt-0.5 ${
                isKitabTheme ? "text-[#26150a]" : "text-white"
              }`}
              title={fileName}
            >
              {fileName}
            </h4>
          </div>
        </div>

        {/* Action Buttons: Preview Toggle & Download */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {/* Tombol Preview Toggle */}
          <button
            type="button"
            onClick={() => {
              setIsPreviewOpen((prev) => !prev);
              setIsLoadingIframe(true);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer ${
              isPreviewOpen
                ? isKitabTheme
                  ? "bg-[#3a2211] text-amber-300 border border-[#8f632d]"
                  : "bg-rose-600 text-white border border-rose-500 shadow-rose-600/30"
                : isKitabTheme
                ? "bg-[#ede1c7] text-[#5e3d1c] hover:bg-[#dfcdab] border border-[#cbb38b]"
                : "bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 border border-slate-700"
            }`}
          >
            {isPreviewOpen ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>Tutup Preview</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>Baca di Web</span>
              </>
            )}
          </button>

          {/* Tombol Download / Buka Asli di Tab Baru */}
          <a
            href={fileUrl}
            target="_blank"
            rel="noreferrer"
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 border shadow-xs ${
              isKitabTheme
                ? "bg-[#ebdcc4] text-[#3a2211] hover:bg-[#dfcdab] border-[#cbb38b]"
                : "bg-slate-900 text-sky-400 hover:text-sky-300 hover:bg-slate-800 border-slate-700"
            }`}
            title="Buka dokumen di tab baru atau unduh langsung"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Buka / Unduh</span>
            <ExternalLink className="w-3 h-3 opacity-60 ml-0.5" />
          </a>
        </div>
      </div>

      {/* EMBEDDED IFRAME VIEWER CONTAINER */}
      {isPreviewOpen && (
        <div className="relative animate-in fade-in duration-300">
          {/* Loading Indicator */}
          {isLoadingIframe && (
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center z-10 gap-2 backdrop-blur-xs ${
                isKitabTheme ? "bg-[#fcf7ed]/80 text-[#3a2211]" : "bg-slate-950/80 text-white"
              }`}
            >
              <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
              <p className="text-xs font-medium">Memuat pratinjau dokumen...</p>
            </div>
          )}

          {/* Iframe View */}
          <div className="w-full h-[520px] sm:h-[620px] bg-slate-900 overflow-hidden">
            <iframe
              src={embedUrl}
              title={fileName}
              onLoad={() => setIsLoadingIframe(false)}
              className="w-full h-full border-0"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          </div>

          {/* Footer Guidance */}
          <div
            className={`px-4 py-2 text-[11px] flex flex-wrap items-center justify-between gap-2 border-t ${
              isKitabTheme
                ? "bg-[#f7eedc] text-[#634224] border-[#dfcfb0]"
                : "bg-slate-900/90 text-slate-400 border-slate-800"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>
                <strong>Tips Belajar:</strong> Anda bisa scroll, zoom, atau klik ikon pop-out di kanan atas untuk layar penuh.
              </span>
            </div>
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="font-bold underline hover:opacity-80 flex items-center gap-1"
            >
              <span>Mengalami kendala pratinjau? Buka langsung di Google Drive</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
