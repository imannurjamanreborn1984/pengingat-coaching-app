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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Hapus header data URI jika ada (misal 'data:image/jpeg;base64,')
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const prompt =
      "Ekstrak semua teks pertanyaan, instruksi latihan, atau poin-poin refleksi dari gambar materi ini dengan rapi dan terstruktur dalam Bahasa Indonesia. Tampilkan hanya teks yang relevan untuk dijawab peserta.";

    const imagePart = {
      inlineData: {
        data: cleanBase64,
        mimeType: mimeType || "image/jpeg",
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ success: true, text });
  } catch (err) {
    console.error("Error OCR Gemini:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Gagal memproses OCR." },
      { status: 500 }
    );
  }
}