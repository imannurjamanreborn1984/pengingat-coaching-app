"use client";

import React, { useState } from 'react';
import { Sparkles, Save, X, Lock, Send, Image, Film, ExternalLink, Cloud, Upload } from 'lucide-react';

const COMMON_SOMATIC_SENSATIONS = [
  'Dada terasa hangat & lapang',
  'Pundak & leher rileks',
  'Tulang belakang tegak & kokoh',
  'Detak jantung melambat & stabil',
  'Sensasi kesemutan halus di tangan',
  'Pikiran hening (zero chatter)',
  'Energi mengalir deras di ulu hati',
  'Kaki menancap kuat ke bumi (grounded)',
  'Ruang kepala terasa sejuk & terang',
];

export const JournalForm = ({
  roots,
  selectedRoot,
  initialPracticeType = 'dynamic_meditation',
  initialDuration = 15,
  onSave,
  onCancel,
  isKitabTheme = true,
}) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [practiceType, setPracticeType] = useState(initialPracticeType);
  const [targetRootId, setTargetRootId] = useState(selectedRoot?.id || roots[0]?.id || '');
  const [durationMinutes, setDurationMinutes] = useState(initialDuration);
  const [energyLevelBefore, setEnergyLevelBefore] = useState(3);
  const [energyLevelAfter, setEnergyLevelAfter] = useState(5);
  const [selectedSensations, setSelectedSensations] = useState([
    'Dada terasa hangat & lapang',
    'Pikiran hening (zero chatter)',
  ]);
  const [customSensation, setCustomSensation] = useState('');
  
  // Field Bebas User (6 Komponen Utama)
  const [notes, setNotes] = useState(''); // Isi Catatan Harian
  const [findings, setFindings] = useState(''); // Temuan Harian
  const [evaluation, setEvaluation] = useState(''); // Evaluasi Diri
  const [imageUrl, setImageUrl] = useState(''); // Link Gambar
  const [images, setImages] = useState([]); // Array Foto (1 atau 2 foto dari Galeri/File)
  const [youtubeUrl, setYoutubeUrl] = useState(''); // Link Video YouTube
  const [gdriveUrl, setGdriveUrl] = useState(''); // Link Google Drive

  const toggleSensation = (item) => {
    if (selectedSensations.includes(item)) {
      setSelectedSensations(selectedSensations.filter((s) => s !== item));
    } else {
      setSelectedSensations([...selectedSensations, item]);
    }
  };

  const handleAddCustomSensation = (e) => {
    e.preventDefault();
    if (customSensation.trim() && !selectedSensations.includes(customSensation.trim())) {
      setSelectedSensations([...selectedSensations, customSensation.trim()]);
      setCustomSensation('');
    }
  };

  const handleImageFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const selectedFiles = files.slice(0, 2 - images.length);
    selectedFiles.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        alert('Mohon pilih file gambar (JPG, PNG, WebP).');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setImages((prev) => {
          if (prev.length >= 2) return prev;
          return [...prev, event.target.result];
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = (e, isSharedWithAdmin) => {
    if (e) e.preventDefault();
    const rootObj = roots.find((r) => r.id === targetRootId);
    
    const primaryImage = images[0] || imageUrl.trim();

    onSave({
      date,
      title: title.trim() || `Catatan Temuan - ${new Date(date).toLocaleDateString('id-ID')}`,
      practiceType,
      targetRootId,
      targetRootName: rootObj ? `${rootObj.name} (${rootObj.alias})` : 'Umum',
      durationMinutes,
      energyLevelBefore,
      energyLevelAfter,
      somaticSensations: selectedSensations,
      notes: notes.trim(),
      findings: findings.trim(),
      evaluation: evaluation.trim(),
      imageUrl: primaryImage,
      images: images,
      youtubeUrl: youtubeUrl.trim(),
      gdriveUrl: gdriveUrl.trim(),
      isSharedWithAdmin: !!isSharedWithAdmin,
    });
  };

  return (
    <div className={`rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 text-left ${
      isKitabTheme ? 'card-kitab-frame' : 'bg-white dark:bg-slate-900 border border-slate-800'
    }`}>
      <div className="flex items-center justify-between border-b border-[#dfcfb0] dark:border-slate-800 pb-4">
        <div>
          <h3 className={`text-lg font-bold tracking-tight ${
            isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-slate-100'
          }`}>
            📔 Buku Diary & Temuan Harian Peserta
          </h3>
          <p className={`text-xs mt-0.5 ${isKitabTheme ? 'text-[#634224]' : 'text-slate-400'}`}>
            Tuliskan catatan bebas, temuan batin, evaluasi diri, dan lampirkan link gambar/media.
          </p>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className={`p-1.5 rounded-xl transition cursor-pointer ${
              isKitabTheme ? 'text-[#734822] hover:bg-[#dfcdab]' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={(e) => handleFormSubmit(e, false)} className="space-y-5">
        {/* 1. JUDUL & TANGGAL DIARY */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className={`block text-xs font-bold mb-1.5 ${
              isKitabTheme ? 'text-[#3a2211]' : 'text-slate-300'
            }`}>
              Judul Catatan / Temuan Harian *
            </label>
            <input
              type="text"
              placeholder="Contoh: Temuan Rasa Lapang Saat Hening Subuh di Tepi Sungai"
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

          <div>
            <label className={`block text-xs font-bold mb-1.5 ${
              isKitabTheme ? 'text-[#3a2211]' : 'text-slate-300'
            }`}>
              Tanggal
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-hidden ${
                isKitabTheme
                  ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b]'
                  : 'bg-slate-950 border-slate-800 text-white focus:border-rose-500'
              }`}
              required
            />
          </div>
        </div>



        {/* 3. ISI CATATAN HARIAN */}
        <div>
          <label className={`block text-xs font-bold mb-1.5 ${
            isKitabTheme ? 'text-[#3a2211]' : 'text-slate-300'
          }`}>
            📖 Isi Catatan Harian (Bebas Menceritakan Pengalaman / Perasaan) *
          </label>
          <textarea
            rows={4}
            placeholder="Tuliskan pengalaman hari ini, suasana hati, atau dinamika yang terjadi secara leluasa..."
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

        {/* 4. TEMUAN HARIAN & EVALUASI DIRI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={`block text-xs font-bold mb-1.5 flex items-center gap-1.5 ${
              isKitabTheme ? 'text-[#9e2a2b]' : 'text-amber-400'
            }`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>💡 Temuan Harian (*Breakthrough Insights*)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Pencerahan, kesadaran baru, atau titik pemahaman yang kamu dapatkan hari ini..."
              value={findings}
              onChange={(e) => setFindings(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs leading-relaxed italic focus:outline-hidden ${
                isKitabTheme
                  ? 'bg-[#faf2e3] text-[#26150a] border-[#cbb38b] placeholder:text-[#9e876a]'
                  : 'bg-slate-950 border-slate-800 text-white focus:border-amber-500'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-bold mb-1.5 flex items-center gap-1.5 ${
              isKitabTheme ? 'text-[#3a2211]' : 'text-sky-400'
            }`}>
              🎯 Evaluasi Diri (*Self-Evaluation*)
            </label>
            <textarea
              rows={3}
              placeholder="Apa yang perlu diperbaiki, dijaga, atau ditingkatkan untuk esok hari..."
              value={evaluation}
              onChange={(e) => setEvaluation(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs leading-relaxed focus:outline-hidden ${
                isKitabTheme
                  ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b] placeholder:text-[#9e876a]'
                  : 'bg-slate-950 border-slate-800 text-white focus:border-sky-500'
              }`}
            />
          </div>
        </div>

        {/* 5. LINK MEDIA (GAMBAR, YOUTUBE, GDRIVE) */}
        <div className={`p-4 rounded-2xl border space-y-3 ${
          isKitabTheme ? 'bg-[#eee3cb]/60 border-[#d8c3a1]' : 'bg-slate-950/60 border-slate-800'
        }`}>
          <span className={`text-xs font-bold block ${isKitabTheme ? 'text-[#3a2211]' : 'text-slate-300'}`}>
            🔗 Lampiran Media (Opsional):
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Upload File Gambar (Maksimal 2 Foto) */}
            <div>
              <label className={`block text-[11px] font-semibold mb-1 flex items-center gap-1 ${
                isKitabTheme ? 'text-[#634224]' : 'text-slate-400'
              }`}>
                <Image className="w-3.5 h-3.5 text-emerald-600" /> Upload File Foto/Gambar (1 atau 2 Foto)
              </label>

              {images.length < 2 && (
                <label className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-dashed text-xs font-bold cursor-pointer transition ${
                  isKitabTheme
                    ? 'bg-[#fdfaf3] text-[#4a2e12] border-[#cbb38b] hover:bg-[#eee3cb]'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}>
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>{images.length === 0 ? "📷 Pilih File Foto (Max 2)" : "➕ Tambah 1 Foto Lagi"}</span>
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
                    <div key={idx} className="relative group w-14 h-14 rounded-xl overflow-hidden border border-amber-500/40 shadow-xs">
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

            <div>
              <label className={`block text-[11px] font-semibold mb-1 flex items-center gap-1 ${
                isKitabTheme ? 'text-[#634224]' : 'text-slate-400'
              }`}>
                <Film className="w-3.5 h-3.5 text-red-500" /> Link Video YouTube
              </label>
              <input
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-hidden ${
                  isKitabTheme
                    ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b] placeholder:text-[#9e876a]'
                    : 'bg-slate-900 border-slate-800 text-white'
                }`}
              />
            </div>

            <div>
              <label className={`block text-[11px] font-semibold mb-1 flex items-center gap-1 ${
                isKitabTheme ? 'text-[#634224]' : 'text-slate-400'
              }`}>
                <Cloud className="w-3.5 h-3.5 text-blue-500" /> Link Google Drive
              </label>
              <input
                type="url"
                placeholder="https://drive.google.com/..."
                value={gdriveUrl}
                onChange={(e) => setGdriveUrl(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-hidden ${
                  isKitabTheme
                    ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b] placeholder:text-[#9e876a]'
                    : 'bg-slate-900 border-slate-800 text-white'
                }`}
              />
            </div>
          </div>
        </div>

        {/* 6. DUA TOMBOL SUBMIT SAKRAL */}
        <div className="pt-3 border-t border-[#dfcfb0] dark:border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                isKitabTheme ? 'text-[#634224] hover:bg-[#dfcdab]' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              Batal
            </button>
          )}

          {/* OPSI 1: SIMPAN SEBAGAI CATATAN PRIBADI */}
          <button
            type="button"
            onClick={(e) => handleFormSubmit(e, false)}
            className={`w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
              isKitabTheme
                ? 'bg-[#eee3cb] text-[#3a2211] border-[#cbb38b] hover:bg-[#dfcdab]'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
            title="Hanya tersimpan di perangkat HP sendiri"
          >
            <Lock className="w-4 h-4 text-amber-600" />
            <span>🔒 Simpan Catatan Pribadi</span>
          </button>

          {/* OPSI 2: SIMPAN DAN SHARE KE ADMIN */}
          <button
            type="button"
            onClick={(e) => handleFormSubmit(e, true)}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isKitabTheme
                ? 'bg-[#9e2a2b] hover:bg-[#852324] shadow-rose-950/20'
                : 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 shadow-rose-600/30'
            }`}
            title="Tersimpan di HP & dikirim ke Kang Iman / Admin untuk diulas"
          >
            <Send className="w-4 h-4" />
            <span>📤 Simpan & Share ke Admin</span>
          </button>
        </div>
      </form>
    </div>
  );
};
