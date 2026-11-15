"use client";

import React, { useState } from "react";
import { Film, ExternalLink, Lock } from "lucide-react";
import { parseYouTubeUrls, formatYouTubeEmbedUrl } from "@/lib/utils/materialImages";

export default function MaterialVideoPlayer({
  youtubeUrl,
  title = "Video Pembelajaran",
  isKitabTheme = false,
  isApproved = true,
  onOpenAuthModal = null,
}) {
  const urls = parseYouTubeUrls(youtubeUrl);
  const [activeIdx, setActiveIdx] = useState(0);

  if (!urls.length) return null;
  const currentUrl = urls[activeIdx] || urls[0];
  const embedUrl = formatYouTubeEmbedUrl(currentUrl);

  return (
    <div className="space-y-2.5">
      {/* Header bar with Part selector */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`text-xs font-bold flex items-center gap-1.5 ${
              isKitabTheme ? "text-[#3a2211]" : "text-slate-300"
            }`}
          >
            <Film className="w-4 h-4 text-red-500" />
            <span>
              {urls.length > 1
                ? `Video Pembelajaran (${urls.length} Bagian):`
                : "Video Siaran Ulang YouTube:"}
            </span>
          </span>

          {/* Part Selection Tabs (if multiple videos) */}
          {urls.length > 1 && (
            <div className="flex items-center gap-1 bg-slate-950/60 p-0.5 rounded-xl border border-slate-800">
              {urls.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveIdx(i)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer flex items-center gap-1 ${
                    activeIdx === i
                      ? isKitabTheme
                        ? "bg-[#9e2a2b] text-white shadow-sm"
                        : "bg-red-600 text-white shadow-md shadow-red-600/30 font-black"
                      : isKitabTheme
                      ? "text-[#543516] hover:bg-[#f4ebd5]"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <span>Part {i + 1}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <a
          href={currentUrl}
          target="_blank"
          rel="noreferrer"
          className={`text-[11px] font-bold flex items-center gap-1 hover:underline ${
            isKitabTheme ? "text-[#9e2a2b]" : "text-sky-400"
          }`}
        >
          <span>
            Buka di YouTube {urls.length > 1 ? `(Part ${activeIdx + 1})` : ""}
          </span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Embedded Player or Lock Screen */}
      {isApproved ? (
        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-md">
          {embedUrl ? (
            <iframe
              key={embedUrl}
              src={embedUrl}
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
      ) : (
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
              Masuk sebagai member untuk menonton video siaran ulang ini.
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
