"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { AppNavbar, AppSidebar } from "@/components/layout/AppNavbar";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Sparkles,
  Heart,
  ShieldCheck,
  Save,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Compass,
  Home,
  LogOut,
  RefreshCw,
  Sun,
  Moon,
  Feather
} from "lucide-react";
import {
  getSavedDeviceUser,
  savePermanentDeviceUser,
  clearPermanentDeviceUser,
  parseUserAccess,
  formatRoleLabel,
  syncDeviceUserApproval
} from "@/lib/authHelper";

const DAYS_IN_INDONESIAN = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu"
];

export default function MemberProfilePage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isKitabTheme, setIsKitabTheme] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [address, setAddress] = useState("");
  const [profession, setProfession] = useState("");
  const [intention, setIntention] = useState("");
  const [soulQuote, setSoulQuote] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState("");

  // Sync theme with localStorage
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("npt_theme");
      if (savedTheme === "kitab") setIsKitabTheme(true);
      else if (savedTheme === "dark") setIsKitabTheme(false);
    } catch (e) {}
  }, []);

  const toggleTheme = () => {
    const nextTheme = !isKitabTheme;
    setIsKitabTheme(nextTheme);
    try {
      localStorage.setItem("npt_theme", nextTheme ? "kitab" : "dark");
    } catch (e) {}
  };

  // Load user data on mount
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      const saved = getSavedDeviceUser();
      if (saved) {
        setCurrentUser(saved);
        setFullName(saved.name || saved.full_name || "");
        setEmail(saved.email || "");
        setPhoneNumber(saved.phone_number || "");

        // Load extended profile from device cache
        const cacheKey = `npt_profile_ext_${saved.email || saved.phone_number || saved.id || "guest"}`;
        try {
          const cachedExt = localStorage.getItem(cacheKey);
          if (cachedExt) {
            const parsed = JSON.parse(cachedExt);
            if (parsed.birthPlace) setBirthPlace(parsed.birthPlace);
            if (parsed.birthDate) setBirthDate(parsed.birthDate);
            if (parsed.birthDay) setBirthDay(parsed.birthDay);
            if (parsed.address) setAddress(parsed.address);
            if (parsed.profession) setProfession(parsed.profession);
            if (parsed.intention) setIntention(parsed.intention);
            if (parsed.soulQuote) setSoulQuote(parsed.soulQuote);
          }
        } catch (e) {}

        // Fetch from Supabase
        try {
          if (supabase) {
            let query = supabase.from("profiles").select("*");
            if (saved.id) {
              query = query.eq("id", saved.id);
            } else if (saved.email) {
              query = query.eq("email", saved.email.toLowerCase().trim());
            } else if (saved.phone_number) {
              query = query.eq("phone_number", saved.phone_number);
            }

            const { data: profiles } = await query;
            if (profiles && profiles.length > 0) {
              const p = profiles[0];
              setCurrentUser((prev) => ({ ...prev, ...p }));
              if (p.full_name) setFullName(p.full_name);
              if (p.email) setEmail(p.email);
              if (p.phone_number) setPhoneNumber(p.phone_number);
              if (p.birth_place) setBirthPlace(p.birth_place);
              if (p.birth_date) setBirthDate(p.birth_date);
              if (p.birth_day) setBirthDay(p.birth_day);
              if (p.address) setAddress(p.address);
              if (p.profession) setProfession(p.profession);
              if (p.intention) setIntention(p.intention);
              if (p.bio) setSoulQuote(p.bio);
            }
          }
        } catch (err) {
          console.warn("Supabase fetch profile warning:", err);
        }
      }
      setIsLoading(false);
    };

    loadProfile();
  }, []);

  // Otomatis hitung hari kelahiran saat tanggal lahir dipilih
  const handleDateChange = (dateString) => {
    setBirthDate(dateString);
    if (!dateString) return;
    try {
      const parts = dateString.split("-");
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        const dayName = DAYS_IN_INDONESIAN[d.getDay()];
        if (dayName && !birthDay) {
          setBirthDay(dayName);
        }
      }
    } catch (e) {}
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      alert("Nama lengkap mohon diisi.");
      return;
    }

    setIsSaving(true);
    setSaveSuccessMessage("");

    let formattedPhone = phoneNumber ? phoneNumber.replace(/[^0-9]/g, "") : "";
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "62" + formattedPhone.slice(1);
    }

    const updatedUserObj = {
      ...(currentUser || {}),
      name: fullName.trim(),
      full_name: fullName.trim(),
      email: email.trim().toLowerCase() || currentUser?.email,
      phone_number: formattedPhone || currentUser?.phone_number,
      birth_place: birthPlace.trim(),
      birth_date: birthDate,
      birth_day: birthDay.trim(),
      address: address.trim(),
      profession: profession.trim(),
      intention: intention.trim(),
      soulQuote: soulQuote.trim()
    };

    // 1. Simpan di perangkat (10 Tahun)
    savePermanentDeviceUser(updatedUserObj);
    setCurrentUser(updatedUserObj);

    const cacheKey = `npt_profile_ext_${updatedUserObj.email || updatedUserObj.phone_number || updatedUserObj.id || "guest"}`;
    try {
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          birthPlace: birthPlace.trim(),
          birthDate,
          birthDay: birthDay.trim(),
          address: address.trim(),
          profession: profession.trim(),
          intention: intention.trim(),
          soulQuote: soulQuote.trim()
        })
      );
    } catch (e) {}

    // 2. Simpan di Supabase jika terkoneksi
    try {
      if (supabase && (currentUser?.id || updatedUserObj.email)) {
        // Coba simpan kolom standar
        const updatePayload = {
          full_name: fullName.trim(),
          email: email.trim().toLowerCase() || null,
          phone_number: formattedPhone || null
        };

        // Tambahkan kolom opsional jika ada
        const optionalPayload = {
          ...updatePayload,
          birth_place: birthPlace.trim() || null,
          birth_date: birthDate || null,
          birth_day: birthDay.trim() || null,
          address: address.trim() || null,
          profession: profession.trim() || null,
          intention: intention.trim() || null,
          bio: soulQuote.trim() || null
        };

        let targetId = currentUser?.id;
        if (!targetId && updatedUserObj.email) {
          const { data } = await supabase.from("profiles").select("id").eq("email", updatedUserObj.email).limit(1);
          if (data && data[0]) targetId = data[0].id;
        }

        if (targetId) {
          // Pertama coba dengan payload lengkap
          const res = await supabase.from("profiles").update(optionalPayload).eq("id", targetId);
          if (res.error && res.error.code === "PGRST204") {
            // Jika kolom tambahan belum ada di skema SQL, update kolom standar saja
            await supabase.from("profiles").update(updatePayload).eq("id", targetId);
          }
        }
      }
    } catch (err) {
      console.warn("Info simpan Supabase:", err);
    }

    setIsSaving(false);
    setSaveSuccessMessage("Alhamdulillah, biodata & profil Anda berhasil disimpan! Rumah batin Anda kini telah diperbarui.");
    setTimeout(() => setSaveSuccessMessage(""), 5000);
  };

  const access = parseUserAccess(currentUser);

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors ${
        isKitabTheme ? "bg-parchment text-[#231409]" : "bg-slate-950 text-slate-100"
      }`}
    >
      <AppNavbar
        onToggleSidebar={() => setIsSidebarOpen(true)}
        currentUser={currentUser}
        activeTitle="Profil & Rumah Batin Sahabat"
      />
      <AppSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentUser={currentUser}
        activePath="/profile"
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-6 pb-24 space-y-6">
        {/* Top Breadcrumb & Switcher */}
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className={`inline-flex items-center gap-1.5 text-xs font-bold transition ${
              isKitabTheme ? "text-[#8f632d] hover:text-[#26150a]" : "text-slate-400 hover:text-white"
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Gerbang Depan</span>
          </Link>

          <button
            onClick={toggleTheme}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
              isKitabTheme
                ? "bg-[#fdfaf3] text-[#3a2211] border-[#cbb38b] hover:bg-[#ebdcc4] shadow-xs"
                : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
            }`}
            title={isKitabTheme ? "Beralih ke Mode Gelap Sanctuary" : "Beralih ke Mode Kitab Klasik"}
          >
            <span>{isKitabTheme ? "🌌 Mode Gelap" : "📜 Mode Kitab Klasik"}</span>
          </button>
        </div>

        {/* Hero Card: Rumah Pribadi Sahabat */}
        <div
          className={`p-6 sm:p-8 rounded-3xl border text-center space-y-3 relative overflow-hidden shadow-xl ${
            isKitabTheme
              ? "card-kitab-frame"
              : "bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-950 border-rose-500/30"
          }`}
        >
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
              isKitabTheme
                ? "bg-[#edd8b6] text-[#9e2a2b] border-[#cbb38b]"
                : "bg-rose-500/20 text-rose-300 border-rose-500/30"
            }`}
          >
            <Home className="w-3.5 h-3.5 text-amber-500" />
            <span>Rumah Batin & Biodata Sahabat</span>
          </div>

          <h1
            className={`text-2xl sm:text-3xl font-black tracking-tight ${
              isKitabTheme ? "font-kitab-title text-[#26150a]" : "text-white"
            }`}
          >
            Ruang Personal{" "}
            <span className={isKitabTheme ? "text-[#9e2a2b]" : "text-rose-500"}>
              {fullName || "Sahabat Pejalan Ruhani"}
            </span>
          </h1>

          <p
            className={`text-xs sm:text-sm max-w-xl mx-auto leading-relaxed ${
              isKitabTheme ? "text-[#634224]" : "text-slate-300"
            }`}
          >
            Rawat identitas, data kelahiran, dan niat belajar Anda di sini. Portal ini dirancang sebagai rumah kedua yang hangat, aman, dan menyertai perjalanan batin Anda bersama Sang Guru.
          </p>

          {/* Membership Badge Bar */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                isKitabTheme
                  ? "bg-[#edd8b6] text-[#634224] border-[#cbb38b]"
                  : "bg-slate-900 text-amber-300 border-amber-500/30"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              <span>{access.badgeText}</span>
            </span>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                isKitabTheme
                  ? "bg-[#dbeef0] text-[#1b6b55] border-[#b0d9d3]"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Perangkat Aktif Permanen (10 Tahun)</span>
            </span>
          </div>
        </div>

        {/* Notifikasi Simpan Sukses */}
        {saveSuccessMessage && (
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-in fade-in shadow-md">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{saveSuccessMessage}</span>
          </div>
        )}

        {/* FORM EDIT PROFILE */}
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* SEKSI 1: IDENTITAS UTAMA */}
          <div
            className={`p-6 rounded-3xl border space-y-4 shadow-sm ${
              isKitabTheme ? "card-kitab-frame bg-[#fbf7ee]" : "bg-slate-900/80 border-slate-800"
            }`}
          >
            <div className="flex items-center gap-2 border-b pb-3 border-slate-800/60">
              <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 text-sm">
                👤
              </span>
              <div>
                <h3 className={`text-sm font-bold ${isKitabTheme ? "font-kitab-title text-[#26150a]" : "text-white"}`}>
                  1. Identitas Utama Sahabat
                </h3>
                <p className={`text-[11px] ${isKitabTheme ? "text-[#82613d]" : "text-slate-400"}`}>
                  Data nama resmi dan kontak komunikasi dengan Guru/Admin.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className={`text-xs font-bold flex items-center gap-1.5 ${isKitabTheme ? "text-[#4a2e12]" : "text-slate-300"}`}>
                  <User className="w-3.5 h-3.5 text-rose-500" />
                  <span>Nama Lengkap *</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Nia Ramdaniati"
                  className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border outline-none transition-colors ${
                    isKitabTheme
                      ? "bg-[#fdfaf3] text-[#2c1810] border-[#cbb38b] focus:border-[#9e2a2b]"
                      : "bg-slate-950 text-white border-slate-800 focus:border-rose-500"
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className={`text-xs font-bold flex items-center gap-1.5 ${isKitabTheme ? "text-[#4a2e12]" : "text-slate-300"}`}>
                  <Mail className="w-3.5 h-3.5 text-sky-500" />
                  <span>Alamat Email (Akun Login)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@gmail.com"
                  className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border outline-none transition-colors ${
                    isKitabTheme
                      ? "bg-[#fdfaf3] text-[#2c1810] border-[#cbb38b] focus:border-[#9e2a2b]"
                      : "bg-slate-950 text-white border-slate-800 focus:border-rose-500"
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className={`text-xs font-bold flex items-center gap-1.5 ${isKitabTheme ? "text-[#4a2e12]" : "text-slate-300"}`}>
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Nomor WhatsApp / HP</span>
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="08123456789"
                  className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border outline-none transition-colors ${
                    isKitabTheme
                      ? "bg-[#fdfaf3] text-[#2c1810] border-[#cbb38b] focus:border-[#9e2a2b]"
                      : "bg-slate-950 text-white border-slate-800 focus:border-rose-500"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* SEKSI 2: KELAHIRAN & ASAL USUL (DATA LAHIR) */}
          <div
            className={`p-6 rounded-3xl border space-y-4 shadow-sm ${
              isKitabTheme ? "card-kitab-frame bg-[#fbf7ee]" : "bg-slate-900/80 border-slate-800"
            }`}
          >
            <div className="flex items-center gap-2 border-b pb-3 border-slate-800/60">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 text-sm">
                🌱
              </span>
              <div>
                <h3 className={`text-sm font-bold ${isKitabTheme ? "font-kitab-title text-[#26150a]" : "text-white"}`}>
                  2. Kelahiran & Asal Usul Jiwa
                </h3>
                <p className={`text-[11px] ${isKitabTheme ? "text-[#82613d]" : "text-slate-400"}`}>
                  Informasi tempat, tanggal, hari lahir (weton), dan tempat bernaung.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className={`text-xs font-bold flex items-center gap-1.5 ${isKitabTheme ? "text-[#4a2e12]" : "text-slate-300"}`}>
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>Tempat Lahir</span>
                </label>
                <input
                  type="text"
                  value={birthPlace}
                  onChange={(e) => setBirthPlace(e.target.value)}
                  placeholder="Contoh: Bandung / Cirebon"
                  className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border outline-none transition-colors ${
                    isKitabTheme
                      ? "bg-[#fdfaf3] text-[#2c1810] border-[#cbb38b] focus:border-[#9e2a2b]"
                      : "bg-slate-950 text-white border-slate-800 focus:border-rose-500"
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className={`text-xs font-bold flex items-center gap-1.5 ${isKitabTheme ? "text-[#4a2e12]" : "text-slate-300"}`}>
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  <span>Tanggal Lahir</span>
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border outline-none transition-colors ${
                    isKitabTheme
                      ? "bg-[#fdfaf3] text-[#2c1810] border-[#cbb38b] focus:border-[#9e2a2b]"
                      : "bg-slate-950 text-white border-slate-800 focus:border-rose-500"
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className={`text-xs font-bold flex items-center gap-1.5 ${isKitabTheme ? "text-[#4a2e12]" : "text-slate-300"}`}>
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Hari Lahir (Otomatis / Weton)</span>
                </label>
                <input
                  type="text"
                  value={birthDay}
                  onChange={(e) => setBirthDay(e.target.value)}
                  placeholder="Contoh: Senin / Senin Pahing"
                  className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border outline-none transition-colors ${
                    isKitabTheme
                      ? "bg-[#fdfaf3] text-[#2c1810] border-[#cbb38b] focus:border-[#9e2a2b]"
                      : "bg-slate-950 text-white border-slate-800 focus:border-rose-500"
                  }`}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className={`text-xs font-bold flex items-center gap-1.5 ${isKitabTheme ? "text-[#4a2e12]" : "text-slate-300"}`}>
                  <Home className="w-3.5 h-3.5 text-teal-400" />
                  <span>Alamat Domisili / Kota Tinggal Saat Ini</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Contoh: Jl. Sukajadi No. 12, Bandung, Jawa Barat"
                  className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border outline-none transition-colors ${
                    isKitabTheme
                      ? "bg-[#fdfaf3] text-[#2c1810] border-[#cbb38b] focus:border-[#9e2a2b]"
                      : "bg-slate-950 text-white border-slate-800 focus:border-rose-500"
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className={`text-xs font-bold flex items-center gap-1.5 ${isKitabTheme ? "text-[#4a2e12]" : "text-slate-300"}`}>
                  <Compass className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Aktivitas / Profesi Harian</span>
                </label>
                <input
                  type="text"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  placeholder="Contoh: Pengajar, Pengusaha, Praktisi"
                  className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border outline-none transition-colors ${
                    isKitabTheme
                      ? "bg-[#fdfaf3] text-[#2c1810] border-[#cbb38b] focus:border-[#9e2a2b]"
                      : "bg-slate-950 text-white border-slate-800 focus:border-rose-500"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* SEKSI 3: RUMAH BATIN & NIAT BELAJAR */}
          <div
            className={`p-6 rounded-3xl border space-y-4 shadow-sm ${
              isKitabTheme ? "card-kitab-frame bg-[#fbf7ee]" : "bg-slate-900/80 border-slate-800"
            }`}
          >
            <div className="flex items-center gap-2 border-b pb-3 border-slate-800/60">
              <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 text-sm">
                🤍
              </span>
              <div>
                <h3 className={`text-sm font-bold ${isKitabTheme ? "font-kitab-title text-[#26150a]" : "text-white"}`}>
                  3. Niat Batin & Moto Jiwa
                </h3>
                <p className={`text-[11px] ${isKitabTheme ? "text-[#82613d]" : "text-slate-400"}`}>
                  Tuliskan niat murni dan kalimat pengingat jiwa yang menjadi sauh perjalanan Anda.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className={`text-xs font-bold flex items-center gap-1.5 ${isKitabTheme ? "text-[#4a2e12]" : "text-slate-300"}`}>
                  <Feather className="w-3.5 h-3.5 text-amber-500" />
                  <span>Niat / Doa Pribadi dalam Mengikuti NPT & Hakikat Cinta</span>
                </label>
                <textarea
                  rows={3}
                  value={intention}
                  onChange={(e) => setIntention(e.target.value)}
                  placeholder="Tuliskan niat batin Anda... (Misal: Ingin membersihkan hambatan jiwa, mengenal Allah lebih dekat, dan menebar kasih sayang bagi keluarga dan sesama)."
                  className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border outline-none transition-colors leading-relaxed ${
                    isKitabTheme
                      ? "bg-[#fdfaf3] text-[#2c1810] border-[#cbb38b] focus:border-[#9e2a2b]"
                      : "bg-slate-950 text-white border-slate-800 focus:border-rose-500"
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className={`text-xs font-bold flex items-center gap-1.5 ${isKitabTheme ? "text-[#4a2e12]" : "text-slate-300"}`}>
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <span>Moto Jiwa / Kalimat Penenang Batin</span>
                </label>
                <input
                  type="text"
                  value={soulQuote}
                  onChange={(e) => setSoulQuote(e.target.value)}
                  placeholder="Contoh: 'Laa haula wa laa quwwata illa billah' / 'Tenang, pasrah, dan sadar.'"
                  className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border outline-none transition-colors ${
                    isKitabTheme
                      ? "bg-[#fdfaf3] text-[#2c1810] border-[#cbb38b] focus:border-[#9e2a2b]"
                      : "bg-slate-950 text-white border-slate-800 focus:border-rose-500"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* TOMBOL SIMPAN & AKSI KELUAR */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition cursor-pointer"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Menyimpan Biodata...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Biodata</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                if (confirm("Yakin ingin keluar dan menghapus sesi perangkat ini?")) {
                  clearPermanentDeviceUser();
                  window.location.href = "/";
                }
              }}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                isKitabTheme
                  ? "bg-[#eee3cb] text-[#9e2a2b] border-[#d8c3a1] hover:bg-[#dfcdab]"
                  : "bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border-slate-800"
              }`}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Ganti Akun / Keluar dari HP Ini</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
