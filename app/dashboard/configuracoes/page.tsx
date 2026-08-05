import Link from "next/link";
import Header from "@/app/components/dashboard/Header";
import { requireAuth } from "@/app/lib/auth/dal";
import { rotuloRole } from "@/app/lib/data/labels";
import { listarInstituicoesComMetricas } from "@/app/lib/data/plataforma";
import { listarUsuariosDaInstituicao } from "@/app/lib/data/repository";

export default async function ConfiguracoesPage() {
  const auth = await requireAuth();
  const isPlatformAdmin = auth.user.role === "admin_neoguard";
  const usuarios = await listarUsuariosDaInstituicao(auth);
  const instituicoes = isPlatformAdmin
    ? await listarInstituicoesComMetricas()
    : [];

  return (
    <>
      <Header
        title="Configurações"
        subtitle={
          isPlatformAdmin
            ? "Administração da plataforma NeoGuardAI."
            : "Usuários e contexto da instituição autenticada."
        }
        eyebrow={isPlatformAdmin ? "NeoGuardAI · Plataforma" : undefined}
      />

      <div className="space-y-6 px-6 py-6">
        {isPlatformAdmin ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-lg font-semibold">Plataforma</h2>
            <p className="mt-2 text-sm text-gray-400">
              Você está no perfil de super admin. Use as áreas abaixo para
              operar a rede de instituições.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/dashboard/instituicoes"
                className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100"
              >
                Instituições ({instituicoes.length})
              </Link>
              <Link
                href="/dashboard/usuarios"
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-200"
              >
                Usuários ({usuarios.length})
              </Link>
              <Link
                href="/dashboard/convites"
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-200"
              >
                Convites
              </Link>
              <Link
                href="/dashboard/operacao"
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-200"
              >
                Operação
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-lg font-semibold">Instituição</h2>
            <p className="mt-2 text-sm text-gray-400">{auth.instituicao.nome}</p>
            <p className="mt-1 text-xs text-gray-500">
              ID: {auth.instituicao.id}
            </p>
            {auth.user.role === "admin_instituicao" ? (
              <Link
                href="/dashboard/convites"
                className="mt-4 inline-flex rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100"
              >
                Convidar usuários
              </Link>
            ) : null}
          </div>
        )}

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="mb-4 text-lg font-semibold">
            {isPlatformAdmin ? "Usuários da plataforma" : "Usuários"}
          </h2>
          <div className="space-y-3">
            {usuarios.map((usuario) => (
              <div
                key={usuario.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3"
              >
                <div>
                  <p className="font-medium">{usuario.nome}</p>
                  <p className="text-sm text-gray-500">{usuario.email}</p>
                </div>
                <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-gray-300">
                  {rotuloRole[usuario.role]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-6 text-sm text-gray-400">
          {isPlatformAdmin
            ? "Convites e CRUD de instituições/usuários já estão disponíveis no menu da plataforma."
            : auth.user.role === "admin_instituicao"
              ? "Use Convites para adicionar coordenação, especialistas e outros admins da instituição."
              : "Dados de usuários e instituição já vêm do PostgreSQL."}
        </div>
      </div>
    </>
  );
}
