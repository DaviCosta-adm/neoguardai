import Link from "next/link";
import { redirect } from "next/navigation";
import Header from "@/app/components/dashboard/Header";
import { requireAuth } from "@/app/lib/auth/dal";
import { listarInstituicoesComMetricas } from "@/app/lib/data/plataforma";

export default async function InstituicoesPage() {
  const auth = await requireAuth();

  if (auth.user.role !== "admin_neoguard") {
    redirect("/dashboard");
  }

  const instituicoes = await listarInstituicoesComMetricas();

  return (
    <>
      <Header
        title="Instituições"
        subtitle="Escolas e redes monitoradas pela plataforma NeoGuardAI."
        eyebrow="NeoGuardAI · Plataforma"
      />

      <div className="space-y-4 px-6 py-6">
        {instituicoes.map((instituicao) => (
          <Link
            key={instituicao.id}
            href={`/dashboard/instituicoes/${instituicao.id}`}
            className="block rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-cyan-400/30"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {instituicao.nome}
                </h2>
                <p className="mt-1 text-sm text-gray-500">ID: {instituicao.id}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div>
                  <p className="text-xs text-gray-500">Estudantes</p>
                  <p className="font-semibold">{instituicao.totalEstudantes}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Usuários</p>
                  <p className="font-semibold">{instituicao.usuarios}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Casos imediatos</p>
                  <p className="font-semibold">{instituicao.casosImediatos}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Frequência</p>
                  <p className="font-semibold">{instituicao.frequenciaMedia}%</p>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {instituicoes.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhuma instituição encontrada.</p>
        ) : null}
      </div>
    </>
  );
}
