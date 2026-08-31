"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { ExternalLink, Send, BookOpen, ZoomIn, X, Shield, RefreshCw } from "lucide-react";

export const dynamic = "force-dynamic";

export default function ParticipantDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submittingId, setSubmittingId] = useState(null);
  const [userName, setUserName] = useState("");
  const [zoomImage, setZoomImage] = useState(null); // State modal zoom gambar

  useEffect(() => {
    fetchTasks();
    const savedName = localStorage.getItem("participant_name") || "";
    setUserName(savedName);

    // Event listener untuk tombol ESC menutup modal zoom
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setZoomImage(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
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
        
        {/* Navigation Bar / Header */}
        <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2 tracking-wide">
                <BookOpen className="w-6 h-6 text-sky-400" /> REMINDER NPT
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">Persiapan Event 22 Agustus 2026</p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Link
              href="/buku-saku"
              className="px-3 py-2 text-xs bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-semibold rounded-lg shadow-sm shadow-rose-600/30 transition flex items-center gap-1.5"
              title="Buka Buku Saku 14 Akar Spiritual"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Buku Saku 14 Akar</span>
            </Link>

            <button
              onClick={fetchTasks}
              disabled={loading}
              className="p-2 text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg transition flex items-center gap-1.5"
              title="Muat Ulang Tugas"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-sky-400" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <Link
              href="/admin/dashboard"
              className="px-3 py-2 text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg transition flex items-center gap-1.5"
              title="Akses Halaman Admin"
            >
              <Shield className="w-3.5 h-3.5 text-sky-400" />
              <span>Menu Admin</span>
            </Link>
          </div>
        </div>

        {/* Input Nama Peserta */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <label htmlFor="participant-name" className="block text-xs font-semibold text-slate-200">
              Identitas Peserta:
            </label>
            <p className="text-[11px] text-slate-400">
              Nama ini akan disertakan saat mengirim jawaban/refleksi.
            </p>
          </div>
          <input
            id="participant-name"
            type="text"
            placeholder="Masukkan Nama Lengkap Anda..."
            value={userName}
            onChange={handleNameChange}
            className="w-full sm:w-72 p-2.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
          />
        </div>

        {/* List Tugas */}
        {loading ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Memuat materi & tugas harian...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/50 rounded-xl border border-slate-800">
            <p className="text-sm text-slate-400">Belum ada tugas rilis untuk hari ini.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {tasks.map((task) => (
              <div key={task.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
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

                {/* Gambar Materi (Bisa Diklik Langsung untuk Zoom) */}
                {task.image_url && (
                  <div className="space-y-1.5">
                    <div
                      onClick={() => setZoomImage({ url: task.image_url, title: task.title })}
                      className="relative group rounded-lg overflow-hidden border border-slate-800 max-h-80 cursor-pointer bg-slate-950"
                    >
                      <img
                        src={task.image_url}
                        alt={task.title || "Materi"}
                        className="w-full object-contain max-h-80 transition-transform duration-200 group-hover:scale-[1.01]"
                      />
                      
                      {/* Tombol Perbesar Gambar yang Selalu Terlihat & Jelas */}
                      <div className="absolute bottom-3 right-3 bg-slate-950/90 hover:bg-slate-900 text-sky-400 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-lg backdrop-blur-sm transition pointer-events-none group-hover:bg-sky-600 group-hover:text-white">
                        <ZoomIn className="w-4 h-4" />
                        <span>Klik untuk Perbesar</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pertanyaan / OCR Text */}
                {task.ocr_extracted_text && (
                  <div className="bg-sky-950/20 border border-sky-800/30 p-3 rounded-lg text-xs space-y-1">
                    <p className="font-semibold text-sky-300">Teks Materi & Poin Refleksi:</p>
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

      {/* Modal Lightbox Zoom Gambar (Fullscreen) */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 select-none"
          onClick={() => setZoomImage(null)}
        >
          {/* Tombol Tutup / Kembali di Pojok Atas */}
          <button
            onClick={() => setZoomImage(null)}
            className="absolute top-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white text-xs font-semibold rounded-full shadow-2xl transition cursor-pointer hover:border-rose-500 hover:text-rose-400"
            title="Tutup Preview (ESC)"
          >
            <X className="w-4 h-4 text-rose-400" />
            <span>Tutup Preview (ESC)</span>
          </button>

          {/* Kontainer Gambar Zoom */}
          <div
            className="relative max-w-5xl max-h-[85vh] w-full flex flex-col items-center justify-center p-2"
            onClick={(e) => e.stopPropagation()} // Mencegah klik pada gambar menutup modal
          >
            <img
              src={zoomImage.url}
              alt={zoomImage.title || "Preview Materi"}
              className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl border border-slate-800"
            />
            {zoomImage.title && (
              <p className="mt-3 text-xs text-slate-300 text-center font-medium bg-slate-900/90 px-4 py-2 rounded-full border border-slate-700 shadow-md">
                {zoomImage.title}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}