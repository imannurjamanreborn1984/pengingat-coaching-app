"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  MessageCircle,
  Send,
  Lock,
  Globe,
  Users,
  CheckSquare,
  Square,
  Trash2,
  CornerDownRight,
  Crown,
  ShieldCheck,
  Loader2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  UserCheck,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { SUPER_ADMIN_EMAILS } from "@/lib/authHelper";

export default function MaterialCommentsSection({
  materialId,
  materialTitle = "Materi NPT",
  levelNum = 1,
  isKitabTheme = false,
  currentUser = null,
  isApproved = true,
  onOpenAuthModal = null,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  
  // Opsi Privasi & Siapa yang dapat melihat
  // User request:
  // "siapa yang bisa melihat komentarnya: [] saya sendiri, [] teman/akun lain sedangkan admin dan guru sudah terceklis auto dan tidak bisa diuncheklist."
  const [canOthersView, setCanOthersView] = useState(true); // Default true agar bisa diskusi, tapi bisa di-uncheck untuk private
  const [canSelfView, setCanSelfView] = useState(true); // Penulis sendiri (selalu true)

  // Reply state
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const cleanUserEmail = (currentUser?.email || "").toLowerCase().trim();
  const cleanUserName = currentUser?.name || currentUser?.full_name || (cleanUserEmail ? cleanUserEmail.split("@")[0] : "");
  const cleanUserPhone = currentUser?.phone_number || "";

  const isSuperAdmin =
    Boolean(currentUser?.role === "super_admin" || currentUser?.role === "admin") ||
    (cleanUserEmail && SUPER_ADMIN_EMAILS.includes(cleanUserEmail));

  // Key untuk local caching
  const cacheKey = `npt_comments_${materialId}`;

  // Ambil data komentar dari Supabase
  const fetchComments = useCallback(async () => {
    if (!materialId) return;
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("submissions")
        .select("id, user_name, answer_text, created_at")
        .ilike("answer_text", `%[KOMENTAR_MATERI]%${materialId}%`)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const parsedComments = (data || [])
        .map((row) => {
          try {
            const raw = row.answer_text || "";
            const jsonPart = raw.replace(/^\[KOMENTAR_MATERI\]\s*/i, "").trim();
            const parsed = JSON.parse(jsonPart);
            return {
              id: row.id,
              ...parsed,
              created_at: parsed.created_at || row.created_at,
            };
          } catch (e) {
            return null;
          }
        })
        .filter(Boolean);

      setComments(parsedComments);
      try {
        localStorage.setItem(cacheKey, JSON.stringify(parsedComments));
      } catch (e) {}
    } catch (err) {
      console.warn("Gagal memuat komentar:", err.message);
      // Fallback ke local cache
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) setComments(JSON.parse(cached));
      } catch (e) {}
    } finally {
      setIsLoading(false);
    }
  }, [materialId, cacheKey]);

  // Load awal jika terbuka atau saat mount
  useEffect(() => {
    // Coba baca dari cache dulu agar instant
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) setComments(JSON.parse(cached));
    } catch (e) {}

    fetchComments();
  }, [fetchComments, cacheKey]);

  // Filter komentar sesuai hak akses viewer
  // - Admin / Guru: Bisa melihat SEMUA komentar
  // - Penulis sendiri: Bisa melihat komentar miliknya
  // - Teman / Akun lain: Hanya bisa melihat jika visible_to_others === true
  const visibleComments = comments.filter((c) => {
    if (isSuperAdmin) return true; // Guru & Admin selalu bisa membaca
    const isAuthor =
      (c.user_email && cleanUserEmail && c.user_email.toLowerCase() === cleanUserEmail) ||
      (c.user_phone && cleanUserPhone && c.user_phone === cleanUserPhone) ||
      (c.user_name && cleanUserName && c.user_name.toLowerCase() === cleanUserName.toLowerCase());

    if (isAuthor) return true; // Saya sendiri selalu bisa membaca komentar sendiri
    return Boolean(c.visible_to_others); // Akun lain hanya jika diizinkan
  });

  // Pisahkan top-level comments dan replies
  const topLevelComments = visibleComments.filter((c) => !c.parent_id);
  const repliesByParentId = visibleComments.reduce((acc, c) => {
    if (c.parent_id) {
      if (!acc[c.parent_id]) acc[c.parent_id] = [];
      acc[c.parent_id].push(c);
    }
    return acc;
  }, {});

  // Kirim komentar baru
  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    if (!currentUser || !cleanUserName) {
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }

    try {
      setIsSubmitting(true);
      const commentPayload = {
        material_id: String(materialId),
        material_title: materialTitle,
        level: levelNum,
        user_name: cleanUserName,
        user_email: cleanUserEmail,
        user_phone: cleanUserPhone,
        is_admin: isSuperAdmin,
        comment: newCommentText.trim(),
        visible_to_admin: true, // Guru & Admin selalu terceklis auto
        visible_to_self: canSelfView, // Saya sendiri
        visible_to_others: canOthersView, // Teman / Akun lain
        parent_id: null,
        created_at: new Date().toISOString(),
      };

      const rowPayload = {
        user_name: `${cleanUserName}${cleanUserPhone ? ` (${cleanUserPhone})` : ""}`,
        assignment_id: null,
        answer_text: `[KOMENTAR_MATERI]\n${JSON.stringify(commentPayload)}`,
      };

      const { data, error } = await supabase
        .from("submissions")
        .insert([rowPayload])
        .select("id, created_at");

      if (error) throw error;

      const newId = data?.[0]?.id || `local_${Date.now()}`;
      const newCommentObj = { id: newId, ...commentPayload };

      const updated = [...comments, newCommentObj];
      setComments(updated);
      setNewCommentText("");

      try {
        localStorage.setItem(cacheKey, JSON.stringify(updated));
      } catch (e) {}
    } catch (err) {
      console.error("Gagal mengirim komentar:", err);
      alert("Gagal mengirim komentar: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Kirim balasan (reply)
  const handlePostReply = async (parentId) => {
    if (!replyText.trim()) return;
    if (!currentUser || !cleanUserName) {
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }

    const parentComment = comments.find((c) => c.id === parentId);

    try {
      setIsSubmittingReply(true);
      const replyPayload = {
        material_id: String(materialId),
        material_title: materialTitle,
        level: levelNum,
        user_name: cleanUserName,
        user_email: cleanUserEmail,
        user_phone: cleanUserPhone,
        is_admin: isSuperAdmin,
        comment: replyText.trim(),
        visible_to_admin: true,
        visible_to_self: true,
        visible_to_others: parentComment ? Boolean(parentComment.visible_to_others) : true,
        parent_id: parentId,
        created_at: new Date().toISOString(),
      };

      const rowPayload = {
        user_name: `${cleanUserName}${cleanUserPhone ? ` (${cleanUserPhone})` : ""}`,
        assignment_id: null,
        answer_text: `[KOMENTAR_MATERI]\n${JSON.stringify(replyPayload)}`,
      };

      const { data, error } = await supabase
        .from("submissions")
        .insert([rowPayload])
        .select("id, created_at");

      if (error) throw error;

      const newId = data?.[0]?.id || `local_${Date.now()}`;
      const newReplyObj = { id: newId, ...replyPayload };

      const updated = [...comments, newReplyObj];
      setComments(updated);
      setReplyText("");
      setReplyingToId(null);

      try {
        localStorage.setItem(cacheKey, JSON.stringify(updated));
      } catch (e) {}
    } catch (err) {
      console.error("Gagal membalas komentar:", err);
      alert("Gagal membalas: " + err.message);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Hapus komentar
  const handleDeleteComment = async (id) => {
    if (!confirm("Hapus komentar ini?")) return;
    try {
      await supabase.from("submissions").delete().eq("id", id);
      const updated = comments.filter((c) => c.id !== id && c.parent_id !== id);
      setComments(updated);
      try {
        localStorage.setItem(cacheKey, JSON.stringify(updated));
      } catch (e) {}
    } catch (err) {
      console.error("Gagal menghapus:", err);
      alert("Gagal menghapus: " + err.message);
    }
  };

  const commentCount = topLevelComments.length;

  return (
    <div
      className={`rounded-2xl transition-all border ${
        isKitabTheme
          ? "bg-[#f8f1e3]/80 border-[#d8c3a1]"
          : "bg-slate-900/70 border-slate-800"
      }`}
    >
      {/* Header Bar / Toggle Accordion */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-3.5 flex items-center justify-between gap-3 text-left transition cursor-pointer rounded-2xl ${
          isKitabTheme
            ? "hover:bg-[#ebdcc4]/50 text-[#3a2211]"
            : "hover:bg-slate-800/60 text-slate-200"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              isKitabTheme
                ? "bg-[#9e2a2b] text-amber-100 shadow-xs"
                : "bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white shadow-md shadow-indigo-600/20"
            }`}
          >
            <MessageCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black tracking-wide">
                Ruang Tanya & Diskusi Materi
              </span>
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  commentCount > 0
                    ? isKitabTheme
                      ? "bg-[#9e2a2b] text-white"
                      : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : isKitabTheme
                    ? "bg-[#e2d0b5] text-[#543516]"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {commentCount} Diskusi
              </span>
            </div>
            <p
              className={`text-[11px] ${
                isKitabTheme ? "text-[#6b4823]" : "text-slate-400"
              }`}
            >
              Ajukan pertanyaan ke Guru atau berbagi pemahaman batin dengan sahabat se-level.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span
            className={`text-[11px] font-bold hidden sm:inline ${
              isKitabTheme ? "text-[#9e2a2b]" : "text-cyan-400"
            }`}
          >
            {isOpen ? "Tutup Ruang Diskusi" : "Buka Diskusi"}
          </span>
          {isOpen ? (
            <ChevronUp
              className={`w-4 h-4 ${
                isKitabTheme ? "text-[#9e2a2b]" : "text-cyan-400"
              }`}
            />
          ) : (
            <ChevronDown
              className={`w-4 h-4 ${
                isKitabTheme ? "text-[#9e2a2b]" : "text-cyan-400"
              }`}
            />
          )}
        </div>
      </button>

      {/* Konten Ruang Komentar */}
      {isOpen && (
        <div
          className={`p-3.5 sm:p-5 border-t space-y-5 animate-in fade-in duration-200 ${
            isKitabTheme ? "border-[#d8c3a1]/60" : "border-slate-800/80"
          }`}
        >
          {/* ========================================================================= */}
          {/* FORM INPUT KOMENTAR BARU                                                  */}
          {/* ========================================================================= */}
          {currentUser && cleanUserName ? (
            <form onSubmit={handlePostComment} className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span
                  className={`font-bold flex items-center gap-1.5 ${
                    isKitabTheme ? "text-[#3a2211]" : "text-slate-300"
                  }`}
                >
                  <span>Menulis sebagai:</span>
                  <span
                    className={`font-black flex items-center gap-1 ${
                      isSuperAdmin
                        ? "text-amber-400"
                        : isKitabTheme
                        ? "text-[#9e2a2b]"
                        : "text-cyan-400"
                    }`}
                  >
                    {isSuperAdmin && <Crown className="w-3.5 h-3.5 text-amber-400 inline" />}
                    {cleanUserName} {isSuperAdmin ? "(Guru / Admin)" : ""}
                  </span>
                </span>
                <span className="text-[10px] text-slate-500">
                  Level {levelNum}
                </span>
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  rows={3}
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Tulis pemahaman, renungan, atau pertanyaan Anda terkait materi ini kepada Guru..."
                  className={`w-full p-3 text-xs sm:text-sm rounded-xl outline-hidden transition resize-y min-h-[75px] ${
                    isKitabTheme
                      ? "bg-[#fff9ef] border border-[#d8c3a1] text-[#2c1809] placeholder-[#9a7850] focus:ring-2 focus:ring-[#9e2a2b]/30"
                      : "bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500/40"
                  }`}
                />
              </div>

              {/* =================================================================== */}
              {/* CHECKLIST OPSI PRIVASI / SIAPA YANG BISA MELIHAT KOMENTAR          */}
              {/* =================================================================== */}
              <div
                className={`p-3 rounded-xl border space-y-2 ${
                  isKitabTheme
                    ? "bg-[#f2e5cf]/60 border-[#d3be9a]"
                    : "bg-slate-950/60 border-slate-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                      isKitabTheme ? "text-[#543516]" : "text-slate-300"
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Siapa yang dapat membaca komentar ini?</span>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Opsi Privasi
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                  {/* 1. Admin & Guru (TERKUNCI & AUTO TERCEKLIS) */}
                  <div
                    className={`flex items-start gap-2 p-2 rounded-lg border opacity-90 select-none ${
                      isKitabTheme
                        ? "bg-[#ebd9bd] border-[#cbb38d] text-[#3a2211]"
                        : "bg-slate-900 border-slate-700 text-slate-200"
                    }`}
                  >
                    <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div className="leading-tight">
                      <span className="font-bold flex items-center gap-1">
                        Admin & Guru
                        <Crown className="w-3 h-3 text-amber-400" />
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        (Otomatis & Terkunci)
                      </p>
                    </div>
                  </div>

                  {/* 2. Saya Sendiri (TERCEKLIS PENULIS) */}
                  <div
                    onClick={() => setCanSelfView(true)}
                    className={`flex items-start gap-2 p-2 rounded-lg border select-none ${
                      isKitabTheme
                        ? "bg-[#ebd9bd] border-[#cbb38d] text-[#3a2211]"
                        : "bg-slate-900 border-slate-700 text-slate-200"
                    }`}
                  >
                    <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div className="leading-tight">
                      <span className="font-bold">Saya Sendiri</span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        (Penulis Komentar)
                      </p>
                    </div>
                  </div>

                  {/* 3. Teman / Akun Lain (PILIHAN CEKLIST TOGGLE) */}
                  <label
                    className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition select-none ${
                      canOthersView
                        ? isKitabTheme
                          ? "bg-amber-100/80 border-amber-400 text-[#3a2211]"
                          : "bg-cyan-950/40 border-cyan-500/50 text-cyan-200 shadow-xs"
                        : isKitabTheme
                        ? "bg-[#fff8ee] border-[#d8c3a1] text-slate-500 hover:border-amber-400"
                        : "bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={canOthersView}
                      onChange={(e) => setCanOthersView(e.target.checked)}
                      className="hidden"
                    />
                    {canOthersView ? (
                      <CheckSquare className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    )}
                    <div className="leading-tight">
                      <span className="font-bold flex items-center gap-1">
                        Teman / Akun Lain
                        {canOthersView ? (
                          <Globe className="w-3 h-3 text-cyan-400" />
                        ) : (
                          <Lock className="w-3 h-3 text-amber-500" />
                        )}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {canOthersView
                          ? "Publik (Bisa dibaca teman se-level)"
                          : "Privat (Hanya Saya & Guru/Admin)"}
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Tombol Kirim */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  {canOthersView ? (
                    <>
                      <Globe className="w-3 h-3 text-cyan-400" />
                      <span>Komentar terbuka untuk pembelajaran bersama</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3 text-amber-400" />
                      <span>Komentar privat: hanya Anda dan Guru/Admin yang melihat</span>
                    </>
                  )}
                </span>

                <button
                  type="submit"
                  disabled={isSubmitting || !newCommentText.trim()}
                  className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-md ${
                    isSubmitting || !newCommentText.trim()
                      ? "opacity-50 cursor-not-allowed bg-slate-800 text-slate-400"
                      : isKitabTheme
                      ? "bg-[#9e2a2b] hover:bg-[#822223] text-white shadow-[#9e2a2b]/25"
                      : "bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-cyan-600/25"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim Komentar</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Prompt Jika Belum Login */
            <div
              className={`p-4 rounded-2xl border text-center space-y-2 ${
                isKitabTheme
                  ? "bg-[#fff9ef] border-[#d8c3a1]"
                  : "bg-slate-950/80 border-slate-800"
              }`}
            >
              <AlertCircle className="w-6 h-6 text-amber-500 mx-auto" />
              <p
                className={`text-xs ${
                  isKitabTheme ? "text-[#543516]" : "text-slate-300"
                }`}
              >
                Masuk sebagai member NPT untuk berdiskusi, bertanya pada Guru, atau berbagi pemahaman materi.
              </p>
              {onOpenAuthModal && (
                <button
                  type="button"
                  onClick={onOpenAuthModal}
                  className="px-4 py-1.5 rounded-xl text-xs font-black bg-[#9e2a2b] text-white hover:bg-[#832223] transition cursor-pointer"
                >
                  Masuk / Registrasi Member
                </button>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* DAFTAR KOMENTAR & DISKUSI                                                 */}
          {/* ========================================================================= */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b pb-2 border-slate-800/60">
              <span
                className={`text-xs font-black flex items-center gap-1.5 ${
                  isKitabTheme ? "text-[#3a2211]" : "text-slate-300"
                }`}
              >
                <span>Daftar Catatan & Diskusi</span>
                <span className="text-[10px] text-slate-500">
                  ({visibleComments.length} entri)
                </span>
              </span>

              {isLoading && (
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Menyinkronkan...</span>
                </span>
              )}
            </div>

            {visibleComments.length === 0 ? (
              <div className="py-6 text-center space-y-1">
                <p
                  className={`text-xs ${
                    isKitabTheme ? "text-[#8a6842]" : "text-slate-500"
                  }`}
                >
                  Belum ada diskusi pada materi ini.
                </p>
                <p className="text-[10px] text-slate-500">
                  Jadilah yang pertama menyampaikan pemahaman batin atau pertanyaan Anda!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {topLevelComments.map((commentItem) => {
                  const isAuthor =
                    (commentItem.user_email && cleanUserEmail && commentItem.user_email.toLowerCase() === cleanUserEmail) ||
                    (commentItem.user_phone && cleanUserPhone && commentItem.user_phone === cleanUserPhone) ||
                    (commentItem.user_name && cleanUserName && commentItem.user_name.toLowerCase() === cleanUserName.toLowerCase());

                  const canDelete = isSuperAdmin || isAuthor;
                  const replies = repliesByParentId[commentItem.id] || [];

                  return (
                    <div
                      key={commentItem.id}
                      className={`p-3.5 rounded-2xl border transition ${
                        commentItem.is_admin
                          ? isKitabTheme
                            ? "bg-[#fff6e0] border-amber-300 shadow-xs"
                            : "bg-indigo-950/30 border-indigo-700/60 shadow-xs ring-1 ring-indigo-500/20"
                          : isKitabTheme
                          ? "bg-[#fffcf7] border-[#dfd0b7]"
                          : "bg-slate-950/70 border-slate-800/80"
                      }`}
                    >
                      {/* Baris Atas: Pengguna, Badge & Privacy */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/30">
                        <div className="flex items-center gap-2">
                          {/* Avatar inisial */}
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                              commentItem.is_admin
                                ? "bg-gradient-to-tr from-amber-500 to-rose-500 text-white"
                                : isKitabTheme
                                ? "bg-[#d8c3a1] text-[#3a2211]"
                                : "bg-slate-800 text-slate-200"
                            }`}
                          >
                            {(commentItem.user_name || "M").charAt(0).toUpperCase()}
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`text-xs font-black ${
                                commentItem.is_admin
                                  ? "text-amber-400"
                                  : isKitabTheme
                                  ? "text-[#3a2211]"
                                  : "text-slate-200"
                              }`}
                            >
                              {commentItem.user_name || "Sahabat NPT"}
                            </span>

                            {commentItem.is_admin ? (
                              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-0.5">
                                <Crown className="w-2.5 h-2.5" />
                                <span>Guru / Admin</span>
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-slate-800 text-slate-400">
                                Peserta
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Status Privasi Komentar */}
                        <div className="flex items-center gap-1.5">
                          {commentItem.visible_to_others ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-800/50 flex items-center gap-1">
                              <Globe className="w-2.5 h-2.5" />
                              <span>Publik</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-950/60 text-amber-300 border border-amber-800/50 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" />
                              <span>Privat ke Guru</span>
                            </span>
                          )}

                          {/* Tombol Hapus */}
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => handleDeleteComment(commentItem.id)}
                              title="Hapus komentar"
                              className="text-slate-500 hover:text-red-400 transition p-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Teks Komentar */}
                      <p
                        className={`text-xs sm:text-sm py-2 leading-relaxed whitespace-pre-line ${
                          isKitabTheme ? "text-[#2c1809]" : "text-slate-200"
                        }`}
                      >
                        {commentItem.comment}
                      </p>

                      {/* Footer: Waktu & Tombol Balas */}
                      <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500">
                        <span>
                          {commentItem.created_at
                            ? new Date(commentItem.created_at).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </span>

                        {currentUser && cleanUserName && (
                          <button
                            type="button"
                            onClick={() =>
                              setReplyingToId(
                                replyingToId === commentItem.id ? null : commentItem.id
                              )
                            }
                            className={`font-bold flex items-center gap-1 transition cursor-pointer ${
                              isKitabTheme
                                ? "text-[#9e2a2b] hover:underline"
                                : "text-cyan-400 hover:text-cyan-300"
                            }`}
                          >
                            <CornerDownRight className="w-3 h-3" />
                            <span>
                              {replyingToId === commentItem.id ? "Batal Balas" : "Balas"}
                            </span>
                          </button>
                        )}
                      </div>

                      {/* =============================================================== */}
                      {/* FORM BALASAN INLINE                                            */}
                      {/* =============================================================== */}
                      {replyingToId === commentItem.id && (
                        <div className="mt-3 pt-3 border-t border-slate-800/40 pl-3 border-l-2 border-l-cyan-500 space-y-2">
                          <span className="text-[11px] font-bold text-slate-400">
                            Balas untuk {commentItem.user_name}:
                          </span>
                          <textarea
                            rows={2}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Tulis balasan atau penjelasan bimbingan..."
                            className={`w-full p-2.5 text-xs rounded-xl outline-hidden transition ${
                              isKitabTheme
                                ? "bg-[#fff9ef] border border-[#d8c3a1] text-[#2c1809]"
                                : "bg-slate-900 border border-slate-700 text-slate-100"
                            }`}
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingToId(null);
                                setReplyText("");
                              }}
                              className="px-2.5 py-1 rounded-lg text-[10px] text-slate-400 hover:text-white"
                            >
                              Batal
                            </button>
                            <button
                              type="button"
                              disabled={isSubmittingReply || !replyText.trim()}
                              onClick={() => handlePostReply(commentItem.id)}
                              className={`px-3 py-1 rounded-lg text-[10px] font-black text-white flex items-center gap-1 transition cursor-pointer ${
                                isSubmittingReply || !replyText.trim()
                                  ? "opacity-50 cursor-not-allowed bg-slate-800"
                                  : isKitabTheme
                                  ? "bg-[#9e2a2b]"
                                  : "bg-cyan-600 hover:bg-cyan-500"
                              }`}
                            >
                              {isSubmittingReply ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Send className="w-3 h-3" />
                              )}
                              <span>Kirim Balasan</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* =============================================================== */}
                      {/* DAFTAR BALASAN (NESTED REPLIES)                                */}
                      {/* =============================================================== */}
                      {replies.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-slate-800/40 space-y-2 pl-3 sm:pl-4 border-l-2 border-l-amber-500/40">
                          {replies.map((replyItem) => {
                            const isReplyAuthor =
                              (replyItem.user_email && cleanUserEmail && replyItem.user_email.toLowerCase() === cleanUserEmail) ||
                              (replyItem.user_phone && cleanUserPhone && replyItem.user_phone === cleanUserPhone) ||
                              (replyItem.user_name && cleanUserName && replyItem.user_name.toLowerCase() === cleanUserName.toLowerCase());

                            return (
                              <div
                                key={replyItem.id}
                                className={`p-2.5 rounded-xl border text-xs ${
                                  replyItem.is_admin
                                    ? isKitabTheme
                                      ? "bg-[#fff1d0] border-amber-300"
                                      : "bg-indigo-950/40 border-indigo-700/70 text-slate-100"
                                    : isKitabTheme
                                    ? "bg-[#fcf7ee] border-[#e2d5c0]"
                                    : "bg-slate-900/60 border-slate-800 text-slate-300"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2 pb-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-black text-[11px] text-amber-400">
                                      {replyItem.user_name}
                                    </span>
                                    {replyItem.is_admin && (
                                      <span className="px-1 py-0.2 rounded text-[8px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-0.5">
                                        <Crown className="w-2 h-2" />
                                        <span>Guru / Admin</span>
                                      </span>
                                    )}
                                  </div>

                                  {(isSuperAdmin || isReplyAuthor) && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteComment(replyItem.id)}
                                      className="text-slate-500 hover:text-red-400 p-0.5 cursor-pointer"
                                    >
                                      <Trash2 className="w-2.5 h-2.5" />
                                    </button>
                                  )}
                                </div>

                                <p className="leading-relaxed whitespace-pre-line text-xs">
                                  {replyItem.comment}
                                </p>

                                <span className="text-[9px] text-slate-500 block pt-1">
                                  {replyItem.created_at
                                    ? new Date(replyItem.created_at).toLocaleDateString("id-ID", {
                                        day: "numeric",
                                        month: "short",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : ""}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
