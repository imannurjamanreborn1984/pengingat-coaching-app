"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { UserPlus, Phone, Trash2, ArrowLeft, Users, MessageSquareShare, Send } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default function MembersAdmin() {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Load daftar teman dari Supabase
  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      console.error("Gagal mengambil data member:", err.message);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Tambah Member / Teman Baru
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!fullName || !phoneNumber) return alert("Nama dan Nomor WA wajib diisi!");
    setIsLoading(true);

    // Format nomor WA agar diawali kode negara 62
    let formattedPhone = phoneNumber.replace(/[^0-9]/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "62" + formattedPhone.slice(1);
    }

    try {
      const { error } = await supabase.from("profiles").insert([
        {
          full_name: fullName,
          phone_number: formattedPhone,
          role: "member",
        },
      ]);

      if (error) throw error;

      alert("Teman berhasil ditambahkan!");
      setFullName("");
      setPhoneNumber("");
      fetchMembers();
    } catch (err) {
      alert("Gagal menambahkan: " + err.message);
    } finally {
      setIsLoading(false);
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

  // Kirim WA Manual (Direct Chat Chat via wa.me)
  const handleSendWA = (member) => {
    const participantName = member.full_name || "Sahabat";
    const appDashboardUrl = `${window.location.origin}/dashboard`;

    const textMessage = `Halo Kak ${participantName}! 👋\n\nJangan lupa cek To-Do & Refleksi Harian kamu untuk persiapan Event 22 Agustus 2026 ya.\n\nSilakan isi refleksimu di tautan berikut:\n👉 ${appDashboardUrl}\n\nSemangat berproses! 🔥`;

    const encodedText = encodeURIComponent(textMessage);
    const waUrl = `https://wa.me/${member.phone_number}?text=${encodedText}`;

    window.open(waUrl, "_blank");
  };

  // Kirim WA Broadcast Otomatis ke SEMUA Nomor (via API Fonnte)
  const handleBroadcastAll = async () => {
    if (members.length === 0) return alert("Belum ada kontak terdaftar!");
    if (!confirm(`Kirim pesan WA broadcast otomatis ke SEMUA (${members.length}) kontak?`)) return;

    setIsBroadcasting(true);
    const appDashboardUrl = `${window.location.origin}/dashboard`;
    const defaultMessage = `Halo Sahabat! 👋\n\nTo-Do & Refleksi Harian persiapan Event 22 Agustus 2026 sudah terbit.\n\nSilakan isi di tautan berikut:\n👉 ${appDashboardUrl}\n\nSemangat berproses! 🔥`;

    try {
      const res = await fetch("/api/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: defaultMessage }),
      });

      const data = await res.json();
      if (data.success) {
        alert("🚀 Pesan berhasil di-broadcast ke semua nomor!");
      } else {
        alert("Gagal broadcast: " + data.error);
      }
    } catch (err) {
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link
                href="/admin/dashboard"
                className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-800 transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-sky-400" />
                <span>Dashboard Admin</span>
              </Link>
              <Link
                href="/dashboard"
                className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-800 transition"
              >
                Tampilan Peserta
              </Link>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-sky-400" /> Daftar Teman & Nomor WA
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Penerima Reminder Persiapan Event 22 Agustus 2026
            </p>
          </div>
        </div>

        {/* Form Tambah Teman */}
        <form
          onSubmit={handleAddMember}
          className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm space-y-4"
        >
          <h2 className="font-semibold text-sky-400 flex items-center gap-2 text-sm">
            <UserPlus className="w-4 h-4 text-sky-400" /> Tambah Teman Baru
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1 text-slate-300">
                Nama Lengkap
              </label>
              <input
                type="text"
                placeholder="Contoh: Budi Santoso"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:ring-1 focus:ring-sky-500 outline-none text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-slate-300">
                Nomor WhatsApp
              </label>
              <input
                type="text"
                placeholder="Contoh: 081234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:ring-1 focus:ring-sky-500 outline-none text-xs text-white"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-lg text-xs transition disabled:opacity-50"
          >
            {isLoading ? "Menyimpan..." : "Simpan Kontak"}
          </button>
        </form>

        {/* List Teman Terdaftar */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex justify-between items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-slate-200 text-sm">
              Daftar Kontak Terdaftar ({members.length})
            </h3>

            {/* Tombol Broadcast Sekali Klik (Fonnte API) */}
            <button
              onClick={handleBroadcastAll}
              disabled={isBroadcasting || members.length === 0}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {isBroadcasting ? "Proses Broadcast..." : `Broadcast Ke Semua (${members.length})`}
            </button>
          </div>
          <div className="divide-y divide-slate-800">
            {members.length === 0 ? (
              <p className="p-6 text-xs text-slate-500 text-center">
                Belum ada kontak teman yang dimasukkan.
              </p>
            ) : (
              members.map((member) => (
                <div
                  key={member.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-800/40 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-sky-950 border border-sky-800 text-sky-400 flex items-center justify-center font-bold text-xs">
                      {member.full_name ? member.full_name.charAt(0).toUpperCase() : "?"}
                    </div>
                    <div>
                      <p className="font-medium text-slate-200 text-xs">
                        {member.full_name}
                      </p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-500" /> {member.phone_number}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Tombol Pengirim WA Manual */}
                    <button
                      onClick={() => handleSendWA(member)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
                      title="Kirim WA Manual"
                    >
                      <MessageSquareShare className="w-3.5 h-3.5" /> Kirim WA
                    </button>
                    {/* Tombol Hapus */}
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="p-2 text-slate-500 hover:text-red-400 transition rounded-lg hover:bg-slate-800"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}