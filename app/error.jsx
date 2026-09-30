"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    console.error("NPT Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#fbf7ee] text-[#2c1810]">
      <div className="max-w-md w-full p-8 rounded-3xl border border-[#dfcfb0] bg-white shadow-xl text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-[#26150a]">
            Halaman Sedang Mengalami Kendala
          </h2>
          <p className="text-xs text-[#634224] leading-relaxed">
            Terjadi sedikit gangguan saat memuat data halaman ini. Silakan coba muat ulang atau kembali ke halaman utama.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#9e2a2b] hover:bg-[#852324] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Muat Ulang Halaman</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#eee3cb] hover:bg-[#dfcdab] text-[#3a2211] text-xs font-bold transition flex items-center justify-center gap-2 border border-[#cbb38b]"
          >
            <Home className="w-4 h-4" />
            <span>Gerbang Awal</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
