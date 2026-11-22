"use client";

import React, { useState, useEffect } from "react";
import { Film, ExternalLink, Lock, Music2, Loader2, Play, Sparkles } from "lucide-react";
import { parseYouTubeUrls, formatVideoEmbed, detectVideoPlatform } from "@/lib/utils/materialImages";

export default function MaterialVideoPlayer({
  youtubeUrl,
  title = "Video Pembelajaran",
  isKitabTheme = false,
  isApproved = true,
  onOpenAuthModal = null,
}) {
  const urls = parseYouTubeUrls(youtubeUrl);
  const [activeIdx, setActiveIdx] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);

  const currentUrl = urls[activeIdx] || urls[0] || "";
  const videoMeta = formatVideoEmbed(currentUrl);
  const activePlatform = videoMeta.platform;

  // Reset video error and loading state on change
  useEffect(() => {
    setVideoError(false);
    setIsVideoLoading(true);
  }, [currentUrl]);

  if (!urls.length) return null;

  return (
    <div className="space-y-3">
      {/* Header bar with Platform & Part selector */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`text-xs font-bold flex items-center gap-1.5 ${
              isKitabTheme ? "text-[#3a2211]" : "text-slate-300"
            }`}
          >
            {activePlatform === "tiktok" ? (
              <span className="flex items-center gap-1 text-cyan-400 font-extrabold">
                <Music2 className="w-4 h-4 text-rose-400" />
                <span className="bg-gradient-to-r from-cyan-400 via-rose-400 to-amber-400 bg-clip-text text-transparent">
                  Video Pembelajaran TikTok:
                </span>
              </span>
            ) : (
              <>
                <Film className="w-4 h-4 text-red-500" />
                <span>
                  {urls.length > 1
                    ? `Video Pembelajaran (${urls.length} Bagian):`
                    : "Video Siaran Ulang Pembelajaran:"}
                </span>
              </>
            )}
          </span>

          {/* Part Selection Tabs (if multiple videos) */}
          {urls.length > 1 && (
            <div className="flex flex-wrap items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
              {urls.map((urlItem, i) => {
                const itemPlatform = detectVideoPlatform(urlItem);
                const isActive = activeIdx === i;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveIdx(i)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? itemPlatform === "tiktok"
                          ? "bg-gradient-to-r from-cyan-500 to-rose-500 text-white shadow-md shadow-rose-500/25 font-black"
                          : isKitabTheme
                          ? "bg-[#9e2a2b] text-white shadow-sm"
                          : "bg-red-600 text-white shadow-md shadow-red-600/30 font-black"
                        : isKitabTheme
                        ? "text-[#543516] hover:bg-[#f4ebd5]"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    {itemPlatform === "tiktok" ? (
                      <Music2 className="w-3 h-3 text-cyan-300" />
                    ) : (
                      <Play className="w-3 h-3" />
                    )}
                    <span>
                      Part {i + 1}
                      {itemPlatform === "tiktok" ? " (TikTok)" : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Link Eksternal */}
        <a
          href={currentUrl}
          target="_blank"
          rel="noreferrer"
          className={`text-[11px] font-bold flex items-center gap-1 hover:underline transition ${
            activePlatform === "tiktok"
              ? "text-rose-400 hover:text-rose-300"
              : isKitabTheme
              ? "text-[#9e2a2b]"
              : "text-sky-400 hover:text-sky-300"
          }`}
        >
          <span>
            {activePlatform === "tiktok"
              ? "Buka di Aplikasi TikTok"
              : `Buka di YouTube ${urls.length > 1 ? `(Part ${activeIdx + 1})` : ""}`}
          </span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Embedded Player or Lock Screen */}
      {isApproved ? (
        activePlatform === "tiktok" ? (
          /* TIKTOK DIRECT WEB STREAM PLAYER (BEBAS DISTRAKSI, BEBAS ERROR THIRD-PARTY COOKIE) */
          <div
            className={`w-full py-4 px-2 rounded-3xl border flex flex-col items-center justify-center transition ${
              isKitabTheme
                ? "bg-[#f5ebd7] border-[#d8c3a1]"
                : "bg-slate-950/80 border-slate-800/90 shadow-xl"
            }`}
          >
            <div className="w-full flex flex-col items-center gap-3">
              {/* Badge Fokus Belajar Bebas Distraksi */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-700/80 text-[10px] text-cyan-300 font-bold shadow-xs">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Pemutar Web Fokus Materi (Bebas Distraksi & Bebas Iklan)</span>
              </div>

              {/* Native HTML5 Video Player Container */}
              <div className="relative w-full max-w-[340px] sm:max-w-[360px] aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl bg-black border border-slate-800 ring-1 ring-rose-500/30 flex items-center justify-center">
                {!videoError ? (
                  <>
                    {isVideoLoading && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 z-10 gap-3 text-slate-300">
                        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
                        <span className="text-xs font-semibold text-slate-300">Menyiapkan video materi...</span>
                        <span className="text-[10px] text-slate-500">Bebas iklan & bebas rekomendasi distraksi</span>
                      </div>
                    )}
                    <video
                      key={currentUrl}
                      src={`/api/tiktok-stream?url=${encodeURIComponent(currentUrl)}`}
                      controls
                      playsInline
                      preload="metadata"
                      onLoadedData={() => setIsVideoLoading(false)}
                      onCanPlay={() => setIsVideoLoading(false)}
                      onError={() => {
                        setIsVideoLoading(false);
                        setVideoError(true);
                      }}
                      className="w-full h-full object-contain bg-black"
                    />
                  </>
                ) : (
                  /* Fallback jika video gagal streaming */
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3 bg-slate-950 text-slate-300">
                    <Music2 className="w-10 h-10 text-rose-500 animate-pulse" />
                    <p className="text-xs font-semibold">
                      Video TikTok sedang dalam perlindungan privasi. Anda bisa langsung memutarnya via aplikasi TikTok:
                    </p>
                    <a
                      href={currentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-rose-600 to-amber-600 text-white text-xs font-black shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1.5 hover:opacity-95 transition"
                    >
                      <span>Tonton Langsung di TikTok</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>

              {/* Bottom Option Bar */}
              <div className="w-full max-w-[340px] flex items-center justify-between text-[11px] pt-1">
                <span className="text-slate-500 text-[10px]">
                  💡 Putar, jeda, atur volume, dan layar penuh langsung di sini.
                </span>
                <a
                  href={currentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-rose-400 hover:text-rose-300 underline flex items-center gap-1 shrink-0 ml-2"
                >
                  <span>Buka App</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* YOUTUBE WIDESCREEN PLAYER (Rasio 16:9) */
          <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-md">
            {videoMeta.embedUrl ? (
              <iframe
                key={videoMeta.embedUrl}
                src={videoMeta.embedUrl}
                title={`${title} - Part ${activeIdx + 1}`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                Format link video tidak valid
              </div>
            )}
          </div>
        )
      ) : (
        /* KONDISI NON-MEMBER TERKUNCI */
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
            isKitabTheme
              ? "bg-[#f5ebd7] border-[#d8c3a1]"
              : "bg-slate-900 border-slate-800"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-amber-600" />
            <span
              className={`text-xs ${
                isKitabTheme ? "text-[#543516]" : "text-slate-300"
              }`}
            >
              Masuk sebagai member untuk menonton video pembelajaran ini.
            </span>
          </div>
          {onOpenAuthModal && (
            <button
              onClick={onOpenAuthModal}
              className="px-3 py-1.5 rounded-xl text-white text-xs font-bold bg-[#9e2a2b] hover:bg-[#852324] shrink-0 cursor-pointer"
            >
              Masuk Member
            </button>
          )}
        </div>
      )}
    </div>
  );
}
