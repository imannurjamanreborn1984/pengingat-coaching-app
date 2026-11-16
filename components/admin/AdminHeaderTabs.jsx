"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Users, BookOpen, Crown, ArrowLeft, GraduationCap } from "lucide-react";

export default function AdminHeaderTabs({ activeTab, isKitabTheme = false, onToggleTheme }) {
  const tabs = [
    {
      id: "emt",
      label: "Ruang Kontrol & Evaluasi EMT",
      href: "/admin/emt",
      icon: GraduationCap,
      color: isKitabTheme ? "text-[#9e2a2b]" : "text-emerald-400"
    },
    {
      id: "members",
      label: "Persetujuan Anggota NPT",
      href: "/admin/members",
      icon: ShieldCheck,
      color: isKitabTheme ? "text-[#9e2a2b]" : "text-amber-400"
    },
    {
      id: "submissions",
      label: "Periksa Jawaban & Evaluasi",
      href: "/admin/submissions",
      icon: Users,
      color: isKitabTheme ? "text-[#8f632d]" : "text-sky-400"
    },
    {
      id: "materials",
      label: "Upload Materi NPT (1 – 6)",
      href: "/admin/materials",
      icon: BookOpen,
      color: isKitabTheme ? "text-[#9e2a2b]" : "text-rose-400"
    },
    {
      id: "dashboard",
      label: "Broadcast & Monitoring WA",
      href: "/admin/dashboard",
      icon: Crown,
      color: isKitabTheme ? "text-[#b38b42]" : "text-amber-500"
    }
  ];

  return (
    <div className="w-full space-y-3.5">
      {/* Top Breadcrumb & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/"
            className={`inline-flex items-center gap-1.5 font-bold transition ${
              isKitabTheme ? "text-[#634224] hover:text-[#9e2a2b]" : "text-slate-400 hover:text-white"
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Portal NPT</span>
          </Link>
          <span className="text-slate-600">/</span>
          <span className={`font-semibold ${isKitabTheme ? "text-[#8f632d]" : "text-slate-300"}`}>
            Studio Admin
          </span>
          <span className="text-slate-600">/</span>
          <span className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
            isKitabTheme 
              ? "bg-[#3a2211] text-amber-300" 
              : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
          }`}>
            {tabs.find((t) => t.id === activeTab)?.label || "Manajemen"}
          </span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                isKitabTheme
                  ? "bg-[#fdfaf3] text-[#3a2211] border-[#cbb38b] hover:bg-[#ebdcc4]"
                  : "bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white"
              }`}
              title="Ganti Mode Tampilan"
            >
              <span>{isKitabTheme ? "🌌 Dark Mode" : "📜 Kitab Klasik"}</span>
            </button>
          )}

          <div className={`px-2.5 py-1 rounded-xl text-[10px] font-black tracking-wide border flex items-center gap-1.5 shadow-xs ${
            isKitabTheme
              ? "bg-[#edd8b6] text-[#9e2a2b] border-[#cbb38b]"
              : "bg-amber-500/10 text-amber-300 border-amber-500/30"
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>SUPER ADMIN</span>
          </div>
        </div>
      </div>

      {/* 5 Admin Quick Switch Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
                isActive
                  ? isKitabTheme
                    ? "bg-[#3a2211] text-[#fbf6ec] border-[#8f632d] shadow-md ring-1 ring-[#b38b42]/60"
                    : "bg-slate-900 text-white border-amber-500/60 shadow-lg shadow-amber-950/40 ring-1 ring-amber-500/50"
                  : isKitabTheme
                  ? "bg-[#eee3cb] text-[#543516] border-[#d8c3a1] hover:bg-[#dfcdab]"
                  : "bg-slate-950/60 hover:bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? (isKitabTheme ? "text-amber-400" : tab.color) : (isKitabTheme ? "text-[#8f632d]" : "text-slate-500")}`} />
              <span>{tab.label}</span>
              {isActive && (
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isKitabTheme ? "bg-amber-400" : "bg-amber-400"}`} />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
