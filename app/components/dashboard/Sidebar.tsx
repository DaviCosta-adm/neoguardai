"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  Bot,
  ClipboardList,
  FileBarChart,
  GraduationCap,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";

const links = [
  { href: "/dashboard", label: "Visão geral", icon: LayoutDashboard },
  { href: "/dashboard/alunos", label: "Alunos", icon: Users },
  { href: "/dashboard/alertas", label: "Alertas", icon: AlertTriangle },
  {
    href: "/dashboard/intervencoes",
    label: "Intervenções",
    icon: ClipboardList,
  },
  { href: "/dashboard/relatorios", label: "Relatórios", icon: FileBarChart },
  { href: "/dashboard/atlas", label: "Atlas", icon: Bot },
  { href: "/dashboard/configuracoes", label: "Configurações", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-white/10 bg-[#070b1a]/90 backdrop-blur-xl">
      <div className="border-b border-white/10 px-5 py-5">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-300">
            <GraduationCap size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide text-white">
              NeoGuardAI
            </p>
            <p className="text-xs text-gray-500">Prevenção de evasão</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === href
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                active
                  ? "bg-cyan-400/15 text-cyan-200"
                  : "text-gray-400 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-4 py-4 text-xs text-gray-500">
        Dados simulados · v1
      </div>
    </aside>
  );
}
