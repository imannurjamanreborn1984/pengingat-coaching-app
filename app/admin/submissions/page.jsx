"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { 
  Users, 
  BookOpen, 
  Clock, 
  FileDown, 
  ArrowLeft, 
  RefreshCw, 
  Share2, 
  CheckCircle2, 
  Sparkles, 
  X, 
  Send, 
  Layers, 
  UserCheck, 
  ShieldCheck, 
  Tag 
} from "lucide-react";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { saveAs } from "file-saver";
import { AppNavbar, AppSidebar } from "@/components/layout/AppNavbar";
import AdminHeaderTabs from "@/components/admin/AdminHeaderTabs";

export const dynamic = 'force-dynamic';

export default function AdminSubmissions() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isKitabTheme, setIsKitabTheme] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [groupedSubmissions, setGroupedSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [curatedMaterials, setCuratedMaterials] = useState([]);

  // State Modal Kurasi
  const [selectedSubForCuration, setSelectedSubForCuration] = useState(null);
  const [curateLevel, setCurateLevel] = useState(1);
  const [curateTitle, setCurateTitle] = useState("");
  const [curateContent, setCurateContent] = useState("");
  const [curateAuthorType, setCurateAuthorType] = useState("real"); // 'real' | 'anonymous'
  const [curateImageUrl, setCurateImageUrl] = useState("");
  const [curateNote, setCurateNote] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    try {
      const authStr = localStorage.getItem("npt_user_auth");
      if (authStr) setCurrentUser(JSON.parse(authStr));
    } catch (e) {}
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("submissions")
        .select(`
          id,
          user_name,
          answer_text,
          created_at,
          assignments ( id, title )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Grouping data berdasarkan judul tugas/assignment
      const grouped = (data || []).reduce((acc, item) => {
        const title = item.assignments?.title || "Tugas Tanpa Judul";
        if (!acc[title]) {
          acc[title] = [];
        }
        acc[title].push(item);
        return acc;
      }, {});

      setGroupedSubmissions(grouped);

      // Ambil materi yang sudah pernah dikurasi ke npt_materials
      try {
        const { data: mats } = await supabase
          .from("npt_materials")
          .select("id, level, title, created_at, file_type")
          .order("created_at", { ascending: false });
        if (mats) setCuratedMaterials(mats);
      } catch (err) {
        console.warn("Info fetch npt_materials:", err.message);
      }
    } catch (err) {
      console.error("Gagal mengambil data submissions:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Buka Modal Kurasi
  const handleOpenCurateModal = (sub) => {
    setSelectedSubForCuration(sub);
    const text = sub.answer_text || "";

    let title = "";
    let notes = text;
    let imageUrl = "";

    const titleMatch = text.match(/📌 Judul:\s*(.+)/);
    if (titleMatch) title = titleMatch[1].trim();

    const imgMatch = text.match(/📷 Link Foto\/Gambar:\s*(.+)/);
    if (imgMatch) imageUrl = imgMatch[1].trim();

    const notesMatch = text.match(/📖 CATATAN & TEMUAN:\s*([\s\S]*?)(?=\n📷|$)/);
    if (notesMatch) notes = notesMatch[1].trim();

    if (!title) {
      title = `Catatan Refleksi: ${sub.user_name || "Sahabat NPT"}`;
    }

    // Deteksi level otomatis jika ada kata "Level X"
    let detectedLevel = 1;
    const levelMatch = text.match(/Level\s*([1-6])/i) || sub.user_name?.match(/Level\s*([1-6])/i);
    if (levelMatch && levelMatch[1]) {
      detectedLevel = Number(levelMatch[1]);
    }

    setCurateLevel(detectedLevel);
    setCurateTitle(title);
    setCurateContent(notes);
    setCurateImageUrl(imageUrl);
    setCurateAuthorType("real");
    setCurateNote("");
  };

  // Eksekusi Terbitkan ke Sahabat Se-Level
  const handlePublishCurated = async (e) => {
    if (e) e.preventDefault();
    if (!curateTitle.trim() || !curateContent.trim()) {
      alert("Judul dan Isi Catatan tidak boleh kosong.");
      return;
    }

    setIsPublishing(true);
    try {
      const rawName = selectedSubForCuration?.user_name?.split("(")[0]?.trim() || "Sahabat NPT";
      const authorLabel = curateAuthorType === "anonymous" 
        ? `Draf Buku NPT • Refleksi Sahabat Level ${curateLevel} (Anonim)`
        : `Draf Buku NPT • Ditulis oleh: ${rawName} (Level ${curateLevel})`;

      const finalContent = curateNote.trim()
        ? `${curateContent.trim()}\n\n━━━━━━━━━━━━━━━━━━━━\n💡 Catatan Guru / Kurator:\n${curateNote.trim()}`
        : curateContent.trim();

      const payload = {
        level: Number(curateLevel),
        title: `[Inspirasi Sahabat] ${curateTitle.trim()}`,
        subtitle: authorLabel,
        content: finalContent,
        image_url: curateImageUrl || "",
        file_type: "draf_buku",
        is_published: true,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from("npt_materials").insert([payload]);
      if (error) throw error;

      alert(`✅ Berhasil Diterbitkan!\nDiary berhasil dibagikan ke Sahabat NPT Level ${curateLevel} dan siap menjadi materi draf buku.`);
      setSelectedSubForCuration(null);
      fetchSubmissions();
    } catch (err) {
      console.error("Gagal menerbitkan:", err);
      alert("Gagal menerbitkan: " + err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  // Fungsi untuk Export kelompok jawaban ke File Word (.docx)
  const exportToWord = async (title, items) => {
    try {
      const docChildren = [
        new Paragraph({
          text: `Rekap Jawaban: ${title}`,
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 300 },
        }),
        new Paragraph({
          text: `Total Respon: ${items.length} | Di-export pada: ${new Date().toLocaleDateString("id-ID")}`,
          spacing: { after: 400 },
        }),
      ];

      items.forEach((item, index) => {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${index + 1}. ${item.user_name || "Peserta Anonymous"} `,
                bold: true,
                size: 24,
              }),
              new TextRun({
                text: `(${new Date(item.created_at).toLocaleString("id-ID")})`,
                italics: true,
                size: 20,
                color: "666666",
              }),
            ],
            spacing: { before: 200 },
          })
        );

        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: item.answer_text || "-",
                size: 22,
              }),
            ],
            spacing: { after: 200 },
          })
        );
      });

      const doc = new Document({
        sections: [{ properties: {}, children: docChildren }],
      });

      const blob = await Packer.toBlob(doc);
      const sanitizedTitle = (title || "Tugas").replace(/[^a-zA-Z0-9_-]/g, "_");
      saveAs(blob, `Rekap_${sanitizedTitle}.docx`);
    } catch (err) {
      console.error("Gagal export Word:", err);
      alert("Gagal mengunduh file Word: " + err.message);
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
        activeTitle="Rekap Jawaban & Evaluasi"
      />
      <AppSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentUser={currentUser || { name: "Admin Utama", role: "super_admin" }}
        activePath="/admin/submissions"
      />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {/* Admin Quick Switch Tabs */}
        <AdminHeaderTabs 
          activeTab="submissions" 
          isKitabTheme={isKitabTheme}
          onToggleTheme={() => setIsKitabTheme(!isKitabTheme)}
        />

        {/* Header */}
        <div className={`border-b pb-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 ${
          isKitabTheme ? 'border-[#dfcfb0]' : 'border-slate-800'
        }`}>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🏛️</span>
              <h1 className={`text-xl sm:text-2xl font-bold ${
                isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-white'
              }`}>
                Rekap Tugas Rumah NPT (Asuhan Sang Guru)
              </h1>
            </div>
            <p className={`text-xs mt-1 ${isKitabTheme ? 'text-[#634224]' : 'text-slate-400'}`}>
              Evaluasi jawaban tugas modul Level 1–6 peserta NPT. Setoran otomatis terkelompok berdasarkan judul tugas.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={fetchSubmissions}
              disabled={loading}
              className={`p-2.5 text-xs font-semibold rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
                isKitabTheme
                  ? 'bg-[#eee3cb] text-[#3a2211] border-[#d8c3a1] hover:bg-[#dfcdab]'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
              }`}
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? (isKitabTheme ? "animate-spin text-amber-700" : "animate-spin text-sky-400") : ""}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>
          </div>
        </div>

        {/* Banner Pemisah Rumah EMT & NPT */}
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          isKitabTheme ? 'bg-[#f4ebd5] border-[#d8c3a1]' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏫</span>
            <div>
              <h4 className="text-xs font-bold text-[#26150a] dark:text-white">
                Mencari Setoran Jurnal Refleksi EMT (Asuhan Kang Iman)?
              </h4>
              <p className="text-[11px] text-slate-500">
                Jurnal refleksi 5 emosi & checklist 21 hari peserta EMT dikelola terpisah di Ruang Kontrol EMT.
              </p>
            </div>
          </div>

          <Link
            href="/admin/emt"
            className="px-3.5 py-1.5 rounded-xl bg-[#1b6b55] hover:bg-[#155644] text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0"
          >
            <span>Buka Ruang Kontrol EMT</span>
            <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
          </Link>
        </div>

        {loading ? (
          <div className={`py-12 text-center text-xs ${isKitabTheme ? 'text-[#82613d]' : 'text-slate-500'}`}>
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-600" />
            <p className="animate-pulse">Memuat rekap jawaban peserta...</p>
          </div>
        ) : Object.keys(groupedSubmissions).length === 0 ? (
          <div className={`rounded-3xl p-12 text-center text-xs space-y-2 shadow-sm ${
            isKitabTheme ? 'card-kitab-frame' : 'bg-slate-900 border border-slate-800 text-slate-400'
          }`}>
            <Users className={`w-10 h-10 mx-auto ${isKitabTheme ? 'text-[#a17c52]' : 'text-slate-600'}`} />
            <p className={`font-bold text-sm ${isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-slate-300'}`}>
              Belum ada peserta yang mengirimkan jawaban tugas.
            </p>
            <p className={`text-[11px] ${isKitabTheme ? 'text-[#734822]' : 'text-slate-500'}`}>
              Jawaban yang disetor peserta di menu Reminder & Penugasan akan otomatis masuk ke sini.
            </p>
          </div>
        ) : (
          Object.entries(groupedSubmissions).map(([title, items]) => (
            <div key={title} className={`rounded-3xl p-6 space-y-4 shadow-sm ${
              isKitabTheme ? 'card-kitab-frame' : 'bg-slate-900 border border-slate-800 shadow-xl'
            }`}>
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-3 ${
                isKitabTheme ? 'border-[#dfcfb0]' : 'border-slate-800'
              }`}>
                <div className="space-y-1">
                  <h2 className={`text-base sm:text-lg font-bold flex items-center gap-2 ${
                    isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-white'
                  }`}>
                    <BookOpen className={`w-5 h-5 ${isKitabTheme ? 'text-[#9e2a2b]' : 'text-sky-400'}`} />
                    {title}
                  </h2>
                  <span className={`text-xs ${isKitabTheme ? 'text-[#634224]' : 'text-slate-400'}`}>
                    Total Respon Peserta: <strong className={isKitabTheme ? 'text-[#9e2a2b]' : 'text-sky-400'}>{items.length}</strong>
                  </span>
                </div>

                <button
                  onClick={() => exportToWord(title, items)}
                  className={`text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all w-fit shadow-md cursor-pointer ${
                    isKitabTheme
                      ? 'bg-gradient-to-r from-[#9e2a2b] via-[#b38b42] to-[#8f632d] hover:brightness-110 text-white shadow-amber-900/20'
                      : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/30'
                  }`}
                >
                  <FileDown className="w-4 h-4" /> Export ke Word (.docx)
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {items.map((sub) => (
                  <div key={sub.id} className={`p-4 rounded-2xl border space-y-2 ${
                    isKitabTheme
                      ? 'bg-[#fdfbf6] border-[#decba4]'
                      : 'bg-slate-950 border-slate-800'
                  }`}>
                    <div className={`flex justify-between items-center text-xs border-b pb-2 ${
                      isKitabTheme ? 'border-[#ede0c8] text-[#734822]' : 'border-slate-800/60 text-slate-400'
                    }`}>
                      <span className={`font-bold ${isKitabTheme ? 'text-[#26150a]' : 'text-slate-200'}`}>
                        {sub.user_name || "Peserta Anonymous"}
                      </span>
                      <span className={`text-[10px] flex items-center gap-1 ${
                        isKitabTheme ? 'text-[#82613d]' : 'text-slate-500'
                      }`}>
                        <Clock className="w-3 h-3" />
                        {new Date(sub.created_at).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className={`text-xs whitespace-pre-line leading-relaxed pt-1 ${
                      isKitabTheme ? 'text-[#331d10] font-kitab-body' : 'text-slate-300'
                    }`}>
                      {sub.answer_text}
                    </div>

                    {/* Action Bar Kurasi */}
                    {(() => {
                      const isCurated = curatedMaterials.find((m) => {
                        const titleMatch = sub.answer_text?.match(/📌 Judul:\s*(.+)/);
                        const targetTitle = titleMatch ? titleMatch[1].trim() : "";
                        return targetTitle && m.title?.includes(targetTitle);
                      });

                      return (
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 mt-2 border-t border-[#ede0c8] dark:border-slate-800">
                          {isCurated ? (
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Sudah Terbit di Level {isCurated.level} (Draf Buku)</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-[#82613d] dark:text-slate-500 flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                              <span>Status: Arsip Masuk Khusus Admin</span>
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleOpenCurateModal(sub)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs ${
                              isKitabTheme
                                ? 'bg-[#3a2211] hover:bg-[#26150a] text-white shadow-amber-950/20'
                                : 'bg-rose-600 hover:bg-rose-500 text-white'
                            }`}
                            title="Kurasi dan terbitkan ke teman-teman se-level peserta"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>📢 Kurasi & Share ke Se-Level</span>
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </main>

      {/* MODAL KURASI & PUBLIKASI DIARY KE SAHABAT SE-LEVEL */}
      {selectedSubForCuration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className={`border rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-5 text-left ${
            isKitabTheme
              ? 'bg-[#fdfaf3] border-[#cbb38b] text-[#26150a]'
              : 'bg-slate-900 border-slate-800 text-slate-100'
          }`}>
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-[#dfcfb0] dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center border border-amber-500/20">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className={`text-base sm:text-lg font-bold tracking-tight ${
                    isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-slate-100'
                  }`}>
                    📢 Kurasi & Bagikan ke Sahabat Se-Level
                  </h3>
                  <p className={`text-xs mt-0.5 ${isKitabTheme ? 'text-[#634224]' : 'text-slate-400'}`}>
                    Terbitkan temuan ini ke modul level peserta & arsipkan sebagai draf bab buku NPT.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedSubForCuration(null)}
                className={`p-1.5 rounded-xl transition cursor-pointer ${
                  isKitabTheme ? 'text-[#734822] hover:bg-[#dfcdab]' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishCurated} className="space-y-4">
              {/* Target Level */}
              <div>
                <label className="block text-xs font-bold mb-1.5">
                  1. Pilih Target Level Penerima:
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setCurateLevel(lvl)}
                      className={`py-2 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                        curateLevel === lvl
                          ? isKitabTheme
                            ? 'bg-[#3a2211] text-amber-300 border-[#8f632d] shadow-sm'
                            : 'bg-rose-600 text-white border-rose-500'
                          : isKitabTheme
                            ? 'bg-[#eee3cb] text-[#543516] border-[#d8c3a1] hover:bg-[#dfcdab]'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      Lvl {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Opsi Nama Penulis / Anonim */}
              <div>
                <label className="block text-xs font-bold mb-1.5">
                  2. Atribusi Penulis (Privasi Peserta):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCurateAuthorType("real")}
                    className={`p-2.5 rounded-xl text-xs font-bold border text-left flex items-center gap-2 cursor-pointer transition ${
                      curateAuthorType === "real"
                        ? isKitabTheme
                          ? 'bg-[#edd8b6] text-[#26150a] border-[#8f632d]'
                          : 'bg-slate-800 text-white border-rose-500'
                        : isKitabTheme
                          ? 'bg-[#f4ebd5] text-[#734822] border-[#d8c3a1]'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="leading-tight">Nama Asli Peserta</p>
                      <span className="text-[10px] font-normal opacity-80">
                        {selectedSubForCuration?.user_name?.split("(")[0]?.trim() || "Nama Peserta"}
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurateAuthorType("anonymous")}
                    className={`p-2.5 rounded-xl text-xs font-bold border text-left flex items-center gap-2 cursor-pointer transition ${
                      curateAuthorType === "anonymous"
                        ? isKitabTheme
                          ? 'bg-[#edd8b6] text-[#26150a] border-[#8f632d]'
                          : 'bg-slate-800 text-white border-rose-500'
                        : isKitabTheme
                          ? 'bg-[#f4ebd5] text-[#734822] border-[#d8c3a1]'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <div>
                      <p className="leading-tight">Anonim (Disamarkan)</p>
                      <span className="text-[10px] font-normal opacity-80">
                        "Sahabat NPT Level {curateLevel}"
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Judul Materi Draf Buku */}
              <div>
                <label className="block text-xs font-bold mb-1.5">
                  3. Judul Catatan / Judul Draf Buku:
                </label>
                <input
                  type="text"
                  value={curateTitle}
                  onChange={(e) => setCurateTitle(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:outline-hidden ${
                    isKitabTheme
                      ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b] focus:border-[#8f632d]'
                      : 'bg-slate-950 border-slate-800 text-white focus:border-rose-500'
                  }`}
                  placeholder="Judul temuan / refleksi batin"
                />
              </div>

              {/* Isi Refleksi */}
              <div>
                <label className="block text-xs font-bold mb-1.5">
                  4. Isi Catatan (Bisa Diedit / Dipoles untuk Draf Buku):
                </label>
                <textarea
                  rows={6}
                  value={curateContent}
                  onChange={(e) => setCurateContent(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs leading-relaxed focus:outline-hidden font-sans ${
                    isKitabTheme
                      ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b] focus:border-[#8f632d]'
                      : 'bg-slate-950 border-slate-800 text-white focus:border-rose-500'
                  }`}
                  placeholder="Isi catatan pengalaman batin peserta..."
                />
              </div>

              {/* Catatan / Faedah dari Guru/Admin */}
              <div>
                <label className="block text-xs font-bold mb-1.5">
                  5. Catatan / Faedah Hikmah dari Guru (Opsional):
                </label>
                <input
                  type="text"
                  value={curateNote}
                  onChange={(e) => setCurateNote(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-hidden ${
                    isKitabTheme
                      ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b] focus:border-[#8f632d]'
                      : 'bg-slate-950 border-slate-800 text-white focus:border-rose-500'
                  }`}
                  placeholder="Contoh: Sangat selaras dengan Maqamat Al-Hikam bab Tawakkal..."
                />
              </div>

              {/* Foto Lampiran */}
              {curateImageUrl && (
                <div className="p-3 rounded-xl border bg-amber-500/5 border-amber-500/20 text-xs space-y-1">
                  <span className="font-bold flex items-center gap-1 text-amber-700">
                    📷 Foto Lampiran Terdeteksi:
                  </span>
                  <a
                    href={curateImageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-sky-600 underline truncate block"
                  >
                    {curateImageUrl}
                  </a>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#dfcfb0] dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedSubForCuration(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isKitabTheme ? 'text-[#734822] hover:bg-[#dfcdab]' : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPublishing}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition flex items-center gap-2 shadow-md cursor-pointer ${
                    isPublishing
                      ? 'opacity-60 cursor-not-allowed bg-slate-600'
                      : isKitabTheme
                        ? 'bg-[#3a2211] hover:bg-[#26150a] shadow-amber-950/20'
                        : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isPublishing ? 'Menerbitkan...' : `Terbitkan ke Level ${curateLevel}`}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}