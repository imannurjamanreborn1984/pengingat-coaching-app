"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { CheckCircle2, Circle, ExternalLink, Send, BookOpen } from "lucide-react";

export const dynamic = 'force-dynamic';

export default function ParticipantDashboard() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submittingId, setSubmittingId] = useState(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    fetchTasks();
    const savedName = localStorage.getItem("participant_name") || "";
    setUserName(savedName);
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("assignments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error("Gagal mengambil tugas:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Rahasia: Double Click di Judul Header untuk Masuk ke Halaman Login Admin
  const handleSecretAdminAccess = () => {
    router.push("/admin/login");
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    setUserName(val);
    localStorage.setItem("participant_name", val);
  };

  const handleAnswerChange = (taskId, text) => {
    setAnswers((prev) => ({ ...prev, [taskId]: text }));
  };

  const handleSubmitAnswer = async (taskId) => {
    const answerText = answers[taskId];
    if (!userName.trim()) return alert("Harap isi nama Anda terlebih dahulu di bagian atas!");
    if (!answerText || !answerText.trim()) return alert("Isi refleksi/jawaban Anda terlebih dahulu!");

    setSubmittingId(taskId);
    try {
      const { error } = await supabase.from("submissions").insert([
        {
          assignment_id: taskId,
          user_name: userName,
          answer_text: answerText,
        },
      ]);

      if (error) throw error;
      alert("Jawaban berhasil terkirim!");
    } catch (err) {
      alert("Gagal mengirim jawaban: " + err.message);
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            {/* Ketuk 2x (Double Click) di Judul Ini Untuk Akses Admin */}
            <h1 
              onDoubleClick={handleSecretAdminAccess}
              className="text-2xl font-bold text-white flex items-center gap-2 cursor-pointer select-none active:opacity-80"
              title="Ketuk 2x untuk akses khusus"
            >
              <BookOpen className="w-6 h-6 text-sky-400" /> Jurnal & To-Do Harian
            </h1>
            <p className="text-xs text-slate-400 mt-1">Persiapan Event 22 Agustus 2026</p>
          </div>
          <div className="w-full sm:w-64">
            <label className="block text-[10px] text-slate-400 mb-1">Nama Peserta:</label>
            <input
              type="text"
              placeholder="Masukkan Nama Anda..."
              value={userName}
              onChange={handleNameChange}
              className="w-full p-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* List Tugas */}
        {loading ? (
          <p className="text-center text-xs text-slate-500 py-10 animate-pulse">Memuat tugas harian...</p>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/50 rounded-xl border border-slate-800">
            <p className="text-sm text-slate-400">Belum ada tugas rilis untuk hari ini.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {tasks.map((task) => (
              <div key={task.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                  <h2 className="font-semibold text-sky-400 text-base">{task.title}</h2>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700">
                    {task.publish_date}
                  </span>
                </div>

                {/* Pesan Mentor */}
                {task.group_chat_text && (
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 text-xs text-slate-300">
                    <p className="font-medium text-slate-400 mb-1">Pesan Mentor:</p>
                    <p className="whitespace-pre-line">{task.group_chat_text}</p>
                  </div>
                )}

                {/* Gambar Materi */}
                {task.image_url && (
                  <div className="rounded-lg overflow-hidden border border-slate-800 max-h-80">
                    <img src={task.image_url} alt="Materi" className="w-full object-contain bg-slate-950" />
                  </div>
                )}

                {/* Pertanyaan / OCR Text */}
                {task.ocr_extracted_text && (
                  <div className="bg-sky-950/20 border border-sky-800/30 p-3 rounded-lg text-xs space-y-1">
                    <p className="font-semibold text-sky-300">Soal / Refleksi Diri:</p>
                    <p className="text-slate-200 whitespace-pre-line leading-relaxed">{task.ocr_extracted_text}</p>
                  </div>
                )}

                {/* External Link */}
                {task.external_link && (
                  <a
                    href={task.external_link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Buka Referensi Eksternal
                  </a>
                )}

                {/* Input Jawaban */}
                <div className="pt-2 space-y-2">
                  <textarea
                    rows={3}
                    placeholder="Tulis jawaban atau refleksi kamu di sini..."
                    value={answers[task.id] || ""}
                    onChange={(e) => handleAnswerChange(task.id, e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:ring-1 focus:ring-sky-500 outline-none"
                  />
                  <button
                    onClick={() => handleSubmitAnswer(task.id)}
                    disabled={submittingId === task.id}
                    className="w-full sm:w-auto px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {submittingId === task.id ? "Mengirim..." : "Kirim Jawaban"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}