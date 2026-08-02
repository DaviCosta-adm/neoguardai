import { redirect } from "next/navigation";
import Header from "@/app/components/dashboard/Header";
import { requireAuth } from "@/app/lib/auth/dal";
import { getInstituicaoById, listUsuarios } from "@/app/lib/auth/users";
import { rotuloRole } from "@/app/lib/data/labels";

export default async function UsuariosPage() {
  const auth = await requireAuth();

  if (auth.user.role !== "admin_neoguard") {
    redirect("/dashboard/configuracoes");
  }

  const usuarios = await listUsuarios();
  const instituicaoNomes = new Map<string, string>();

  await Promise.all(
    [...new Set(usuarios.map((usuario) => usuario.instituicaoId))].map(
      async (instituicaoId) => {
        const instituicao = await getInstituicaoById(instituicaoId);
        instituicaoNomes.set(
          instituicaoId,
          instituicao?.nome ?? instituicaoId
        );
      }
    )
  );

  return (
    <>
      <Header
        title="Usuários"
        subtitle="Contas da plataforma agrupadas por instituição e perfil."
        eyebrow="NeoGuardAI · Plataforma"
      />

      <div className="space-y-3 px-6 py-6">
        {usuarios.map((usuario) => (
          <div
            key={usuario.id}
            className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium text-white">{usuario.nome}</p>
              <p className="text-sm text-gray-500">{usuario.email}</p>
              <p className="mt-1 text-xs text-gray-500">
                {instituicaoNomes.get(usuario.instituicaoId)}
              </p>
            </div>
            <span className="w-fit rounded-full border border-white/10 px-2.5 py-1 text-xs text-gray-300">
              {rotuloRole[usuario.role]}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
