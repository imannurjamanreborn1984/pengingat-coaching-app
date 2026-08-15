"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Users, BookOpen, Clock } from "lucide-react";

export const dynamic = 'force-dynamic';

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState([]);
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
          assignments ( title )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (err) {
      console.error("Gagal mengambil data submissions:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="border-b border-slate-800 pb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-sky-400" /> Rekap Jawaban Peserta
            </h1>
            <p className="text-sm text-slate-400 mt-1">Pantau respon dan hasil refleksi harian peserta</p>
          </div>
          <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs px-3 py-1 rounded-full">
            Total Masuk: {submissions.length}
          </span>
        </div>

        {loading ? (
          <p className="text-xs text-slate-500 animate-pulse">Memuat rekap jawaban...</p>
        ) : submissions.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
            Belum ada peserta yang mengirimkan jawaban.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {submissions.map((sub) => (
              <div key={sub.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">{sub.user_name || "Peserta Anonymous"}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                      <BookOpen className="w-3 h-3 inline mr-1" />
                      {sub.assignments?.title || "Tugas Tanpa Judul"}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(sub.created_at).toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                  {sub.answer_text}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}