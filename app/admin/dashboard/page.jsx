"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Sparkles, Send, Link as LinkIcon, FileText, Trash2, Edit3, X } from "lucide-react";

export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
  const [tasks, setTasks] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState("");
  const [groupChatText, setGroupChatText] = useState("");
  const [externalLink, setExternalLink] = useState("");
  const [ocrText, setOcrText] = useState("");
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const { data } = await supabase
      .from("assignments")
      .select("*")
      .order("created_at", { ascending: false });
    setTasks(data || []);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));

  };

  const runOcr = async (base64Data, mimeType) => {
    setIsProcessingOcr(true);
    try {
      const res = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64Data, mimeType }),
      });
      const data = await res.json();
      if (data.success) {
        setOcrText(data.text);
      } else {
        alert("Gagal membaca gambar: " + data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingOcr(false);
    }
  };

  const handleEditInit = (task) => {
    setEditingId(task.id);
    setTitle(task.title || "");
    setGroupChatText(task.group_chat_text || "");
    setOcrText(task.ocr_extracted_text || "");
    setExternalLink(task.external_link || "");
    setPreview(task.image_url || null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setGroupChatText("");
    setOcrText("");
    setExternalLink("");
    setImage(null);
    setPreview(null);
  };

  const handleDeleteTask = async (id) => {
    if (!confirm("Yakin ingin menghapus tugas ini? Data jawaban terkait juga akan terhapus.")) return;

    try {
      const { error } = await supabase.from("assignments").delete().eq("id", id);
      if (error) throw error;
      alert("Tugas berhasil dihapus!");
      fetchTasks();
    } catch (err) {
      alert("Gagal menghapus tugas: " + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) return alert("Judul tugas wajib diisi!");
    setIsSubmitting(true);

    try {
      let imageUrl = preview;

      if (image) {
        const fileExt = image.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadErr } = await supabase.storage
          .from("materi-images")
          .upload(fileName, image);

        if (uploadErr) throw uploadErr;

        const { data: publicUrlData } = supabase.storage
          .from("materi-images")
          .getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      }

      // Format link: Jika kosong atau hanya spasi, simpan sebagai null
      const formattedLink = externalLink && externalLink.trim() !== "" ? externalLink.trim() : null;

      const payload = {
        title,
        image_url: imageUrl,
        ocr_extracted_text: ocrText,
        group_chat_text: groupChatText,
        external_link: formattedLink, // Null diizinkan jika kosong
      };

      if (editingId) {
        const { error } = await supabase.from("assignments").update(payload).eq("id", editingId);
        if (error) throw error;
        alert("Tugas berhasil diperbarui!");
      } else {
        payload.publish_date = new Date().toISOString().split("T")[0];
        const { error } = await supabase.from("assignments").insert([payload]);
        if (error) throw error;
        alert("Tugas harian berhasil dipublikasikan!");
      }

      handleCancelEdit();
      fetchTasks();
    } catch (err) {
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard Admin - Buat To-Do Harian</h1>
            <p className="text-sm text-slate-400">Persiapan Event 22 Agustus 2026</p>
          </div>
          <div className="flex gap-2">
            <a
              href="/admin/submissions"
              className="text-xs bg-slate-800 hover:bg-slate-700 text-sky-400 px-3 py-1.5 rounded-lg border border-slate-700 transition flex items-center gap-1"
            >
              📋 Lihat Jawaban Peserta
            </a>
            <a
              href="/admin/members"
              className="text-xs bg-slate-800 hover:bg-slate-700 text-sky-400 px-3 py-1.5 rounded-lg border border-slate-700 transition flex items-center gap-1"
            >
              👥 Kelola Members
            </a>
          </div>
        </div>

        {/* Form Input / Edit */}
        <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <h2 className="text-sm font-semibold text-sky-400">
              {editingId ? "✏️ Edit Tugas Harian" : "➕ Buat Tugas Baru"}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-xs text-rose-400 hover:underline flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Batal Edit
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 text-slate-300">Judul Modul / Hari Ke-</label>
            <input
              type="text"
              placeholder="Contoh: Refleksi Nur dan Nar Diri - Hari ke-1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 border border-slate-800 rounded-lg focus:ring-1 focus:ring-sky-500 outline-none text-xs text-white bg-slate-950"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 flex items-center gap-1.5 text-slate-300">
              <FileText className="w-4 h-4 text-sky-400" /> Teks Pesan dari Group Chat WA
            </label>
            <textarea
              rows={3}
              placeholder="Paste pesan / pengantar instruksi dari mentor di sini..."
              value={groupChatText}
              onChange={(e) => setGroupChatText(e.target.value)}
              className="w-full p-2.5 border border-slate-800 rounded-lg focus:ring-1 focus:ring-sky-500 outline-none text-xs text-white bg-slate-950"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 text-slate-300">Unggah Gambar Materi (Poster/Soal)</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-xs text-slate-400" />
            {preview && (
              <div className="mt-3 relative w-48 h-48 border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
                <img src={preview} alt="Preview" className="w-full h-full object-contain" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 flex items-center gap-1.5 text-slate-300">
              <Sparkles className="w-4 h-4 text-amber-400" /> Hasil OCR Otomatis (Pertanyaan/Evaluasi)
            </label>
            {isProcessingOcr ? (
              <p className="text-xs text-amber-400 animate-pulse">Sedang membaca teks dari gambar...</p>
            ) : (
              <textarea
                rows={5}
                value={ocrText}
                onChange={(e) => setOcrText(e.target.value)}
                placeholder="Hasil teks dari gambar akan muncul otomatis di sini (dapat Anda edit kembali)..."
                className="w-full p-2.5 border border-slate-800 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-none text-slate-200 bg-slate-950"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 flex items-center gap-1.5 text-slate-300">
              <LinkIcon className="w-4 h-4 text-emerald-400" /> Link Eksternal (Opsional)
            </label>
            {/* Diubah type="text" agar tidak memicu validasi URL bawaan browser saat kosong */}
            <input
              type="text"
              placeholder="https://youtube.com/watch?v=... (Boleh dikosongkan)"
              value={externalLink}
              onChange={(e) => setExternalLink(e.target.value)}
              className="w-full p-2.5 border border-slate-800 rounded-lg focus:ring-1 focus:ring-sky-500 outline-none text-xs text-white bg-slate-950"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" /> {isSubmitting ? "Memproses..." : editingId ? "Update Tugas" : "Publish To-Do Hari Ini"}
          </button>
        </form>

        {/* List Tugas yang Sudah Rilis */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-4">
          <h3 className="font-semibold text-slate-200 text-sm border-b border-slate-800 pb-2">
            Daftar Tugas yang Sudah Dipublikasikan ({tasks.length})
          </h3>
          <div className="divide-y divide-slate-800">
            {tasks.map((task) => (
              <div key={task.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-sky-400">{task.title}</p>
                  <p className="text-[10px] text-slate-500">Tanggal: {task.publish_date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditInit(task)}
                    className="p-1.5 text-slate-400 hover:text-sky-400 transition"
                    title="Edit Tugas"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 transition"
                    title="Hapus Tugas"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}