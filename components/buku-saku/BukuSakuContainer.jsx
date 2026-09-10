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
  const [isKitabTheme, setIsKitabTheme] = useState(true);

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
      let savedUser = null;
      const authStr = localStorage.getItem('npt_user_auth');
      if (authStr) {
        savedUser = JSON.parse(authStr);
      } else {
        const match = document.cookie.match(/(?:^|; )npt_device_auth=([^;]*)/);
        if (match) {
          savedUser = JSON.parse(decodeURIComponent(match[1]));
          localStorage.setItem('npt_user_auth', JSON.stringify(savedUser));
        }
      }
      if (savedUser) {
        setCurrentUser(savedUser);
      }
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab');
        if (tabParam === 'journal' || tabParam === 'diary') {
          setActiveTab('journal');
        }
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
        const jsonStr = JSON.stringify(userData);
        localStorage.setItem("npt_user_auth", jsonStr);
        localStorage.setItem("participant_name", userData.name);
        document.cookie = `npt_device_auth=${encodeURIComponent(jsonStr)}; path=/; max-age=315360000; SameSite=Lax`;
        setIsAuthModalOpen(false);
        setAuthStatus(null);
        alert("✅ Akses Member Terverifikasi! Perangkat Anda tersimpan.");
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

  const handleSaveJournal = async (entryData) => {
    DataService.saveJournal(entryData);
    setJournals(DataService.getJournals());
    setJournalSubTab('list');

    if (entryData.isSharedWithAdmin) {
      try {
        const userName = currentUser?.name || currentUser?.full_name || 'Peserta NPT';
        const userPhone = currentUser?.phone_number || null;
        const userEmail = currentUser?.email || null;

        await supabase.from("submissions").insert([
          {
            user_name: `${userName}${userPhone ? ` (${userPhone})` : ''}`,
            answer_text: `[📔 BUKU DIARY & TEMUAN HARIAN PESERTA]
📌 Judul: ${entryData.title}
📅 Tanggal: ${entryData.date}
🎯 Akar Terkait: ${entryData.targetRootName}
🏃 Kategori: ${entryData.practiceType}
⚡ Level Energi: ${entryData.energyLevelBefore} ➔ ${entryData.energyLevelAfter}
🧘 Sensasi Somatik: ${entryData.somaticSensations ? entryData.somaticSensations.join(", ") : "-"}

📖 ISI CATATAN HARIAN:
${entryData.notes}

💡 TEMUAN HARIAN (INSIGHTS):
${entryData.findings || "-"}

🎯 EVALUASI DIRI:
${entryData.evaluation || "-"}

🔗 LAMPIRAN MEDIA:
${entryData.imageUrl ? `📷 Foto: ${entryData.imageUrl}\n` : ""}${entryData.youtubeUrl ? `🎬 YouTube: ${entryData.youtubeUrl}\n` : ""}${entryData.gdriveUrl ? `☁️ Drive: ${entryData.gdriveUrl}\n` : ""}`,
            created_at: new Date().toISOString()
          }
        ]);
        alert("✅ Diary berhasil disimpan di perangkat dan DI-SHARE ke Admin (Kang Iman)!");
      } catch (e) {
        console.error("Gagal share ke admin:", e);
        alert("Diary tersimpan secara pribadi di HP Anda.");
      }
    } else {
      alert("🔒 Diary berhasil disimpan sebagai Catatan Pribadi di HP Anda.");
    }
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
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${
      isKitabTheme ? "bg-parchment text-[#231409]" : "bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
    }`}>
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

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 pb-24 space-y-6">
        
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link
              href="/npt"
              className={`p-2 rounded-xl border transition ${
                isKitabTheme
                  ? 'bg-[#eee3cb] text-[#4a2e12] border-[#d8c3a1] hover:bg-[#dfcdab]'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
              title="Kembali ke Modul NPT"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className={`text-lg sm:text-2xl font-black ${
                isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-slate-100'
              }`}>
                Buku Saku 14 Akar Spiritualitas
              </h1>
              <p className={`text-xs ${isKitabTheme ? 'text-[#634224]' : 'text-slate-400'}`}>
                Ensiklopedi Sains, Kitab Hikmah, & Jurnal Temuan Harian Peserta
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={() => setIsKitabTheme(!isKitabTheme)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                isKitabTheme
                  ? 'bg-[#fdfaf3] text-[#3a2211] border-[#cbb38b] hover:bg-[#ebdcc4]'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <span>{isKitabTheme ? "📜 Mode Kitab" : "🌌 Mode Dark"}</span>
            </button>

            {currentUser?.role === 'super_admin' && (
              <button
                onClick={() => setIsDataModalOpen(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                  isKitabTheme
                    ? 'bg-[#eee3cb] text-[#4a2e12] border-[#d8c3a1] hover:bg-[#dfcdab]'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
                title="Backup / Restore Data"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Backup/Restore</span>
              </button>
            )}
          </div>
        </div>

        {/* Selected Root Detail View */}
        {selectedRoot ? (
          <MultiPerspectiveView
            root={selectedRoot}
            onBack={() => setSelectedRoot(null)}
            onOpenQuickAdd={handleOpenQuickAdd}
            onStartPractice={handleStartPractice}
            isBookmarked={bookmarks.includes(selectedRoot.id)}
            onToggleBookmark={handleToggleBookmark}
            isKitabTheme={isKitabTheme}
          />
        ) : (
          <>
            {/* Main Tabs Navigation: 14 Akar vs Buku Diary vs Radar Fitur */}
            <div className="flex border-b border-[#dfcfb0] dark:border-slate-800">
              <button
                onClick={() => setActiveTab('roots')}
                className={`px-5 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
                  activeTab === 'roots'
                    ? isKitabTheme ? 'border-[#9e2a2b] text-[#9e2a2b] bg-[#f5ebd7]/50' : 'border-rose-500 text-rose-400 bg-slate-900/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Katalog 14 Akar</span>
              </button>

              <button
                onClick={() => setActiveTab('journal')}
                className={`px-5 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
                  activeTab === 'journal'
                    ? isKitabTheme ? 'border-[#9e2a2b] text-[#9e2a2b] bg-[#f5ebd7]/50' : 'border-rose-500 text-rose-400 bg-slate-900/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <PenTool className="w-4 h-4" />
                <span>📔 Buku Diary & Temuan Harian ({journals.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('assessment')}
                className={`px-5 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
                  activeTab === 'assessment'
                    ? isKitabTheme ? 'border-[#9e2a2b] text-[#9e2a2b] bg-[#f5ebd7]/50' : 'border-rose-500 text-rose-400 bg-slate-900/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Radar Pemetaan</span>
              </button>
            </div>

            {/* TAB 1: KATALOG 14 AKAR */}
            {activeTab === 'roots' && (
              <div className="space-y-6 animate-in fade-in">
                {/* Search & Element Filter */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                      isKitabTheme ? 'text-[#82613d]' : 'text-slate-500'
                    }`} />
                    <input
                      type="text"
                      placeholder="Cari nama akar, keyword, ayat, atau nama jurnal sains..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs focus:outline-none ${
                        isKitabTheme
                          ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b] placeholder:text-[#9e876a]'
                          : 'bg-slate-900 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-rose-500'
                      }`}
                    />
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto">
                    <select
                      value={selectedElement}
                      onChange={(e) => setSelectedElement(e.target.value)}
                      className={`px-3 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none cursor-pointer ${
                        isKitabTheme
                          ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b]'
                          : 'bg-slate-900 border-slate-800 text-slate-200'
                      }`}
                    >
                      {ELEMENTS.map((el) => (
                        <option key={el.id} value={el.id}>
                          {el.label}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
                      className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                        showBookmarksOnly
                          ? 'bg-amber-500 text-white border-amber-600'
                          : isKitabTheme
                          ? 'bg-[#eee3cb] text-[#4a2e12] border-[#d8c3a1] hover:bg-[#dfcdab]'
                          : 'bg-slate-900 text-slate-300 border-slate-800'
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>{showBookmarksOnly ? 'Bookmark Saja' : 'Semua'}</span>
                    </button>
                  </div>
                </div>

                {/* Grid 14 Akar Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredRoots.map((root) => (
                    <RootCard
                      key={root.id}
                      root={root}
                      onSelect={handleSelectRoot}
                      onSelectRoot={handleSelectRoot}
                      isBookmarked={bookmarks.includes(root.id)}
                      onToggleBookmark={handleToggleBookmark}
                      isKitabTheme={isKitabTheme}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: BUKU DIARY TEMUAN HARIAN */}
            {activeTab === 'journal' && (
              <div className="space-y-6 animate-in fade-in">
                {/* Toolbar Subtab Journal */}
                <div className="flex items-center justify-between gap-3 border-b border-[#dfcfb0] dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setJournalSubTab('list')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        journalSubTab === 'list'
                          ? isKitabTheme ? 'bg-[#3a2211] text-[#fbf6ec] border-[#8f632d]' : 'bg-slate-800 text-white border-slate-700'
                          : isKitabTheme ? 'bg-[#eee3cb] text-[#543516] border-[#d8c3a1]' : 'text-slate-400 border-transparent'
                      }`}
                    >
                      Riwayat Diary ({journals.length})
                    </button>
                    <button
                      onClick={() => setJournalSubTab('form')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border flex items-center gap-1.5 ${
                        journalSubTab === 'form'
                          ? isKitabTheme ? 'bg-[#9e2a2b] text-white border-[#8f632d]' : 'bg-rose-600 text-white border-rose-500'
                          : isKitabTheme ? 'bg-[#eee3cb] text-[#543516] border-[#d8c3a1]' : 'text-slate-400 border-transparent'
                      }`}
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>+ Tulis Catatan Baru</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setJournalSubTab('timer')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                      journalSubTab === 'timer'
                        ? 'bg-amber-500 text-white border-amber-600'
                        : isKitabTheme ? 'bg-[#eee3cb] text-[#543516] border-[#d8c3a1]' : 'bg-slate-900 text-slate-300 border-slate-800'
                    }`}
                  >
                    <Timer className="w-3.5 h-3.5" />
                    <span>Timer Hening Somatik</span>
                  </button>
                </div>

                {/* Subtab Content */}
                {journalSubTab === 'list' && (
                  <JournalList
                    journals={journals}
                    onDeleteJournal={handleDeleteJournal}
                    isKitabTheme={isKitabTheme}
                  />
                )}

                {journalSubTab === 'form' && (
                  <JournalForm
                    roots={roots}
                    selectedRoot={practiceRoot}
                    initialPracticeType={practiceType}
                    initialDuration={completedDuration}
                    onSave={handleSaveJournal}
                    onCancel={() => setJournalSubTab('list')}
                    isKitabTheme={isKitabTheme}
                  />
                )}

                {journalSubTab === 'timer' && (
                  <MeditationTimer
                    onComplete={handleTimerComplete}
                    isKitabTheme={isKitabTheme}
                  />
                )}
              </div>
            )}

            {/* TAB 3: RADAR PEMETAAN & ASSESSMENT */}
            {activeTab === 'assessment' && (
              <AssessmentPreview
                roots={roots}
                onNavigateToRoot={(rootId) => {
                  const rootObj = roots.find((r) => r.id === rootId);
                  if (rootObj) setSelectedRoot(rootObj);
                }}
                isKitabTheme={isKitabTheme}
              />
            )}
          </>
        )}
      </main>

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        roots={roots}
        defaultRootId={quickAddRootId}
        defaultCategory={quickAddCategory}
        onSave={handleSaveQuickAdd}
        isKitabTheme={isKitabTheme}
      />

      {/* Data Management Modal */}
      {isDataModalOpen && (
        <DataManagementModal
          isOpen={isDataModalOpen}
          onClose={() => setIsDataModalOpen(false)}
          onDataRestored={loadAllData}
          isKitabTheme={isKitabTheme}
        />
      )}
    </div>
  );
}
