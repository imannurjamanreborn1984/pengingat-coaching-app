import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// Helper function untuk menciptakan jeda waktu (delay)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(req) {
  try {
    const { message } = await req.json();

    // 1. Ambil data nama dan nomor telepon dari database Supabase
    const { data: members, error } = await supabase
      .from("profiles")
      .select("full_name, phone_number");

    if (error || !members || members.length === 0) {
      return NextResponse.json({ success: false, error: "Tidak ada kontak ditemukan." });
    }

    let successCount = 0;
    let failCount = 0;

    // 2. Loop dan kirim satu per satu dengan jeda
    for (const member of members) {
      if (!member.phone_number) continue;

      // Personalisasi pesan agar tidak dianggap spam identik oleh WA
      const personalizedMessage = member.full_name 
        ? `Halo Kak ${member.full_name},\n\n${message}`
        : message;

      const response = await fetch("https://api.fonnte.com/send", {
        method: "POST",
        headers: {
          Authorization: process.env.FONNTE_WA_TOKEN,
        },
        body: new URLSearchParams({
          target: member.phone_number,
          message: personalizedMessage,
        }),
      });

      const result = await response.json();

      if (result.status) {
        successCount++;
      } else {
        failCount++;
      }

      // 3. LOGIKA DELAY: Buat jeda acak antara 7 s/d 15 detik antar nomor
      const randomDelay = Math.floor(Math.random() * (15000 - 7000 + 1)) + 7000;
      await sleep(randomDelay);
    }

    return NextResponse.json({
      success: true,
      message: `Pengiriman selesai. Berhasil: ${successCount}, Gagal: ${failCount}`,
    });

  } catch (err) {
    return NextResponse.json({ success: false, error: err.message });
  }
}