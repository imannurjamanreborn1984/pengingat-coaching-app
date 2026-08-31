"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { RootCard } from './RootCard';
import { MultiPerspectiveView } from './MultiPerspectiveView';
import { JournalForm } from './JournalForm';
import { JournalList } from './JournalList';
import { MeditationTimer } from './MeditationTimer';
import { QuickAddModal } from './QuickAddModal';
import { DataManagementModal } from './DataManagementModal';
import { AssessmentPreview } from './AssessmentPreview';
import { DataService } from '../../lib/services/dataService';
import { GURU_PREFACE } from '../../lib/data/rootsData';
import { 
  BookOpen, 
  Compass, 
  Search, 
  Bookmark, 
  Sparkles, 
  PlusCircle, 
  Download, 
  Layers, 
  History, 
  PenTool, 
  Timer, 
  Plus, 
  ArrowLeft,
  Bell,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  HeartHandshake
} from 'lucide-react';

const ELEMENTS = [
  { id: 'ALL', label: 'Semua (14 Akar)' },
  { id: 'Suara / Eter', label: '🔊 Suara' },
  { id: 'Langit / Udara', label: '☁️ Langit' },
  { id: 'Bumi / Tanah', label: '🌱 Bumi' },
  { id: 'Kayu / Hayat Hijau', label: '🌳 Kayu' },
  { id: 'Api', label: '🔥 Api' },
  { id: 'Logam', label: '⚔️ Logam' },
  { id: 'Air', label: '💧 Air' },
  { id: '9 Elemen Bersatu', label: '🌌 9 Elemen' },
  { id: '5 Elemen (Panca Driya)', label: '⚖️ 5 Elemen' },
  { id: 'Dualitas (Yin-Yang / Jalal-Jamal)', label: '☯️ Ganda' },
  { id: 'Darah / Genetik Leluhur', label: '🩸 Garis Darah' },
  { id: 'Kekosongan (Void / Suwung)', label: '⭕ Void / Suwung' },
  { id: 'Chaos / Turbulensi', label: '🌪️ Chaos' },
  { id: 'Es Mistik / Kristal Beku', label: '❄️ Es Mistik' },
];

export default function BukuSakuContainer() {
  const [showPreface, setShowPreface] = useState(false);
  const [roots, setRoots] = useState([]);
  const [selectedRoot, setSelectedRoot] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [journals, setJournals] = useState([]);
  const [activeTab, setActiveTab] = useState('roots'); // 'roots' | 'journal' | 'assessment'

  // Journal subtab
  const [journalSubTab, setJournalSubTab] = useState('list'); // 'list' | 'form' | 'timer'
  const [practiceRoot, setPracticeRoot] = useState(undefined);
  const [practiceType, setPracticeType] = useState('dynamic_meditation');
  const [completedDuration, setCompletedDuration] = useState(15);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedElement, setSelectedElement] = useState('ALL');
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

  // Modals
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddRootId, setQuickAddRootId] = useState(undefined);
  const [quickAddCategory, setQuickAddCategory] = useState('sains');
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);

  const loadAllData = () => {
    const loadedRoots = DataService.getRoots();
    setRoots(loadedRoots);
    setBookmarks(DataService.getBookmarks());
    setJournals(DataService.getJournals());

    if (selectedRoot) {
      const refreshed = loadedRoots.find((r) => r.id === selectedRoot.id);
      if (refreshed) setSelectedRoot(refreshed);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleToggleBookmark = (id, e) => {
    e.stopPropagation();
    DataService.toggleBookmark(id);
    setBookmarks(DataService.getBookmarks());
  };

  const handleOpenQuickAdd = (rootId, defaultCategory = 'sains') => {
    setQuickAddRootId(rootId || roots[0]?.id);
    setQuickAddCategory(defaultCategory);
    setIsQuickAddOpen(true);
  };

  const handleSaveQuickAdd = (rootId, category, entry) => {
    DataService.addPerspectiveToRoot(rootId, category, entry);
    loadAllData();
  };

  const handleSaveJournal = (entryData) => {
    DataService.saveJournal(entryData);
    setJournals(DataService.getJournals());
    setJournalSubTab('list');
  };

  const handleDeleteJournal = (id) => {
    DataService.deleteJournal(id);
    setJournals(DataService.getJournals());
  };

  const handleStartPractice = (root, type) => {
    setPracticeRoot(root);
    setPracticeType(type);
    setSelectedRoot(null);
    setActiveTab('journal');
    setJournalSubTab('form');
  };

  const handleTimerComplete = (mins) => {
    setCompletedDuration(mins);
    setJournalSubTab('form');
  };

  // Filter roots
  const filteredRoots = useMemo(() => {
    return roots.filter((root) => {
      if (showBookmarksOnly && !bookmarks.includes(root.id)) return false;
      if (selectedElement !== 'ALL' && root.element !== selectedElement) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = root.name.toLowerCase().includes(query);
        const matchAlias = root.alias.toLowerCase().includes(query);
        const matchSummary = root.summary.toLowerCase().includes(query);
        const matchArchetype = root.archetype?.toLowerCase().includes(query);
        const matchKeywords = root.coreKeywords?.some((k) => k.toLowerCase().includes(query));
        const matchSains = root.sainsEpigenetika?.some((s) => s.title.toLowerCase().includes(query) || s.summary.toLowerCase().includes(query));
        const matchKitab = root.kitabKearifan?.some((k) => k.title.toLowerCase().includes(query) || k.source.toLowerCase().includes(query));
        const matchPop = root.popCultureFolklore?.some((p) => p.title.toLowerCase().includes(query) || p.referenceTitle.toLowerCase().includes(query));

        return matchName || matchAlias || matchSummary || matchArchetype || matchKeywords || matchSains || matchKitab || matchPop;
      }
      return true;
    });
  }, [roots, searchQuery, selectedElement, showBookmarksOnly, bookmarks]);

  const totalSains = roots.reduce((acc, r) => acc + (r.sainsEpigenetika?.length || 0), 0);
  const totalKitab = roots.reduce((acc, r) => acc + (r.kitabKearifan?.length || 0), 0);
  const totalPop = roots.reduce((acc, r) => acc + (r.popCultureFolklore?.length || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/85 dark:bg-slate-950/85 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div 
              onClick={() => { setSelectedRoot(null); setActiveTab('roots'); }}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base tracking-tight leading-none">
                    Buku Saku Akar Spiritual
                  </span>
                  <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full border border-rose-500/20">
                    NPT
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                  Sains • Kitab • Pop Culture • Jurnal Latihan
                </p>
              </div>
            </div>
          </div>

          {/* Center Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <button
              onClick={() => { setSelectedRoot(null); setActiveTab('roots'); }}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'roots' && !selectedRoot
                  ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              14 Akar Spiritual
            </button>
            <button
              onClick={() => { setSelectedRoot(null); setActiveTab('journal'); }}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'journal'
                  ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Jurnal & Meditasi ({journals.length})
            </button>
            <button
              onClick={() => { setSelectedRoot(null); setActiveTab('assessment'); }}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'assessment'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Pemetaan Diri
            </button>
          </nav>

          {/* Right Action Links */}
          <div className="flex items-center gap-2">
            <Link
              href="/hakekat-cinta"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 transition-colors"
              title="Kajian Hakikat Cinta & Rekaman Live"
            >
              <span>🎬 Hakikat Cinta</span>
            </Link>

            {/* Link back to Reminder Dashboard */}
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 transition-colors"
              title="Buka Dashboard Reminder & Tugas NPT"
            >
              <Bell className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Reminder Tugas</span>
            </Link>

            <button
              onClick={() => handleOpenQuickAdd()}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Input Bahan</span>
            </button>

            <button
              onClick={() => setIsDataModalOpen(true)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
              title="Backup Data JSON"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 pb-20 md:pb-8">
        {selectedRoot ? (
          <MultiPerspectiveView
            root={selectedRoot}
            onBack={() => setSelectedRoot(null)}
            onOpenQuickAdd={(rootId, cat) => handleOpenQuickAdd(rootId, cat)}
            onStartPractice={handleStartPractice}
            isBookmarked={bookmarks.includes(selectedRoot.id)}
            onToggleBookmark={handleToggleBookmark}
          />
        ) : activeTab === 'roots' ? (
          <div className="space-y-6 pb-12">
            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 dark:from-slate-900 dark:via-purple-950 dark:to-slate-950 text-white p-6 sm:p-8 shadow-xl border border-indigo-900/40">
              <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-rose-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Pusat Riset & Praktik Spiritual NPT</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  Peta 14 Akar Spiritual & Integrasi Multi-Perspektif
                </h1>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                  Wadah dinamis untuk memetakan arketipe batin, menghubungkan temuan sains modern, teks hikmah klasik, dan analogi budaya secara modular.
                </p>

                <div className="grid grid-cols-4 gap-2 pt-2 text-center max-w-lg">
                  <div className="p-2.5 rounded-2xl bg-white/5 backdrop-blur-xs border border-white/10">
                    <span className="block text-base sm:text-lg font-extrabold text-white">14</span>
                    <span className="text-[10px] text-slate-400 font-medium">Akar Utama</span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-white/5 backdrop-blur-xs border border-white/10">
                    <span className="block text-base sm:text-lg font-extrabold text-blue-400">{totalSains}</span>
                    <span className="text-[10px] text-slate-400 font-medium">Riset Sains</span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-white/5 backdrop-blur-xs border border-white/10">
                    <span className="block text-base sm:text-lg font-extrabold text-amber-400">{totalKitab}</span>
                    <span className="text-[10px] text-slate-400 font-medium">Kitab Hikmah</span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-white/5 backdrop-blur-xs border border-white/10">
                    <span className="block text-base sm:text-lg font-extrabold text-purple-400">{totalPop}</span>
                    <span className="text-[10px] text-slate-400 font-medium">Pop Culture</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pengantar & Petunjuk Guru NPT (Expandable) */}
            <div className="bg-gradient-to-br from-amber-500/5 via-white to-amber-500/10 dark:from-slate-900 dark:via-amber-950/20 dark:to-slate-900 border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
              <div 
                onClick={() => setShowPreface(!showPreface)}
                className="flex items-center justify-between cursor-pointer group select-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
                    📜
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex items-center gap-2">
                      <span>{GURU_PREFACE.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-semibold">
                        313 Jalur Sylendra
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      {GURU_PREFACE.subtitle}
                    </p>
                  </div>
                </div>

                <button className="p-2 rounded-xl text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200">
                  {showPreface ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>

              {showPreface && (
                <div className="pt-4 border-t border-amber-500/20 space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed animate-in fade-in duration-200">
                  <p className="italic bg-amber-50/60 dark:bg-amber-950/40 p-3.5 rounded-2xl border-l-3 border-amber-500 text-amber-900 dark:text-amber-200 font-serif">
                    "{GURU_PREFACE.heritageContext}"
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        🌱 Manfaat Merawat Akar Spiritual:
                      </h4>
                      <ul className="space-y-1.5 text-xs">
                        {GURU_PREFACE.benefits.map((b, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-amber-500 font-bold">•</span>
                            <span><strong>{b.title}:</strong> {b.desc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        🧘 Cara Merawat & Latihan Rutin:
                      </h4>
                      <ul className="space-y-1.5 text-xs">
                        {GURU_PREFACE.maintenancePractices.map((p, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-emerald-500 font-bold">✓</span>
                            <span><strong>{p.title}:</strong> {p.desc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                    💡 <em>{GURU_PREFACE.treeIllustration}</em>
                  </p>
                </div>
              )}
            </div>

            {/* Search & Element Filters */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari nama akar, keyword (vitalitas, fokus), sains (mitokondria), atau film (matrix)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs sm:text-sm shadow-xs focus:ring-2 focus:ring-rose-500 focus:outline-none placeholder:text-slate-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                    showBookmarksOnly
                      ? 'bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-500/30'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${showBookmarksOnly ? 'fill-current' : ''}`} />
                  <span>Tersimpan ({bookmarks.length})</span>
                </button>
              </div>

              <div className="flex overflow-x-auto gap-1.5 pb-1 scrollbar-none">
                {ELEMENTS.map((el) => (
                  <button
                    key={el.id}
                    onClick={() => setSelectedElement(el.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedElement === el.id
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {el.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            {filteredRoots.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center space-y-3">
                <Layers className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  Tidak ditemukan akar yang sesuai
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Coba ubah kata kunci pencarian atau reset filter elemen.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedElement('ALL');
                    setShowBookmarksOnly(false);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white shadow-xs cursor-pointer"
                >
                  Reset Semua Filter
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRoots.map((root) => (
                  <RootCard
                    key={root.id}
                    root={root}
                    isBookmarked={bookmarks.includes(root.id)}
                    onToggleBookmark={handleToggleBookmark}
                    onSelectRoot={(r) => setSelectedRoot(r)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'journal' ? (
          <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                    <Compass className="w-5 h-5" />
                  </span>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                    Jurnal Latihan Spiritual & Khalwat
                  </h1>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Catatan harian untuk melatih 14 akar spiritual melalui gerak dinamis somatik dan keheningan.
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-800 self-start sm:self-auto">
                <button
                  onClick={() => setJournalSubTab('list')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    journalSubTab === 'list'
                      ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Riwayat ({journals.length})</span>
                </button>

                <button
                  onClick={() => setJournalSubTab('form')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    journalSubTab === 'form'
                      ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Tulis Jurnal</span>
                </button>

                <button
                  onClick={() => setJournalSubTab('timer')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    journalSubTab === 'timer'
                      ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Timer className="w-3.5 h-3.5" />
                  <span>Timer Hening</span>
                </button>
              </div>
            </div>

            {journalSubTab === 'timer' && (
              <div className="max-w-xl mx-auto space-y-4 animate-in fade-in duration-200">
                <MeditationTimer
                  defaultDurationMinutes={completedDuration}
                  onCompleteSession={handleTimerComplete}
                />
              </div>
            )}

            {journalSubTab === 'form' && (
              <div className="max-w-3xl mx-auto animate-in fade-in duration-200">
                <JournalForm
                  roots={roots}
                  selectedRoot={practiceRoot}
                  initialPracticeType={practiceType}
                  initialDuration={completedDuration}
                  onSave={handleSaveJournal}
                  onCancel={() => setJournalSubTab('list')}
                />
              </div>
            )}

            {journalSubTab === 'list' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Total {journals.length} Sesi Terdata
                  </span>
                  <button
                    onClick={() => setJournalSubTab('form')}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Catat Sesi Baru</span>
                  </button>
                </div>
                <JournalList journals={journals} onDeleteJournal={handleDeleteJournal} />
              </div>
            )}
          </div>
        ) : (
          <AssessmentPreview
            roots={roots}
            onNavigateToRoot={(r) => setSelectedRoot(r)}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-2 py-1.5">
        <div className="grid grid-cols-4 items-center justify-around">
          <button
            onClick={() => { setSelectedRoot(null); setActiveTab('roots'); }}
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
              activeTab === 'roots' && !selectedRoot
                ? 'text-rose-600 dark:text-rose-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] mt-1">14 Akar</span>
          </button>

          <button
            onClick={() => { setSelectedRoot(null); setActiveTab('journal'); }}
            className={`flex flex-col items-center py-1 px-2 rounded-xl relative transition-all ${
              activeTab === 'journal'
                ? 'text-rose-600 dark:text-rose-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-[10px] mt-1">Jurnal</span>
            {journals.length > 0 && (
              <span className="absolute top-0.5 right-4 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                {journals.length}
              </span>
            )}
          </button>

          <button
            onClick={() => handleOpenQuickAdd()}
            className="flex flex-col items-center py-1 px-2 rounded-xl transition-all text-slate-500 dark:text-slate-400"
          >
            <PlusCircle className="w-5 h-5 text-rose-500" />
            <span className="text-[10px] mt-1">Input Bahan</span>
          </button>

          <button
            onClick={() => { setSelectedRoot(null); setActiveTab('assessment'); }}
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
              activeTab === 'assessment'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px] mt-1">Pemetaan</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      {isQuickAddOpen && (
        <QuickAddModal
          roots={roots}
          defaultRootId={quickAddRootId}
          defaultCategory={quickAddCategory}
          onClose={() => setIsQuickAddOpen(false)}
          onSave={handleSaveQuickAdd}
        />
      )}

      {isDataModalOpen && (
        <DataManagementModal
          onClose={() => setIsDataModalOpen(false)}
          onDataChanged={loadAllData}
        />
      )}
    </div>
  );
}
