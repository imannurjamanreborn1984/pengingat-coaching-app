"use client";

import React, { useState, useMemo } from "react";
import {
  Eye,
  CheckCircle2,
  Clock,
  Users,
  Search,
  MessageCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  Crown,
  ShieldCheck,
  Phone,
  Mail,
  UserX,
  ExternalLink
} from "lucide-react";
import { formatTimeAgo } from "@/lib/utils/materialTracker";

export default function MaterialViewerTracker({
  material,
  levelNum = 1,
  isSuperAdmin = false,
  viewsList = [],
  enrolledMembers = [],
  isKitabTheme = false,
  onRefresh = null,
  renderMode = "card" // 'badge' | 'card'
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("read"); // 'read' | 'unread'
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedUnread, setCopiedUnread] = useState(false);

  // Jika bukan Super Admin, jangan render apapun
  if (!isSuperAdmin) return null;

  // Olah data pembaca unik
  const { readMembers, unreadMembers, totalViews } = useMemo(() => {
    const viewersMap = new Map();

    (viewsList || []).forEach((v) => {
      const emailKey = (v.user_email || "").toLowerCase().trim();
      const phoneKey = (v.user_phone || "").replace(/[^0-9]/g, "");
      const nameKey = (v.user_name || "").toLowerCase().trim();
      
      const key = emailKey || phoneKey || nameKey;
      if (!key) return;

      if (!viewersMap.has(key)) {
        viewersMap.set(key, {
          user_name: v.user_name,
          user_email: v.user_email,
          user_phone: v.user_phone,
          firstOpened: v.opened_at,
          lastOpened: v.opened_at,
          openCount: 1,
        });
      } else {
        const existing = viewersMap.get(key);
        existing.openCount += 1;
        if (new Date(v.opened_at) > new Date(existing.lastOpened)) {
          existing.lastOpened = v.opened_at;
        }
        if (new Date(v.opened_at) < new Date(existing.firstOpened)) {
          existing.firstOpened = v.opened_at;
        }
      }
    });

    const read = Array.from(viewersMap.values()).sort(
      (a, b) => new Date(b.lastOpened) - new Date(a.lastOpened)
    );

    // Filter siapa yang belum membaca dari member terdaftar di level ini
    const unread = (enrolledMembers || []).filter((m) => {
      const email = (m.email || "").toLowerCase().trim();
      const phone = (m.phone_number || "").replace(/[^0-9]/g, "");
      const name = (m.full_name || "").toLowerCase().trim();

      const isRead =
        (email && viewersMap.has(email)) ||
        (phone && viewersMap.has(phone)) ||
        (name && viewersMap.has(name));

      return !isRead;
    });

    return {
      readMembers: read,
      unreadMembers: unread,
      totalViews: viewsList.length,
    };
  }, [viewsList, enrolledMembers]);

  // Salin daftar yang belum membaca ke clipboard
  const handleCopyUnread = () => {
    if (unreadMembers.length === 0) return;
    const lines = unreadMembers.map(
      (m, i) => `${i + 1}. ${m.full_name} (${m.phone_number || m.email || "-"})`
    );
    const text = `📋 DAFTAR PESERTA NPT LEVEL ${levelNum} YANG BELUM MEMBUKA MATERI:
"${material?.title || "Materi NPT"}"
Total: ${unreadMembers.length} Peserta

${lines.join("\n")}`;

    navigator.clipboard.writeText(text);
    setCopiedUnread(true);
    setTimeout(() => setCopiedUnread(false), 2500);
  };

  // Filter pencarian
  const filteredRead = readMembers.filter((m) => {
    const q = searchQuery.toLowerCase();
    return (
      m.user_name?.toLowerCase().includes(q) ||
      m.user_email?.toLowerCase().includes(q) ||
      m.user_phone?.includes(q)
    );
  });

  const filteredUnread = unreadMembers.filter((m) => {
    const q = searchQuery.toLowerCase();
    return (
      m.full_name?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.phone_number?.includes(q)
    );
  });

  // Tampilan 1: Badge Mini (misal untuk diletakkan di header bar dekat MODUL)
  if (renderMode === "badge") {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsModalOpen(true);
        }}
        title="Klik untuk melihat siapa saja yang telah membuka materi ini"
        className={`px-2 py-0.5 rounded-md text-[10px] font-black flex items-center gap-1 transition cursor-pointer shadow-xs ${
          isKitabTheme
            ? "bg-[#3a2211] text-amber-300 hover:bg-[#25150a] border border-[#8f632d]"
            : "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40"
        }`}
      >
        <Eye className="w-3 h-3 text-amber-400" />
        <span>{readMembers.length} Pembaca</span>
      </button>
    );
  }

  // Tampilan 2: Card Section Lengkap di Dalam Kartu Materi
  return (
    <>
      <div
        className={`p-3.5 sm:p-4 rounded-2xl border transition ${
          isKitabTheme
            ? "bg-[#f5ead5]/90 border-[#cbb38d]"
            : "bg-amber-950/20 border-amber-500/30 ring-1 ring-amber-500/20"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                isKitabTheme
                  ? "bg-[#3a2211] text-amber-300"
                  : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
              }`}
            >
              <Eye className="w-4 h-4" />
            </div>

            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className={`text-xs font-black flex items-center gap-1 ${
                    isKitabTheme ? "text-[#3a2211]" : "text-amber-300"
                  }`}
                >
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Pantauan Pembaca Materi (Khusus Guru & Admin)</span>
                </span>
                <span className="px-1.5 py-0.2 rounded-md text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Rahasia Admin
                </span>
              </div>
              <p
                className={`text-[11px] ${
                  isKitabTheme ? "text-[#6b4823]" : "text-slate-400"
                }`}
              >
                {readMembers.length} dari {enrolledMembers.length || readMembers.length} sahabat se-level telah membuka materi ini ({totalViews}x total akses).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-sm ${
              isKitabTheme
                ? "bg-[#3a2211] text-amber-200 hover:bg-[#25150a]"
                : "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Lihat Daftar Pembaca</span>
          </button>
        </div>

        {/* Quick Preview Chips (Avatar Pembaca Terbaru) */}
        {readMembers.length > 0 && (
          <div className="pt-3 flex flex-wrap items-center gap-1.5 border-t border-amber-500/20 mt-3">
            <span className="text-[10px] font-bold text-slate-400">Terbuka oleh:</span>
            {readMembers.slice(0, 6).map((r, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-900/80 text-slate-200 border border-slate-700/60 flex items-center gap-1"
              >
                <span>{r.user_name}</span>
                <span className="text-slate-500 text-[9px]">
                  ({formatTimeAgo(r.lastOpened)})
                </span>
              </span>
            ))}
            {readMembers.length > 6 && (
              <span className="text-[10px] font-bold text-amber-400 cursor-pointer" onClick={() => setIsModalOpen(true)}>
                +{readMembers.length - 6} lainnya...
              </span>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL DETAIL: DAFTAR LENGKAP SUDAH BACA & BELUM BUKA                     */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 text-left max-h-[90vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Eye className="w-4 h-4" />
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    Data Akses & Pembaca Materi
                  </h3>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Khusus Guru / Admin
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-1">
                  Materi: <span className="text-amber-300 font-bold">{material?.title}</span> (NPT Level {levelNum})
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Statistik Ringkas */}
            <div className="grid grid-cols-3 gap-2 py-1">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block font-semibold">Sudah Membuka</span>
                <span className="text-base sm:text-lg font-black text-emerald-400">
                  {readMembers.length} Orang
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block font-semibold">Belum Membuka</span>
                <span className="text-base sm:text-lg font-black text-rose-400">
                  {unreadMembers.length} Orang
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block font-semibold">Total Akses</span>
                <span className="text-base sm:text-lg font-black text-cyan-400">
                  {totalViews} Kali
                </span>
              </div>
            </div>

            {/* Tab Selector & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab("read")}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "read"
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Sudah Membuka ({readMembers.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("unread")}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "unread"
                      ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>Belum Membuka ({unreadMembers.length})</span>
                </button>
              </div>

              {/* Input Pencarian */}
              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama sahabat..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 outline-hidden focus:border-amber-500/50"
                />
              </div>
            </div>

            {/* Action Bar Khusus Tab Belum Membuka */}
            {activeTab === "unread" && unreadMembers.length > 0 && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-950/30 border border-rose-800/40 text-xs">
                <span className="text-[11px] text-rose-300">
                  💡 Guru/Admin dapat menyalin nama atau mengingatkan sahabat yang belum sempat membaca.
                </span>
                <button
                  type="button"
                  onClick={handleCopyUnread}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold flex items-center gap-1 transition cursor-pointer shrink-0 ml-2"
                >
                  {copiedUnread ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedUnread ? "Tersalin!" : "Salin Daftar"}</span>
                </button>
              </div>
            )}

            {/* List Konten (Scrollable) */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px]">
              {activeTab === "read" ? (
                filteredRead.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 space-y-1">
                    <p className="text-xs">Belum ada catatan pembaca untuk pencarian ini.</p>
                  </div>
                ) : (
                  filteredRead.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-xs flex items-center justify-center shrink-0">
                          {(item.user_name || "M").charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-xs text-white block truncate">
                            {item.user_name}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {item.user_phone || item.user_email || "Member NPT"}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 block">
                          Terbuka {item.openCount}x
                        </span>
                        <span className="text-[10px] text-slate-500 block pt-0.5">
                          {formatTimeAgo(item.lastOpened)}
                        </span>
                      </div>
                    </div>
                  ))
                )
              ) : (
                filteredUnread.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-1">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                    <p className="text-xs font-bold text-white">Alhamdulillah!</p>
                    <p className="text-[11px] text-slate-400">
                      Seluruh sahabat yang terdaftar di Level {levelNum} telah membuka materi ini.
                    </p>
                  </div>
                ) : (
                  filteredUnread.map((item, idx) => {
                    const waPhone = item.phone_number ? item.phone_number.replace(/[^0-9]/g, "") : "";
                    const waText = encodeURIComponent(
                      `Assalamu'alaikum wr. wb. Saudaraku ${item.full_name}, materi "${material?.title || "Materi NPT"}" di NPT Level ${levelNum} sudah tersedia di web. Mari sempatkan untuk membuka & menyimak ya: https://nptcentre.id/npt/${levelNum}`
                    );

                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-300 font-black text-xs flex items-center justify-center shrink-0">
                            {(item.full_name || "M").charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-xs text-white block truncate">
                              {item.full_name}
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {item.phone_number ? `+${item.phone_number}` : item.email || "Member NPT"}
                            </span>
                          </div>
                        </div>

                        {waPhone && (
                          <a
                            href={`https://wa.me/${waPhone}?text=${waText}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-600/80 hover:bg-emerald-600 text-white flex items-center gap-1 transition shrink-0"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>Ingatkan via WA</span>
                          </a>
                        )}
                      </div>
                    );
                  })
                )
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span className="text-[10px]">
                💡 Catatan dibuka otomatis terbarui saat peserta membuka atau membaca modul ini.
              </span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
