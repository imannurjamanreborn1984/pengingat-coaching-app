import { supabase } from "@/lib/supabaseClient";
import { parseGrantedLevels } from "@/lib/authHelper";

/**
 * Catat aktivitas pembacaan/pembukaan materi ke Supabase
 * Diduplikasi secara lokal per-hari agar tidak spam database
 */
export async function recordMaterialView({
  materialId,
  materialTitle = "Materi NPT",
  levelNum = 1,
  currentUser = null
}) {
  if (!materialId) return;

  const cleanEmail = (currentUser?.email || "").toLowerCase().trim();
  const cleanName = currentUser?.name || currentUser?.full_name || (cleanEmail ? cleanEmail.split("@")[0] : "");
  const cleanPhone = currentUser?.phone_number || "";

  // Jika tidak ada identitas sama sekali, abaikan
  if (!cleanName && !cleanEmail && !cleanPhone) return;

  const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const userIdentifier = cleanEmail || cleanPhone || cleanName;
  const storageKey = `npt_mat_view_${materialId}_${userIdentifier}_${todayStr}`;

  try {
    // Cek apakah sudah pernah tercatat hari ini pada perangkat ini
    if (typeof window !== "undefined") {
      if (sessionStorage.getItem(storageKey) || localStorage.getItem(storageKey)) {
        return; // Sudah tercatat hari ini, lewati insert
      }
    }

    const payload = {
      material_id: String(materialId),
      material_title: materialTitle,
      level: Number(levelNum),
      user_name: cleanName,
      user_email: cleanEmail,
      user_phone: cleanPhone,
      opened_at: new Date().toISOString()
    };

    const rowPayload = {
      user_name: `${cleanName}${cleanPhone ? ` (${cleanPhone})` : ""}`,
      assignment_id: null,
      answer_text: `[LOG_BACA_MATERI]\n${JSON.stringify(payload)}`
    };

    // Tandai langsung di storage sebelum network call agar tidak double trigger
    if (typeof window !== "undefined") {
      sessionStorage.setItem(storageKey, "1");
      localStorage.setItem(storageKey, "1");
    }

    const { error } = await supabase.from("submissions").insert([rowPayload]);
    if (error) {
      console.warn("Info recordMaterialView:", error.message);
    }
  } catch (err) {
    console.warn("Gagal mencatat log pembaca:", err.message);
  }
}

/**
 * Ambil semua log pembaca materi untuk level tertentu (Sekali query untuk seluruh level)
 */
export async function fetchLevelMaterialViews(levelNum) {
  try {
    const { data, error } = await supabase
      .from("submissions")
      .select("id, user_name, answer_text, created_at")
      .ilike("answer_text", `%[LOG_BACA_MATERI]%"level":${levelNum}%`)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Kelompokkan per material_id
    const viewsByMaterial = {};

    (data || []).forEach((row) => {
      try {
        const raw = row.answer_text || "";
        const jsonPart = raw.replace(/^\[LOG_BACA_MATERI\]\s*/i, "").trim();
        const parsed = JSON.parse(jsonPart);
        const matId = String(parsed.material_id);

        if (!viewsByMaterial[matId]) {
          viewsByMaterial[matId] = [];
        }

        viewsByMaterial[matId].push({
          submissionId: row.id,
          user_name: parsed.user_name || row.user_name,
          user_email: (parsed.user_email || "").toLowerCase().trim(),
          user_phone: parsed.user_phone || "",
          opened_at: parsed.opened_at || row.created_at,
        });
      } catch (e) {
        // Abaikan jika format tidak sesuai
      }
    });

    return viewsByMaterial;
  } catch (err) {
    console.warn("Gagal mengambil data pembaca materi:", err.message);
    return {};
  }
}

/**
 * Ambil daftar member resmi/approved yang terdaftar pada level tertentu
 */
export async function fetchLevelEnrolledMembers(levelNum) {
  try {
    const { data: members, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone_number, role, status")
      .eq("status", "approved");

    if (error) throw error;

    const targetLvl = Number(levelNum);

    const enrolled = (members || []).filter((m) => {
      const granted = parseGrantedLevels(m.role);
      return granted.levels.includes(targetLvl);
    });

    return enrolled;
  } catch (err) {
    console.warn("Gagal mengambil member terdaftar level:", err.message);
    return [];
  }
}

/**
 * Helper untuk memformat waktu yang mudah dibaca (misal "Baru saja", "10 menit lalu", "24 Nov 2026 10:20")
 */
export function formatTimeAgo(dateString) {
  if (!dateString) return "-";
  try {
    const d = new Date(dateString);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 2) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays === 1) return `Kemarin, ${d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;
    if (diffDays < 7) return `${diffDays} hari lalu`;

    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch (e) {
    return dateString;
  }
}
