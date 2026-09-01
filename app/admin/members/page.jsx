"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  UserPlus, 
  Phone, 
  Trash2, 
  ArrowLeft, 
  Users, 
  MessageSquareShare, 
  Send,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Mail,
  Filter,
  RefreshCw,
  Crown
} from "lucide-react";
import { AppNavbar, AppSidebar } from "@/components/layout/AppNavbar";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default function MembersAdmin() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [filterTab, setFilterTab] = useState("all"); // 'all' | 'pending' | 'approved'

  // Load daftar teman dari Supabase
  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      console.error("Gagal mengambil data member:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Tambah Member / Teman Baru secara Manual oleh Admin
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!fullName) return alert("Nama lengkap wajib diisi!");
    setIsLoading(true);

    let formattedPhone = phoneNumber ? phoneNumber.replace(/[^0-9]/g, "") : "";
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "62" + formattedPhone.slice(1);
    }

    try {
      const { error } = await supabase.from("profiles").insert([
        {
          full_name: fullName,
          phone_number: formattedPhone || null,
          email: email.trim().toLowerCase() || null,
          role: "member",
          status: "approved", // Manual add oleh admin otomatis approved
        },
      ]);

      if (error) throw error;

      alert("Anggota berhasil ditambahkan dan langsung disetujui!");
      setFullName("");
      setPhoneNumber("");
      setEmail("");
      fetchMembers();
    } catch (err) {
      alert("Gagal menambahkan: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Ubah Status Approval (Setujui / Batalkan)
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      alert(newStatus === "approved" ? "✅ Akses anggota berhasil disetujui!" : "⚠️ Akses anggota dibatalkan/ditangguhkan.");
      fetchMembers();
    } catch (err) {
      alert("Gagal mengubah status: " + err.message);
    }
  };

  // Hapus Member
  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus teman ini dari daftar?")) return;
    try {
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) throw error;
      fetchMembers();
    } catch (err) {
      alert("Gagal menghapus: " + err.message);
    }
  };

  // Kirim WA Manual
  const handleSendWA = (member) => {
    if (!member.phone_number) {
      alert("Anggota ini belum memasukkan nomor WA.");
      return;
    }
    const participantName = member.full_name || "Sahabat";
    const appDashboardUrl = `${window.location.origin}/dashboard`;
    const textMessage = `Halo Kak ${participantName}! 👋\n\nAkun Anda di Portal NPT sudah aktif. Silakan buka tautan berikut untuk memantau tugas dan rekaman kajian:\n👉 ${appDashboardUrl}\n\nSemangat berproses! 🔥`;
    const encodedText = encodeURIComponent(textMessage);
    window.open(`https://wa.me/${member.phone_number}?text=${encodedText}`, "_blank");
  };

  // Kirim WA Broadcast Otomatis ke SEMUA Nomor (via API Fonnte)
  const handleBroadcastAll = async () => {
    const validMembers = members.filter((m) => m.phone_number);
    if (validMembers.length === 0) return alert("Belum ada kontak dengan nomor WA terdaftar!");
    if (!confirm(`Kirim pesan WA broadcast otomatis ke SEMUA (${validMembers.length}) kontak?`)) return;

    setIsBroadcasting(true);
    try {
      const response = await fetch("/api/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customMessage: "Jangan lupa cek Portal NPT hari ini untuk update materi dan tugas terbaru ya! 🔥",
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Gagal broadcast");

      alert(`✅ Broadcast Terkirim!\nSukses: ${result.results.success} nomor\nGagal: ${result.results.failed} nomor`);
    } catch (err) {
      alert("Error Broadcast: " + err.message);
    } finally {
      setIsBroadcasting(false);
    }
  };

  const pendingCount = members.filter((m) => m.status === "pending" || !m.status).length;
  const approvedCount = members.filter((m) => m.status === "approved").length;

  const filteredMembers = members.filter((m) => {
    if (filterTab === "pending") return m.status === "pending" || !m.status;
    if (filterTab === "approved") return m.status === "approved";
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar & Sidebar Drawer */}
      <AppNavbar 
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        currentUser={{ name: "Admin Utama", role: "super_admin" }}
        activeTitle="Ruang Persetujuan"
      />
      <AppSidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentUser={{ name: "Admin Utama", role: "super_admin" }}
        activePath="/admin/members"
      />

      <div className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {/* Header Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition"
              title="Kembali ke Dashboard Admin"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                  Ruang Persetujuan & Anggota NPT
                </h1>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                    {pendingCount} Menunggu Approval
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Kelola izin masuk peserta, approval rekaman video, dan kontak reminder WhatsApp.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchMembers}
              disabled={isLoading}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Segarkan Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-sky-400" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={handleBroadcastAll}
              disabled={isBroadcasting || members.length === 0}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center gap-2 cursor-pointer"
            >
              <MessageSquareShare className={`w-4 h-4 ${isBroadcasting ? "animate-bounce" : ""}`} />
              <span>{isBroadcasting ? "Mengirim..." : "Broadcast WA Massal"}</span>
            </button>
          </div>
        </div>

        {/* Form Tambah Anggota Manual */}
        <div className="p-5 sm:p-6 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-4">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-sky-400" />
            <span>Tambah Anggota Baru Langsung (Otomatis Disetujui)</span>
          </h2>

          <form onSubmit={handleAddMember} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Nama Lengkap *"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              required
            />

            <input
              type="email"
              placeholder="Alamat Email Gmail (Opsional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="No WA (08xx...)"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />

              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shrink-0 transition cursor-pointer"
              >
                + Simpan
              </button>
            </div>
          </form>
        </div>

        {/* Filter Tab Approval */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setFilterTab("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                filterTab === "all"
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Semua ({members.length})
            </button>
            <button
              onClick={() => setFilterTab("pending")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                filterTab === "pending"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Menunggu Persetujuan ({pendingCount})</span>
            </button>
            <button
              onClick={() => setFilterTab("approved")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                filterTab === "approved"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Disetujui ({approvedCount})</span>
            </button>
          </div>
        </div>

        {/* Daftar Anggota & Status Approval */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-4 sm:p-6 space-y-3">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-500" />
              <span>Memuat data anggota & permohonan akses...</span>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              {filterTab === "pending"
                ? "🎉 Tidak ada permintaan yang menunggu persetujuan."
                : "Belum ada anggota di kategori ini."}
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {filteredMembers.map((member) => {
                const isApproved = member.status === "approved";
                const isSuperAdminRole = member.role === "super_admin";

                return (
                  <div
                    key={member.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-100">
                          {member.full_name || "Tanpa Nama"}
                        </span>
                        {isSuperAdminRole ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                            <Crown className="w-3 h-3 text-amber-400" /> Admin Utama
                          </span>
                        ) : isApproved ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Disetujui
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1 animate-pulse">
                            <Clock className="w-3 h-3 text-amber-400" /> Menunggu Approval
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        {member.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-slate-500" />
                            {member.email}
                          </span>
                        )}
                        {member.phone_number && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                            +{member.phone_number}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500">
                          Terdaftar: {new Date(member.created_at).toLocaleDateString("id-ID")}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {!isApproved ? (
                        <button
                          onClick={() => handleUpdateStatus(member.id, "approved")}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition cursor-pointer"
                          title="Setujui Akses Video & Portal"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Setujui (Approve)</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(member.id, "pending")}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
                          title="Tangguhkan Akses"
                        >
                          Tangguhkan
                        </button>
                      )}

                      {member.phone_number && (
                        <button
                          onClick={() => handleSendWA(member)}
                          className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition cursor-pointer"
                          title="Kirim Pesan WA"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(member.id)}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition cursor-pointer"
                        title="Hapus dari Daftar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}