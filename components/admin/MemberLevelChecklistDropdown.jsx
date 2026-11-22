"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  Check,
  CheckSquare,
  Square,
  X,
  Sparkles,
  ShieldCheck,
  Layers,
  Loader2
} from "lucide-react";
import {
  NPT_LEVEL_CONFIG,
  parseGrantedLevels,
  serializeLevelsToRole,
  formatRoleLabel
} from "@/lib/authHelper";

const ALL_LEVEL_KEYS = [
  { key: "npt_1", num: 1, name: "Level 1: Fondasi", desc: "Nafas & Relaksasi Dasar", icon: "🌬️" },
  { key: "npt_2", num: 2, name: "Level 2: Somatik", desc: "Olah Energi & Penyembuhan", icon: "⚡" },
  { key: "npt_3", num: 3, name: "Level 3: Transcendental", desc: "Power & Gelombang Otak", icon: "🔥" },
  { key: "npt_4", num: 4, name: "Level 4: Self Mastery", desc: "Spiritual Alignment", icon: "🧠" },
  { key: "npt_5", num: 5, name: "Level 5: 14 Akar", desc: "Higher State & 14 Akar", icon: "👁️" },
  { key: "npt_6", num: 6, name: "Level 6: Mastery", desc: "Pendalaman 14 Akar Lanjutan", icon: "🌿" },
  { key: "emt", num: null, name: "EMT Guru & FMD42", desc: "Pelatihan Emosi & Somatik", icon: "🎓" }
];

export default function MemberLevelChecklistDropdown({
  member,
  isKitabTheme = false,
  onRoleChange,
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const granted = parseGrantedLevels(member?.role);
  const activeKeys = new Set();
  granted.levels.forEach((lvl) => activeKeys.add(`npt_${lvl}`));
  if (granted.hasEmt) activeKeys.add("emt");

  // Summary Label on Pill Button
  const getSummaryLabel = () => {
    if (member?.role === "super_admin") return "👑 Super Admin";
    if (granted.isAll && granted.hasEmt) return "⭐ Semua Level + EMT";
    if (granted.isAll) return "⭐ Semua Level (1 - 6)";
    if (activeKeys.size === 0) return "⚠️ Belum Ada Level";

    if (granted.levels.length === 0 && granted.hasEmt) {
      return "🎓 EMT Guru";
    }

    if (granted.levels.length === 1 && !granted.hasEmt) {
      return `🏛️ Level ${granted.levels[0]}: ${NPT_LEVEL_CONFIG[granted.levels[0]]?.name?.split("&")[0] || ""}`;
    }

    const nptStr = granted.levels.length > 0 ? `Lvl ${granted.levels.join(", ")}` : "";
    const emtStr = granted.hasEmt ? "+ EMT" : "";
    return `🏛️ ${nptStr} ${emtStr}`.trim();
  };

  const handleToggleKey = async (keyToToggle) => {
    const nextKeys = new Set(activeKeys);
    if (nextKeys.has(keyToToggle)) {
      nextKeys.delete(keyToToggle);
    } else {
      nextKeys.add(keyToToggle);
    }

    const newRoleString = serializeLevelsToRole(Array.from(nextKeys));
    setIsSaving(true);
    try {
      await onRoleChange(member.id, member.full_name, newRoleString);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectAllNpt = async () => {
    const nextKeys = new Set(activeKeys);
    [1, 2, 3, 4, 5, 6].forEach((lvl) => nextKeys.add(`npt_${lvl}`));
    const newRoleString = serializeLevelsToRole(Array.from(nextKeys));
    setIsSaving(true);
    try {
      await onRoleChange(member.id, member.full_name, newRoleString);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1500);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearAll = async () => {
    const newRoleString = "npt_1"; // minimal level 1
    setIsSaving(true);
    try {
      await onRoleChange(member.id, member.full_name, newRoleString);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1500);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* TRIGGER BUTTON (CHIP / PILL) */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`px-3 py-1.5 rounded-xl text-[11px] font-black border transition-all flex items-center gap-1.5 shadow-xs cursor-pointer select-none ${
          isKitabTheme
            ? granted.isAll
              ? "bg-[#edd8b6] text-[#9e2a2b] border-[#cbb38b] hover:bg-[#e4cb9f]"
              : "bg-[#fdfaf3] text-[#3a2211] border-[#cbb38b] hover:bg-[#f4ebd5]"
            : granted.isAll
            ? "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
            : granted.levels.length > 1
            ? "bg-sky-950/70 text-sky-300 border-sky-500/40 hover:bg-sky-900/60"
            : "bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-600 hover:bg-slate-750"
        }`}
        title="Klik untuk membuka Checklist Pilihan Level"
      >
        <span className="truncate max-w-[200px] sm:max-w-[240px]">
          {getSummaryLabel()}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 opacity-70 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* FLOATING CHECKLIST BOX POPOVER */}
      {isOpen && (
        <div
          className={`absolute left-0 top-full mt-1.5 z-50 w-72 sm:w-80 rounded-2xl border shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-150 ${
            isKitabTheme
              ? "bg-[#faf3e3] border-[#d8c3a1] text-[#26150a]"
              : "bg-slate-900 border-slate-700 text-slate-100 shadow-black/80"
          }`}
        >
          {/* Header Popover */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700/60">
            <div>
              <h4 className="text-xs font-black truncate max-w-[200px]">
                {member.full_name || "Member"}
              </h4>
              <p
                className={`text-[10px] ${
                  isKitabTheme ? "text-[#8f632d]" : "text-slate-400"
                }`}
              >
                Pilih checklist level yang berhak diakses:
              </p>
            </div>
            <div className="flex items-center gap-1">
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
              ) : justSaved ? (
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                  ✓ Tersimpan
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                title="Tutup"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Buttons: Pilih Semua / Reset */}
          <div className="flex items-center gap-1.5 mb-2.5">
            <button
              type="button"
              onClick={handleSelectAllNpt}
              className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition ${
                isKitabTheme
                  ? "bg-[#ebdcc4] text-[#3a2211] border-[#cbb38b] hover:bg-[#dfcdab]"
                  : "bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700 hover:text-white"
              }`}
            >
              ✓ Centang Semua (1-6)
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                isKitabTheme
                  ? "bg-[#ebdcc4] text-[#9e2a2b] border-[#cbb38b] hover:bg-[#dfcdab]"
                  : "bg-slate-800 hover:bg-slate-750 text-rose-400 border-slate-700"
              }`}
            >
              Reset (Lvl 1)
            </button>
          </div>

          {/* CHECKLIST ITEMS */}
          <div className="space-y-1 max-h-64 overflow-y-auto scrollbar-none pr-0.5">
            {ALL_LEVEL_KEYS.map((item) => {
              const isChecked = activeKeys.has(item.key);
              return (
                <div
                  key={item.key}
                  onClick={() => handleToggleKey(item.key)}
                  className={`p-2 rounded-xl border transition cursor-pointer flex items-center justify-between gap-2 select-none ${
                    isChecked
                      ? isKitabTheme
                        ? "bg-[#f5ebd7] border-[#8f632d] shadow-xs"
                        : "bg-gradient-to-r from-rose-950/40 to-slate-850 border-rose-500/50 shadow-xs"
                      : isKitabTheme
                      ? "hover:bg-[#f2e7d0]/60 border-transparent text-[#634224]"
                      : "hover:bg-slate-800/60 border-transparent text-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Custom Checkbox Box */}
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition ${
                        isChecked
                          ? isKitabTheme
                            ? "bg-[#9e2a2b] border-[#9e2a2b] text-white"
                            : "bg-rose-600 border-rose-500 text-white"
                          : isKitabTheme
                          ? "border-[#cbb38b] bg-[#fdfaf3]"
                          : "border-slate-700 bg-slate-950"
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">{item.icon}</span>
                        <span
                          className={`text-xs font-bold leading-tight ${
                            isChecked
                              ? isKitabTheme
                                ? "text-[#26150a]"
                                : "text-white"
                              : ""
                          }`}
                        >
                          {item.name}
                        </span>
                      </div>
                      <p
                        className={`text-[10px] truncate ${
                          isKitabTheme ? "text-[#8f632d]" : "text-slate-400"
                        }`}
                      >
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  {isChecked && (
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider shrink-0 ${
                        isKitabTheme
                          ? "bg-[#ebdcc4] text-[#9e2a2b]"
                          : "bg-rose-500/20 text-rose-300"
                      }`}
                    >
                      Aktif
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer Guidance */}
          <div className="pt-2 mt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px]">
            <span
              className={isKitabTheme ? "text-[#8f632d]" : "text-slate-400"}
            >
              💡 Perubahan tersimpan otomatis.
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="font-bold text-sky-400 hover:underline cursor-pointer"
            >
              Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
