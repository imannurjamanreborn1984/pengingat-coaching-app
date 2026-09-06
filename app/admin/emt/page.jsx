"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { 
  GraduationCap, 
  Users, 
  ShieldCheck, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  CheckCircle2, 
  Clock, 
  Activity, 
  FileText, 
  Edit3, 
  Send, 
  Share2, 
  FileDown, 
  RefreshCw, 
  ArrowLeft, 
  Sparkles, 
  Heart, 
  AlertCircle,
  PlusCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
  Lock,
  Crown,
  Trash2
} from "lucide-react";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { saveAs } from "file-saver";
import { AppNavbar, AppSidebar, SUPER_ADMIN_EMAILS } from "@/components/layout/AppNavbar";
import AdminHeaderTabs from "@/components/admin/AdminHeaderTabs";

export const dynamic = 'force-dynamic';

export default function AdminEMTRoom() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isKitabTheme, setIsKitabTheme] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Data State
  const [members, setMembers] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLoginStatus, setFilterLoginStatus] = useState("all"); // 'all' | 'need_email' | 'active_login'

  // Selected Member for Full Dossier Detail
  const [selectedMember, setSelectedMember] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [editEmail, setEditEmail] = useState("");
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editBatch, setEditBatch] = useState("batch-1");
  const [isSaving, setIsSaving] = useState(false);

  // State Modal Tambah Member Manual
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMemberData, setNewMemberData] = useState({
    nama: "",
    wa: "",
    email: "",
    sekolah: "",
    jabatan: "",
    batch: "batch-1"
  });

  // Load Auth & Data
  useEffect(() => {
    try {
      const authStr = localStorage.getItem("npt_user_auth");
      if (authStr) {
        setCurrentUser(JSON.parse(authStr));
      }
    } catch (e) {}
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // 1. Ambil pendaftar lokal EMT
      let localRegs = [];
      try {
        const saved = localStorage.getItem("emt_registered_members");
        if (saved) localRegs = JSON.parse(saved);
      } catch (e) {}

      // 2. Ambil jurnal lokal EMT
      let localJournals = [];
      try {
        const saved = localStorage.getItem("emt_journal_entries");
        if (saved) localJournals = JSON.parse(saved);
      } catch (e) {}

      // 3. Ambil submissions dari Supabase yang KHUSUS JURNAL EMT
      let subsData = [];
      if (supabase) {
        const { data: subs, error: sErr } = await supabase
          .from("submissions")
          .select("*")
          .order("created_at", { ascending: false });
        if (!sErr && subs) {
          subsData = subs.filter(s => s.answer_text?.includes("[JURNAL EMT") || s.answer_text?.toLowerCase().includes("jurnal emt"));
        }
      }

      // 4. Ambil profiles dari Supabase
      let profilesData = [];
      if (supabase) {
        const { data: profs, error: pErr } = await supabase
          .from("profiles")
          .select("*");
        if (!pErr && profs) {
          profilesData = profs;
        }
      }

      // Gabungkan submissions EMT
      const allEMTSubmissions = [...subsData];
      localJournals.forEach(lj => {
        if (!allEMTSubmissions.some(s => s.id === lj.id)) {
          allEMTSubmissions.push({
            id: lj.id,
            user_name: lj.nama,
            answer_text: `[JURNAL EMT - ${(lj.batchId || 'BATCH-1').toUpperCase()}]\nKondisi Emosi: ${lj.kondisiEmosi}\nTrigger: ${lj.triggerEmosi}\nRespon Tubuh: ${lj.responTubuh}\nTeknik: ${lj.teknikPraktik}\nHikmah/Kesadaran Baru:\n${lj.kesadaranBaru}`,
            created_at: lj.createdAt || new Date().toISOString(),
            isLocal: true,
            rawJournal: lj
          });
        }
      });

      setSubmissions(allEMTSubmissions);

      // 5. BANGUN DIREKTORI MEMBER EMT (HANYA PESERTA EMT, KELUARGA NPT TIDAK DIMASUKKAN)
      const memberMap = new Map();

      // A. Masukkan pendaftar EMT resmi dari formulir / input manual
      localRegs.forEach(reg => {
        const key = (reg.nama || "").toLowerCase().trim();
        if (!key) return;

        // Cek apakah ada profil di Supabase yang cocok
        const matchedProfile = profilesData.find(p => 
          (p.email && reg.email && p.email.toLowerCase().trim() === reg.email.toLowerCase().trim()) ||
          (p.full_name && p.full_name.toLowerCase().trim() === key)
        );

        memberMap.set(key, {
          id: matchedProfile?.id || reg.id,
          nama: matchedProfile?.full_name || reg.nama,
          email: matchedProfile?.email || reg.email || "",
          wa: matchedProfile?.phone_number || reg.wa || "",
          role: "member",
          status: matchedProfile?.status || "approved",
          batch: reg.batch || "batch-1",
          sekolah: reg.sekolah || "Instansi Pendidikan",
          jabatan: reg.jabatan || "Guru / Pendidik",
          createdAt: matchedProfile?.created_at || reg.createdAt || new Date().toISOString(),
          isProfile: !!matchedProfile,
          isLocalReg: true
        });
      });

      // B. Masukkan peserta yang sudah pernah menyetor jurnal EMT
      allEMTSubmissions.forEach(sub => {
        const name = (sub.user_name || "").trim();
        if (!name || name === "Peserta Anonymous") return;
        const key = name.toLowerCase();

        if (!memberMap.has(key)) {
          const matchedProfile = profilesData.find(p => 
            p.full_name && p.full_name.toLowerCase().trim() === key
          );

          memberMap.set(key, {
            id: matchedProfile?.id || `auto-${key.replace(/\s+/g, "_")}`,
            nama: matchedProfile?.full_name || name,
            email: matchedProfile?.email || "",
            wa: matchedProfile?.phone_number || "",
            role: "member",
            status: matchedProfile?.status || "approved",
            batch: sub.rawJournal?.batchId || "batch-1",
            sekolah: "Peserta Terdata dari Setoran Jurnal EMT",
            jabatan: "Peserta EMT",
            createdAt: matchedProfile?.created_at || sub.created_at || new Date().toISOString(),
            isProfile: !!matchedProfile,
            isAutoGenerated: !matchedProfile
          });
        }
      });

      const aggregatedMembers = Array.from(memberMap.values());
      setMembers(aggregatedMembers);

    } catch (err) {
      console.error("Gagal load data EMT Admin:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Cek otorisasi Super Admin Kang Iman
  const isSuperAdmin = 
    currentUser?.role === 'super_admin' || 
    (currentUser?.email && SUPER_ADMIN_EMAILS.includes(currentUser.email.toLowerCase().trim()));

  // Filter Members
  const filteredMembers = members.filter(m => {
    // Filter Batch
    if (selectedBatch !== "all" && m.batch !== selectedBatch) return false;
    
    // Filter Login Status (Email)
    if (filterLoginStatus === "need_email" && m.email) return false;
    if (filterLoginStatus === "active_login" && !m.email) return false;

    // Filter Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = m.nama?.toLowerCase().includes(q);
      const matchPhone = m.wa?.includes(q);
      const matchEmail = m.email?.toLowerCase().includes(q);
      const matchSchool = m.sekolah?.toLowerCase().includes(q);
      return matchName || matchPhone || matchEmail || matchSchool;
    }

    return true;
  });

  // Ekstrak Riwayat Jurnal Refleksi untuk Member Tertentu
  const getMemberJournals = (memberName) => {
    if (!memberName) return [];
    return submissions.filter(s => {
      const isUserMatch = s.user_name?.toLowerCase().trim() === memberName.toLowerCase().trim();
      const isEMTJournal = s.answer_text?.includes("[JURNAL EMT") || s.rawJournal;
      return isUserMatch && isEMTJournal;
    });
  };

  // Ekstrak Progress 21 Hari untuk Member
  const getMemberHealingProgress = (memberEmail, memberName) => {
    const userKey = memberEmail || memberName || 'default_user';
    try {
      const saved = localStorage.getItem(`emt_selfhealing_21_days_${userKey}`);
      if (saved) {
        const days = JSON.parse(saved);
        const doneCount = days.filter(d => d.completed).length;
        return {
          days,
          doneCount,
          percent: Math.round((doneCount / 21) * 100)
        };
      }
    } catch (e) {}

    return {
      days: [],
      doneCount: 0,
      percent: 0
    };
  };

  // Simpan / Update Email Login Seumur Hidup oleh Kang Iman
  const handleSaveMemberAccount = async (e) => {
    e.preventDefault();
    if (!editingMember) return;
    setIsSaving(true);

    const cleanEmail = editEmail.trim().toLowerCase();
    const cleanPhone = editPhone ? editPhone.replace(/[^0-9]/g, "") : "";
    let formattedPhone = cleanPhone;
    if (formattedPhone.startsWith("0")) formattedPhone = "62" + formattedPhone.slice(1);

    try {
      // 1. Update ke local storage emt_registered_members
      try {
        const existing = JSON.parse(localStorage.getItem('emt_registered_members') || '[]');
        const updated = existing.map(item => {
          if (item.nama.toLowerCase().trim() === editingMember.nama.toLowerCase().trim()) {
            return {
              ...item,
              nama: editName.trim(),
              email: cleanEmail,
              wa: formattedPhone || item.wa,
              batch: editBatch
            };
          }
          return item;
        });
        localStorage.setItem('emt_registered_members', JSON.stringify(updated));
      } catch (e) {}

      // 2. Simpan ke Supabase jika ada profile
      if (supabase && editingMember.isProfile) {
        const { error } = await supabase
          .from("profiles")
          .update({
            full_name: editName.trim(),
            email: cleanEmail || null,
            phone_number: formattedPhone || null,
            status: "approved"
          })
          .eq("id", editingMember.id);

        if (error) throw error;
      } else if (supabase && editingMember.isAutoGenerated) {
        const { error } = await supabase
          .from("profiles")
          .insert([
            {
              full_name: editName.trim(),
              email: cleanEmail || null,
              phone_number: formattedPhone || null,
              role: "member",
              status: "approved"
            }
          ]);
        if (error) throw error;
      }

      alert(`✅ Akun ${editName} berhasil disimpan!\nEmail Login: ${cleanEmail || 'Belum diisi'}\nMember kini dapat login seumur hidup menggunakan email tersebut.`);
      setEditingMember(null);
      fetchData();
    } catch (err) {
      alert("Gagal menyimpan akun: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Tambah Peserta Baru Manual
  const handleCreateNewMember = async (e) => {
    e.preventDefault();
    if (!newMemberData.nama.trim()) return alert("Nama peserta wajib diisi!");
    setIsSaving(true);

    let formattedPhone = newMemberData.wa ? newMemberData.wa.replace(/[^0-9]/g, "") : "";
    if (formattedPhone.startsWith("0")) formattedPhone = "62" + formattedPhone.slice(1);

    try {
      // 1. Simpan ke localStorage emt_registered_members
      const newReg = {
        id: `emt-reg-${Date.now()}`,
        nama: newMemberData.nama.trim(),
        email: newMemberData.email ? newMemberData.email.trim().toLowerCase() : "",
        wa: formattedPhone || "",
        sekolah: newMemberData.sekolah || "Instansi Pendidikan",
        jabatan: newMemberData.jabatan || "Guru / Pendidik",
        batch: newMemberData.batch || "batch-1",
        createdAt: new Date().toISOString()
      };

      try {
        const existing = JSON.parse(localStorage.getItem('emt_registered_members') || '[]');
        const updated = [newReg, ...existing.filter(i => i.nama.toLowerCase() !== newReg.nama.toLowerCase())];
        localStorage.setItem('emt_registered_members', JSON.stringify(updated));
      } catch (e) {}

      // 2. Simpan ke Supabase jika online
      if (supabase) {
        await supabase.from("profiles").insert([
          {
            full_name: newMemberData.nama.trim(),
            phone_number: formattedPhone || null,
            email: newMemberData.email ? newMemberData.email.trim().toLowerCase() : null,
            role: "member",
            status: "approved"
          }
        ]);
      }

      alert(`✅ Peserta ${newMemberData.nama} berhasil ditambahkan ke direktori EMT!`);
      setIsAddModalOpen(false);
      setNewMemberData({ nama: "", wa: "", email: "", sekolah: "", jabatan: "", batch: "batch-1" });
      fetchData();
    } catch (err) {
      alert("Gagal menambahkan peserta: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Hapus Peserta dari Ruang EMT
  const handleDeleteMember = (member) => {
    if (!confirm(`Hapus peserta "${member.nama}" dari Ruang EMT?`)) return;

    try {
      // 1. Hapus dari localStorage emt_registered_members
      try {
        const existing = JSON.parse(localStorage.getItem('emt_registered_members') || '[]');
        const updated = existing.filter(i => i.nama.toLowerCase().trim() !== member.nama.toLowerCase().trim());
        localStorage.setItem('emt_registered_members', JSON.stringify(updated));
      } catch (e) {}

      // 2. Hapus dari jurnal lokal
      try {
        const existingJ = JSON.parse(localStorage.getItem('emt_journal_entries') || '[]');
        const updatedJ = existingJ.filter(i => i.nama.toLowerCase().trim() !== member.nama.toLowerCase().trim());
        localStorage.setItem('emt_journal_entries', JSON.stringify(updatedJ));
      } catch (e) {}

      alert(`Peserta "${member.nama}" telah dihapus dari Ruang EMT.`);
      fetchData();
    } catch (err) {
      alert("Gagal menghapus peserta: " + err.message);
    }
  };

  // Kirim WhatsApp Feedback Evaluasi Pribadi dari Kang Iman ke Peserta
  const handleSendWAFeedback = (member) => {
    if (!member.wa) {
      alert("Nomor WhatsApp peserta belum tercatat. Silakan edit dan masukkan no WA terlebih dahulu.");
      return;
    }

    const memberJournals = getMemberJournals(member.nama);
    const healingProgress = getMemberHealingProgress(member.email, member.nama);

    let pesan = `Assalamu'alaikum Wr. Wb. Sahabat ${member.nama},\n\n`;
    pesan += `Saya *Iman Nurjaman* (Mentor & Founder EMT NPT) telah meninjau rekap latihan batin dan jurnal refleksi Anda di Ruang Kelas EMT.\n\n`;
    pesan += `📊 *Status Progres Latihan Anda:*\n`;
    pesan += `• Disiplin Self-Healing 21 Hari: *${healingProgress.doneCount}/21 Hari (${healingProgress.percent}%)*\n`;
    pesan += `• Total Setoran Jurnal Refleksi: *${memberJournals.length} Catatan*\n\n`;

    if (member.email) {
      pesan += `🔑 *Akun Login Portal Pembelajaran:*\nEmail terdaftar: *${member.email}* (Akses seumur hidup aktif).\n\n`;
    }

    pesan += `*Catatan Evaluasi & Doa Penguat:*\n"Terus rawat keheningan dan kelembutan rasa di dalam kelas maupun dalam keseharian. Jadikan setiap pemicu emosi sebagai cermin untuk semakin mengenal martabat ruhaniyah kita."\n\n`;
    pesan += `Salam hormat & takzim,\n*Kang Iman Nurjaman, M.Pd*\n_Neuro Programming Training & EMT Centre_`;

    window.open(`https://wa.me/${member.wa}?text=${encodeURIComponent(pesan)}`, "_blank");
  };

  // Export Dossier Member ke Dokumen Word (.docx)
  const exportMemberDossierToWord = async (member) => {
    const memberJournals = getMemberJournals(member.nama);
    const healingProgress = getMemberHealingProgress(member.email, member.nama);

    try {
      const docChildren = [
        new Paragraph({
          text: `DOSSIER & EVALUASI BATIN PESERTA EMT`,
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `Nama Peserta: `, bold: true }),
            new TextRun({ text: `${member.nama}\n` }),
            new TextRun({ text: `Asal Sekolah / Instansi: `, bold: true }),
            new TextRun({ text: `${member.sekolah || "-"}\n` }),
            new TextRun({ text: `No. WhatsApp: `, bold: true }),
            new TextRun({ text: `${member.wa ? `+${member.wa}` : "-"}\n` }),
            new TextRun({ text: `Email Login Seumur Hidup: `, bold: true }),
            new TextRun({ text: `${member.email || "Belum dimasukkan"}\n` }),
            new TextRun({ text: `Progres Self-Healing 21 Hari: `, bold: true }),
            new TextRun({ text: `${healingProgress.doneCount}/21 Hari (${healingProgress.percent}%)\n` }),
            new TextRun({ text: `Tanggal Evaluasi: `, bold: true }),
            new TextRun({ text: `${new Date().toLocaleDateString("id-ID")}\n` }),
          ],
          spacing: { after: 300 },
        }),
        new Paragraph({
          text: `RIWAYAT JURNAL REFLEKSI EMOSI (${memberJournals.length} SETORAN)`,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 200 },
        }),
      ];

      if (memberJournals.length === 0) {
        docChildren.push(
          new Paragraph({
            text: "Belum ada catatan jurnal refleksi yang disetor peserta.",
            italics: true,
            spacing: { after: 200 },
          })
        );
      } else {
        memberJournals.forEach((j, idx) => {
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({ text: `Jurnal #${idx + 1} (${new Date(j.created_at).toLocaleString("id-ID")})`, bold: true, size: 22 }),
              ],
              spacing: { before: 150 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: j.answer_text || "-" }),
              ],
              spacing: { after: 200 },
            })
          );
        });
      }

      const doc = new Document({
        sections: [{ properties: {}, children: docChildren }],
      });

      const blob = await Packer.toBlob(doc);
      const sanitized = (member.nama || "Peserta").replace(/[^a-zA-Z0-9_-]/g, "_");
      saveAs(blob, `Dossier_EMT_${sanitized}.docx`);
    } catch (e) {
      alert("Gagal export Word: " + e.message);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${
      isKitabTheme 
        ? 'bg-parchment text-[#231409]' 
        : 'bg-slate-950 text-slate-100'
    }`}>
      {/* Top Navbar & Sidebar */}
      <AppNavbar 
        onToggleSidebar={() => setIsSidebarOpen(true)}
        currentUser={currentUser || { name: "Kang Iman (Super Admin)", role: "super_admin" }}
        activeTitle="Ruang Kontrol & Evaluasi EMT"
      />
      <AppSidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentUser={currentUser || { name: "Kang Iman (Super Admin)", role: "super_admin" }}
        activePath="/admin/emt"
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 space-y-6">
        
        {/* Admin Header Tabs */}
        <AdminHeaderTabs 
          activeTab="emt"
          isKitabTheme={isKitabTheme}
          onToggleTheme={() => setIsKitabTheme(!isKitabTheme)}
        />

        {/* HEADER UTAMA RUANG KONTROL */}
        <div className={`p-6 rounded-3xl border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isKitabTheme ? 'card-kitab-frame border-[#cbb38b]' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#3a2211] text-amber-400 font-bold flex items-center justify-center border border-[#8f632d] shadow-xs">
                👑
              </span>
              <h1 className={`text-xl sm:text-2xl font-black ${
                isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-white'
              }`}>
                Ruang Kontrol & Evaluasi Batin EMT
              </h1>
            </div>
            <p className={`text-xs sm:text-sm ${isKitabTheme ? 'text-[#634224]' : 'text-slate-400'}`}>
              Halaman privat khusus <strong>Kang Iman</strong> untuk memantau laporan orang perorang, input email login seumur hidup, dan feedback batin via WhatsApp.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className={`px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer ${
                isKitabTheme ? 'bg-[#9e2a2b] hover:bg-[#852324]' : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Input Peserta Baru</span>
            </button>

            <button
              onClick={fetchData}
              disabled={isLoading}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                isKitabTheme ? 'bg-[#eee3cb] text-[#3a2211] border-[#d8c3a1] hover:bg-[#dfcdab]' : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
              title="Segarkan Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-amber-600" : ""}`} />
            </button>
          </div>
        </div>

        {/* 4 STATISTIK KONTROL RINGKAS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className={`p-4 rounded-2xl border space-y-1 ${
            isKitabTheme ? 'card-kitab-frame' : 'bg-slate-900 border-slate-800'
          }`}>
            <span className="text-[10px] font-bold uppercase text-slate-500">Total Member Terdaftar</span>
            <div className="text-xl sm:text-2xl font-black text-amber-600">{members.length}</div>
            <span className="text-[10px] text-slate-400">Anggota aktif</span>
          </div>

          <div className={`p-4 rounded-2xl border space-y-1 ${
            isKitabTheme ? 'card-kitab-frame' : 'bg-slate-900 border-slate-800'
          }`}>
            <span className="text-[10px] font-bold uppercase text-slate-500">Jurnal Refleksi Disetor</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-600">
              {submissions.filter(s => s.answer_text?.includes("[JURNAL EMT") || s.rawJournal).length}
            </div>
            <span className="text-[10px] text-slate-400">Setoran masuk</span>
          </div>

          <div className={`p-4 rounded-2xl border space-y-1 ${
            isKitabTheme ? 'card-kitab-frame' : 'bg-slate-900 border-slate-800'
          }`}>
            <span className="text-[10px] font-bold uppercase text-slate-500">Sudah Aktif Login Gmail</span>
            <div className="text-xl sm:text-2xl font-black text-sky-600">
              {members.filter(m => m.email).length}
            </div>
            <span className="text-[10px] text-slate-400">Siap login seumur hidup</span>
          </div>

          <div className={`p-4 rounded-2xl border space-y-1 ${
            isKitabTheme ? 'card-kitab-frame' : 'bg-slate-900 border-slate-800'
          }`}>
            <span className="text-[10px] font-bold uppercase text-rose-600">Belum Ada Email Login</span>
            <div className="text-xl sm:text-2xl font-black text-rose-600">
              {members.filter(m => !m.email).length}
            </div>
            <span className="text-[10px] text-rose-500 font-semibold">Perlu diisi Kang Iman</span>
          </div>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-3 ${
          isKitabTheme ? 'bg-[#f4ebd5] border-[#d8c3a1]' : 'bg-slate-900 border-slate-800'
        }`}>
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama, no. WA, instansi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border focus:outline-hidden ${
                isKitabTheme ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b]' : 'bg-slate-950 text-white border-slate-800'
              }`}
            />
          </div>

          {/* Filter Status Login & Batch */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border focus:outline-hidden ${
                isKitabTheme ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b]' : 'bg-slate-950 text-white border-slate-800'
              }`}
            >
              <option value="all">Semua Angkatan</option>
              <option value="batch-1">Batch 1 (Guru Hebat)</option>
              <option value="batch-2">Batch 2 (Reguler)</option>
              <option value="batch-3">Batch 3 (Somatic)</option>
            </select>

            <select
              value={filterLoginStatus}
              onChange={(e) => setFilterLoginStatus(e.target.value)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border focus:outline-hidden ${
                isKitabTheme ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b]' : 'bg-slate-950 text-white border-slate-800'
              }`}
            >
              <option value="all">Status Login: Semua</option>
              <option value="need_email">⚠️ Butuh Email Login</option>
              <option value="active_login">✅ Sudah Ada Email</option>
            </select>
          </div>
        </div>

        {/* DAFTAR LAPORAN ORANG PERORANG */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className={`text-base font-bold flex items-center gap-2 ${
              isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-white'
            }`}>
              <Users className="w-4 h-4 text-amber-600" />
              <span>Daftar Peserta & Laporan Evaluasi Batin ({filteredMembers.length})</span>
            </h2>
          </div>

          {isLoading ? (
            <div className="py-16 text-center text-xs text-slate-400 space-y-2">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-600" />
              <p>Memuat rekap laporan peserta EMT...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className={`p-12 rounded-3xl text-center text-xs space-y-2 border ${
              isKitabTheme ? 'card-kitab-frame' : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}>
              <Users className="w-10 h-10 mx-auto text-amber-600 opacity-60" />
              <p className="font-bold text-sm">Tidak ada peserta yang cocok dengan filter pencarian.</p>
              <p className="text-[11px]">Silakan ubah kata kunci atau klik "Input Peserta Baru".</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredMembers.map((member) => {
                const memberJournals = getMemberJournals(member.nama);
                const healingProgress = getMemberHealingProgress(member.email, member.nama);
                const isDetailOpen = selectedMember?.id === member.id;

                return (
                  <div
                    key={member.id}
                    className={`rounded-3xl border transition-all overflow-hidden ${
                      isKitabTheme 
                        ? 'card-kitab-frame shadow-sm' 
                        : 'bg-slate-900/80 border-slate-800'
                    }`}
                  >
                    {/* Ringkasan Baris Peserta */}
                    <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Identitas Member */}
                      <div className="flex items-start gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-[#3a2211] text-amber-400 font-black text-base flex items-center justify-center shrink-0 border border-[#8f632d] shadow-sm">
                          {member.nama.charAt(0).toUpperCase()}
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className={`font-bold text-base ${
                              isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-white'
                            }`}>
                              {member.nama}
                            </h3>

                            {member.email ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Login Aktif
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-700 border border-rose-500/30 flex items-center gap-1 animate-pulse">
                                <AlertCircle className="w-3 h-3" /> Belum Ada Email
                              </span>
                            )}

                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#eee3cb] text-[#634224] border border-[#d8c3a1]">
                              {member.batch.toUpperCase()}
                            </span>
                          </div>

                          <p className={`text-xs ${isKitabTheme ? 'text-[#634224]' : 'text-slate-400'}`}>
                            🏫 {member.sekolah} • 💼 {member.jabatan}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                            <span className="flex items-center gap-1 font-semibold text-emerald-700">
                              <Phone className="w-3 h-3" /> {member.wa ? `+${member.wa}` : 'Belum ada WA'}
                            </span>
                            <span className="flex items-center gap-1 text-slate-500">
                              <Mail className="w-3 h-3" /> {member.email || '—'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status Progress Mini & Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center border-t lg:border-t-0 pt-3 lg:pt-0">
                        {/* Mini Progress Card */}
                        <div className={`p-2.5 rounded-xl border text-center text-xs space-y-0.5 ${
                          isKitabTheme ? 'bg-[#f4ebd5] border-[#d8c3a1]' : 'bg-slate-950 border-slate-800'
                        }`}>
                          <span className="text-[10px] text-slate-500 block font-bold">Self-Healing 21 Hari</span>
                          <strong className="text-amber-700">{healingProgress.doneCount}/21 Hari ({healingProgress.percent}%)</strong>
                        </div>

                        {/* Jurnal Count */}
                        <div className={`p-2.5 rounded-xl border text-center text-xs space-y-0.5 ${
                          isKitabTheme ? 'bg-[#f4ebd5] border-[#d8c3a1]' : 'bg-slate-950 border-slate-800'
                        }`}>
                          <span className="text-[10px] text-slate-500 block font-bold">Jurnal Disetor</span>
                          <strong className="text-emerald-700">{memberJournals.length} Setoran</strong>
                        </div>

                        {/* Tombol Edit Email Login */}
                        <button
                          onClick={() => {
                            setEditingMember(member);
                            setEditName(member.nama);
                            setEditEmail(member.email || "");
                            setEditPhone(member.wa || "");
                            setEditBatch(member.batch || "batch-1");
                          }}
                          className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                            isKitabTheme ? 'bg-[#eee3cb] text-[#634224] border-[#d8c3a1] hover:bg-[#dfcdab]' : 'bg-slate-800 text-slate-300'
                          }`}
                          title="Input / Edit Email Login Seumur Hidup"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                          <span className="hidden sm:inline">Set Email</span>
                        </button>

                        {/* Tombol Chat WA Feedback */}
                        <button
                          onClick={() => handleSendWAFeedback(member)}
                          className={`p-2 rounded-xl text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                            isKitabTheme ? 'bg-[#1b6b55] hover:bg-[#155644]' : 'bg-emerald-600 hover:bg-emerald-500'
                          }`}
                          title="Kirim Feedback Evaluasi Langsung via WA"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Feedback WA</span>
                        </button>

                        {/* Tombol Hapus Member EMT */}
                        <button
                          onClick={() => handleDeleteMember(member)}
                          className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                            isKitabTheme ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' : 'bg-rose-950/40 text-rose-300 border-rose-800'
                          }`}
                          title="Hapus Peserta dari Ruang EMT"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span className="hidden sm:inline">Hapus</span>
                        </button>

                        {/* Tombol Buka Detail Dossier */}
                        <button
                          onClick={() => setSelectedMember(isDetailOpen ? null : member)}
                          className={`p-2 rounded-xl border text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                            isDetailOpen
                              ? isKitabTheme ? 'bg-[#3a2211] text-white border-[#8f632d]' : 'bg-emerald-600 text-white'
                              : isKitabTheme ? 'bg-[#eee3cb] text-[#3a2211] border-[#d8c3a1]' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          <span>{isDetailOpen ? 'Tutup Dossier' : 'Lihat Dossier Lengkap'}</span>
                          {isDetailOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* DETAIL DOSSIER PESERTA JIKA DIBUKA */}
                    {isDetailOpen && (
                      <div className={`p-6 border-t space-y-5 animate-in fade-in ${
                        isKitabTheme ? 'bg-[#fdfaf3] border-[#decba4]' : 'bg-slate-950 border-slate-800'
                      }`}>
                        {/* Header Dossier & Tombol Export Word */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                          <div>
                            <h4 className={`text-sm font-black uppercase tracking-wider ${
                              isKitabTheme ? 'text-[#9e2a2b]' : 'text-amber-400'
                            }`}>
                              📑 Lembar Evaluasi & Rekap Jurnal Batin: {member.nama}
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Daftar setoran refleksi emosi dan catatan latihan somatik harian.
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => exportMemberDossierToWord(member)}
                              className={`px-3 py-1.5 rounded-xl text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer ${
                                isKitabTheme ? 'bg-[#8f632d] hover:bg-[#734f24]' : 'bg-sky-600 hover:bg-sky-500'
                              }`}
                            >
                              <FileDown className="w-3.5 h-3.5" />
                              <span>Unduh Word (.docx)</span>
                            </button>
                          </div>
                        </div>

                        {/* 2 Kolom: Kiri Riwayat Jurnal, Kanan Status 21 Hari */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                          {/* Kolom Kiri: Riwayat Jurnal (7 Cols) */}
                          <div className="lg:col-span-7 space-y-3">
                            <h5 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                              isKitabTheme ? 'text-[#26150a]' : 'text-slate-300'
                            }`}>
                              <FileText className="w-3.5 h-3.5 text-amber-600" />
                              <span>Riwayat Jurnal Refleksi ({memberJournals.length})</span>
                            </h5>

                            {memberJournals.length === 0 ? (
                              <div className="p-6 rounded-2xl border text-center text-xs text-slate-400">
                                Belum ada jurnal refleksi yang disetor oleh peserta ini.
                              </div>
                            ) : (
                              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                                {memberJournals.map((j, idx) => (
                                  <div key={j.id || idx} className={`p-4 rounded-2xl border space-y-2 ${
                                    isKitabTheme ? 'bg-[#f4ebd5] border-[#d8c3a1]' : 'bg-slate-900 border-slate-800'
                                  }`}>
                                    <div className="flex items-center justify-between text-xs border-b pb-1.5">
                                      <span className="font-bold text-amber-800">Setoran #{idx + 1}</span>
                                      <span className="text-[10px] text-slate-500">
                                        {new Date(j.created_at).toLocaleString("id-ID")}
                                      </span>
                                    </div>
                                    <div className="text-xs whitespace-pre-line leading-relaxed">
                                      {j.answer_text}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Kolom Kanan: Rincian 21 Hari & Akun Login (5 Cols) */}
                          <div className="lg:col-span-5 space-y-4">
                            {/* Kotak Info Akun Login */}
                            <div className={`p-4 rounded-2xl border space-y-2 ${
                              isKitabTheme ? 'bg-[#f4ebd5] border-[#d8c3a1]' : 'bg-slate-900 border-slate-800'
                            }`}>
                              <h5 className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                <span>Akun Login Seumur Hidup</span>
                              </h5>
                              <p className="text-xs leading-relaxed text-slate-600">
                                Email: <strong>{member.email || "⚠️ Belum Diisi"}</strong>
                              </p>
                              <p className="text-[11px] text-slate-500 italic">
                                Email ini digunakan peserta saat login ke seluruh sistem portal NPT & EMT.
                              </p>
                              <button
                                onClick={() => {
                                  setEditingMember(member);
                                  setEditName(member.nama);
                                  setEditEmail(member.email || "");
                                  setEditPhone(member.wa || "");
                                  setEditBatch(member.batch || "batch-1");
                                }}
                                className="w-full py-1.5 rounded-xl bg-[#3a2211] text-white text-xs font-bold hover:bg-[#26150a] transition cursor-pointer"
                              >
                                Edit / Masukkan Email Sekarang
                              </button>
                            </div>

                            {/* Kotak Status 21 Hari */}
                            <div className={`p-4 rounded-2xl border space-y-2.5 ${
                              isKitabTheme ? 'bg-[#f4ebd5] border-[#d8c3a1]' : 'bg-slate-900 border-slate-800'
                            }`}>
                              <div className="flex items-center justify-between">
                                <h5 className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                                  <Activity className="w-4 h-4 text-rose-600" />
                                  <span>Checklist Self-Healing 21 Hari</span>
                                </h5>
                                <span className="text-xs font-bold text-emerald-700">
                                  {healingProgress.percent}% Selesai
                                </span>
                              </div>

                              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-emerald-500 to-amber-500" 
                                  style={{ width: `${healingProgress.percent}%` }}
                                />
                              </div>

                              {healingProgress.days.length > 0 ? (
                                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 text-[11px]">
                                  {healingProgress.days.filter(d => d.completed).map((d) => (
                                    <div key={d.day} className="p-2 rounded-lg bg-white/70 border text-slate-700">
                                      <strong>Hari ke-{d.day}:</strong> {d.note ? `"${d.note}"` : 'Terlaksana'}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[11px] text-slate-500 italic">
                                  Peserta belum menyinkronkan catatan checklist 21 hari via WhatsApp / portal.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT / INPUT EMAIL LOGIN SEUMUR HIDUP                           */}
      {/* ========================================================================= */}
      {editingMember && (
        <div 
          onClick={() => setEditingMember(null)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 text-left ${
              isKitabTheme ? 'card-kitab-frame' : 'bg-slate-900 border border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <h3 className={`text-base font-bold ${isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-white'}`}>
                  Atur Akun Login Peserta
                </h3>
              </div>
              <button onClick={() => setEditingMember(null)} className="p-1 cursor-pointer">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveMemberAccount} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold mb-1">Nama Lengkap Peserta *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-hidden ${
                    isKitabTheme ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b]' : 'bg-slate-950 text-white border-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Alamat Email Gmail (Kunci Login Seumur Hidup) *
                </label>
                <input
                  type="email"
                  placeholder="contoh: nama.guru@gmail.com"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-hidden ${
                    isKitabTheme ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b]' : 'bg-slate-950 text-white border-slate-800'
                  }`}
                />
                <p className="text-[10px] text-amber-700 mt-1">
                  Email yang dimasukkan Kang Iman di sini akan langsung menjadi akses login seumur hidup bagi peserta.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Nomor WhatsApp</label>
                <input
                  type="text"
                  placeholder="08123456789"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-hidden ${
                    isKitabTheme ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b]' : 'bg-slate-950 text-white border-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Angkatan EMT</label>
                <select
                  value={editBatch}
                  onChange={(e) => setEditBatch(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-hidden ${
                    isKitabTheme ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b]' : 'bg-slate-950 text-white border-slate-800'
                  }`}
                >
                  <option value="batch-1">EMT Batch 1 (Guru Hebat)</option>
                  <option value="batch-2">EMT Batch 2 (Reguler / Umum)</option>
                  <option value="batch-3">EMT Batch 3 (Somatic & Energy Flow)</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="flex-1 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`flex-1 py-2.5 rounded-xl text-white text-xs font-bold transition cursor-pointer ${
                    isKitabTheme ? 'bg-[#9e2a2b] hover:bg-[#852324]' : 'bg-emerald-600 hover:bg-emerald-500'
                  }`}
                >
                  {isSaving ? "Menyimpan..." : "Simpan Akun Login"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: INPUT PESERTA BARU SECARA MANUAL                                */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div 
          onClick={() => setIsAddModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 text-left ${
              isKitabTheme ? 'card-kitab-frame' : 'bg-slate-900 border border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-600" />
                <h3 className={`text-base font-bold ${isKitabTheme ? 'font-kitab-title text-[#26150a]' : 'text-white'}`}>
                  Input Peserta EMT Baru
                </h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 cursor-pointer">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateNewMember} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Nama Lengkap Peserta *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dra. Hj. Ratna Juwita, M.Pd"
                  value={newMemberData.nama}
                  onChange={(e) => setNewMemberData({ ...newMemberData, nama: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-hidden ${
                    isKitabTheme ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b]' : 'bg-slate-950 text-white border-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Nomor WhatsApp Aktif *</label>
                <input
                  type="text"
                  required
                  placeholder="08123456789"
                  value={newMemberData.wa}
                  onChange={(e) => setNewMemberData({ ...newMemberData, wa: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-hidden ${
                    isKitabTheme ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b]' : 'bg-slate-950 text-white border-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Alamat Email Gmail (Kunci Login)</label>
                <input
                  type="email"
                  placeholder="nama@gmail.com"
                  value={newMemberData.email}
                  onChange={(e) => setNewMemberData({ ...newMemberData, email: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-hidden ${
                    isKitabTheme ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b]' : 'bg-slate-950 text-white border-slate-800'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Asal Sekolah / Instansi</label>
                  <input
                    type="text"
                    placeholder="SMAN 1 Tasikmalaya"
                    value={newMemberData.sekolah}
                    onChange={(e) => setNewMemberData({ ...newMemberData, sekolah: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-hidden ${
                      isKitabTheme ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b]' : 'bg-slate-950 text-white border-slate-800'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Angkatan</label>
                  <select
                    value={newMemberData.batch}
                    onChange={(e) => setNewMemberData({ ...newMemberData, batch: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-hidden ${
                      isKitabTheme ? 'bg-[#fdfaf3] text-[#26150a] border-[#cbb38b]' : 'bg-slate-950 text-white border-slate-800'
                    }`}
                  >
                    <option value="batch-1">Batch 1</option>
                    <option value="batch-2">Batch 2</option>
                    <option value="batch-3">Batch 3</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`flex-1 py-2.5 rounded-xl text-white text-xs font-bold transition cursor-pointer ${
                    isKitabTheme ? 'bg-[#1b6b55] hover:bg-[#155644]' : 'bg-emerald-600 hover:bg-emerald-500'
                  }`}
                >
                  {isSaving ? "Menyimpan..." : "Simpan Peserta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
