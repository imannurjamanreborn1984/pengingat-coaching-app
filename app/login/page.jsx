"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  User,
  Mail,
  Phone,
  Lock,
  Crown,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  UserCheck,
  UserPlus,
  Compass
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import {
  SUPER_ADMIN_EMAILS,
  getSavedDeviceUser,
  savePermanentDeviceUser,
  syncDeviceUserApproval
} from "@/lib/authHelper";

export default function LoginPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("login"); // 'login' | 'register'

  // Form Fields
  const [inputName, setInputName] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  const [inputPhone, setInputPhone] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("npt");
  const [selectedLevel, setSelectedLevel] = useState(5);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const saved = getSavedDeviceUser();
    if (saved) {
      setCurrentUser(saved);
      syncDeviceUserApproval(supabase, saved).then((synced) => {
        if (synced) setCurrentUser(synced);
      });
    }
  }, []);

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    const cleanEmail = inputEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setStatusMessage({ type: "error", text: "Silakan masukkan alamat email yang valid!" });
      return;
    }

    const cleanName = inputName.trim() || cleanEmail.split("@")[0];
    const isAdmin = SUPER_ADMIN_EMAILS.includes(cleanEmail);

    setIsSubmitting(true);
    setStatusMessage({ type: "", text: "" });

    // A. Jika Super Admin (Kang Iman, Ibu Novi, dkk)
    if (isAdmin) {
      const userData = {
        email: cleanEmail,
        name: cleanName || "Admin Utama",
        role: "super_admin",
        status: "approved",
        loggedInAt: new Date().toISOString()
      };
      setCurrentUser(userData);
      savePermanentDeviceUser(userData);
      setStatusMessage({
        type: "success",
        text: "👑 Akses Super Admin & Ruang Privat Aktif! Mengalihkan..."
      });
      setTimeout(() => {
        router.push("/");
      }, 800);
      return;
    }

    // B. Cek Database Supabase untuk Member Terdaftar
    try {
      let query = supabase.from("profiles").select("*").eq("email", cleanEmail);
      const { data: existingProfiles, error } = await query;
      if (error) throw error;

      const existingProfile = existingProfiles && existingProfiles.length > 0 ? existingProfiles[0] : null;

      if (existingProfile) {
        const userData = {
          id: existingProfile.id,
          email: cleanEmail,
          phone_number: existingProfile.phone_number || null,
          name: existingProfile.full_name || cleanName,
          role: existingProfile.role || "member",
          status: existingProfile.status || "approved"
        };
        setCurrentUser(userData);
        savePermanentDeviceUser(userData);

        if (existingProfile.status === "approved") {
          setStatusMessage({
            type: "success",
            text: "✅ Selamat Datang Member NPT! Mengalihkan..."
          });
          setTimeout(() => {
            router.push("/");
          }, 800);
        } else {
          setStatusMessage({
            type: "warning",
            text: "⏳ Perangkat Anda telah diingat. Begitu disetujui Admin, akses otomatis terbuka penuh."
          });
          setTimeout(() => {
            router.push("/");
          }, 1500);
        }
      } else {
        setStatusMessage({
          type: "warning",
          text: "Email belum terdaftar. Silakan lengkapi formulir pendaftaran di bawah ini."
        });
        setActiveTab("register");
      }
    } catch (err) {
      console.warn("Login fallback:", err.message);
      const userData = {
        email: cleanEmail,
        name: cleanName,
        role: "member",
        status: "approved"
      };
      setCurrentUser(userData);
      savePermanentDeviceUser(userData);
      setStatusMessage({ type: "success", text: "✅ Berhasil masuk! Mengalihkan..." });
      setTimeout(() => {
        router.push("/");
      }, 800);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Registrasi Member Baru
  const handleRegister = async (e) => {
    e.preventDefault();
    const cleanEmail = inputEmail.trim().toLowerCase();
    const cleanName = inputName.trim() || cleanEmail.split("@")[0];

    let formattedPhone = inputPhone ? inputPhone.replace(/[^0-9]/g, "") : "";
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "62" + formattedPhone.slice(1);
    }

    if (!cleanEmail || !cleanName) {
      setStatusMessage({ type: "error", text: "Nama dan email wajib diisi!" });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage({ type: "", text: "" });

    const roleTarget = selectedProgram === "emt" ? "emt" : `npt_${selectedLevel}`;

    try {
      if (supabase) {
        await supabase.from("profiles").insert([
          {
            full_name: cleanName,
            email: cleanEmail,
            phone_number: formattedPhone || null,
            role: roleTarget,
            status: "pending",
            created_at: new Date().toISOString()
          }
        ]);
      }

      const pendingUser = {
        email: cleanEmail,
        name: cleanName,
        phone_number: formattedPhone,
        role: roleTarget,
        status: "pending",
        requestedProgram: selectedProgram,
        requestedLevel: selectedLevel
      };
      setCurrentUser(pendingUser);
      savePermanentDeviceUser(pendingUser);

      const programLabel = selectedProgram === "emt" ? "🎓 EMT Guru" : `🏛️ NPT Level ${selectedLevel}`;
      setStatusMessage({
        type: "success",
        text: `✅ Pendaftaran untuk ${programLabel} berhasil diajukan! Perangkat Anda telah diingat.`
      });

      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err) {
      setStatusMessage({ type: "error", text: "Gagal mendaftar: " + err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative font-sans overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 bg-radial from-rose-950/20 via-slate-950/90 to-slate-950 pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-radial from-rose-600/10 via-amber-600/5 to-transparent blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="w-full max-w-md mx-auto mb-6 flex items-center justify-between relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>

        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          NPT Centre Portal
        </span>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-white p-1.5 shadow-lg shadow-rose-950/50 mx-auto flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Logo NPT"
              width={48}
              height={48}
              priority
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Akses Member & Admin NPT
          </h1>
          <p className="text-xs text-slate-400">
            Neuro Programming Training • EMT • 14 Akar Spiritual
          </p>
        </div>

        {/* Status Message Alert */}
        {statusMessage.text && (
          <div
            className={`p-3 rounded-2xl text-xs font-semibold text-center border animate-in fade-in ${
              statusMessage.type === "success"
                ? "bg-emerald-950/50 border-emerald-500/40 text-emerald-300"
                : statusMessage.type === "error"
                ? "bg-rose-950/50 border-rose-500/40 text-rose-300"
                : "bg-amber-950/50 border-amber-500/40 text-amber-300"
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setActiveTab("login");
              setStatusMessage({ type: "", text: "" });
            }}
            className={`py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "login"
                ? "bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-md shadow-rose-600/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Masuk Akun</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("register");
              setStatusMessage({ type: "", text: "" });
            }}
            className={`py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "register"
                ? "bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-md shadow-rose-600/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Daftar Member</span>
          </button>
        </div>

        {/* =============================================================== */}
        {/* TAB 1: FORM LOGIN MEMBER                                        */}
        {/* =============================================================== */}
        {activeTab === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-rose-400" />
                  <span>Nama Lengkap / Panggilan</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-rose-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>Alamat Email Gmail</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="namaanda@gmail.com"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-rose-500 transition"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-black shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <UserCheck className="w-4 h-4" />
                <span>{isSubmitting ? "Memeriksa..." : "Masuk Sekarang (1x Klik)"}</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500 text-center leading-relaxed">
              💡 Cukup 1x login per perangkat HP/Laptop. Perangkat Anda akan otomatis diingat secara permanen.
            </p>
          </form>
        )}

        {/* =============================================================== */}
        {/* TAB 2: FORM REGISTRASI MEMBER BARU                             */}
        {/* =============================================================== */}
        {activeTab === "register" && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Pilihan Klaster Pelatihan *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProgram("npt")}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                      selectedProgram === "npt"
                        ? "bg-rose-950/40 border-rose-500 text-white ring-1 ring-rose-500"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <span className="text-xs font-bold flex items-center gap-1 text-white">
                      🏛️ NPT Inti
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Level 1 s.d. 6
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedProgram("emt")}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                      selectedProgram === "emt"
                        ? "bg-amber-950/40 border-amber-500 text-white ring-1 ring-amber-500"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <span className="text-xs font-bold flex items-center gap-1 text-white">
                      🎓 EMT Guru
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Emotional Mastery
                    </span>
                  </button>
                </div>
              </div>

              {selectedProgram === "npt" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Pilih Jenjang Level NPT Anda:
                  </label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-rose-500"
                  >
                    <option value={1}>Level 1: Nafas & Relaksasi Dasar (Fondasi)</option>
                    <option value={2}>Level 2: Olah Energi & Somatik</option>
                    <option value={3}>Level 3: Power & Transcendental</option>
                    <option value={4}>Level 4: Self Mastery & Mindset</option>
                    <option value={5}>Level 5: 14 Akar Spiritual (Pembahasan)</option>
                    <option value={6}>Level 6: Mastery & Integrasi 14 Akar Spiritualitas</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-rose-400" />
                  <span>Nama Lengkap Anda *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama lengkap sesuai biodata"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>Alamat Email Gmail *</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="namaanda@gmail.com"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Nomor WhatsApp Aktif *</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="081234567890"
                  value={inputPhone}
                  onChange={(e) => setInputPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-rose-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-black shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? "Mengajukan..."
                    : `Kirim Pendaftaran (${selectedProgram === "emt" ? "EMT" : `NPT Lvl ${selectedLevel}`})`}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
