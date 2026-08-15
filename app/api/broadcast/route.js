import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req) {
  try {
    const { message } = await req.json();

    // 1. Ambil semua nomor dari database Supabase
    const { data: members, error } = await supabase
      .from("profiles")
      .select("phone_number");

    if (error || !members || members.length === 0) {
      return NextResponse.json({ success: false, error: "Tidak ada kontak ditemukan." });
    }

    // 2. Gabungkan semua nomor dipisah koma
    const targetNumbers = members.map((m) => m.phone_number).join(",");

    // 3. Tembak API Fonnte menggunakan Environment Variable
    const response = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: process.env.FONNTE_WA_TOKEN, // Mengambil aman dari .env / Vercel
      },
      body: new URLSearchParams({
        target: targetNumbers,
        message: message,
      }),
    });

    const result = await response.json();

    // 4. Validasi respon dari API Fonnte
    if (result.status) {
      return NextResponse.json({ success: true, result });
    } else {
      return NextResponse.json({
        success: false,
        error: result.reason || "Gagal mengirim pesan via Fonnte.",
      });
    }
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message });
  }
}