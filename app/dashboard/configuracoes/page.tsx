import Header from "@/app/components/dashboard/Header";
import { requireAuth } from "@/app/lib/auth/dal";
import { rotuloRole } from "@/app/lib/data/labels";
import { listarUsuariosDaInstituicao } from "@/app/lib/data/repository";

export default async function ConfiguracoesPage() {
  const auth = await requireAuth();
  const usuarios = listarUsuariosDaInstituicao(auth);

  return (
    <>
      <Header
        title="Configurações"
        subtitle="Usuários e contexto da instituição autenticada."
      />

      <div className="space-y-6 px-6 py-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-lg font-semibold">Instituição</h2>
          <p className="mt-2 text-sm text-gray-400">{auth.instituicao.nome}</p>
          <p className="mt-1 text-xs text-gray-500">ID: {auth.instituicao.id}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="mb-4 text-lg font-semibold">Usuários</h2>
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
          Próximo passo: persistência em banco real (substitui o store em
          memória) e gestão completa de permissões.
        </div>
      </div>
    </>
  );
}
