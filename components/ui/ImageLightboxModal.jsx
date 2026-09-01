"use client";

import React, { useState, useEffect } from "react";
import { ZoomIn, ZoomOut, RotateCcw, X, Download } from "lucide-react";

export default function ImageLightboxModal({ isOpen, imageUrl, title, onClose }) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !imageUrl) return null;

  const handleZoomIn = (e) => {
    e?.stopPropagation();
    setScale((prev) => Math.min(prev + 0.3, 4));
  };

  const handleZoomOut = (e) => {
    e?.stopPropagation();
    setScale((prev) => {
      const next = Math.max(prev - 0.3, 0.5);
      if (next <= 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = (e) => {
    e?.stopPropagation();
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleWheel = (e) => {
    e.stopPropagation();
    if (e.deltaY < 0) {
      setScale((prev) => Math.min(prev + 0.15, 4));
    } else {
      setScale((prev) => {
        const next = Math.max(prev - 0.15, 0.5);
        if (next <= 1) setPosition({ x: 0, y: 0 });
        return next;
      });
    }
  };

  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-between p-4 select-none animate-in fade-in duration-200"
    >
      {/* Top Header Bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl flex items-center justify-between z-10 py-2 border-b border-slate-800/80 text-white"
      >
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-black uppercase">
            Preview Gambar
          </span>
          <h3 className="text-xs sm:text-sm font-bold text-slate-200 truncate max-w-xs sm:max-w-md">
            {title || "Gambar Materi"}
          </h3>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
          title="Tutup Preview (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Center Image Container with Interactive Zoom & Pan */}
      <div
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={(e) => e.stopPropagation()}
        className={`flex-1 w-full flex items-center justify-center overflow-hidden my-auto relative ${
          scale > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-zoom-in"
        }`}
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? "none" : "transform 0.15s ease-out",
          }}
          className="max-w-full max-h-[75vh] flex items-center justify-center"
        >
          <img
            src={imageUrl}
            alt={title || "Preview"}
            draggable={false}
            onClick={() => {
              if (scale === 1) setScale(1.8);
            }}
            className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-slate-800 pointer-events-auto"
          />
        </div>
      </div>

      {/* Floating Bottom Toolbar (Zoom Controls) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="z-10 px-4 py-2 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md flex items-center gap-3 text-slate-200"
      >
        <button
          onClick={handleZoomOut}
          disabled={scale <= 0.5}
          className="p-2 rounded-xl hover:bg-slate-800 disabled:opacity-30 transition cursor-pointer text-slate-300 hover:text-white"
          title="Perkecil (-)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <span className="text-xs font-mono font-bold text-amber-400 min-w-[50px] text-center">
          {Math.round(scale * 100)}%
        </span>

        <button
          onClick={handleZoomIn}
          disabled={scale >= 4}
          className="p-2 rounded-xl hover:bg-slate-800 disabled:opacity-30 transition cursor-pointer text-slate-300 hover:text-white"
          title="Perbesar (+)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-slate-800" />

        <button
          onClick={handleResetZoom}
          className="p-2 rounded-xl hover:bg-slate-800 transition cursor-pointer text-slate-300 hover:text-white text-xs flex items-center gap-1.5"
          title="Reset Ukuran Normal"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="text-[11px] font-semibold hidden sm:inline">Reset</span>
        </button>

        <a
          href={imageUrl}
          target="_blank"
          rel="noreferrer"
          download
          className="p-2 rounded-xl hover:bg-slate-800 transition cursor-pointer text-sky-400 hover:text-sky-300"
          title="Buka File Asli"
        >
          <Download className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
