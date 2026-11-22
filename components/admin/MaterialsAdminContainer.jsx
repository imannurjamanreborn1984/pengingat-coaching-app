"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { AppNavbar, AppSidebar } from "../layout/AppNavbar";
import AdminHeaderTabs from "./AdminHeaderTabs";
import { getSavedDeviceUser, parseUserAccess, syncDeviceUserApproval } from "@/lib/authHelper";
import { parseImageUrls, parseYouTubeUrls, getYouTubeThumbnailUrl, formatDocumentEmbedUrl } from "@/lib/utils/materialImages";
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
  ZoomIn,
  Lock,
  Eye,
  Music2
} from "lucide-react";
import ImageLightboxModal from "../ui/ImageLightboxModal";

export default function MaterialsAdminContainer() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeLightbox, setActiveLightbox] = useState(null);
  const [activeDocPreview, setActiveDocPreview] = useState(null);
  const [isKitabTheme, setIsKitabTheme] = useState(false);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('npt_theme');
      if (savedTheme === 'kitab') setIsKitabTheme(true);
      else if (savedTheme === 'dark') setIsKitabTheme(false);
    } catch (e) {}
  }, []);

  const toggleTheme = () => {
    const nextTheme = !isKitabTheme;
    setIsKitabTheme(nextTheme);
    try {
      localStorage.setItem('npt_theme', nextTheme ? 'kitab' : 'dark');
    } catch (e) {}
  };

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

  // State Gambar (Maksimal 3 Gambar per Postingan) & OCR
  const [imageSlots, setImageSlots] = useState([]); // Array of { id, file, preview, url }
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [copiedOcr, setCopiedOcr] = useState(false);

  // State Video YouTube (Maksimal 3 Video / Part per Postingan)
  const [youtubeLinks, setYoutubeLinks] = useState([""]);

  useEffect(() => {
    const saved = getSavedDeviceUser();
    if (saved) {
      setCurrentUser(saved);
      syncDeviceUserApproval(supabase, saved).then((synced) => {
        if (synced) setCurrentUser(synced);
      });
    }
    fetchMaterials();
  }, [selectedLevel]);

  const fetchMaterials = async () => {
    setIsLoading(true);
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from("npt_materials")
          .select("*")
          .eq("level", selectedLevel)
          .order("created_at", { ascending: false });

        if (!error && data) {
          setMaterials(data);
          setIsLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Supabase fetch info:", err.message);
    }
    setMaterials([]);
    setIsLoading(false);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setImageSlots([]);
    setYoutubeLinks([""]);
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
    const urls = parseImageUrls(item.image_url);
    setImageSlots(
      urls.map((u, i) => ({
        id: `existing-${i}-${Date.now()}`,
        file: null,
        preview: u,
        url: u
      }))
    );
    const yts = parseYouTubeUrls(item.youtube_url);
    setYoutubeLinks(yts.length > 0 ? yts : [""]);
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

  // Handlers untuk Video YouTube (Maksimal 3 Video / Part)
  const handleAddYoutubeLink = () => {
    if (youtubeLinks.length >= 3) {
      alert("Maksimal 3 link video YouTube per postingan materi!");
      return;
    }
    setYoutubeLinks((prev) => [...prev, ""]);
  };

  const handleUpdateYoutubeLink = (index, value) => {
    setYoutubeLinks((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleRemoveYoutubeLink = (index) => {
    setYoutubeLinks((prev) => {
      if (prev.length <= 1) return [""];
      return prev.filter((_, i) => i !== index);
    });
  };

  // Handle Unggah Gambar (Bisa 1 sampai 3 Gambar)
  const handleImagesChange = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    const remainingSlots = 3 - imageSlots.length;
    if (remainingSlots <= 0) {
      alert("Maksimal 3 gambar per postingan materi!");
      return;
    }

    const filesToAdd = selectedFiles.slice(0, remainingSlots);
    if (selectedFiles.length > remainingSlots) {
      alert(`Hanya ${remainingSlots} gambar yang ditambahkan karena batas maksimal adalah 3 gambar.`);
    }

    const newSlots = filesToAdd.map((file, idx) => ({
      id: `new-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      file: file,
      preview: URL.createObjectURL(file),
      url: null
    }));

    setImageSlots((prev) => [...prev, ...newSlots]);

    // Jalankan OCR otomatis pada file baru pertama jika teks OCR masih kosong
    if (filesToAdd.length > 0 && !formData.ocr_extracted_text) {
      const firstFile = filesToAdd[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        runOcr(reader.result, firstFile.type);
      };
      reader.readAsDataURL(firstFile);
    }

    e.target.value = "";
  };

  const handleRemoveSlot = (idToRemove) => {
    setImageSlots((prev) => prev.filter((slot) => slot.id !== idToRemove));
  };

  const handleOcrSlot = (slot) => {
    if (slot.file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        runOcr(reader.result, slot.file.type);
      };
      reader.readAsDataURL(slot.file);
    } else {
      alert("Gambar ini sudah tersimpan di Cloud. Anda bisa mengedit atau menambahkan catatan pada teks OCR di bawah.");
    }
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

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return alert("Judul materi wajib diisi!");
    setIsLoading(true);

    // 1. Upload semua file gambar baru ke Supabase Storage bucket 'materi-images'
    const finalImageUrls = [];
    for (let i = 0; i < imageSlots.length; i++) {
      const slot = imageSlots[i];
      if (slot.file) {
        try {
          if (supabase) {
            const fileExt = slot.file.name.split(".").pop();
            const fileName = `material_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
            const { error: uploadErr } = await supabase.storage
              .from("materi-images")
              .upload(fileName, slot.file);

            if (!uploadErr) {
              const { data: publicUrlData } = supabase.storage
                .from("materi-images")
                .getPublicUrl(fileName);
              finalImageUrls.push(publicUrlData.publicUrl);
            } else {
              console.warn("Storage upload warn for slot", i, uploadErr.message);
            }
          }
        } catch (err) {
          console.warn("Storage upload warn:", err.message);
        }
      } else if (slot.url) {
        finalImageUrls.push(slot.url);
      }
    }

    let finalImageUrl = null;
    if (finalImageUrls.length === 1) {
      finalImageUrl = finalImageUrls[0];
    } else if (finalImageUrls.length > 1) {
      finalImageUrl = JSON.stringify(finalImageUrls);
    }

    // 2. Format link Video YouTube (Mendukung hingga 3 link video)
    const validYoutube = youtubeLinks.map((u) => u.trim()).filter(Boolean);
    let finalYoutubeUrl = "";
    if (validYoutube.length === 1) {
      finalYoutubeUrl = validYoutube[0];
    } else if (validYoutube.length > 1) {
      finalYoutubeUrl = JSON.stringify(validYoutube);
    }

    const payload = {
      level: Number(formData.level),
      title: formData.title.trim(),
      subtitle: formData.subtitle.trim(),
      content: formData.content.trim(),
      youtube_url: finalYoutubeUrl,
      file_url: formData.file_url.trim(),
      file_name: formData.file_name.trim() || (formData.file_url ? "Dokumen Materi" : ""),
      file_type: formData.file_type,
      image_url: finalImageUrl || null,
      ocr_extracted_text: formData.ocr_extracted_text || null,
      is_published: formData.is_published,
      updated_at: new Date().toISOString()
    };

    // 2. Simpan ke Supabase DB Langsung (1x Klik Terbit Selamanya)
    try {
      if (supabase) {
        if (editingId) {
          const { error } = await supabase
            .from("npt_materials")
            .update(payload)
            .eq("id", editingId);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("npt_materials")
            .insert([{ ...payload, created_at: new Date().toISOString(), order_index: materials.length + 1 }]);
          if (error) throw error;
        }
      }
      alert("✅ Materi berhasil diterbitkan langsung ke Cloud! (Bisa langsung dibuka di HP & Laptop tanpa perlu sinkronisasi manual)");
    } catch (err) {
      console.error("Supabase save error:", err);
      // Simpan cadangan ke draft lokal browser agar ketikan tidak hilang
      try {
        const localDrafts = JSON.parse(localStorage.getItem("npt_materials_drafts") || "[]");
        const existingIdx = localDrafts.findIndex((d) => d.id === (editingId || payload.title));
        const draftItem = { ...payload, id: editingId || `draft-${Date.now()}`, local_draft: true };
        if (existingIdx >= 0) {
          localDrafts[existingIdx] = draftItem;
        } else {
          localDrafts.unshift(draftItem);
        }
        localStorage.setItem("npt_materials_drafts", JSON.stringify(localDrafts));
      } catch (localErr) {
        console.warn("Gagal simpan draft lokal:", localErr);
      }

      if (err.message && err.message.includes("Failed to fetch")) {
        alert(
          "⚠️ Gagal terhubung ke Server Cloud (Failed to fetch).\n\n" +
          "Penyebab: Database Supabase Anda kemungkinan sedang dalam status 'PAUSED' (dijeda otomatis oleh Supabase karena beberapa hari tidak ada aktivitas).\n\n" +
          "Solusi: Buka https://supabase.com/dashboard, login, lalu klik tombol 'Restore project' (hanya butuh 1-2 menit).\n\n" +
          "✅ Jangan khawatir! Ketikan dan materi Anda aman dan telah tersimpan di draft lokal browser ini."
        );
      } else {
        alert("Gagal menyimpan ke server cloud: " + err.message + "\n\n(Ketikan Anda telah diamankan di draft lokal browser)");
      }
    }

    setIsLoading(false);
    setIsModalOpen(false);
    fetchMaterials();
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus materi ini?")) return;
    setIsLoading(true);

    try {
      if (supabase) {
        const { error } = await supabase.from("npt_materials").delete().eq("id", id);
        if (error) throw error;
      }
    } catch (e) {
      alert("Gagal menghapus: " + e.message);
    }

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

  const handleEdit = (mat) => {
    handleOpenEdit(mat);
  };

  const access = parseUserAccess(currentUser);
  if (!access.isSuperAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-rose-500/30 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">Area Khusus Super Admin</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Halaman upload materi ini khusus untuk pengelola resmi NPT Centre. Akun Anda ({currentUser?.name || currentUser?.email || 'Murid'}) tidak memiliki izin akses CMS Materi.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-block px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-md shadow-rose-600/30"
            >
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
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
        <AdminHeaderTabs 
          activeTab="materials" 
          isKitabTheme={isKitabTheme}
          onToggleTheme={toggleTheme}
        />
        
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

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{selectedLevel === 0 ? "+ Tambah Modul Materi EMT" : `+ Tambah Materi NPT Level ${selectedLevel}`}</span>
            </button>
          </div>
        </div>

        {/* Level & EMT Tabs Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {/* TAB EMT (LEVEL 0) */}
          <button
            onClick={() => setSelectedLevel(0)}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
              selectedLevel === 0
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 border border-emerald-500"
                : "bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30"
            }`}
          >
            <span className="w-5 h-5 rounded-lg bg-slate-950/40 flex items-center justify-center text-[11px]">
              🎓
            </span>
            <span>EMT (Pelatihan Emosi)</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-normal">
              Khusus Guru & Umum
            </span>
          </button>

          {/* TAB NPT LEVEL 1 s/d 6 */}
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
              <span>{selectedLevel === 0 ? "Daftar Materi & Modul: EMT (Pelatihan Emosi Guru)" : `Daftar Materi: NPT Level ${selectedLevel}`}</span>
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
                {selectedLevel === 0
                  ? "Belum ada materi modul yang diupload untuk EMT. Klik tombol di atas untuk menambahkan modul/video EMT pertama!"
                  : `Belum ada materi yang diupload untuk NPT Level ${selectedLevel}. Klik tombol di atas untuk menambahkan modul pertama!`}
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
              {materials.map((mat, idx) => {
                const images = parseImageUrls(mat.image_url);
                const videos = parseYouTubeUrls(mat.youtube_url);
                const ytThumb = videos.length > 0 ? getYouTubeThumbnailUrl(videos[0]) : null;
                const moduleNumber = String(materials.length - idx).padStart(2, "0");

                return (
                  <div
                    key={mat.id || idx}
                    className="p-5 sm:p-6 rounded-3xl bg-slate-950/90 border border-slate-800/90 hover:border-slate-700/80 transition-all duration-200 shadow-xl flex flex-col lg:flex-row items-start justify-between gap-5 group"
                  >
                    {/* Visual Media Preview (YouTube Cinematic Thumbnail or Image Gallery) */}
                    {(ytThumb || images.length > 0) && (
                      <div className="w-full sm:w-56 lg:w-52 shrink-0 space-y-2">
                        {ytThumb ? (
                          <a
                            href={videos[0]}
                            target="_blank"
                            rel="noreferrer"
                            className="block relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 group/thumb shadow-lg cursor-pointer"
                            title="Tonton Preview di YouTube"
                          >
                            <img
                              src={ytThumb}
                              alt={mat.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-105"
                            />
                            {/* Dark gradient & Play icon */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex items-center justify-center">
                              <div className="w-10 h-10 rounded-full bg-red-600/90 group-hover/thumb:bg-red-500 text-white flex items-center justify-center shadow-lg transition-transform group-hover/thumb:scale-110">
                                <span className="text-sm font-black pl-0.5">▶</span>
                              </div>
                            </div>
                            <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/90 text-[10px] font-bold text-red-400 border border-red-500/30 flex items-center gap-1">
                              <Film className="w-3 h-3" />
                              <span>{videos.length > 1 ? `${videos.length} Video` : "YouTube"}</span>
                            </span>
                          </a>
                        ) : images.length > 0 ? (
                          <div
                            onClick={() =>
                              setActiveLightbox({
                                url: images[0],
                                title: `${mat.title} (Gambar 1/${images.length})`,
                              })
                            }
                            className="relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 cursor-zoom-in group/img shadow-lg"
                            title="Klik untuk Zoom In Gambar"
                          >
                            <img
                              src={images[0]}
                              alt={mat.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                            />
                            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="px-2 py-1 rounded-xl bg-slate-900/90 text-white text-[10px] font-bold flex items-center gap-1 shadow-md">
                                <ZoomIn className="w-3 h-3 text-amber-400" /> Zoom
                              </span>
                            </div>
                            <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/90 text-[10px] font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                              <ImageIcon className="w-3 h-3" />
                              <span>{images.length} Gambar</span>
                            </span>
                          </div>
                        ) : null}

                        {/* Strip foto kecil jika lebih dari 1 foto */}
                        {images.length > 1 && (
                          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-0.5">
                            {images.map((imgUrl, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() =>
                                  setActiveLightbox({
                                    url: imgUrl,
                                    title: `${mat.title} (Gambar ${i + 1}/${images.length})`,
                                  })
                                }
                                className="relative w-12 h-9 rounded-lg overflow-hidden border border-slate-800 hover:border-amber-400 shrink-0 transition"
                                title={`Zoom Foto #${i + 1}`}
                              >
                                <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Main Content Info */}
                    <div className="space-y-2 flex-1 min-w-0">
                      {/* Top Meta Line: Modul Number + Badges + Date */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[10px] font-black font-mono tracking-wider">
                          MODUL {moduleNumber}
                        </span>

                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Live Terbit</span>
                        </span>

                        {mat.created_at && (
                          <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" />
                            {new Date(mat.created_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        )}

                        {mat.file_type && mat.file_url && getFileBadge(mat.file_type)}
                      </div>

                      {/* Title & Subtitle */}
                      <div>
                        <h3 className="font-extrabold text-base sm:text-lg text-white group-hover:text-rose-300 transition-colors tracking-tight leading-snug">
                          {mat.title}
                        </h3>
                        {mat.subtitle && (
                          <p className="text-xs text-amber-400 font-semibold flex items-center gap-1.5 pt-0.5">
                            <span>•</span>
                            <span>{mat.subtitle}</span>
                          </p>
                        )}
                      </div>

                      {/* Content Excerpt */}
                      {mat.content && (
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed whitespace-pre-line pt-0.5">
                          {mat.content}
                        </p>
                      )}

                      {/* Footer Link / Attachments */}
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px]">
                        {mat.file_url && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setActiveDocPreview({
                                  url: mat.file_url,
                                  name: mat.file_name,
                                  type: mat.file_type
                                })
                              }
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/30 text-[11px] font-bold cursor-pointer transition"
                              title="Lihat Pratinjau Dokumen Langsung di Web"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Preview: {mat.file_name || "Dokumen"}</span>
                            </button>
                            <a
                              href={mat.file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-400 hover:text-white transition"
                              title="Buka link asli di tab baru / unduh"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        )}

                        {videos.length > 0 && (
                          <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                            {videos.some((v) => v.includes("tiktok.com")) ? (
                              <span className="text-cyan-400 flex items-center gap-1 font-bold">
                                <Music2 className="w-3.5 h-3.5 text-rose-400" />
                                <span>{videos.length} Video (Ada TikTok)</span>
                              </span>
                            ) : (
                              <span className="text-slate-400 flex items-center gap-1">
                                <Film className="w-3.5 h-3.5 text-red-500" />
                                <span>{videos.length} Sesi Video Terlampir</span>
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 self-end lg:self-center shrink-0 pt-2 lg:pt-0">
                      <button
                        onClick={() => handleOpenEdit(mat)}
                        className="px-3.5 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-white border border-sky-500/25 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-xs"
                        title="Edit Modul Materi"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(mat.id)}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/25 transition cursor-pointer shadow-xs"
                        title="Hapus Modul Materi"
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-rose-500 font-semibold"
                  >
                    <option value={0}>🎓 EMT (Pelatihan Emosi)</option>
                    {[1, 2, 3, 4, 5, 6].map((l) => (
                      <option key={l} value={l}>NPT Level {l} {l === 6 ? '(14 Akar)' : ''}</option>
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

              {/* SECTION 1: UNGGAH GAMBAR (BISA 1 - 3 GAMBAR) & AUTO FULL OCR */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4" /> Unggah Gambar Materi ({imageSlots.length}/3 Gambar)
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Mendukung 1 s/d 3 gambar per postingan
                  </span>
                </div>

                {imageSlots.length < 3 ? (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImagesChange}
                      className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      *Bisa pilih langsung 2-3 gambar sekaligus atau tambah satu per satu (maksimal 3 gambar).
                    </p>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 font-semibold flex items-center justify-between">
                    <span>✅ Kuota maksimal 3 gambar sudah terisi.</span>
                    <span className="text-[10px] text-slate-400">Hapus salah satu jika ingin mengganti</span>
                  </div>
                )}

                {/* Grid Preview 1-3 Gambar */}
                {imageSlots.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    {imageSlots.map((slot, idx) => (
                      <div
                        key={slot.id}
                        className="relative rounded-xl border border-slate-800 overflow-hidden bg-slate-900 flex flex-col group shadow-md"
                      >
                        <div className="relative h-28 w-full bg-slate-950 flex items-center justify-center overflow-hidden">
                          <img
                            src={slot.preview}
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                          <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-slate-950/80 text-white text-[9px] font-bold border border-slate-700">
                            Gambar #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSlot(slot.id)}
                            className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white transition cursor-pointer shadow-md"
                            title="Hapus gambar ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setActiveLightbox({
                                url: slot.preview,
                                title: `Preview Gambar #${idx + 1}`,
                              })
                            }
                            className="absolute bottom-1.5 right-1.5 p-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-amber-400 transition cursor-pointer text-[10px] flex items-center gap-1"
                            title="Perbesar"
                          >
                            <ZoomIn className="w-3 h-3" />
                          </button>
                        </div>

                        {slot.file && (
                          <div className="p-1.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => handleOcrSlot(slot)}
                              disabled={isProcessingOcr}
                              className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              <Sparkles className="w-3 h-3" /> Scan OCR
                            </button>
                            <span className="text-[9px] text-slate-500 truncate max-w-[100px]">
                              {slot.file.name}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Box Hasil OCR */}
                {imageSlots.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> Hasil Full OCR Otomatis Gemini AI:
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

              {/* SECTION 4: LINK VIDEO PEMBELAJARAN (YOUTUBE / TIKTOK) */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                    <Film className="w-4 h-4 text-red-500" />
                    <span>Link Video Materi (YouTube / TikTok) ({youtubeLinks.filter((u) => u.trim()).length}/3 Video)</span>
                  </label>
                  {youtubeLinks.length < 3 && (
                    <button
                      type="button"
                      onClick={handleAddYoutubeLink}
                      className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> + Tambah Video (Part Lain)
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {youtubeLinks.map((link, idx) => {
                    const isTikTok = (link || "").toLowerCase().includes("tiktok.com");
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-2 rounded-xl text-[10px] font-bold shrink-0 border transition ${
                            isTikTok
                              ? "bg-rose-950/60 text-cyan-300 border-rose-500/40"
                              : "bg-slate-900 text-slate-400 border-slate-800"
                          }`}
                        >
                          Part {idx + 1} {isTikTok ? "🎵 TikTok" : "▶ YouTube"}
                        </span>
                        <input
                          type="url"
                          placeholder={`Tempel link YouTube (youtu.be/...) atau TikTok (tiktok.com/@.../video/...)`}
                          value={link}
                          onChange={(e) => handleUpdateYoutubeLink(idx, e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-red-500 font-sans"
                        />
                        {youtubeLinks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveYoutubeLink(idx)}
                            className="p-2 rounded-xl bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 transition cursor-pointer"
                            title="Hapus slot video ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-500">
                  *Mendukung link <strong>YouTube</strong> (Layar Lebar 16:9) dan link <strong>TikTok</strong> (Vertikal 9:16). Peserta di NPT (Level 6 dll) bisa langsung menonton video tanpa keluar web.
                </p>
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

      {/* Document Preview Modal */}
      {activeDocPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2 min-w-0">
                <Eye className="w-4 h-4 text-sky-400 shrink-0" />
                <h3 className="text-sm font-bold text-white truncate">
                  Pratinjau Dokumen: {activeDocPreview.name || "Lampiran"}
                </h3>
              </div>
              <button
                onClick={() => setActiveDocPreview(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                title="Tutup Pratinjau"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 w-full min-h-[500px] bg-black">
              <iframe
                src={formatDocumentEmbedUrl(activeDocPreview.url).embedUrl}
                title={activeDocPreview.name}
                className="w-full h-full border-0 min-h-[500px]"
                allow="autoplay; fullscreen"
                allowFullScreen
              />
            </div>
            <div className="p-3 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <span>💡 Pratinjau interaktif tersemat via Google Cloud / Drive.</span>
              <a
                href={activeDocPreview.url}
                target="_blank"
                rel="noreferrer"
                className="text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-1 font-bold"
              >
                <span>Buka di Tab Baru / Unduh Asli</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
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
