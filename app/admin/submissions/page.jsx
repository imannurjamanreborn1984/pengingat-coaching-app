"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Users, BookOpen, Clock, FileDown, ArrowLeft, RefreshCw } from "lucide-react";
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
    } catch (err) {
      console.error("Gagal mengambil data submissions:", err.message);
    } finally {
      setLoading(false);
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
            <h1 className={`text-xl sm:text-2xl font-bold flex items-center gap-2 ${
              isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-white'
            }`}>
              <Users className={`w-6 h-6 ${isKitabTheme ? 'text-[#9e2a2b]' : 'text-sky-400'}`} />
              <span>Periksa Jawaban & Evaluasi Peserta</span>
            </h1>
            <p className={`text-xs mt-1 ${isKitabTheme ? 'text-[#634224]' : 'text-slate-400'}`}>
              Jawaban otomatis dikelompokkan berdasarkan klaster tugas untuk dievaluasi atau di-export ke Word (.docx).
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
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}