"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CheckCircle2, Circle, ExternalLink, MessageSquare, Image as ImageIcon } from "lucide-react";

export default function UserDashboard() {
  const [tasks, setTasks] = useState([]);
  const [answers, setAnswers] = useState({});
  const [completedTasks, setCompletedTasks] = useState({});
  const [loading, setLoading] = useState(true);

  // Load daftar To-Do / Task dari Supabase
  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("assignments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error("Gagal mengambil data tugas:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleInputChange = (taskId, value) => {
    setAnswers((prev) => ({ ...prev, [taskId]: value }));
  };

  const handleToggleComplete = async (taskId) => {
    const isDone = completedTasks[taskId];
    setCompletedTasks((prev) => ({ ...prev, [taskId]: !isDone }));
    
    // Di sini kamu bisa menambahkan logika simpan ke tabel submissions jika sistem login auth sudah dipasang
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500 text-sm animate-pulse">Memuat persiapan pelatihan...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 pb-12">
      {/* Header Mobile Friendly */}
      <div className="bg-sky-600 text-white p-6 rounded-b-2xl shadow-md">
        <h1 className="text-xl font-bold">Persiapan Training</h1>
        <p className="text-sky-100 text-xs mt-1">Target Event: 22 Agustus 2026</p>
      </div>

      <div className="p-4 space-y-6 mt-2">
        {tasks.length === 0 ? (
          <div className="bg-white p-6 rounded-xl border text-center text-slate-500 text-sm">
            Belum ada tugas persiapan hari ini.
          </div>
        ) : (
          tasks.map((task) => {
            const isDone = completedTasks[task.id];
            return (
              <div
                key={task.id}
                className={`bg-white rounded-xl border shadow-sm overflow-hidden transition ${
                  isDone ? "border-emerald-300 bg-emerald-50/20" : "border-slate-200"
                }`}
              >
                {/* Header Task */}
                <div className="p-4 border-b bg-slate-50/50 flex items-center justify-between">
                  <h2 className="font-semibold text-slate-800 text-sm">{task.title}</h2>
                  <span className="text-[10px] bg-sky-100 text-sky-700 font-medium px-2 py-0.5 rounded-full">
                    {task.publish_date}
                  </span>
                </div>

                <div className="p-4 space-y-4">
                  {/* Teks Chat Grup WA */}
                  {task.group_chat_text && (
                    <div className="p-3 bg-amber-50 border border-amber-200/60 rounded-lg text-xs text-amber-900 leading-relaxed flex gap-2">
                      <MessageSquare className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold block mb-0.5">Pesan Mentor:</span>
                        {task.group_chat_text}
                      </div>
                    </div>
                  )}

                  {/* Gambar Materi */}
                  {task.image_url && (
                    <div className="rounded-lg overflow-hidden border bg-black/5">
                      <img src={task.image_url} alt="Materi" className="w-full h-auto object-cover" />
                    </div>
                  )}

                  {/* External Link */}
                  {task.external_link && (
                    <a
                      href={task.external_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-sky-600 hover:underline font-medium"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Buka Link Referensi / Video
                    </a>
                  )}

                  {/* Pertanyaan Hasil OCR */}
                  {task.ocr_extracted_text && (
                    <div className="space-y-2 pt-2 border-t">
                      <label className="block text-xs font-semibold text-slate-700">
                        Refleksi / Pertanyaan Evaluasi:
                      </label>
                      <div className="p-2.5 bg-slate-50 rounded-lg text-xs text-slate-600 whitespace-pre-line leading-relaxed border">
                        {task.ocr_extracted_text}
                      </div>
                    </div>
                  )}

                  {/* Form Input Jawaban */}
                  <div className="pt-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Jawaban / Persentase Anda:
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Ketik jawaban Anda di sini..."
                      value={answers[task.id] || ""}
                      onChange={(e) => handleInputChange(task.id, e.target.value)}
                      className="w-full p-2.5 border rounded-lg text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                  </div>

                  {/* Tombol Checklist / Tandai Selesai */}
                  <button
                    onClick={() => handleToggleComplete(task.id)}
                    className={`w-full py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition ${
                      isDone
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "bg-slate-800 text-white hover:bg-slate-900"
                    }`}
                  >
                    {isDone ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-200" /> Selesai Dikerjakan
                      </>
                    ) : (
                      <>
                        <Circle className="w-4 h-4" /> Tandai Selesai
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}