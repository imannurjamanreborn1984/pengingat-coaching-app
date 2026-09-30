"use client";

import React, { useState } from "react";
import { Share2, Copy, Check, MessageCircle } from "lucide-react";

export default function ShareButton({
  title = "Materi NPT Centre",
  snippet = "",
  path = "",
  category = "Khazanah NPT",
  isKitabTheme = true,
  className = "",
  compact = false,
}) {
  const [copied, setCopied] = useState(false);

  // Construct absolute URL safely
  const getShareUrl = () => {
    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      if (path) {
        return path.startsWith("http") ? path : `${origin}${path.startsWith("/") ? "" : "/"}${path}`;
      }
      return window.location.href;
    }
    return `https://neuroprogrammingtraining.id${path ? (path.startsWith("/") ? path : `/${path}`) : ""}`;
  };

  const getCleanSnippet = () => {
    if (!snippet) return "";
    const clean = snippet.replace(/<[^>]*>?/gm, "").trim();
    if (clean.length > 180) {
      return clean.substring(0, 180) + "...";
    }
    return clean;
  };

  const handleCopyLink = async (e) => {
    e.stopPropagation();
    try {
      const shareUrl = getShareUrl();
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.warn("Failed to copy link:", err);
    }
  };

  const handleWhatsAppShare = (e) => {
    e.stopPropagation();
    const shareUrl = getShareUrl();
    const cleanSnippet = getCleanSnippet();

    const textPayload = `🌿 *NPT CENTRE - ${category.toUpperCase()}*\n*${title}*\n\n${cleanSnippet ? `"${cleanSnippet}"\n\n` : ""}📖 *Simak ulasan selengkapnya di NPT Centre:*\n${shareUrl}`;

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(textPayload)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const handleNativeShare = async (e) => {
    e.stopPropagation();
    const shareUrl = getShareUrl();
    const cleanSnippet = getCleanSnippet();

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `NPT Centre: ${title}`,
          text: cleanSnippet || title,
          url: shareUrl,
        });
        return;
      } catch (err) {
        if (err.name !== "AbortError") {
          handleWhatsAppShare(e);
        }
      }
    } else {
      handleWhatsAppShare(e);
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <button
          type="button"
          onClick={handleWhatsAppShare}
          className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
            isKitabTheme
              ? "bg-[#dbeef0] text-[#136f58] border-[#a5d8cf] hover:bg-[#cbeae4]"
              : "bg-emerald-950/50 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/60"
          }`}
          title="Bagikan ke WhatsApp"
        >
          <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="hidden sm:inline">Share WA</span>
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
            copied
              ? "bg-emerald-600 text-white border-emerald-500"
              : isKitabTheme
              ? "bg-[#eee3cb] text-[#543516] border-[#d8c3a1] hover:bg-[#dfcdab]"
              : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
          }`}
          title="Salin Tautan Materi"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{copied ? "Tersalin!" : "Salin Link"}</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center justify-between gap-2 pt-3 border-t ${
      isKitabTheme ? "border-[#dfcfb0]/50" : "border-slate-800"
    } ${className}`}>
      <span className={`text-[11px] font-semibold flex items-center gap-1.5 ${
        isKitabTheme ? "text-[#734822]" : "text-slate-400"
      }`}>
        <Share2 className="w-3.5 h-3.5 text-amber-500" />
        <span>Bagikan ilmu & pencerahan ini:</span>
      </span>

      <div className="flex items-center gap-2">
        {/* Tombol WhatsApp */}
        <button
          type="button"
          onClick={handleWhatsAppShare}
          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
            isKitabTheme
              ? "bg-[#dbeef0] text-[#136f58] border-[#a5d8cf] hover:bg-[#cbeae4]"
              : "bg-emerald-950/60 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/60"
          }`}
          title="Bagikan ke WhatsApp Grup / Sahabat"
        >
          <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Bagikan ke WA</span>
        </button>

        {/* Tombol Salin Tautan */}
        <button
          type="button"
          onClick={handleCopyLink}
          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
            copied
              ? "bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/30"
              : isKitabTheme
              ? "bg-[#eee3cb] text-[#543516] border-[#d8c3a1] hover:bg-[#dfcdab]"
              : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
          }`}
          title="Salin Link Halaman ini"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-white" />
              <span className="text-white">Tautan Tersalin!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Salin Link</span>
            </>
          )}
        </button>

        {/* Tombol Native Share jika di smartphone */}
        <button
          type="button"
          onClick={handleNativeShare}
          className={`p-1.5 rounded-xl border text-xs font-bold transition-all flex sm:hidden items-center justify-center cursor-pointer ${
            isKitabTheme
              ? "bg-[#f4ebd5] text-[#543516] border-[#d8c3a1] hover:bg-[#ebdcc4]"
              : "bg-slate-900 text-slate-300 border-slate-800"
          }`}
          title="Opsi Share Lainnya"
        >
          <Share2 className="w-3.5 h-3.5 text-[#543516]" />
        </button>
      </div>
    </div>
  );
}
