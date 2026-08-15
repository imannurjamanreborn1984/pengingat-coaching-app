"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Upload, Sparkles, Send, Link as LinkIcon, FileText } from "lucide-react";

export default function AdminDashboard() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState("");
  const [groupChatText, setGroupChatText] = useState("");
  const [externalLink, setExternalLink] = useState("");
  const [ocrText, setOcrText] = useState("");
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Handle Pilihan Gambar & Auto OCR
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));

    // Konversi Gambar ke Base64 untuk dikirim ke API OCR Gemini
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Data = reader.result.split(",")[1];
      runOcr(base64Data, file.type);
    };
  };

  // 2. Panggil API OCR Gemini
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

  // 3. Simpan Task ke Database Supabase
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) return alert("Judul tugas wajib diisi!");
    setIsSubmitting(true);

    try {
      let imageUrl = "";

      // Upload Gambar ke Supabase Storage (Bucket: materi-images)
      if (image) {
        const fileExt = image.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { data, error: uploadErr } = await supabase.storage
          .from("materi-images")
          .upload(fileName, image);

        if (uploadErr) throw uploadErr;

        const { data: publicUrlData } = supabase.storage
          .from("materi-images")
          .getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      }

      // Simpan data ke tabel assignments
      const { error } = await supabase.from("assignments").insert([
        {
          title,
          image_url: imageUrl,
          ocr_extracted_text: ocrText,
          group_chat_text: groupChatText,
          external_link: externalLink,
          publish_date: new Date().toISOString().split("T")[0],
        },
      ]);

      if (error) throw error;

      alert("Tugas harian berhasil dipublikasikan!");
      // Reset Form
      setTitle("");
      setImage(null);
      setPreview(null);
      setGroupChatText("");
      setExternalLink("");
      setOcrText("");
    } catch (err) {
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Admin - Buat To-Do Harian</h1>
        <p className="text-sm text-slate-500">Persiapan Event 22 Agustus 2026</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border shadow-sm">
        {/* Judul Modul */}
        <div>
          <label className="block text-sm font-medium mb-1">Judul Modul / Hari Ke-</label>
          <input
            type="text"
            placeholder="Contoh: Refleksi Nur dan Nar Diri - Hari ke-1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
            required
          />
        </div>

        {/* Input Text Chat Grup */}
        <div>
          <label className="block text-sm font-medium mb-1 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-sky-600" /> Teks Pesan dari Group Chat WA
          </label>
          <textarea
            rows={3}
            placeholder="Paste pesan / pengantar instruksi dari mentor di sini..."
            value={groupChatText}
            onChange={(e) => setGroupChatText(e.target.value)}
            className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-sky-500 outline-none text-sm"
          />
        </div>

        {/* Upload Gambar Materi */}
        <div>
          <label className="block text-sm font-medium mb-1">Unggah Gambar Materi (Poster/Soal)</label>
          <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm" />
          {preview && (
            <div className="mt-3 relative w-48 h-48 border rounded-lg overflow-hidden">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Result OCR Box */}
        <div>
          <label className="block text-sm font-medium mb-1 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" /> Hasil OCR Otomatis (Pertanyaan/Evaluasi)
          </label>
          {isProcessingOcr ? (
            <p className="text-sm text-amber-600 animate-pulse">Sedang membaca teks dari gambar...</p>
          ) : (
            <textarea
              rows={5}
              value={ocrText}
              onChange={(e) => setOcrText(e.target.value)}
              placeholder="Hasil teks dari gambar akan muncul otomatis di sini (dapat Anda edit kembali)..."
              className="w-full p-2.5 border rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
            />
          )}
        </div>

        {/* External Link (YouTube / Ref) */}
        <div>
          <label className="block text-sm font-medium mb-1 flex items-center gap-1.5">
            <LinkIcon className="w-4 h-4 text-emerald-600" /> Link Referensi External (YouTube / Web)
          </label>
          <input
            type="url"
            placeholder="https://youtube.com/watch?v=... (Opsional)"
            value={externalLink}
            onChange={(e) => setExternalLink(e.target.value)}
            className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-sky-500 outline-none text-sm"
          />
        </div>

        {/* Tombol Publish */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition"
        >
          <Send className="w-4 h-4" /> {isSubmitting ? "Memublikasikan..." : "Publish To-Do Hari Ini"}
        </button>
      </form>
    </div>
  );
}