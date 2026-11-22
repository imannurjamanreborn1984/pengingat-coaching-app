"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Layers,
  GraduationCap,
  PenTool,
  User,
  Crown,
  Home,
  Sparkles
} from "lucide-react";
import { getSavedDeviceUser, SUPER_ADMIN_EMAILS } from "@/lib/authHelper";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const user = getSavedDeviceUser();
      if (user) setCurrentUser(user);
    } catch (e) {}
  }, [pathname]);

  if (!mounted) return null;

  // Sembunyikan di laptop / desktop (layar md ke atas)
  // Hanya muncul di smartphone / PWA mobile
  const isSuperAdmin =
    currentUser?.role === "super_admin" ||
    (currentUser?.email &&
      SUPER_ADMIN_EMAILS.includes(currentUser.email.toLowerCase().trim()));

  const navItems = [
    {
      id: "home",
      label: "Gerbang",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      id: "npt",
      label: "Kelas NPT",
      href: "/npt",
      icon: BookOpen,
      isActive: pathname.startsWith("/npt"),
    },
    {
      id: "akar",
      label: "14 Akar",
      href: "/buku-saku",
      icon: Layers,
      isActive: pathname === "/buku-saku",
    },
    {
      id: "emt",
      label: "EMT Guru",
      href: "/emt",
      icon: GraduationCap,
      isActive: pathname.startsWith("/emt"),
    },
    {
      id: "diary",
      label: "Diary",
      href: "/buku-saku?tab=journal",
      icon: PenTool,
      isActive: pathname.includes("journal"),
    },
    {
      id: "profile",
      label: isSuperAdmin ? "Admin" : "Akun",
      href: isSuperAdmin ? "/admin/members" : "/profile",
      icon: isSuperAdmin ? Crown : User,
      isActive: pathname.startsWith("/profile") || pathname.startsWith("/admin"),
      badgeColor: isSuperAdmin ? "text-amber-400" : "",
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 shadow-[0_-8px_30px_rgba(0,0,0,0.5)] transition-all select-none"
      style={{
        paddingBottom: "max(env(safe-area-inset-bottom, 0px), 8px)",
      }}
    >
      <div className="max-w-md mx-auto px-2 py-1 flex items-center justify-around">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const active = item.isActive;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex-1 py-1.5 px-1 flex flex-col items-center justify-center gap-1 rounded-2xl transition-all active:scale-90 cursor-pointer ${
                active
                  ? "text-rose-400 font-extrabold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div
                className={`relative w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                  active
                    ? "bg-gradient-to-tr from-rose-600 to-amber-600 text-white shadow-md shadow-rose-600/30 scale-105"
                    : "hover:bg-slate-900 text-slate-400"
                }`}
              >
                <IconComponent
                  className={`w-4 h-4 ${
                    active ? "text-white" : item.badgeColor || "text-slate-400"
                  }`}
                />
                {active && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-slate-950 animate-pulse" />
                )}
              </div>
              <span
                className={`text-[10px] leading-none tracking-tight truncate max-w-[58px] ${
                  active ? "text-rose-300 font-bold" : "text-slate-400"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
