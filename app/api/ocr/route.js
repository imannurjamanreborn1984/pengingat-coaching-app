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

    // Bersihkan base64 data URI
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    // Ambil API key yang valid (prioritaskan key AIzaSy...)
    let apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "GEMINI_API_KEY belum dikonfigurasi di environment variable server.",
        },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const prompt = `Anda adalah sistem OCR (Optical Character Recognition) berpresisi tinggi.
Tugas Anda adalah membaca dan menyalin SELURUH teks yang terdapat di dalam gambar ini secara lengkap, kata demi kata, persis seperti aslinya.
- Salin seluruh judul, poin, nomor, dan paragraf tanpa meringkas.
- Berikan hanya hasil teks salinan gambar tanpa kata pengantar atau penutup.`;

    const imagePart = {
      inlineData: {
        data: cleanBase64,
        mimeType: mimeType || "image/jpeg",
      },
    };

    // Daftar model aktif Google AI Studio
    const candidateModels = [
      "gemini-2.0-flash",
      "gemini-1.5-flash",
      "gemini-1.5-flash-8b",
      "gemini-2.5-flash",
    ];

    let extractedText = null;
    let lastError = null;

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();
        if (text && text.trim()) {
          extractedText = text.trim();
          break;
        }
      } catch (err) {
        console.warn(`Percobaan model ${modelName} gagal:`, err.message);
        lastError = err;
      }
    }

    if (!extractedText) {
      const errMsg = lastError?.message || "";
      if (errMsg.includes("leaked") || errMsg.includes("PERMISSION_DENIED")) {
        return NextResponse.json(
          {
            success: false,
            error: "API Key Gemini Anda telah dinonaktifkan oleh Google karena terdeteksi bocor di repo publik. Silakan buat API Key baru gratis di Google AI Studio (https://aistudio.google.com/app/apikey) lalu pasang di environment variable.",
          },
          { status: 403 }
        );
      }

      throw lastError || new Error("Gagal membaca teks dari gambar.");
    }

    return NextResponse.json({ success: true, text: extractedText });
  } catch (err) {
    console.error("Error OCR Gemini:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Gagal memproses OCR." },
      { status: 500 }
    );
  }
}