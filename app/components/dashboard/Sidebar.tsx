"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  Bot,
  Building2,
  ClipboardList,
  CreditCard,
  FileBarChart,
  GraduationCap,
  LayoutDashboard,
  MailPlus,
  Settings,
  Stethoscope,
  Tags,
  BrainCircuit,
  Users,
} from "lucide-react";
import type { UserRole } from "@/app/lib/types";

const schoolLinks = [
  { href: "/dashboard", label: "Visão geral", icon: LayoutDashboard },
  { href: "/dashboard/alunos", label: "Alunos", icon: Users },
  { href: "/dashboard/alertas", label: "Alertas", icon: AlertTriangle },
  {
    href: "/dashboard/intervencoes",
    label: "Intervenções",
    icon: ClipboardList,
  },
  {
    href: "/dashboard/especialistas",
    label: "Especialistas",
    icon: Stethoscope,
  },
  { href: "/dashboard/relatorios", label: "Relatórios", icon: FileBarChart },
  { href: "/dashboard/atlas", label: "Atlas", icon: Bot },
  { href: "/dashboard/configuracoes", label: "Configurações", icon: Settings },
];

const platformLinks = [
  { href: "/dashboard", label: "Visão geral", icon: LayoutDashboard },
  {
    href: "/dashboard/instituicoes",
    label: "Instituições",
    icon: Building2,
  },
  {
    href: "/dashboard/assinaturas",
    label: "Assinaturas",
    icon: CreditCard,
  },
  { href: "/dashboard/planos", label: "Planos", icon: Tags },
  { href: "/dashboard/modelo", label: "Modelo de risco", icon: BrainCircuit },
  { href: "/dashboard/usuarios", label: "Usuários", icon: Users },
  { href: "/dashboard/convites", label: "Convites", icon: MailPlus },
  { href: "/dashboard/relatorios", label: "Relatórios", icon: FileBarChart },
  { href: "/dashboard/atlas", label: "Atlas", icon: Bot },
  { href: "/dashboard/configuracoes", label: "Configurações", icon: Settings },
];

function linksForRole(role: UserRole) {
  if (role === "admin_neoguard") {
    return platformLinks;
  }

  if (role === "especialista") {
    return schoolLinks.filter((link) =>
      [
        "/dashboard",
        "/dashboard/alunos",
        "/dashboard/intervencoes",
        "/dashboard/especialistas",
        "/dashboard/atlas",
      ].includes(link.href)
    );
  }

  if (role === "admin_instituicao") {
    return [
      ...schoolLinks,
      { href: "/dashboard/convites", label: "Convites", icon: MailPlus },
    ];
  }

  return schoolLinks;
}

export default function Sidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const links = linksForRole(role);
  const isPlatform = role === "admin_neoguard";

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
            <p className="text-xs text-gray-500">
              {isPlatform ? "Admin da plataforma" : "Prevenção de evasão"}
            </p>
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
        {isPlatform
          ? "Acesso global · super admin"
          : "Sessão autenticada · multi-tenant"}
      </div>
    </aside>
  );
}
