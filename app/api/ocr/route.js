import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
  try {
    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64) {
      return NextResponse.json(
        { success: false, error: "Tidak ada data gambar yang diberikan." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "GEMINI_API_KEY belum dikonfigurasi pada environment variable server.",
        },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Hapus header data URI jika ada (misal 'data:image/jpeg;base64,')
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    // Prompt FULL OCR Sempurna: Menangkap seluruh isi teks tanpa peringkasan atau filter
    const prompt = `Anda adalah mesin Full OCR (Optical Character Recognition) berpresisi tinggi.
Tugas Anda adalah menyalin dan mentranskripsikan SELURUH teks yang terdapat di dalam gambar ini secara lengkap, utuh, dan 100% sempurna:

Instruksi Wajib:
1. Ekstrak SEMUA tulisan yang ada pada gambar tanpa terkecuali: judul utama, subjudul, badan teks/paragraf, poin-poin/list nomor, kutipan, catatan kaki, instruksi, rumus, maupun pertanyaan.
2. JANGAN memotong, meringkas, atau menyaring isi gambar. Salin seluruh kalimat kata per kata sebagaimana tertulis pada gambar.
3. Pertahankan tata letak dan struktur aslinya (baris baru, paragraf, penomoran 1, 2, 3 atau bullet points).
4. Berikan HANYA hasil teks salinan murni dari gambar, tanpa menambahkan kata pengantar atau penutup dari Anda.`;

    const imagePart = {
      inlineData: {
        data: cleanBase64,
        mimeType: mimeType || "image/jpeg",
      },
    };

    // Daftar model aktif yang diprioritaskan: gemini-2.0-flash & gemini-1.5-flash
    const candidateModels = [
      "gemini-2.0-flash",
      "gemini-1.5-flash",
      "gemini-1.5-flash-8b",
      "gemini-2.5-flash",
      "gemini-2.0-flash-exp",
      process.env.GEMINI_MODEL
    ].filter(Boolean);

    let lastError = null;
    let extractedText = null;

    for (const rawModelName of candidateModels) {
      try {
        const modelName = rawModelName.replace(/^models\//, "");
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        extractedText = response.text();
        if (extractedText && extractedText.trim()) {
          break;
        }
      } catch (err) {
        console.warn(`Percobaan model ${rawModelName} gagal:`, err.message);
        lastError = err;
      }
    }

    if (!extractedText) {
      throw lastError || new Error("Tidak dapat membaca gambar dengan model Gemini yang tersedia.");
    }

    return NextResponse.json({ success: true, text: extractedText.trim() });
  } catch (err) {
    console.error("Error OCR Gemini:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Gagal memproses OCR." },
      { status: 500 }
    );
  }
}