import { NextResponse } from "next/server";

export function proxy(request) {
  const url = request.nextUrl.clone();

  // Menjaga semua rute yang berawalan /admin
  if (url.pathname.startsWith("/admin")) {
    const authHeader = request.headers.get("authorization");

    const ADMIN_USER = process.env.ADMIN_USER || "admin";
    const ADMIN_PASS = process.env.ADMIN_PASS || "adminpassword123";

    if (authHeader) {
      try {
        const authValue = authHeader.split(" ")[1];
        if (authValue) {
          const decoded = atob(authValue);
          const [user, pwd] = decoded.split(":");

          if (user === ADMIN_USER && pwd === ADMIN_PASS) {
            return NextResponse.next();
          }
        }
      } catch (err) {
        console.error("Auth decoding error:", err);
      }
    }

    // Jika belum terautentikasi, tampilkan pop-up login bawaan browser (HTTP Basic Auth)
    return new NextResponse("Akses ditolak. Silakan masukkan kredensial Admin.", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Secure Admin Area"',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
