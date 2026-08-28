"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Users, BookOpen, Clock, FileDown, ArrowLeft, RefreshCw } from "lucide-react";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { saveAs } from "file-saver";

export const dynamic = 'force-dynamic';

export default function AdminSubmissions() {
  const [groupedSubmissions, setGroupedSubmissions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
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
        // Nama Peserta & Waktu
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

        // Teks Jawaban
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
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link
                href="/admin/dashboard"
                className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-800 transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-sky-400" />
                <span>Dashboard Admin</span>
              </Link>
              <Link
                href="/dashboard"
                className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-800 transition"
              >
                Tampilan Peserta
              </Link>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-sky-400" /> Rekap Jawaban Peserta
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Jawaban otomatis dikelompokkan berdasarkan klaster pertanyaan
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={fetchSubmissions}
              disabled={loading}
              className="p-2 text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg transition flex items-center gap-1.5"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-sky-400" : ""}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-xs text-slate-500 animate-pulse">Memuat rekap jawaban...</p>
        ) : Object.keys(groupedSubmissions).length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
            Belum ada peserta yang mengirimkan jawaban.
          </div>
        ) : (
          /* Mapping Berdasarkan Kelompok Pertanyaan/Tugas */
          Object.entries(groupedSubmissions).map(([title, items]) => (
            <div key={title} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              
              {/* Header Partisi / Klaster */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-sky-400" />
                    {title}
                  </h2>
                  <span className="text-xs text-slate-400">
                    Total Respon: <strong className="text-sky-400">{items.length}</strong>
                  </span>
                </div>

                {/* Tombol Export ke Word per Pertanyaan */}
                <button
                  onClick={() => exportToWord(title, items)}
                  className="bg-sky-600 hover:bg-sky-500 text-white text-xs px-4 py-2 rounded-lg flex items-center gap-2 transition-all w-fit"
                >
                  <FileDown className="w-4 h-4" /> Export Word (.docx)
                </button>
              </div>

              {/* Daftar Jawaban dalam Klaster Ini */}
              <div className="grid grid-cols-1 gap-3">
                {items.map((sub) => (
                  <div key={sub.id} className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs text-slate-400 border-b border-slate-800/60 pb-2">
                      <span className="font-semibold text-slate-200">
                        {sub.user_name || "Peserta Anonymous"}
                      </span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(sub.created_at).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed pt-1">
                      {sub.answer_text}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}