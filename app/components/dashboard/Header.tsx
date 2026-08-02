import { Bell, Search } from "lucide-react";
import LogoutButton from "@/app/components/dashboard/LogoutButton";
import { requireAuth } from "@/app/lib/auth/dal";
import { rotuloRole } from "@/app/lib/data/labels";

export default async function Header({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const auth = await requireAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#050816]/80 px-6 py-4 backdrop-blur-xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-400/80">
            {auth.instituicao.nome}
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-white">{title}</h1>
          {subtitle ? (
            <p className="mt-1 text-sm text-gray-400">{subtitle}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-400 lg:flex-none">
            <Search size={15} />
            <span>Busca rápida (em breve)</span>
          </div>

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
