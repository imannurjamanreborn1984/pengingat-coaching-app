import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// Helper jeda waktu lokal singkat antar request ke Fonnte
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(req) {
  try {
    const { message } = await req.json();

    const fonnteToken = process.env.FONNTE_WA_TOKEN;
    if (!fonnteToken) {
      return NextResponse.json(
        {
          success: false,
          error: "FONNTE_WA_TOKEN belum disetel pada environment variable server.",
        },
        { status: 500 }
      );
    }

    // 1. Ambil data nama dan nomor telepon dari database Supabase
    const { data: members, error } = await supabase
      .from("profiles")
      .select("full_name, phone_number");

    if (error) {
      return NextResponse.json(
        { success: false, error: "Gagal mengambil data dari Supabase: " + error.message },
        { status: 500 }
      );
    }

    if (!members || members.length === 0) {
      return NextResponse.json({ success: false, error: "Tidak ada kontak ditemukan." });
    }

    let successCount = 0;
    let failCount = 0;

    // 2. Loop dan masukkan pesan ke antrean Fonnte
    for (const member of members) {
      if (!member.phone_number) continue;

      // Personalisasi pesan agar tidak dianggap spam identik oleh sistem WA
      const personalizedMessage = member.full_name
        ? `Halo Kak ${member.full_name},\n\n${message}`
        : message;

      try {
        const response = await fetch("https://api.fonnte.com/send", {
          method: "POST",
          headers: {
            Authorization: fonnteToken,
          },
          body: new URLSearchParams({
            target: member.phone_number,
            message: personalizedMessage,
            // Delay acak 5-15 detik di server Fonnte agar pengiriman alami seperti manusia
            delay: "5-15",
            // Simulasi status 'sedang mengetik...' (human-like presence)
            typing: "true",
            countryCode: "62",
          }),
        });

        const result = await response.json();

        if (result.status) {
          successCount++;
        } else {
          console.warn(`Gagal Fonnte untuk ${member.phone_number}:`, result);
          failCount++;
        }
      } catch (err) {
        console.error(`Gagal mengirim ke ${member.phone_number}:`, err);
        failCount++;
      }

      // Jeda 500ms antar pendaftaran antrean
      await sleep(500);
    }

    return NextResponse.json({
      success: true,
      message: `Pesan berhasil dimasukkan ke antrean Fonnte. Sukses: ${successCount}, Gagal: ${failCount}`,
    });
  } catch (err) {
    console.error("Error broadcast API:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}