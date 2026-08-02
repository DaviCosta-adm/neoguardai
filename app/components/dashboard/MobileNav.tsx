"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  Building2,
  ClipboardList,
  LayoutDashboard,
  Stethoscope,
  Users,
} from "lucide-react";
import type { UserRole } from "@/app/lib/types";

const schoolLinks = [
  { href: "/dashboard", label: "Início", icon: LayoutDashboard },
  { href: "/dashboard/alunos", label: "Alunos", icon: Users },
  { href: "/dashboard/alertas", label: "Alertas", icon: AlertTriangle },
  {
    href: "/dashboard/intervencoes",
    label: "Ações",
    icon: ClipboardList,
  },
  {
    href: "/dashboard/especialistas",
    label: "Casos",
    icon: Stethoscope,
  },
];

const platformLinks = [
  { href: "/dashboard", label: "Início", icon: LayoutDashboard },
  {
    href: "/dashboard/instituicoes",
    label: "Escolas",
    icon: Building2,
  },
  { href: "/dashboard/usuarios", label: "Usuários", icon: Users },
];

export default function MobileNav({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const links =
    role === "admin_neoguard"
      ? platformLinks
      : role === "especialista"
        ? schoolLinks.filter((link) =>
            [
              "/dashboard",
              "/dashboard/alunos",
              "/dashboard/especialistas",
            ].includes(link.href)
          )
        : schoolLinks.filter((link) => link.href !== "/dashboard/especialistas");

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#070b1a]/95 px-2 py-2 backdrop-blur-xl md:hidden">
      <div
        className={`grid gap-1 ${links.length === 3 ? "grid-cols-3" : "grid-cols-4"}`}
      >
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === href
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] ${
                active ? "text-cyan-300" : "text-gray-500"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
