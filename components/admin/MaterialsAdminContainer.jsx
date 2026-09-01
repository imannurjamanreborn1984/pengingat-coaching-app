"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { AppNavbar, AppSidebar } from "../layout/AppNavbar";
import AdminHeaderTabs from "./AdminHeaderTabs";
import {
  BookOpen,
  Plus,
  Edit3,
  Trash2,
  FileText,
  Video,
  FileUp,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  ExternalLink,
  Save,
  X,
  File,
  Film,
  Image as ImageIcon,
  Copy,
  Check,
  ZoomIn
} from "lucide-react";
import ImageLightboxModal from "../ui/ImageLightboxModal";

export default function MaterialsAdminContainer() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeLightbox, setActiveLightbox] = useState(null);

  // Form State Tambah / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    level: 1,
    title: "",
    subtitle: "",
    content: "",
    youtube_url: "",
    file_url: "",
    file_name: "",
    file_type: "pdf", // 'pdf' | 'ppt' | 'docx' | 'gdrive'
    image_url: "",
    ocr_extracted_text: "",
    is_published: true
  });

  // State Gambar & OCR
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [copiedOcr, setCopiedOcr] = useState(false);

  const [isTableMissing, setIsTableMissing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    try {
      const authStr = localStorage.getItem("npt_user_auth");
      if (authStr) {
        setCurrentUser(JSON.parse(authStr));
      }
    } catch (e) {}
    fetchMaterials();
  }, [selectedLevel]);

  const fetchMaterials = async () => {
    setIsLoading(true);
    let cloudData = null;
    let tableMissingErr = false;

    try {
      if (supabase) {
        const { data, error } = await supabase
          .from("npt_materials")
          .select("*")
          .eq("level", selectedLevel)
          .order("order_index", { ascending: true });

        if (error) {
          if (error.message?.includes("npt_materials") || error.code === "PGRST205") {
            tableMissingErr = true;
          }
        } else if (data) {
          cloudData = data;
          setIsTableMissing(false);
        }
      }
    } catch (err) {
      console.warn("Supabase fetch info:", err.message);
    }

    setIsTableMissing(tableMissingErr);

    // Ambil data lokal
    let localData = [];
    try {
      const raw = localStorage.getItem(`npt_materials_level_${selectedLevel}`);
      if (raw) localData = JSON.parse(raw);
    } catch (e) {}

    // Jika cloud ada data, prioritaskan cloud
    if (cloudData && cloudData.length > 0) {
      setMaterials(cloudData);
    } else if (localData.length > 0) {
      setMaterials(localData);
    } else if (cloudData) {
      setMaterials(cloudData);
    } else {
      setMaterials([]);
    }

    setIsLoading(false);
  };

  const handleSyncToCloud = async () => {
    setIsSyncing(true);
    try {
      if (!supabase) throw new Error("Supabase client belum siap.");

      let totalSynced = 0;
      const allLevels = [1, 2, 3, 4, 5, 6];

      for (const lvl of allLevels) {
        let localData = [];
        try {
          const raw = localStorage.getItem(`npt_materials_level_${lvl}`);
          if (raw) localData = JSON.parse(raw);
        } catch (e) {}

        if (localData.length > 0) {
          for (const item of localData) {
            const { id, ...cleanPayload } = item;
            const { error } = await supabase.from("npt_materials").insert([
              {
                ...cleanPayload,
                level: Number(cleanPayload.level || lvl),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ]);
            if (!error) totalSynced++;
          }
        }
      }

      if (totalSynced === 0) {
        alert("Tidak ada data materi lokal di laptop yang perlu disinkronkan.");
      } else {
        alert(`✅ Sempurna! Berhasil menyinkronkan total ${totalSynced} materi dari seluruh Level (Level 1 – 6) dari laptop ke Cloud Supabase! Sekarang di HP dan seluruh Member sudah muncul.`);
      }

      fetchMaterials();
    } catch (err) {
      alert("Gagal sinkron: " + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setImageFile(null);
    setImagePreview(null);
    setCopiedOcr(false);
    setFormData({
      level: selectedLevel,
      title: "",
      subtitle: "",
      content: "",
      youtube_url: "",
      file_url: "",
      file_name: "",
      file_type: "pdf",
      image_url: "",
      ocr_extracted_text: "",
      is_published: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setImageFile(null);
    setImagePreview(item.image_url || null);
    setCopiedOcr(false);
    setFormData({
      level: item.level || selectedLevel,
      title: item.title || "",
      subtitle: item.subtitle || "",
      content: item.content || "",
      youtube_url: item.youtube_url || "",
      file_url: item.file_url || "",
      file_name: item.file_name || "",
      file_type: item.file_type || "pdf",
      image_url: item.image_url || "",
      ocr_extracted_text: item.ocr_extracted_text || "",
      is_published: item.is_published !== false
    });
    setIsModalOpen(true);
  };

  // Handle Gambar & Jalankan OCR
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));

    // Ekstrak teks via OCR otomatis menggunakan Gemini API /api/ocr
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
      if (data.success && data.text) {
        setFormData((prev) => ({
          ...prev,
          ocr_extracted_text: data.text,
          // Jika isi materi masih kosong, otomatis isikan teks OCR
          content: prev.content ? prev.content : data.text
        }));
      } else {
        alert("Gagal mengekstrak teks dari gambar: " + (data.error || "Gagal OCR"));
      }
    } catch (err) {
      console.error("OCR Error:", err);
    } finally {
      setIsProcessingOcr(false);
    }
  };

  const handleCopyOcrToContent = () => {
    if (!formData.ocr_extracted_text) return;
    setFormData((prev) => ({
      ...prev,
      content: prev.content
        ? `${prev.content}\n\n${prev.ocr_extracted_text}`
        : prev.ocr_extracted_text
    }));
    setCopiedOcr(true);
    setTimeout(() => setCopiedOcr(false), 2000);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, image_url: "" }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return alert("Judul materi wajib diisi!");
    setIsLoading(true);

    let finalImageUrl = formData.image_url || imagePreview;

    // 1. Upload Gambar ke Supabase Storage bucket 'materi-images' jika ada file baru
    if (imageFile) {
      try {
        if (supabase) {
          const fileExt = imageFile.name.split(".").pop();
          const fileName = `material_${Date.now()}.${fileExt}`;
          const { error: uploadErr } = await supabase.storage
            .from("materi-images")
            .upload(fileName, imageFile);

          if (!uploadErr) {
            const { data: publicUrlData } = supabase.storage
              .from("materi-images")
              .getPublicUrl(fileName);
            finalImageUrl = publicUrlData.publicUrl;
          }
        }
      } catch (err) {
        console.warn("Storage upload warn:", err.message);
      }
    }

    const payload = {
      level: Number(formData.level),
      title: formData.title.trim(),
      subtitle: formData.subtitle.trim(),
      content: formData.content.trim(),
      youtube_url: formData.youtube_url.trim(),
      file_url: formData.file_url.trim(),
      file_name: formData.file_name.trim() || (formData.file_url ? "Dokumen Materi" : ""),
      file_type: formData.file_type,
      image_url: finalImageUrl || null,
      ocr_extracted_text: formData.ocr_extracted_text || null,
      is_published: formData.is_published,
      updated_at: new Date().toISOString()
    };

    let saved = false;

    // 2. Simpan ke Supabase DB
    try {
      if (supabase) {
        if (editingId) {
          const { error } = await supabase
            .from("npt_materials")
            .update(payload)
            .eq("id", editingId);
          if (!error) saved = true;
        } else {
          const { error } = await supabase
            .from("npt_materials")
            .insert([{ ...payload, created_at: new Date().toISOString(), order_index: materials.length + 1 }]);
          if (!error) saved = true;
        }
      }
    } catch (err) {
      console.warn("Supabase save error, fallback to local:", err.message);
    }

    // 3. Simpan ke LocalStorage agar selalu instan
    try {
      const localKey = `npt_materials_level_${formData.level}`;
      const existing = JSON.parse(localStorage.getItem(localKey) || "[]");
      let updated;
      if (editingId) {
        updated = existing.map((m) => (m.id === editingId ? { ...m, ...payload } : m));
      } else {
        const newItem = { id: "local_" + Date.now(), ...payload };
        updated = [...existing, newItem];
      }
      localStorage.setItem(localKey, JSON.stringify(updated));
    } catch (e) {}

    setIsLoading(false);
    setIsModalOpen(false);
    alert("✅ Materi berhasil disimpan dan siap diakses peserta!");
    fetchMaterials();
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus materi ini?")) return;
    setIsLoading(true);

    try {
      if (supabase) {
        await supabase.from("npt_materials").delete().eq("id", id);
      }
    } catch (e) {}

    try {
      const localKey = `npt_materials_level_${selectedLevel}`;
      const existing = JSON.parse(localStorage.getItem(localKey) || "[]");
      const updated = existing.filter((m) => m.id !== id);
      localStorage.setItem(localKey, JSON.stringify(updated));
    } catch (e) {}

    setIsLoading(false);
    fetchMaterials();
  };

  // Helper Ikon Tipe File
  const getFileBadge = (type) => {
    switch (type) {
      case "pdf":
        return <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">📄 PDF</span>;
      case "ppt":
        return <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">📊 PPT / Slide</span>;
      case "docx":
        return <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold">📝 Word / DOCX</span>;
      case "gdrive":
        return <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">☁️ Google Drive</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-bold">📎 Dokumen</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-600 selection:text-white">
      <AppNavbar
        onToggleSidebar={() => setIsSidebarOpen(true)}
        currentUser={currentUser}
        activeTitle="Kelola Materi NPT (Level 1 – 6)"
      />
      <AppSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentUser={currentUser}
        activePath="/admin/materials"
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 pb-24 space-y-6">
        {/* Admin Quick Switch Tabs */}
        <AdminHeaderTabs activeTab="materials" />
        
        {/* Top Header Card */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30">
                CMS ADMIN
              </span>
              <h1 className="text-lg sm:text-xl font-bold text-white">
                Ruang Upload Materi NPT Multi-Level
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              Kelola bahan belajar peserta: <strong>Gambar/Infografis + AI OCR</strong>, Teks Modul, File <strong>PDF, PPT, Word (DOCX)</strong>, dan Video YouTube.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {materials.length > 0 && (
              <button
                onClick={handleSyncToCloud}
                disabled={isSyncing}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-bold border border-sky-500/30 flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                title="Sinkronkan materi tersimpan di laptop ini ke cloud database Supabase agar muncul di HP & semua member"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{isSyncing ? "Menyinkronkan..." : "⚡ Sinkronkan ke Cloud (HP)"}</span>
              </button>
            )}

            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Materi NPT Level {selectedLevel}</span>
            </button>
          </div>
        </div>

        {/* Banner Peringatan jika tabel Supabase belum dibuat */}
        {isTableMissing && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <span>⚠️ Perhatian: Tabel Database Cloud Supabase (npt_materials) Belum Dibuat</span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
              Materi yang Anda simpan saat ini tersimpan sementara di memori browser Laptop Anda (sehingga di HP belum muncul).
              Agar materi otomatis tersinkronisasi ke <strong>HP dan seluruh akun Member</strong>, silakan buat tabel di Supabase SQL Editor sekali saja.
            </p>
          </div>
        )}

        {/* Level Tabs Selector (1 s/d 6) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[1, 2, 3, 4, 5, 6].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                selectedLevel === lvl
                  ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30 border border-rose-500"
                  : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
              }`}
            >
              <span className="w-5 h-5 rounded-lg bg-slate-950/40 flex items-center justify-center text-[11px]">
                {lvl}
              </span>
              <span>NPT Level {lvl}</span>
              {lvl === 6 && (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-normal">
                  14 Akar
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Material List per Level */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-rose-400" />
              <span>Daftar Materi: NPT Level {selectedLevel}</span>
            </h2>
            <span className="text-xs text-slate-400">{materials.length} Modul Terbit</span>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Memuat data materi...
            </div>
          ) : materials.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Belum ada materi yang diupload untuk <strong>NPT Level {selectedLevel}</strong>. Klik tombol di atas untuk menambahkan modul pertama!
              </p>
              <button
                onClick={handleOpenAdd}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-rose-400 border border-rose-500/20 transition cursor-pointer"
              >
                + Tambah Materi Sekarang
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {materials.map((mat, idx) => (
                <div
                  key={mat.id || idx}
                  className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex flex-col md:flex-row items-start justify-between gap-4"
                >
                  <div className="space-y-2.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-slate-100">
                        {mat.title}
                      </span>
                      {mat.subtitle && (
                        <span className="text-xs text-amber-400 font-medium">
                          • {mat.subtitle}
                        </span>
                      )}
                      {mat.image_url && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" /> Gambar / OCR
                        </span>
                      )}
                      {mat.file_type && mat.file_url && getFileBadge(mat.file_type)}
                      {mat.youtube_url && (
                        <span className="px-2 py-0.5 rounded-md bg-red-600/20 text-red-400 border border-red-500/30 text-[10px] font-bold flex items-center gap-1">
                          <Film className="w-3 h-3" /> Video
                        </span>
                      )}
                    </div>

                    {/* Thumbnail Gambar jika ada */}
                    {mat.image_url && (
                      <div
                        onClick={() => setActiveLightbox({ url: mat.image_url, title: mat.title })}
                        className="relative w-40 h-28 rounded-xl overflow-hidden border border-slate-800 bg-slate-900 cursor-zoom-in group shadow-md"
                        title="Klik untuk Zoom In / Out Preview"
                      >
                        <img
                          src={mat.image_url}
                          alt={mat.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="px-2 py-1 rounded-lg bg-slate-900/90 text-white text-[10px] font-bold flex items-center gap-1">
                            <ZoomIn className="w-3 h-3 text-amber-400" /> Zoom
                          </span>
                        </div>
                      </div>
                    )}

                    {mat.content && (
                      <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed whitespace-pre-line">
                        {mat.content}
                      </p>
                    )}

                    {mat.file_url && (
                      <a
                        href={mat.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:underline pt-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Buka Lampiran: {mat.file_name || mat.file_url}</span>
                      </a>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                    <button
                      onClick={() => handleOpenEdit(mat)}
                      className="p-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 transition cursor-pointer"
                      title="Edit Materi"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(mat.id)}
                      className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition cursor-pointer"
                      title="Hapus Materi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* MODAL INPUT / EDIT MATERI LENGKAP DENGAN UPLOAD GAMBAR & OCR */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-slate-900 border border-rose-500/30 rounded-3xl p-6 shadow-2xl space-y-4 text-left my-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">
                  {editingId ? "Edit Materi NPT" : "Tambah Materi NPT Baru"}
                </h3>
                <p className="text-[10px] text-slate-400">
                  Untuk NPT Level {formData.level} (Mendukung Gambar + OCR, PDF, PPT, Word, Video)
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Pilih Level
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-rose-500"
                  >
                    {[1, 2, 3, 4, 5, 6].map((l) => (
                      <option key={l} value={l}>Level {l}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Sub-Judul / Topik (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Modul 1 / Pengenalan"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Judul Materi Utama *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pemrograman Gelombang Pikiran & Afirmasi Qolbu"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-rose-500"
                />
              </div>

              {/* SECTION 1: UNGGAH GAMBAR & AUTO FULL OCR */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4" /> Unggah Gambar Materi (Poster / Slide / Catatan)
                  </label>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-[10px] text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" /> Hapus Gambar
                    </button>
                  )}
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
                />

                {imagePreview && (
                  <div className="flex items-start gap-3 pt-1">
                    <div className="relative w-28 h-28 rounded-xl border border-slate-800 overflow-hidden bg-slate-900 shrink-0">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" /> Hasil Full OCR Otomatis:
                        </span>
                        {formData.ocr_extracted_text && (
                          <button
                            type="button"
                            onClick={handleCopyOcrToContent}
                            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-sky-400 flex items-center gap-1 transition cursor-pointer"
                          >
                            {copiedOcr ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedOcr ? "Disalin!" : "Salin ke Isi Materi"}</span>
                          </button>
                        )}
                      </div>

                      {isProcessingOcr ? (
                        <p className="text-xs text-amber-400 animate-pulse font-mono py-2">
                          Sedang membaca seluruh teks dari gambar via OCR Gemini AI...
                        </p>
                      ) : (
                        <textarea
                          rows={3}
                          value={formData.ocr_extracted_text || ""}
                          onChange={(e) => setFormData({ ...formData, ocr_extracted_text: e.target.value })}
                          placeholder="Teks dari gambar yang terbaca OCR..."
                          className="w-full p-2 rounded-xl border border-slate-800 text-[11px] focus:outline-hidden text-slate-300 bg-slate-900 font-mono leading-relaxed"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 2: ISI MATERI / PENJELASAN PANDUAN */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Isi Materi / Penjelasan Panduan Lengkap
                </label>
                <textarea
                  rows={4}
                  placeholder="Tuliskan intisari materi, langkah latihan, atau penjelasan panduan di sini..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-rose-500 font-sans leading-relaxed"
                />
              </div>

              {/* SECTION 3: LAMPIRAN FILE DOKUMEN (PDF, PPT, WORD) */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <span className="text-xs font-bold text-amber-300 block">
                  📁 Lampiran File Dokumen (PDF / PPT / Word)
                </span>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <select
                      value={formData.file_type}
                      onChange={(e) => setFormData({ ...formData, file_type: e.target.value })}
                      className="w-full px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-hidden"
                    >
                      <option value="pdf">📄 PDF</option>
                      <option value="ppt">📊 PPT / Slide</option>
                      <option value="docx">📝 Word / DOCX</option>
                      <option value="gdrive">☁️ Google Drive</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Nama File (cth: Modul-Latihan-1.pdf)"
                      value={formData.file_name}
                      onChange={(e) => setFormData({ ...formData, file_name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <input
                    type="url"
                    placeholder="Link URL Dokumen (Google Drive / Dropbox / Cloud Storage link)..."
                    value={formData.file_url}
                    onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-hidden"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    *Tempelkan link share Google Drive (PDF/PPT/Word) yang bisa dibuka peserta.
                  </p>
                </div>
              </div>

              {/* SECTION 4: LINK VIDEO YOUTUBE */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Link Video YouTube Pembelajaran (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={formData.youtube_url}
                  onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading || isProcessingOcr}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-xs font-bold text-white shadow-md shadow-rose-600/30 transition cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? "Menyimpan..." : "Simpan & Publikasikan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Zoom In / Out Modal */}
      <ImageLightboxModal
        isOpen={!!activeLightbox}
        imageUrl={activeLightbox?.url}
        title={activeLightbox?.title}
        onClose={() => setActiveLightbox(null)}
      />
    </div>
  );
}
