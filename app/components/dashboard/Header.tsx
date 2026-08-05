import LogoutButton from "@/app/components/dashboard/LogoutButton";
import QuickSearch from "@/app/components/dashboard/QuickSearch";
import { requireAuth } from "@/app/lib/auth/dal";
import { rotuloRole } from "@/app/lib/data/labels";
import { Bell } from "lucide-react";

export default async function Header({
  title,
  subtitle,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}) {
  const auth = await requireAuth();
  const contextLabel =
    eyebrow ??
    (auth.user.role === "admin_neoguard"
      ? "NeoGuardAI · Plataforma"
      : auth.instituicao.nome);

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#050816]/80 px-6 py-4 backdrop-blur-xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-400/80">
            {contextLabel}
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-white">{title}</h1>
          {subtitle ? (
            <p className="mt-1 text-sm text-gray-400">{subtitle}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {auth.user.role !== "admin_neoguard" ? <QuickSearch /> : null}

          <button
            type="button"
            className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-gray-300 transition hover:border-cyan-400/30 hover:text-cyan-200"
            aria-label="Notificações"
          >
            <Bell size={16} />
          </button>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-200">
            <p className="font-medium">{auth.user.nome}</p>
            <p className="text-xs text-gray-500">{rotuloRole[auth.user.role]}</p>
          </div>

          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
