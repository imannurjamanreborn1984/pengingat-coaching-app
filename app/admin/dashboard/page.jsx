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
  const [isKitabTheme, setIsKitabTheme] = useState(true);
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
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${
      isKitabTheme 
        ? 'bg-parchment text-[#231409]' 
        : 'bg-slate-950 text-slate-100'
    }`}>
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
        <AdminHeaderTabs 
          activeTab="dashboard" 
          isKitabTheme={isKitabTheme}
          onToggleTheme={() => setIsKitabTheme(!isKitabTheme)}
        />

        {/* Header */}
        <div className={`border-b pb-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 ${
          isKitabTheme ? 'border-[#dfcfb0]' : 'border-slate-800'
        }`}>
          <div>
            <h1 className={`text-xl sm:text-2xl font-bold ${
              isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-white'
            }`}>
              Dashboard Admin - Reminder & Broadcast NPT
            </h1>
            <p className={`text-xs mt-1 ${isKitabTheme ? 'text-[#634224]' : 'text-slate-400'}`}>
              Kelola penugasan harian coaching dan pesan pengingat peserta.
            </p>
          </div>
        </div>

        {/* Form Input / Edit */}
        <form onSubmit={handleSubmit} className={`space-y-6 p-6 rounded-3xl shadow-sm ${
          isKitabTheme ? 'card-kitab-frame' : 'bg-slate-900 border border-slate-800'
        }`}>
          <div className={`flex justify-between items-center border-b pb-3 ${
            isKitabTheme ? 'border-[#dfcfb0]' : 'border-slate-800'
          }`}>
            <h2 className={`text-sm font-bold flex items-center gap-2 ${
              isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-sky-400'
            }`}>
              {editingId ? "✏️ Edit Reminder NPT" : "➕ Buat Reminder NPT Baru"}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className={`text-xs flex items-center gap-1 font-semibold cursor-pointer ${
                  isKitabTheme ? 'text-[#9e2a2b] hover:underline' : 'text-rose-400 hover:underline'
                }`}
              >
                <X className="w-3.5 h-3.5" /> Batal Edit
              </button>
            )}
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1 ${
              isKitabTheme ? 'text-[#3a2211]' : 'text-slate-300'
            }`}>
              Judul Modul / Hari Ke-
            </label>
            <input
              type="text"
              placeholder="Contoh: Refleksi Nur dan Nar Diri - Hari ke-1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none ${
                isKitabTheme
                  ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b] placeholder:text-[#9e876a]'
                  : 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:ring-1 focus:ring-sky-500'
              }`}
              required
            />
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1 flex items-center gap-1.5 ${
              isKitabTheme ? 'text-[#3a2211]' : 'text-slate-300'
            }`}>
              <FileText className={`w-4 h-4 ${isKitabTheme ? 'text-[#9e2a2b]' : 'text-sky-400'}`} /> Teks Pesan dari Group Chat WA
            </label>
            <textarea
              rows={3}
              placeholder="Paste pesan / pengantar instruksi dari mentor di sini..."
              value={groupChatText}
              onChange={(e) => setGroupChatText(e.target.value)}
              className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none ${
                isKitabTheme
                  ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b] placeholder:text-[#9e876a]'
                  : 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:ring-1 focus:ring-sky-500'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1 ${
              isKitabTheme ? 'text-[#3a2211]' : 'text-slate-300'
            }`}>
              Unggah Gambar Materi (Poster/Soal)
            </label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange} 
              className={`w-full text-xs ${isKitabTheme ? 'text-[#634224]' : 'text-slate-400'}`} 
            />
            {preview && (
              <div className={`mt-3 relative w-48 h-48 border rounded-xl overflow-hidden ${
                isKitabTheme ? 'bg-[#fdfbf6] border-[#decba4]' : 'bg-slate-950 border-slate-800'
              }`}>
                <img src={preview} alt="Preview" className="w-full h-full object-contain" />
              </div>
            )}
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1 flex items-center gap-1.5 ${
              isKitabTheme ? 'text-[#3a2211]' : 'text-slate-300'
            }`}>
              <Sparkles className={`w-4 h-4 ${isKitabTheme ? 'text-[#b38b42]' : 'text-amber-400'}`} /> Hasil Full OCR Otomatis (Seluruh Isi Teks Gambar)
            </label>
            {isProcessingOcr ? (
              <p className={`text-xs animate-pulse font-semibold ${
                isKitabTheme ? 'text-[#b38b42]' : 'text-amber-400'
              }`}>
                Sedang melakukan Full OCR seluruh teks dari gambar...
              </p>
            ) : (
              <textarea
                rows={6}
                value={ocrText}
                onChange={(e) => setOcrText(e.target.value)}
                placeholder="Seluruh teks lengkap dari gambar materi akan diekstrak otomatis di sini (dapat Anda edit/sesuaikan kembali)..."
                className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none font-mono leading-relaxed ${
                  isKitabTheme
                    ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b] placeholder:text-[#9e876a]'
                    : 'bg-slate-950 border-slate-800 text-slate-200 focus:ring-1 focus:ring-sky-500'
                }`}
              />
            )}
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1 flex items-center gap-1.5 ${
              isKitabTheme ? 'text-[#3a2211]' : 'text-slate-300'
            }`}>
              <LinkIcon className={`w-4 h-4 ${isKitabTheme ? 'text-[#1b6b55]' : 'text-emerald-400'}`} /> Link Eksternal (Opsional)
            </label>
            <input
              type="text"
              placeholder="https://youtube.com/watch?v=... (Boleh dikosongkan)"
              value={externalLink}
              onChange={(e) => setExternalLink(e.target.value)}
              className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none ${
                isKitabTheme
                  ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b] placeholder:text-[#9e876a]'
                  : 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:ring-1 focus:ring-sky-500'
              }`}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer shadow-md ${
              isKitabTheme
                ? 'bg-gradient-to-r from-[#9e2a2b] via-[#b38b42] to-[#8f632d] hover:brightness-110 shadow-amber-900/20'
                : 'bg-sky-600 hover:bg-sky-500 shadow-sky-600/30'
            }`}
          >
            <Send className="w-4 h-4" /> {isSubmitting ? "Memproses..." : editingId ? "Update Reminder NPT" : "Publish Reminder NPT Hari Ini"}
          </button>
        </form>

        {/* List Tugas yang Sudah Rilis */}
        <div className={`p-6 rounded-3xl space-y-4 shadow-sm ${
          isKitabTheme ? 'card-kitab-frame' : 'bg-slate-900 border border-slate-800'
        }`}>
          <h3 className={`font-bold text-sm border-b pb-3 ${
            isKitabTheme ? 'font-kitab-title text-[#26150a] border-[#dfcfb0]' : 'text-slate-200 border-slate-800'
          }`}>
            Daftar Reminder NPT yang Sudah Dipublikasikan ({tasks.length})
          </h3>
          <div className={`divide-y ${isKitabTheme ? 'divide-[#dfcfb0]' : 'divide-slate-800'}`}>
            {tasks.map((task, index) => (
              <div key={task.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-lg border text-xs font-bold font-mono flex items-center justify-center ${
                    isKitabTheme
                      ? 'bg-[#eee3cb] border-[#d8c3a1] text-[#634224]'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}>
                    {index + 1}
                  </span>
                  <div>
                    <p className={`text-xs font-bold ${
                      isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-sky-400'
                    }`}>{task.title}</p>
                    <p className={`text-[10px] ${isKitabTheme ? 'text-[#82613d]' : 'text-slate-500'}`}>
                      Tanggal: {task.publish_date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* Tombol Pindah Urutan Ke Atas */}
                  <button
                    type="button"
                    onClick={() => handleMoveTask(index, "up")}
                    disabled={index === 0 || movingId !== null}
                    className={`p-1.5 rounded-lg transition cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed ${
                      isKitabTheme
                        ? 'text-[#634224] hover:text-[#26150a] hover:bg-[#dfcdab]'
                        : 'text-slate-400 hover:text-sky-400 hover:bg-slate-800'
                    }`}
                    title={index === 0 ? "Sudah di posisi paling atas" : "Pindah ke Atas"}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>

                  {/* Tombol Pindah Urutan Ke Bawah */}
                  <button
                    type="button"
                    onClick={() => handleMoveTask(index, "down")}
                    disabled={index === tasks.length - 1 || movingId !== null}
                    className={`p-1.5 rounded-lg transition cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed ${
                      isKitabTheme
                        ? 'text-[#634224] hover:text-[#26150a] hover:bg-[#dfcdab]'
                        : 'text-slate-400 hover:text-sky-400 hover:bg-slate-800'
                    }`}
                    title={index === tasks.length - 1 ? "Sudah di posisi paling bawah" : "Pindah ke Bawah"}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>

                  {/* Garis Pemisah */}
                  <span className={`w-px h-4 mx-1 ${isKitabTheme ? 'bg-[#dfcfb0]' : 'bg-slate-800'}`} />

                  {/* Tombol Edit */}
                  <button
                    type="button"
                    onClick={() => handleEditInit(task)}
                    className={`p-1.5 rounded-lg border transition cursor-pointer ${
                      isKitabTheme
                        ? 'bg-[#eee3cb] text-[#8f632d] border-[#d8c3a1] hover:bg-[#dfcdab]'
                        : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'
                    }`}
                    title="Edit Tugas"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Tombol Hapus */}
                  <button
                    type="button"
                    onClick={() => handleDeleteTask(task.id)}
                    className={`p-1.5 rounded-lg border transition cursor-pointer ${
                      isKitabTheme
                        ? 'bg-[#edd8b6] text-[#9e2a2b] border-[#cbb38b] hover:bg-[#dfcdab]'
                        : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                    }`}
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