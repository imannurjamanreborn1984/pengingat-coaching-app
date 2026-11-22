"use client";

import React, { useState, useEffect } from "react";
import { Film, ExternalLink, Lock, Music2, Loader2, Play } from "lucide-react";
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
  const [resolvedShortlinks, setResolvedShortlinks] = useState({});
  const [isLoadingShortlink, setIsLoadingShortlink] = useState(false);

  const currentUrl = urls[activeIdx] || urls[0] || "";
  const videoMeta = formatVideoEmbed(currentUrl);
  const activePlatform = videoMeta.platform;

  // Resolve TikTok shortlink (vt.tiktok.com or /t/) via API if needed
  useEffect(() => {
    if (!currentUrl) return;
    const isTikTokShort =
      videoMeta.platform === "tiktok" &&
      !videoMeta.embedUrl &&
      (currentUrl.includes("vt.tiktok.com") || currentUrl.includes("/t/"));

    if (isTikTokShort && !resolvedShortlinks[currentUrl]) {
      setIsLoadingShortlink(true);
      fetch(`/api/tiktok-resolve?url=${encodeURIComponent(currentUrl)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.embedUrl) {
            setResolvedShortlinks((prev) => ({
              ...prev,
              [currentUrl]: data.embedUrl,
            }));
          }
        })
        .catch(() => {})
        .finally(() => setIsLoadingShortlink(false));
    }
  }, [currentUrl, videoMeta]);

  if (!urls.length) return null;

  const effectiveEmbedUrl =
    videoMeta.embedUrl || resolvedShortlinks[currentUrl] || null;

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
                <Music2 className="w-4 h-4 text-rose-400 animate-pulse" />
                <span className="bg-gradient-to-r from-cyan-400 to-rose-400 bg-clip-text text-transparent">
                  Video TikTok Materi:
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
              ? "Buka Langsung di TikTok"
              : `Buka di YouTube ${urls.length > 1 ? `(Part ${activeIdx + 1})` : ""}`}
          </span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Embedded Player or Lock Screen */}
      {isApproved ? (
        activePlatform === "tiktok" ? (
          /* TIKTOK PORTRAIT PLAYER (Rasio Vertikal 9:16) */
          <div
            className={`w-full py-4 px-2 rounded-2xl border flex flex-col items-center justify-center transition ${
              isKitabTheme
                ? "bg-[#f5ebd7] border-[#d8c3a1]"
                : "bg-slate-950/70 border-slate-800"
            }`}
          >
            {isLoadingShortlink ? (
              <div className="w-[325px] h-[578px] rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="w-7 h-7 animate-spin text-rose-500" />
                <span className="text-xs font-medium">Menghubungkan ke TikTok...</span>
              </div>
            ) : effectiveEmbedUrl ? (
              <div className="relative w-full max-w-[335px] sm:max-w-[350px] h-[585px] sm:h-[620px] rounded-2xl overflow-hidden shadow-2xl bg-black border border-slate-800 ring-1 ring-rose-500/20">
                <iframe
                  key={effectiveEmbedUrl}
                  src={effectiveEmbedUrl}
                  title={`${title} - TikTok Video (Part ${activeIdx + 1})`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="w-full max-w-[340px] p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
                <Music2 className="w-8 h-8 text-rose-500 mx-auto" />
                <p className="text-xs text-slate-300">
                  Video TikTok dapat langsung ditonton di aplikasi atau web TikTok:
                </p>
                <a
                  href={currentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-rose-600 text-white text-xs font-bold shadow-md hover:opacity-90 transition"
                >
                  <span>Buka Video di TikTok</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            <p
              className={`text-[10px] mt-2 flex items-center gap-1 ${
                isKitabTheme ? "text-[#8f632d]" : "text-slate-500"
              }`}
            >
              <span>💡 Video vertikal resmi TikTok disematkan langsung untuk materi ini.</span>
            </p>
          </div>
        ) : (
          /* YOUTUBE WIDESCREEN PLAYER (Rasio 16:9) */
          <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-md">
            {effectiveEmbedUrl ? (
              <iframe
                key={effectiveEmbedUrl}
                src={effectiveEmbedUrl}
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
