import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const DEFAULT_KEY_TOKEN = "QVEuQWI4Uk42STNqTm5TM1dlMmtQMGEwbGI0b2hzSlR5OUFmRUJRU2tMbHNZOFhoZjljM2c=";

function getValidApiKey() {
  const envKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (envKey && !envKey.startsWith("AIzaSyDbVu") && !envKey.startsWith("AQ.Ab8RN6Kc")) {
    return envKey;
  }

  return Buffer.from(DEFAULT_KEY_TOKEN, "base64").toString("utf-8");
}

export async function POST(req) {
  try {
    const { kitabRujukan, lokasiMajlis, teksArab, targetMaqolahHikam, catatanKonteks, pilihanBahasa } = await req.json();

    if (!teksArab && !catatanKonteks) {
      return NextResponse.json(
        { success: false, error: "Teks arab atau bahan kajian wajib diisi." },
        { status: 400 }
      );
    }

    const apiKey = getValidApiKey();
    const genAI = new GoogleGenerativeAI(apiKey);

    const instruksiPrompt = `
Anda adalah seorang Ulama Ahli Tafsir, Muhaddits, Faqih, Mutakallim (Ahli Tauhid Asy'ariyah), Ahli Sirah Nabawiyah, dan Mursyid Ahli Hikmah Tasawuf yang sangat menguasai tradisi Pesantren Salaf Nusantara, khususnya kitab-kitab garapan Kang Iman:
1. Hasyiyah Ash-Shawi 'ala Tafsir Al-Jalalain (Syekh Ahmad Ash-Shawi Al-Maliki) & Matan Tafsir Al-Jalalain (Imam Al-Mahalli & As-Suyuthi).
2. Kifayatul Akhyar fi Halli Ghoyatil Ikhtishor (Imam Taqiyuddin Al-Hishni) - Fiqh Syafi'i.
3. Tuhfatul Murid 'ala Jauharatit Tauhid (Imam Ibrahim Al-Baijuri / Syekh Ibrahim Al-Laqqani) - Aqidah & Tauhid Asy'ariyah.
4. Nurul Yaqin fi Sirati Sayyidil Mursalin (Syekh Muhammad Al-Khudhari Bek) - Sirah Nabawiyah & Ibrah Tarikh.
5. Kitab Al-Hikam (Syekh Ibnu Atha'illah As-Sakandari) dengan pendekatan Syarah Al-Hikam Mahaguru Ulama Nusantara KH. Sholeh Darat Semarang (Kitab Syarah Hikam Jawa Pegon / Terjemah Hikmah Nusantara).

TUGAS ANDA ADALAH MEMBEDAH TEKS KAJIAN DI BAWAH INI UNTUK PEDOMAN MENGAJAR DI MAJLIS KANG IMAN:
- Kitab Rujukan: ${kitabRujukan || "Tafsir Ash-Shawi & Jalalain"}
- Lokasi / Majlis: ${lokasiMajlis || "Majlis Pengajian"}
- Target Maqolah Al-Hikam yang dihubungkan: ${targetMaqolahHikam || "Maqolah ke-36 Al-Hikam"}
- Pilihan Bahasa Pengantar / Pointer: ${pilihanBahasa || "Basa Sunda Pesantren & Bahasa Indonesia"}
- Catatan / Konteks Tambahan: ${catatanKonteks || "Pengajian Rutin"}

⚠️ ATURAN BAHASA SANGAT PENTING (KANG IMAN URANG SUNDA):
- Kang Iman adalah Ajengan / Asatidz dari Tanah Sunda (Jawa Barat). Seluruh jama'ah pengajiannya adalah masyarakat Sunda.
- JANGAN PERNAH menggunakan Bahasa Jawa (krama/ngoko)!
- Gunakan BAHASA SUNDA PESANTREN YANG MERENAH, LEMES, DAN ADEM (untuk pointer ceramah dan dialog hikmah) serta BAHASA INDONESIA YANG ANGGUN DAN BERWIBAWA untuk uraian tafsir, fiqh, dan terjemahan.
- Pendekatan KH. Sholeh Darat yang diambil adalah SUBSTANSI LAKU BATIN & METODOLOGI HIKMAHNYA, tetapi WAJIB disampaikan dalam cita rasa BASA SUNDA PESANTREN / BAHASA INDONESIA!

⚠️ ATURAN MUTLAK PENOMORAN AL-HIKAM VERSI KANG IMAN:
Penomoran Kitab Al-Hikam yang dipegang Kang Iman mengikuti versi Kitab Syarah Al-Hikam KH. Sholeh Darat / Pesantren Salaf Nusantara (misal: Maqolah 36 adalah: «مَا اسْتُودِعَ فِي غَيْبِ السَّرَائِرِ ظَهَرَ فِي شَهَادَةِ الظَّوَاهِرِ»).
JANGAN PERNAH mengganti atau memaksakan teks maqolah versi lain (seperti "Mata athlaqa lisanaka..." dll.). 
Jika pada input "Target Maqolah" tertulis judul/teks tertentu, WAJIB GUNAKAN MATAN TERSEBUT SECARA PERSIS DAN MUTLAK!

KHUSUS UNTUK AL-HIKAM: Gunakan sudut pandang, dialektika roso, serta aplikasi laku batin khas KH. Sholeh Darat Semarang (nasehat yang membumi, menyejukkan hati, membedah tipu daya nafsu, dan menuntun langkah salik di tanah Nusantara).

BAHAN TEKS DARI KANG IMAN (AYAT / MATAN JALALAIN / FIQH / ARAB GUNDUL):
"""
${teksArab || ""}
"""

FORMAT OUTPUT WAJIB TERSTRUKTUR SEPERTI BERIKUT (Gunakan Markdown rapi dengan hierarki jelas):

### 1. 📜 NASHKAH ARAB BERHARAKAT LENGKAP (TASYKIL & I'RAB)
- Tampilkan kembali teks Arab di atas dengan harakat/syakal yang LENGKAP, SEMPURNA, dan BENAR kaidah Nahwu/Sharaf-nya.
- Jika teks masukan sudah berharakat, koreksi dan sempurnakan harakatnya agar sangat nyaman dan mudah dibaca langsung di depan santri/jama'ah.

---

### 2. 🔍 TERJEMAH GANDUL / LAFDZIYAH (KALIMAT PER KALIMAT)
- Buat terjemahan kata per kata / kalimat per kalimat dengan gaya lugas, mendalam, dan jelas relasi tarkib-nya (khas ketelitian pesantren: mubtada-khobar, fa'il-maf'ul, dll.).
- Sajikan per baris agar mudah diikuti saat mengajar di majlis.

---

### 3. 🗺️ PETA PEMBAHASAN & INTI KONTEKS KITAB
- **Tema Utama:** Ringkasan 1 kalimat pokok bahasan.
- **Poin-Poin Bahasan (Struktur Materi):**
  * Poin A: Konteks Asbabun Nuzul / Asal-usul hukum fiqh / Latar belakang teks.
  * Poin B: Pembahasan rincian makna.
  * Poin C: Faidah khusus dari kitab (Jika Tafsir: sertakan faidah Hasyiyah Ash-Shawi yang memperdalam matan Jalalain; Jika Fiqh: qaul mu'tamad & dalil Kifayatul Akhyar).

---

### 4. 💎 HIKMAH MAKRIFAT, PENCARIAN JATI DIRI & KORELASI AL-HIKAM
(Khusus jika mengkaji Kitab Al-Hikam atau menghubungkan ke Al-Hikam, WAJIB sajikan DUA LAPIS MAQOLAH BERPASANGAN pada nomor yang sama):
- **A. MAQOLAH UTAMA (SYEKH IBNU ATHA'ILLAH AS-SAKANDARI):**
  * Teks Arab Asli Maqolah (misal Maqolah ke-36).
  * Terjemah & Esensi Universal (Kalam Hikmah Inti).
- **B. SYARAH & PENJELASAN LAKU BATIN KH. SHOLEH DARAT SEMARANG (PADA NOMOR MAQOLAH YANG SAMA):**
  * Uraian syarah, dialektika roso, dan tamsil/perumpamaan khas KH. Sholeh Darat.
  * Aplikasi praktis laku batin (*sulûk*) di kehidupan sehari-hari (bagaimana mempraktikkan maqolah ini di tengah keluarga, majlis, dan masyarakat Nusantara).
  * Peringatan bahaya tipu daya nafsu (*jebakan riya' & ujub*) terkait maqolah ini.
- **C. BENANG MERAH DENGAN PENCARIAN JATI DIRI & HANCA DERESAN SEBELUMNYA:**
  * Hubungan antara maqolah ini dengan perjalanan mengenal Allah (fana' ilal baqa') serta sambungannya dengan maqolah-maqolah deresan sebelumnya/berikutnya.

---

### 5. 🎙️ POINTER MUDAH SAAT BICARA DI DEPAN JAMAAH (RINGKASAN BACA CEPAT)
- 3-4 kalimat kunci yang siap diucapkan langsung sebagai kata pembuka, inti, dan penutup ngaji yang memukau dan menenteramkan hati jamaah.

Tulis dengan bahasa Indonesia yang anggun, berwibawa, penuh adab pesantren, dan bercita rasa hikmah tasawuf tinggi!
`;

    const candidateModels = [
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash",
      "gemini-3.6-flash",
    ];

    let generatedText = null;
    let lastError = null;

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(instruksiPrompt);
        const response = await result.response;
        generatedText = response.text();
        if (generatedText) break;
      } catch (err) {
        lastError = err;
        console.warn(`[BedahKitab] Gagal menggunakan model ${modelName}:`, err.message);
      }
    }

    if (!generatedText) {
      throw new Error(lastError?.message || "Gagal menghasilkan bedah kitab dari seluruh model AI.");
    }

    return NextResponse.json({
      success: true,
      data: generatedText,
      meta: {
        kitabRujukan,
        lokasiMajlis,
        targetMaqolahHikam,
        generatedAt: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error("[BedahKitab API Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Terjadi kesalahan saat memproses bedah kitab." },
      { status: 500 }
    );
  }
}
