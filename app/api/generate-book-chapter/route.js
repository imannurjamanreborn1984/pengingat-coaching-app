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
    const { judulVideo, kategoriNama, teksMentahKajian } = await req.json();

    if (!judulVideo) {
      return NextResponse.json(
        { success: false, error: "Judul kajian wajib diisi." },
        { status: 400 }
      );
    }

    const apiKey = getValidApiKey();
    const genAI = new GoogleGenerativeAI(apiKey);

    const instruksiPrompt = `
Kamu adalah seorang Editor Buku Islami profesional, tasawuf, dan spiritual mendalam. 
Tugasmu adalah menyusun sebuah bab buku yang rapi, mengalir indah, puitis, dan padat ilmu berdasarkan bahan kajian di bawah ini.

Judul Bab Buku: ${judulVideo}
Kategori Kajian: ${kategoriNama || "Kajian Hakikat Cinta"}

Bahan Mentah Sumber Kajian:
"${teksMentahKajian || judulVideo}"

Aturan Penulisan Bab Buku:
1. Tulis hasil akhirnya langsung ke isi naskah dalam bentuk paragraf buku yang mengalir indah dan enak dibaca (buat minimal 3-4 paragraf panjang berbobot). JANGAN hanya menulis poin ringkas atau resume pendek!
2. Buang kata-kata lisan yang berulang, sapaan santai, link media sosial, jualan, atau teks timestamp.
3. Rapikan penulisan istilah spiritual/arab agar baku dan bermartabat (misal: Tazkiyatun Nafs, Hakikat, Syariat, Qalbu, Ma'rifat, Fana, Baqa, 14 Akar Spiritual).
4. Hidupkan suasana pengajaran yang menyentuh jiwa, bijaksana, mendalam, dan membimbing pembaca menuju ketenangan transcendental batin.
5. Berikan HANYA teks isi naskah bab buku tanpa basa-basi pengantar atau penutup.
`;

    const candidateModels = [
      "gemini-3.6-flash",
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash",
    ];

    let generatedText = null;
    let lastError = null;

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(instruksiPrompt);
        const response = await result.response;
        const text = response.text();
        if (text && text.trim()) {
          generatedText = text.trim();
          break;
        }
      } catch (err) {
        console.warn(`Model ${modelName} gagal:`, err.message);
        lastError = err;
      }
    }

    if (!generatedText) {
      throw lastError || new Error("Gagal menyusun naskah dengan model AI yang tersedia.");
    }

    return NextResponse.json({ success: true, text: generatedText });
  } catch (err) {
    console.error("Error Generate Book Chapter:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Gagal memproses naskah AI." },
      { status: 500 }
    );
  }
}
