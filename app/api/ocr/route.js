import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64) {
      return Response.json({ success: false, error: "Gambar tidak ditemukan" }, { status: 400 });
    }

    // Menggunakan model gemini-1.5-flash yang cepat & akurat untuk membaca teks dari gambar
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = 
      "Ekstrak semua teks pertanyaan, instruksi, dan evaluasi dari gambar ini secara jelas dan terstruktur. " +
      "Jika ada item isian berupa persentase (%) atau esai, tuliskan dengan format daftar yang rapi.";

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: imageBase64, mimeType: mimeType || "image/jpeg" } }
    ]);

    const responseText = result.response.text();

    return Response.json({ success: true, text: responseText });
  } catch (error) {
    console.error("OCR Error:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}