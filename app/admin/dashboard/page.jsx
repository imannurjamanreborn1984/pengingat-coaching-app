"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Sparkles, Send, Link as LinkIcon, FileText, Trash2, Edit3, X, ArrowLeft, Users, FileCheck2, ZoomIn, ArrowUp, ArrowDown } from "lucide-react";
import { AppNavbar, AppSidebar } from "@/components/layout/AppNavbar";
import AdminHeaderTabs from "@/components/admin/AdminHeaderTabs";

export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
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
  const [movingId, setMovingId] = useState(null);

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

  // Fungsi memindahkan urutan tugas ke atas atau ke bawah
  const handleMoveTask = async (index, direction) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= tasks.length) return;

    const currentTask = tasks[index];
    const targetTask = tasks[targetIndex];

    // Update state secara optimistik untuk responsivitas instan
    const updatedTasks = [...tasks];
    updatedTasks[index] = targetTask;
    updatedTasks[targetIndex] = currentTask;
    setTasks(updatedTasks);
    setMovingId(currentTask.id);

    try {
      let currentCreatedAt = new Date(currentTask.created_at).getTime();
      let targetCreatedAt = new Date(targetTask.created_at).getTime();

      // Pastikan ada selisih waktu agar urutan strictly sorted
      if (currentCreatedAt === targetCreatedAt) {
        if (direction === "up") {
          targetCreatedAt = currentCreatedAt - 1000;
        } else {
          targetCreatedAt = currentCreatedAt + 1000;
        }
      }

      const newCurrentDate = new Date(targetCreatedAt).toISOString();
      const newTargetDate = new Date(currentCreatedAt).toISOString();

      const [res1, res2] = await Promise.all([
        supabase.from("assignments").update({ created_at: newCurrentDate }).eq("id", currentTask.id),
        supabase.from("assignments").update({ created_at: newTargetDate }).eq("id", targetTask.id),
      ]);

      if (res1.error) throw res1.error;
      if (res2.error) throw res2.error;
    } catch (err) {
      console.error("Gagal memindahkan urutan tugas:", err.message);
      alert("Gagal mengubah urutan: " + err.message);
      fetchTasks(); // Kembalikan ke urutan semula jika gagal
    } finally {
      setMovingId(null);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));

    // Ekstrak teks via OCR otomatis menggunakan Gemini API
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result;
      runOcr(base64Data, file.type);
    };
    reader.readAsDataURL(file);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-600 selection:text-white">
      <AppNavbar
        onToggleSidebar={() => setIsSidebarOpen(true)}
        currentUser={currentUser || { name: "Admin Utama", role: "super_admin" }}
        activeTitle="Broadcast & Monitoring WA"
      />
      <AppSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentUser={currentUser || { name: "Admin Utama", role: "super_admin" }}
        activePath="/admin/dashboard"
      />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {/* Admin Quick Switch Tabs */}
        <AdminHeaderTabs activeTab="dashboard" />

        {/* Header */}
        <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Dashboard Admin - Reminder & Broadcast NPT
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Kelola penugasan harian coaching dan pesan pengingat peserta.</p>
          </div>
        </div>

        {/* Form Input / Edit */}
        <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <h2 className="text-sm font-semibold text-sky-400">
              {editingId ? "✏️ Edit Reminder NPT" : "➕ Buat Reminder NPT Baru"}
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
              <Sparkles className="w-4 h-4 text-amber-400" /> Hasil Full OCR Otomatis (Seluruh Isi Teks Gambar)
            </label>
            {isProcessingOcr ? (
              <p className="text-xs text-amber-400 animate-pulse">Sedang melakukan Full OCR seluruh teks dari gambar...</p>
            ) : (
              <textarea
                rows={6}
                value={ocrText}
                onChange={(e) => setOcrText(e.target.value)}
                placeholder="Seluruh teks lengkap dari gambar materi akan diekstrak otomatis di sini (dapat Anda edit/sesuaikan kembali)..."
                className="w-full p-2.5 border border-slate-800 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-none text-slate-200 bg-slate-950 font-mono leading-relaxed"
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
            <Send className="w-4 h-4" /> {isSubmitting ? "Memproses..." : editingId ? "Update Reminder NPT" : "Publish Reminder NPT Hari Ini"}
          </button>
        </form>

        {/* List Tugas yang Sudah Rilis */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-4">
          <h3 className="font-semibold text-slate-200 text-sm border-b border-slate-800 pb-2">
            Daftar Reminder NPT yang Sudah Dipublikasikan ({tasks.length})
          </h3>
          <div className="divide-y divide-slate-800">
            {tasks.map((task, index) => (
              <div key={task.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-md bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-sky-400">{task.title}</p>
                    <p className="text-[10px] text-slate-500">Tanggal: {task.publish_date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* Tombol Pindah Urutan Ke Atas */}
                  <button
                    type="button"
                    onClick={() => handleMoveTask(index, "up")}
                    disabled={index === 0 || movingId !== null}
                    className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded transition disabled:opacity-20 disabled:cursor-not-allowed"
                    title={index === 0 ? "Sudah di posisi paling atas" : "Pindah ke Atas"}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>

                  {/* Tombol Pindah Urutan Ke Bawah */}
                  <button
                    type="button"
                    onClick={() => handleMoveTask(index, "down")}
                    disabled={index === tasks.length - 1 || movingId !== null}
                    className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded transition disabled:opacity-20 disabled:cursor-not-allowed"
                    title={index === tasks.length - 1 ? "Sudah di posisi paling bawah" : "Pindah ke Bawah"}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>

                  {/* Garis Pemisah */}
                  <span className="w-px h-4 bg-slate-800 mx-1" />

                  {/* Tombol Edit */}
                  <button
                    type="button"
                    onClick={() => handleEditInit(task)}
                    className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition"
                    title="Edit Tugas"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Tombol Hapus */}
                  <button
                    type="button"
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition"
                    title="Hapus Tugas"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}