"use client";

import React, { useState } from 'react';
import { X, Plus, Dna, BookMarked, Film, Sparkles } from 'lucide-react';

export const QuickAddModal = ({
  roots,
  defaultRootId,
  defaultCategory = 'sains',
  onClose,
  onSave,
}) => {
  const [selectedRootId, setSelectedRootId] = useState(defaultRootId || roots[0]?.id || '');
  const [category, setCategory] = useState(defaultCategory);

  const [title, setTitle] = useState('');
  
  // Sains fields
  const [field, setField] = useState('Epigenetika');
  const [summary, setSummary] = useState('');
  const [mechanism, setMechanism] = useState('');
  const [sourceCitation, setSourceCitation] = useState('');

  // Kitab fields
  const [source, setSource] = useState('');
  const [quote, setQuote] = useState('');
  const [commentary, setCommentary] = useState('');
  const [tradition, setTradition] = useState('Tasawuf / Islam');

  // Pop Culture fields
  const [popType, setPopType] = useState('film');
  const [characterOrSymbol, setCharacterOrSymbol] = useState('');
  const [referenceTitle, setReferenceTitle] = useState('');
  const [analysis, setAnalysis] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = `custom-${Date.now()}`;

    if (category === 'sains') {
      const entry = {
        id,
        title,
        field,
        summary,
        mechanism: mechanism || undefined,
        sourceCitation: sourceCitation || undefined,
        tags: [field, 'Custom Entry'],
      };
      onSave(selectedRootId, 'sains', entry);
    } else if (category === 'kitab') {
      const entry = {
        id,
        title,
        source,
        quote: quote || undefined,
        commentary,
        tradition,
      };
      onSave(selectedRootId, 'kitab', entry);
    } else {
      const entry = {
        id,
        title,
        type: popType,
        characterOrSymbol,
        referenceTitle,
        analysis,
      };
      onSave(selectedRootId, 'popculture', entry);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Input Bahan / Temuan Baru
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Tambahkan hasil riset sains, ayat/kitab, atau analogi film ke salah satu akar.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Pilih Akar Spiritual Tujuan:
            </label>
            <select
              value={selectedRootId}
              onChange={(e) => setSelectedRootId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
              required
            >
              {roots.map((r) => (
                <option key={r.id} value={r.id}>
                  #{r.number} - {r.name} ({r.element})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Kategori Bahan:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCategory('sains')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  category === 'sains'
                    ? 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Dna className="w-4 h-4" />
                <span>Sains & Epigenetika</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('kitab')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  category === 'kitab'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <BookMarked className="w-4 h-4" />
                <span>Kitab & Tradisi</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('popculture')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  category === 'popculture'
                    ? 'bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-400 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Film className="w-4 h-4" />
                <span>Film / Pop Culture</span>
              </button>
            </div>
          </div>

          {category === 'sains' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Judul Temuan / Topik Riset
                  </label>
                  <input
                    type="text"
                    placeholder="Misal: Regulasi Telomerase & Latihan Nafas"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bidang Sains
                  </label>
                  <select
                    value={field}
                    onChange={(e) => setField(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Epigenetika">Epigenetika</option>
                    <option value="Neurobiologi">Neurobiologi</option>
                    <option value="Psikologi Somatik">Psikologi Somatik</option>
                    <option value="Fisika Kuantum">Fisika Kuantum</option>
                    <option value="Sains Kognitif">Sains Kognitif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ringkasan Penjelasan / Wawasan
                </label>
                <textarea
                  rows={3}
                  placeholder="Jelaskan penemuan ilmiah atau korelasinya dengan akar ini..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jalur Mekanisme Biologis (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Misal: Aktivasi BDNF & Penurunan Kortisol"
                    value={mechanism}
                    onChange={(e) => setMechanism(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Sumber / Jurnal / Peneliti
                  </label>
                  <input
                    type="text"
                    placeholder="Misal: Nature Neuroscience 2024"
                    value={sourceCitation}
                    onChange={(e) => setSourceCitation(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {category === 'kitab' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Judul Bahasan / Bab
                  </label>
                  <input
                    type="text"
                    placeholder="Misal: Maqam Tawakkul & Penyerahan Diri"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Aliran / Tradisi
                  </label>
                  <select
                    value={tradition}
                    onChange={(e) => setTradition(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Tasawuf / Islam">Tasawuf / Islam</option>
                    <option value="Nusantara / Kejawen">Nusantara / Kejawen</option>
                    <option value="Veda / Timur">Veda / Timur</option>
                    <option value="Hermetisisme">Hermetisisme</option>
                    <option value="Filsafat Universal">Filsafat Universal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Kitab & Pengarang
                </label>
                <input
                  type="text"
                  placeholder="Misal: Ihya Ulumuddin (Imam Al-Ghazali) / Serat Centhini"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kutipan Teks Asli / Terjemahan
                </label>
                <textarea
                  rows={2}
                  placeholder="Masukkan bait syair, petikan hadits, atau kutipan kalimat hikmah..."
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none font-serif italic"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ulasan Filosofis / Tafsir Kontemporer
                </label>
                <textarea
                  rows={3}
                  placeholder="Jelaskan makna esensialnya bagi pembaca masa kini..."
                  value={commentary}
                  onChange={(e) => setCommentary(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>
            </div>
          )}

          {category === 'popculture' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Judul Analisis
                  </label>
                  <input
                    type="text"
                    placeholder="Misal: Perjalanan Hero's Journey Luke Skywalker"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jenis Media
                  </label>
                  <select
                    value={popType}
                    onChange={(e) => setPopType(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="film">Film</option>
                    <option value="folklore">Cerita Rakyat / Mitologi</option>
                    <option value="anime">Anime / Manga</option>
                    <option value="novel">Novel / Sastra</option>
                    <option value="figur">Figur Sejarah / Tokoh</option>
                    <option value="simbol">Simbol / Arkais</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Judul Karya / Film / Cerita
                  </label>
                  <input
                    type="text"
                    placeholder="Misal: Inception (2010) / Semar Gugat"
                    value={referenceTitle}
                    onChange={(e) => setReferenceTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Karakter / Simbol yang Ditinjau
                  </label>
                  <input
                    type="text"
                    placeholder="Misal: Dom Cobb / Totem Gasing"
                    value={characterOrSymbol}
                    onChange={(e) => setCharacterOrSymbol(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Analisis Simbolik & Refleksi Spiritual
                </label>
                <textarea
                  rows={3}
                  placeholder="Bagaimana adegan atau karakter tersebut merefleksikan dinamika akar ini?"
                  value={analysis}
                  onChange={(e) => setAnalysis(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  required
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold shadow-sm shadow-rose-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Simpan Temuan Baru</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
