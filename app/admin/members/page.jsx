"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { UserPlus, Phone, User, Trash2 } from "lucide-react";

export default function MembersAdmin() {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load daftar teman dari Supabase
  const fetchMembers = async () => {
    const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (!error) setMembers(data || []);
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
    await supabase.from("profiles").delete().eq("id", id);
    fetchMembers();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-slate-800">Daftar Teman & Nomor WA</h1>
        <p className="text-sm text-slate-500">Penerima Reminder Persiapan Event 22 Agustus 2026</p>
      </div>

      {/* Form Tambah Teman */}
      <form onSubmit={handleAddMember} className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
        <h2 className="font-semibold text-slate-700 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-sky-600" /> Tambah Teman Baru
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
            <input
              type="text"
              placeholder="Contoh: Budi Santoso"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-sky-500 outline-none text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nomor WhatsApp</label>
            <input
              type="text"
              placeholder="Contoh: 081234567890"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-sky-500 outline-none text-sm"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg text-sm transition"
        >
          {isLoading ? "Menyimpan..." : "Simpan Kontak"}
        </button>
      </form>

      {/* List Teman Terdaftar */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b">
          <h3 className="font-semibold text-slate-700">Daftar Kontak Terdaftar ({members.length})</h3>
        </div>
        <div className="divide-y">
          {members.length === 0 ? (
            <p className="p-4 text-sm text-slate-500 text-center">Belum ada kontak teman yang dimasukkan.</p>
          ) : (
            members.map((member) => (
              <div key={member.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-bold text-sm">
                    {member.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{member.full_name}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {member.phone_number}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="p-2 text-slate-400 hover:text-red-600 transition"
                  title="Hapus"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}