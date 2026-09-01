"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Users, BookOpen, Crown, ArrowLeft } from "lucide-react";

export default function AdminHeaderTabs({ activeTab }) {
  const tabs = [
    {
      id: "members",
      label: "Persetujuan Anggota",
      href: "/admin/members",
      icon: ShieldCheck,
      color: "text-amber-400"
    },
    {
      id: "submissions",
      label: "Periksa Jawaban & Evaluasi",
      href: "/admin/submissions",
      icon: Users,
      color: "text-sky-400"
    },
    {
      id: "materials",
      label: "Upload Materi NPT (1 – 6)",
      href: "/admin/materials",
      icon: BookOpen,
      color: "text-rose-400"
    },
    {
      id: "dashboard",
      label: "Broadcast & Monitoring WA",
      href: "/admin/dashboard",
      icon: Crown,
      color: "text-amber-500"
    }
  ];

  return (
    <div className="w-full space-y-3">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Gerbang Depan</span>
        </Link>
        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-black uppercase tracking-wider">
          👑 Panel Super Admin
        </span>
      </div>

      {/* 4 Admin Quick Switch Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
                isActive
                  ? "bg-slate-900 text-white border-amber-500/60 shadow-lg shadow-amber-950/40 ring-1 ring-amber-500/50"
                  : "bg-slate-950/60 hover:bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? tab.color : "text-slate-500"}`} />
              <span>{tab.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
