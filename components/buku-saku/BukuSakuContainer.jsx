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
import { AppNavbar, AppSidebar } from '../layout/AppNavbar';
import { supabase } from '../../lib/supabaseClient';
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
  HeartHandshake,
  Lock,
  Mail,
  Phone,
  UserCheck,
  X,
  Clock,
  User
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
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [inputName, setInputName] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [inputPhone, setInputPhone] = useState('');
  const [authStatus, setAuthStatus] = useState(null);

  const isApproved = currentUser?.status === 'approved' || currentUser?.role === 'super_admin';

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

  // Modals & UI
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
    try {
      const authStr = localStorage.getItem('npt_user_auth');
      if (authStr) {
        setCurrentUser(JSON.parse(authStr));
      }
    } catch (e) {}
    loadAllData();
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = inputEmail.trim().toLowerCase();
    let formattedPhone = inputPhone ? inputPhone.replace(/[^0-9]/g, "") : "";
    if (formattedPhone.startsWith("0")) formattedPhone = "62" + formattedPhone.slice(1);

    if (!cleanEmail && !formattedPhone) {
      alert("Masukkan Alamat Email Gmail atau Nomor WhatsApp!");
      return;
    }

    const cleanName = inputName.trim() || (cleanEmail ? cleanEmail.split("@")[0] : formattedPhone);
    setAuthStatus("checking");

    try {
      let query = supabase.from("profiles").select("*");
      if (cleanEmail && formattedPhone) {
        query = query.or(`email.eq.${cleanEmail},phone_number.eq.${formattedPhone}`);
      } else if (cleanEmail) {
        query = query.eq("email", cleanEmail);
      } else {
        query = query.eq("phone_number", formattedPhone);
      }

      const { data: profiles } = await query;
      const profile = profiles && profiles.length > 0 ? profiles[0] : null;

      if (profile && profile.status === "approved") {
        const userData = {
          id: profile.id,
          email: cleanEmail || profile.email,
          phone_number: formattedPhone || profile.phone_number,
          name: profile.full_name || cleanName,
          role: profile.role || "member",
          status: "approved"
        };
        setCurrentUser(userData);
        localStorage.setItem("npt_user_auth", JSON.stringify(userData));
        localStorage.setItem("participant_name", userData.name);
        setIsAuthModalOpen(false);
        setAuthStatus(null);
        alert("✅ Akses Member Terbuka! Anda sekarang dapat membuka seluruh 14 Akar Spiritual.");
      } else {
        if (!profile) {
          await supabase.from("profiles").insert([
            {
              full_name: cleanName,
              email: cleanEmail || null,
              phone_number: formattedPhone || null,
              role: "member",
              status: "pending"
            }
          ]);
        }
        setAuthStatus("pending");
      }
    } catch (err) {
      console.error(err);
      setAuthStatus("pending");
    }
  };

  const handleSelectRoot = (root) => {
    if (!isApproved) {
      setIsAuthModalOpen(true);
      return;
    }
    setSelectedRoot(root);
  };

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
      {/* Top Navbar & Sidebar Drawer */}
      <AppNavbar 
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        currentUser={currentUser}
        activeTitle="Buku Saku 14 Akar"
      />
      <AppSidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentUser={currentUser}
        activePath="/buku-saku"
      />

      {/* Subnav Action Bar */}
      <div className="bg-slate-100 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 py-2.5 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <nav className="flex items-center gap-1">
            <button
              onClick={() => { setSelectedRoot(null); setActiveTab('roots'); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'roots' && !selectedRoot
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              14 Akar
            </button>
            <button
              onClick={() => { 
                if (!isApproved) { setIsAuthModalOpen(true); return; }
                setSelectedRoot(null); 
                setActiveTab('journal'); 
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'journal'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <span>Jurnal ({journals.length})</span>
              {!isApproved && <Lock className="w-3 h-3 text-amber-500" />}
            </button>
            <button
              onClick={() => { 
                if (!isApproved) { setIsAuthModalOpen(true); return; }
                setSelectedRoot(null); 
                setActiveTab('assessment'); 
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'assessment'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <span>Pemetaan</span>
              {!isApproved && <Lock className="w-3 h-3 text-amber-500" />}
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (!isApproved) { setIsAuthModalOpen(true); return; }
                handleOpenQuickAdd();
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tambah Bahan</span>
            </button>
            {isApproved && (
              <button
                onClick={() => setIsDataModalOpen(true)}
                className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 cursor-pointer"
                title="Backup & Sinkronisasi JSON"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

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

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Sistem pemetaan spiritualitas berbasis 14 fondasi batin: dari sains biologi & neurobiologi, kearifan tasawuf & kitab hikmah, hingga budaya & pop-culture kontemporer.
                </p>

                {/* Status Lencana Akses */}
                <div className="pt-1 flex flex-wrap items-center gap-3">
                  {isApproved ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Akses Penuh Member Aktif (14 Akar Terbuka)</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => setIsAuthModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/40 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Mode Tamu: Masuk Member Untuk Buka Kunci Bab</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* GUEST BANNER PERINGATAN TERGEMBOK */}
            {!isApproved && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20 shrink-0">
                    <Lock className="w-5 h-5 text-rose-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      Dokumen & Latihan 14 Akar Khusus Member NPT
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Anda sedang melihat pratinjau daftar 14 Akar. Klik kartu akar manapun untuk masuk/daftar sebagai member terverifikasi.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition shrink-0 cursor-pointer"
                >
                  🔓 Masuk / Login Member
                </button>
              </div>
            )}

            {/* Sambutan & Panduan Guru Pembina */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs space-y-4">
              <button
                onClick={() => setShowPreface(!showPreface)}
                className="w-full flex items-center justify-between text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                      {GURU_PREFACE.title}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {GURU_PREFACE.subtitle} • {GURU_PREFACE.author}
                    </p>
                  </div>
                </div>
                <div className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">
                  {showPreface ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {showPreface && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  <p className="whitespace-pre-line italic bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                    "{GURU_PREFACE.quote}"
                  </p>

                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider text-rose-600 dark:text-rose-400">
                      Konsep & Filosofi Akar Spiritualitas
                    </h4>
                    <p>{GURU_PREFACE.intro}</p>
                    <p>{GURU_PREFACE.analogyTree}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <div className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 space-y-1.5">
                      <h5 className="font-bold text-rose-900 dark:text-rose-300 text-xs">
                        ⚠️ 4 Gejala Akar Rapuh
                      </h5>
                      <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                        {GURU_PREFACE.warningSigns.map((w, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-rose-500 font-bold">•</span>
                            <span><strong>{w.sign}:</strong> {w.desc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 space-y-1.5">
                      <h5 className="font-bold text-emerald-900 dark:text-emerald-300 text-xs">
                        🌱 4 Praktik Perawatan Akar
                      </h5>
                      <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                        {GURU_PREFACE.maintenancePractices.map((p, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-emerald-500 font-bold">✓</span>
                            <span><strong>{p.title}:</strong> {p.desc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
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
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs sm:text-sm shadow-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden placeholder:text-slate-400"
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
                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs shadow-amber-500/30'
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
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
                <Compass className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Tidak ada akar spiritual yang sesuai
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
                    onSelectRoot={(r) => handleSelectRoot(r)}
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
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    journalSubTab === 'list'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Daftar ({journals.length})
                </button>
                <button
                  onClick={() => setJournalSubTab('form')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    journalSubTab === 'form'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Tulis Baru
                </button>
                <button
                  onClick={() => setJournalSubTab('timer')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    journalSubTab === 'timer'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Timer Meditasi
                </button>
              </div>
            </div>

            {journalSubTab === 'list' && (
              <JournalList
                journals={journals}
                roots={roots}
                onDeleteJournal={handleDeleteJournal}
                onNewJournal={() => setJournalSubTab('form')}
                onStartTimer={() => setJournalSubTab('timer')}
              />
            )}

            {journalSubTab === 'form' && (
              <div className="max-w-2xl mx-auto">
                <JournalForm
                  roots={roots}
                  defaultRootId={practiceRoot}
                  defaultType={practiceType}
                  defaultDuration={completedDuration}
                  onSave={handleSaveJournal}
                  onCancel={() => setJournalSubTab('list')}
                />
              </div>
            )}

            {journalSubTab === 'timer' && (
              <div className="max-w-xl mx-auto">
                <MeditationTimer
                  roots={roots}
                  onCompletePractice={handleTimerComplete}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 pb-12">
            <AssessmentPreview roots={roots} />
          </div>
        )}
      </main>

      {/* Floating Bottom Nav for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-30 px-4 py-2">
        <div className="flex items-center justify-around">
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
            onClick={() => { 
              if (!isApproved) { setIsAuthModalOpen(true); return; }
              setSelectedRoot(null); 
              setActiveTab('journal'); 
            }}
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
            onClick={() => {
              if (!isApproved) { setIsAuthModalOpen(true); return; }
              handleOpenQuickAdd();
            }}
            className="flex flex-col items-center py-1 px-2 rounded-xl transition-all text-slate-500 dark:text-slate-400"
          >
            <PlusCircle className="w-5 h-5 text-rose-500" />
            <span className="text-[10px] mt-1">Input Bahan</span>
          </button>

          <button
            onClick={() => { 
              if (!isApproved) { setIsAuthModalOpen(true); return; }
              setSelectedRoot(null); 
              setActiveTab('assessment'); 
            }}
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

      {/* MODAL VERIFIKASI MEMBER KHUSUS 14 AKAR SPIRITUAL */}
      {isAuthModalOpen && (
        <div
          onClick={() => setIsAuthModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-slate-900 border border-rose-500/30 rounded-3xl p-6 shadow-2xl space-y-4 text-left"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Akses Member 14 Akar</h3>
                  <p className="text-[10px] text-slate-400">Buka Bab Kajian & Latihan Lengkap</p>
                </div>
              </div>
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {authStatus === "pending" ? (
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-2.5">
                <Clock className="w-8 h-8 text-amber-400 mx-auto animate-pulse" />
                <h4 className="text-xs font-bold text-amber-300">
                  Pendaftaran Berhasil Terkirim
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Data Anda sudah masuk di antrean persetujuan Admin NPT. Silakan hubungi admin via WhatsApp untuk aktivasi cepat.
                </p>
                <button
                  onClick={() => {
                    setAuthStatus(null);
                    setIsAuthModalOpen(false);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
                >
                  Tutup
                </button>
              </div>
            ) : (
              <form onSubmit={handleLoginSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nama Lengkap Anda
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    placeholder="Nama lengkap Anda..."
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Alamat Email Gmail
                  </label>
                  <input
                    type="email"
                    autoComplete="off"
                    placeholder="contoh: nama@gmail.com"
                    value={inputEmail}
                    onChange={(e) => setInputEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nomor WhatsApp
                  </label>
                  <input
                    type="tel"
                    autoComplete="off"
                    placeholder="08123456789"
                    value={inputPhone}
                    onChange={(e) => setInputPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-rose-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    *Bisa masukkan Email atau Nomor WA terdaftar.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={authStatus === "checking"}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition flex items-center justify-center gap-2 cursor-pointer mt-1"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{authStatus === "checking" ? "Memeriksa Status..." : "Masuk & Buka 14 Akar"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
