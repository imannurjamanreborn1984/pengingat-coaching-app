"use client";

import React, { useState } from 'react';
import { X, Sparkles, Lock, Send, Image as ImageIcon, Calendar, Upload } from 'lucide-react';
import { DataService } from '../../lib/services/dataService';
import { supabase } from '../../lib/supabaseClient';
import { compressImageFile } from '../../lib/utils/imageCompressor';

export const QuickAddModal = ({
  isOpen = true,
  roots = [],
  defaultRootId,
  onClose,
  onSave,
  isKitabTheme = true,
  currentUser,
}) => {
  if (!isOpen) return null;

  const [date] = useState(new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompressingImage, setIsCompressingImage] = useState(false);

  const handleImageFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setIsCompressingImage(true);
    const selectedFiles = files.slice(0, 2 - images.length);

    try {
      for (const file of selectedFiles) {
        if (!file.type.startsWith('image/')) {
          alert('Mohon pilih file gambar (JPG, PNG, WebP).');
          continue;
        }
        const compressedDataUrl = await compressImageFile(file, 800, 800, 0.7);
        setImages((prev) => {
          if (prev.length >= 2) return prev;
          return [...prev, compressedDataUrl];
        });
      }
    } catch (err) {
      console.error('Error compressing image in QuickAddModal:', err);
      alert('Gagal memproses gambar. Silakan coba file lain.');
    } finally {
      setIsCompressingImage(false);
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (e, isSharedWithAdmin) => {
    if (e) e.preventDefault();
    if (!title.trim() && !notes.trim()) {
      alert("Mohon isi Judul atau Catatan Harian terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);

    const primaryImage = images[0] || imageUrl.trim();

    const entryData = {
      id: `journal-${Date.now()}`,
      date,
      title: title.trim() || `Catatan Temuan - ${new Date(date).toLocaleDateString('id-ID')}`,
      targetRootId: defaultRootId || roots[0]?.id || 'root-1',
      targetRootName: 'Umum / 14 Akar',
      notes: notes.trim(),
      findings: notes.trim(),
      evaluation: '',
      imageUrl: primaryImage,
      images: images,
      youtubeUrl: '',
      gdriveUrl: '',
      isSharedWithAdmin: !!isSharedWithAdmin,
      created_at: new Date().toISOString(),
    };

    // Simpan ke local storage
    DataService.saveJournal(entryData);

    // Jika di-share ke admin, kirim ke supabase submissions
    if (isSharedWithAdmin) {
      try {
        const userName = currentUser?.name || currentUser?.full_name || 'Peserta NPT';
        const userPhone = currentUser?.phone_number || null;

        await supabase.from("submissions").insert([
          {
            user_name: `${userName}${userPhone ? ` (${userPhone})` : ''}`,
            answer_text: `[📔 BUKU DIARY & TEMUAN HARIAN PESERTA]
📌 Judul: ${entryData.title}
📅 Tanggal: ${entryData.date}
📖 CATATAN & TEMUAN:
${entryData.notes}
${entryData.imageUrl ? `\n📷 Link Foto/Gambar: ${entryData.imageUrl}` : ''}`,
            created_at: new Date().toISOString()
          }
        ]);
        alert("✅ Diary berhasil disimpan di HP dan DI-SHARE ke Admin untuk ditinjau!");
      } catch (err) {
        console.error("Share error:", err);
        alert("Diary tersimpan secara pribadi di HP Anda.");
      }
    } else {
      alert("🔒 Diary berhasil disimpan sebagai Catatan Pribadi di HP Anda.");
    }

    setIsSubmitting(false);
    if (onSave) onSave(entryData);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className={`border rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-5 text-left ${
        isKitabTheme
          ? 'bg-[#fdfaf3] border-[#cbb38b] text-[#26150a]'
          : 'bg-slate-900 border-slate-800 text-slate-100'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#dfcfb0] dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base sm:text-lg font-bold tracking-tight ${
                isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-slate-100'
              }`}>
                📔 Input Buku Diary & Temuan Harian
              </h3>
              <p className={`text-xs mt-0.5 ${isKitabTheme ? 'text-[#634224]' : 'text-slate-400'}`}>
                Tuliskan catatan harian & temuan batin Anda secara bebas dan sederhana.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl transition cursor-pointer ${
              isKitabTheme ? 'text-[#734822] hover:bg-[#dfcdab]' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={(e) => handleFormSubmit(e, false)} className="space-y-4">
          {/* Info Tanggal Otomatis */}
          <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold ${
            isKitabTheme
              ? 'bg-[#faf2e3] border-[#cbb38b] text-[#634224]'
              : 'bg-slate-950 border-slate-800 text-slate-300'
          }`}>
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span>Tanggal Catatan:</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/20">
              🗓️ {new Date(date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} (Otomatis)
            </span>
          </div>

          {/* 1. JUDUL */}
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${
              isKitabTheme ? 'text-[#3a2211]' : 'text-slate-300'
            }`}>
              Judul Catatan / Temuan *
            </label>
            <input
              type="text"
              placeholder="Contoh: Temuan Ketenangan Saat Hening Subuh di Tepi Sungai"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:outline-hidden ${
                isKitabTheme
                  ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b] placeholder:text-[#9e876a]'
                  : 'bg-slate-950 border-slate-800 text-white focus:border-rose-500'
              }`}
              required
            />
          </div>

          {/* 2. CATATAN HARIAN DAN TEMUANKU */}
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${
              isKitabTheme ? 'text-[#3a2211]' : 'text-slate-300'
            }`}>
              Catatan Harian & Temuanku *
            </label>
            <textarea
              rows={5}
              placeholder="Tuliskan pengalaman hari ini, suasana hati, pencerahan batin, atau temuan yang dirasakan..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs leading-relaxed focus:outline-hidden ${
                isKitabTheme
                  ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b] placeholder:text-[#9e876a]'
                  : 'bg-slate-950 border-slate-800 text-white focus:border-rose-500'
              }`}
              required
            />
          </div>

          {/* 3. FOTO / GAMBAR AI (Opsional) */}
          <div>
            <label className={`block text-xs font-bold mb-1.5 flex items-center gap-1.5 ${
              isKitabTheme ? 'text-[#3a2211]' : 'text-slate-300'
            }`}>
              <ImageIcon className="w-4 h-4 text-emerald-600" />
              <span>Foto / Gambar (Maksimal 2 Foto, Tanpa OCR):</span>
            </label>

            {images.length < 2 && (
              <label className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-dashed text-xs font-bold cursor-pointer transition ${
                isKitabTheme
                  ? 'bg-[#faf2e3] text-[#4a2e12] border-[#cbb38b] hover:bg-[#eee3cb]'
                  : 'bg-slate-950 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}>
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>{images.length === 0 ? "📷 Pilih File Foto dari Galeri (1 atau 2)" : "➕ Tambah 1 Foto Lagi"}</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageFileChange}
                  className="hidden"
                />
              </label>
            )}

            {/* Preview Foto */}
            {images.length > 0 && (
              <div className="flex gap-2 mt-2">
                {images.map((imgSrc, idx) => (
                  <div key={idx} className="relative group w-16 h-16 rounded-xl overflow-hidden border border-amber-500/40 shadow-xs">
                    <img src={imgSrc} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-0.5 right-0.5 p-1 rounded-full bg-rose-600 text-white shadow-xs hover:bg-rose-700 transition cursor-pointer"
                      title="Hapus foto ini"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DUA TOMBOL SUBMIT */}
          <div className="pt-3 border-t border-[#dfcfb0] dark:border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                isKitabTheme ? 'text-[#634224] hover:bg-[#dfcdab]' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              Batal
            </button>

            {/* OPSI 1: SIMPAN SEBAGAI CATATAN PRIBADI */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={(e) => handleFormSubmit(e, false)}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                isKitabTheme
                  ? 'bg-[#eee3cb] text-[#3a2211] border-[#cbb38b] hover:bg-[#dfcdab]'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
              title="Hanya tersimpan di perangkat HP sendiri"
            >
              <Lock className="w-4 h-4 text-amber-600" />
              <span>🔒 Simpan buatku saja</span>
            </button>

            {/* OPSI 2: SIMPAN DAN SHARE */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={(e) => handleFormSubmit(e, true)}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isKitabTheme
                  ? 'bg-[#9e2a2b] hover:bg-[#852324] shadow-rose-950/20'
                  : 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 shadow-rose-600/30'
              }`}
              title="Tersimpan di HP & dikirim ke Admin untuk di-approve agar bisa dibaca peserta lain"
            >
              <Send className="w-4 h-4" />
              <span>📤 Simpan & Share (Approve Admin)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
