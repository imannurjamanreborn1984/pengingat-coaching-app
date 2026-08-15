import { NextResponse } from "next/server";

export function middleware(request) {
  const url = request.nextUrl.clone();
  
  // Menjaga semua rute yang berawalan /admin
  if (url.pathname.startsWith("/admin")) {
    const authHeader = request.headers.get("authorization");

    // Password Sederhana (Username: admin | Password: adminpassword123)
    const ADMIN_USER = "admin";
    const ADMIN_PASS = "adminpassword123";

    if (authHeader) {
      const authValue = authHeader.split(" ")[1];
      const [user, pwd] = atob(authValue).split(":");

      if (user === ADMIN_USER && pwd === ADMIN_PASS) {
        return NextResponse.next();
      }
    }

    // Jika belum terautentikasi, tampilkan pop-up login bawaan browser (HTTP Basic Auth)
    return new NextResponse("Akses ditolak. Silakan masukkan kredensial Admin.", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Secure Area"',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};