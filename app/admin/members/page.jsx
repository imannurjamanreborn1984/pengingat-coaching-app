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
  Crown,
  Edit3,
  X
} from "lucide-react";
import { AppNavbar, AppSidebar } from "@/components/layout/AppNavbar";
import AdminHeaderTabs from "@/components/admin/AdminHeaderTabs";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default function MembersAdmin() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isKitabTheme, setIsKitabTheme] = useState(true);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [filterTab, setFilterTab] = useState("all"); // 'all' | 'pending' | 'approved'

  // State Edit Member
  const [editingMember, setEditingMember] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editStatus, setEditStatus] = useState("approved");

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

  // Update Status Approval Member (Setujui / Pending)
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("profiles")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      // Update state lokal
      setMembers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
      );
    } catch (err) {
      alert("Gagal update status: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Buka Modal Edit Member
  const handleOpenEdit = (member) => {
    setEditingMember(member);
    setEditName(member.full_name || "");
    setEditPhone(member.phone_number || "");
    setEditEmail(member.email || "");
    setEditStatus(member.status || "approved");
  };

  // Simpan Perubahan Data Member
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingMember) return;
    setIsLoading(true);

    let formattedPhone = editPhone ? editPhone.replace(/[^0-9]/g, "") : "";
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "62" + formattedPhone.slice(1);
    }

    const cleanEmail = editEmail ? editEmail.trim().toLowerCase() : null;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editName.trim(),
          phone_number: formattedPhone || null,
          email: cleanEmail,
          status: editStatus,
        })
        .eq("id", editingMember.id);

      if (error) throw error;

      alert("Data anggota berhasil diperbarui!");
      setEditingMember(null);
      fetchMembers();
    } catch (err) {
      alert("Gagal memperbarui data: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Hapus Member
  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus anggota ini?")) return;
    try {
      setIsLoading(true);
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) throw error;
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      alert("Gagal menghapus: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Kirim Pengingat WhatsApp ke Member
  const handleSendWA = (member) => {
    if (!member.phone_number) {
      alert("Nomor WA belum tersimpan.");
      return;
    }

    const text = encodeURIComponent(
      `Assalamu'alaikum Wr. Wb. Sahabat ${member.full_name},\n\nAkses materi pembelajaran & rekaman live NPT Anda telah aktif. Silakan buka portal:\nhttps://neuroprogrammingtraining.id/hakekat-cinta\n\nTerima kasih!`
    );

    window.open(`https://wa.me/${member.phone_number}?text=${text}`, "_blank");
  };

  // Broadcast Massal
  const handleBroadcastAll = async () => {
    if (!confirm(`Kirim broadcast link materi ke ${members.filter(m => m.phone_number).length} anggota via WA Gateway?`)) return;
    setIsBroadcasting(true);
    try {
      const res = await fetch("/api/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Akses pembelajaran & rekaman live kajian Hakikat Cinta NPT telah diperbarui. Silakan buka modul di: https://neuroprogrammingtraining.id"
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Broadcast pesan berhasil dikirim!");
      } else {
        alert("Broadcast gateway offline / belum terkonfigurasi. Anda bisa kirim manual 1 per 1.");
      }
    } catch (e) {
      alert("Gagal broadcast: " + e.message);
    } finally {
      setIsBroadcasting(false);
    }
  };

  // Filter Data
  const pendingCount = members.filter((m) => m.status === "pending").length;
  const approvedCount = members.filter((m) => m.status === "approved").length;

  const filteredMembers = members.filter((m) => {
    if (filterTab === "pending") return m.status === "pending";
    if (filterTab === "approved") return m.status === "approved";
    return true;
  });

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${
      isKitabTheme 
        ? 'bg-parchment text-[#231409]' 
        : 'bg-slate-950 text-slate-100'
    }`}>
      {/* Top Navbar & Sidebar Drawer */}
      <AppNavbar 
        onToggleSidebar={() => setIsSidebarOpen(true)}
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
        {/* Admin Quick Switch Tabs */}
        <AdminHeaderTabs 
          activeTab="members" 
          isKitabTheme={isKitabTheme}
          onToggleTheme={() => setIsKitabTheme(!isKitabTheme)}
        />

        {/* Header Navigation */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5 ${
          isKitabTheme ? 'border-[#dfcfb0]' : 'border-slate-800'
        }`}>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className={`p-2 rounded-xl border transition ${
                isKitabTheme 
                  ? 'bg-[#eee3cb] border-[#d8c3a1] text-[#634224] hover:bg-[#dfcdab]' 
                  : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Kembali ke Dashboard Admin"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`text-xl sm:text-2xl font-bold ${
                  isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent'
                }`}>
                  Ruang Persetujuan & Anggota NPT
                </h1>
                {pendingCount > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold border animate-pulse ${
                    isKitabTheme 
                      ? 'bg-[#edd8b6] text-[#9e2a2b] border-[#cbb38b]' 
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  }`}>
                    {pendingCount} Menunggu Approval
                  </span>
                )}
              </div>
              <p className={`text-xs mt-0.5 ${isKitabTheme ? 'text-[#634224]' : 'text-slate-400'}`}>
                Kelola izin masuk peserta, approval rekaman video, dan kontak reminder WhatsApp.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchMembers}
              disabled={isLoading}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                isKitabTheme
                  ? 'bg-[#eee3cb] text-[#3a2211] border-[#d8c3a1] hover:bg-[#dfcdab]'
                  : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300'
              }`}
              title="Segarkan Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-amber-600" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={handleBroadcastAll}
              disabled={isBroadcasting || members.length === 0}
              className={`px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
                isKitabTheme
                  ? 'bg-[#1b6b55] hover:bg-[#155644] shadow-emerald-900/20'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 shadow-emerald-600/20'
              }`}
            >
              <MessageSquareShare className={`w-4 h-4 ${isBroadcasting ? "animate-bounce" : ""}`} />
              <span>{isBroadcasting ? "Mengirim..." : "Broadcast WA Massal"}</span>
            </button>
          </div>
        </div>

        {/* Form Tambah Anggota Manual */}
        <div className={`p-5 sm:p-6 rounded-3xl space-y-4 shadow-sm ${
          isKitabTheme
            ? 'card-kitab-frame'
            : 'bg-slate-900/80 border border-slate-800'
        }`}>
          <h2 className={`text-sm font-bold flex items-center gap-2 ${
            isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-slate-200'
          }`}>
            <UserPlus className={`w-4 h-4 ${isKitabTheme ? 'text-[#9e2a2b]' : 'text-sky-400'}`} />
            <span>Tambah Anggota Baru Langsung (Otomatis Disetujui)</span>
          </h2>

          <form onSubmit={handleAddMember} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Nama Lengkap *"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none ${
                isKitabTheme
                  ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b] placeholder:text-[#9e876a]'
                  : 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500 focus:ring-1 focus:ring-sky-500'
              }`}
              required
            />

            <input
              type="email"
              placeholder="Alamat Email Gmail (Opsional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none ${
                isKitabTheme
                  ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b] placeholder:text-[#9e876a]'
                  : 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500 focus:ring-1 focus:ring-sky-500'
              }`}
            />

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="No WA (08xx...)"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none ${
                  isKitabTheme
                    ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b] placeholder:text-[#9e876a]'
                    : 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500 focus:ring-1 focus:ring-sky-500'
                }`}
              />

              <button
                type="submit"
                disabled={isLoading}
                className={`px-4 py-2.5 text-white text-xs font-bold rounded-xl shrink-0 transition cursor-pointer disabled:opacity-50 ${
                  isKitabTheme
                    ? 'bg-[#9e2a2b] hover:bg-[#852324]'
                    : 'bg-sky-600 hover:bg-sky-500'
                }`}
              >
                + Simpan
              </button>
            </div>
          </form>
        </div>

        {/* Filter Tab Approval */}
        <div className={`flex items-center justify-between gap-2 border-b pb-3 ${
          isKitabTheme ? 'border-[#dfcfb0]' : 'border-slate-800'
        }`}>
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setFilterTab("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                filterTab === "all"
                  ? isKitabTheme ? "bg-[#3a2211] text-[#fbf6ec] border-[#8f632d]" : "bg-slate-800 text-white border-slate-700"
                  : isKitabTheme ? "bg-[#eee3cb] text-[#543516] border-[#d8c3a1]" : "text-slate-400 hover:text-slate-200 border-transparent"
              }`}
            >
              Semua ({members.length})
            </button>
            <button
              onClick={() => setFilterTab("pending")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                filterTab === "pending"
                  ? isKitabTheme ? "bg-[#edd8b6] text-[#9e2a2b] border-[#cbb38b]" : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                  : isKitabTheme ? "bg-[#eee3cb] text-[#543516] border-[#d8c3a1]" : "text-slate-400 hover:text-slate-200 border-transparent"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Menunggu Persetujuan ({pendingCount})</span>
            </button>
            <button
              onClick={() => setFilterTab("approved")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                filterTab === "approved"
                  ? isKitabTheme ? "bg-[#dbeef0] text-[#1b6b55] border-[#b0d9d3]" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  : isKitabTheme ? "bg-[#eee3cb] text-[#543516] border-[#d8c3a1]" : "text-slate-400 hover:text-slate-200 border-transparent"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Disetujui ({approvedCount})</span>
            </button>
          </div>
        </div>

        {/* Daftar Anggota & Status Approval */}
        <div className={`rounded-3xl p-4 sm:p-6 space-y-3 shadow-sm ${
          isKitabTheme
            ? 'card-kitab-frame'
            : 'bg-slate-900/60 border border-slate-800'
        }`}>
          {isLoading ? (
            <div className={`py-12 text-center text-xs ${isKitabTheme ? 'text-[#82613d]' : 'text-slate-400'}`}>
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-600" />
              <span>Memuat data anggota & permohonan akses...</span>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className={`py-12 text-center text-xs ${isKitabTheme ? 'text-[#82613d]' : 'text-slate-500'}`}>
              {filterTab === "pending"
                ? "🎉 Tidak ada permintaan yang menunggu persetujuan."
                : "Belum ada anggota di kategori ini."}
            </div>
          ) : (
            <div className={`divide-y ${isKitabTheme ? 'divide-[#dfcfb0]' : 'divide-slate-800/80'}`}>
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
                        <span className={`font-bold text-sm ${
                          isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-slate-100'
                        }`}>
                          {member.full_name || "Tanpa Nama"}
                        </span>
                        {isSuperAdminRole ? (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                            isKitabTheme
                              ? 'bg-[#edd8b6] text-[#9e2a2b] border-[#cbb38b]'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            <Crown className="w-3 h-3 text-amber-500" /> Admin Utama
                          </span>
                        ) : isApproved ? (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                            isKitabTheme
                              ? 'bg-[#dbeef0] text-[#1b6b55] border-[#b0d9d3]'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Disetujui
                          </span>
                        ) : (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 animate-pulse ${
                            isKitabTheme
                              ? 'bg-[#edd8b6] text-[#9e2a2b] border-[#cbb38b]'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            <Clock className="w-3 h-3 text-amber-600" /> Menunggu Approval
                          </span>
                        )}
                      </div>

                      <div className={`flex flex-wrap items-center gap-3 text-xs ${
                        isKitabTheme ? 'text-[#634224]' : 'text-slate-400'
                      }`}>
                        {member.email && (
                          <span className="flex items-center gap-1">
                            <Mail className={`w-3.5 h-3.5 ${isKitabTheme ? 'text-[#82613d]' : 'text-slate-500'}`} />
                            {member.email}
                          </span>
                        )}
                        {member.phone_number && (
                          <span className="flex items-center gap-1">
                            <Phone className={`w-3.5 h-3.5 ${isKitabTheme ? 'text-[#82613d]' : 'text-slate-500'}`} />
                            +{member.phone_number}
                          </span>
                        )}
                        <span className={`text-[10px] ${isKitabTheme ? 'text-[#82613d]' : 'text-slate-500'}`}>
                          Terdaftar: {new Date(member.created_at).toLocaleDateString("id-ID")}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {!isApproved ? (
                        <button
                          onClick={() => handleUpdateStatus(member.id, "approved")}
                          className={`px-3 py-1.5 rounded-xl text-white text-xs font-bold flex items-center gap-1 shadow-sm transition cursor-pointer ${
                            isKitabTheme
                              ? 'bg-[#1b6b55] hover:bg-[#155644]'
                              : 'bg-emerald-600 hover:bg-emerald-500'
                          }`}
                          title="Setujui Akses Video & Portal"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Setujui (Approve)</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(member.id, "pending")}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
                            isKitabTheme
                              ? 'bg-[#eee3cb] text-[#543516] border-[#d8c3a1] hover:bg-[#dfcdab]'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          }`}
                          title="Tangguhkan Akses"
                        >
                          Tangguhkan
                        </button>
                      )}

                      {/* Tombol Edit Data Anggota */}
                      <button
                        onClick={() => handleOpenEdit(member)}
                        className={`p-2 rounded-xl border transition cursor-pointer ${
                          isKitabTheme
                            ? 'bg-[#eee3cb] text-[#8f632d] border-[#d8c3a1] hover:bg-[#dfcdab]'
                            : 'bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border-sky-500/20'
                        }`}
                        title="Edit Data Anggota (Nama, Email, No WA)"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {member.phone_number && (
                        <button
                          onClick={() => handleSendWA(member)}
                          className={`p-2 rounded-xl border transition cursor-pointer ${
                            isKitabTheme
                              ? 'bg-[#dbeef0] text-[#1b6b55] border-[#b0d9d3] hover:bg-[#cbeae4]'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                          }`}
                          title="Kirim Pesan WA"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(member.id)}
                        className={`p-2 rounded-xl border transition cursor-pointer ${
                          isKitabTheme
                            ? 'bg-[#edd8b6] text-[#9e2a2b] border-[#cbb38b] hover:bg-[#dfcdab]'
                            : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20'
                        }`}
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

      {/* MODAL EDIT DATA ANGGOTA */}
      {editingMember && (
        <div 
          onClick={() => setEditingMember(null)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 text-left ${
              isKitabTheme
                ? 'card-kitab-frame'
                : 'bg-slate-900 border border-sky-500/30'
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${
              isKitabTheme ? 'border-[#dfcfb0]' : 'border-slate-800'
            }`}>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                  isKitabTheme
                    ? 'bg-[#eee3cb] text-[#8f632d] border-[#d8c3a1]'
                    : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                }`}>
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${
                    isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-white'
                  }`}>
                    Edit Data Anggota
                  </h3>
                  <p className={`text-[10px] ${isKitabTheme ? 'text-[#734822]' : 'text-slate-400'}`}>
                    Lengkapi Email atau Perbaiki Nomor WA
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEditingMember(null)}
                className={`p-1 rounded-xl cursor-pointer ${
                  isKitabTheme ? 'text-[#734822] hover:bg-[#dfcfb0]' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${
                  isKitabTheme ? 'text-[#3a2211]' : 'text-slate-300'
                }`}>
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-hidden ${
                    isKitabTheme
                      ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b]'
                      : 'bg-slate-950 border-slate-800 text-white focus:border-sky-500'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${
                  isKitabTheme ? 'text-[#3a2211]' : 'text-slate-300'
                }`}>
                  Alamat Email Gmail (Kunci Login)
                </label>
                <input
                  type="email"
                  placeholder="contoh: nama@gmail.com"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-hidden ${
                    isKitabTheme
                      ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b] placeholder:text-[#9e876a]'
                      : 'bg-slate-950 border-slate-800 text-white focus:border-sky-500'
                  }`}
                />
                <p className={`text-[10px] mt-0.5 ${isKitabTheme ? 'text-[#734822]' : 'text-slate-500'}`}>
                  Isi email ini agar member bisa langsung login tanpa tertolak.
                </p>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${
                  isKitabTheme ? 'text-[#3a2211]' : 'text-slate-300'
                }`}>
                  Nomor WhatsApp
                </label>
                <input
                  type="text"
                  placeholder="08123456789"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-hidden ${
                    isKitabTheme
                      ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b] placeholder:text-[#9e876a]'
                      : 'bg-slate-950 border-slate-800 text-white focus:border-sky-500'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${
                  isKitabTheme ? 'text-[#3a2211]' : 'text-slate-300'
                }`}>
                  Status Approval Akses
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-hidden ${
                    isKitabTheme
                      ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b]'
                      : 'bg-slate-950 border-slate-800 text-white focus:border-sky-500'
                  }`}
                >
                  <option value="approved">✅ Disetujui (Approved / Full VIP)</option>
                  <option value="pending">⏳ Menunggu Persetujuan (Pending)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    isKitabTheme
                      ? 'bg-[#eee3cb] text-[#543516] border-[#d8c3a1] hover:bg-[#dfcdab]'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition cursor-pointer ${
                    isKitabTheme
                      ? 'bg-[#9e2a2b] hover:bg-[#852324]'
                      : 'bg-sky-600 hover:bg-sky-500 shadow-sky-600/30'
                  }`}
                >
                  {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}