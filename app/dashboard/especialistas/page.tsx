import Link from "next/link";
import AssumirCasoButton from "@/app/components/dashboard/AssumirCasoButton";
import Header from "@/app/components/dashboard/Header";
import RiskBadge from "@/app/components/dashboard/RiskBadge";
import { requireAuth } from "@/app/lib/auth/dal";
import { listarEncaminhamentos } from "@/app/lib/data/especialistas";
import { rotuloStatusEncaminhamento } from "@/app/lib/data/labels";

export default async function EspecialistasPage() {
  const auth = await requireAuth();
  const casos = await listarEncaminhamentos(auth);

  return (
    <>
      <Header
        title={
          auth.user.role === "especialista"
            ? "Meus encaminhamentos"
            : "Módulo de especialistas"
        }
        subtitle="Casos encaminhados, atendimentos e devolutivas especializadas."
      />

      <div className="space-y-4 px-6 py-6">
        {casos.map((caso) => (
          <div
            key={caso.id}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold">{caso.alunoNome}</h2>
                  <RiskBadge
                    nivel={caso.riscoNivel}
                    percentual={caso.riscoPercentual}
                  />
                  <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-gray-300">
                    {rotuloStatusEncaminhamento[caso.status]}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-400">{caso.motivo}</p>
                <p className="mt-2 text-xs text-gray-500">
                  {caso.alunoTurma} · por {caso.criadoPorNome}
                  {caso.especialistaNome
                    ? ` · especialista ${caso.especialistaNome}`
                    : " · sem especialista atribuído"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {auth.user.role === "especialista" &&
                (!caso.especialistaId ||
                  caso.especialistaId === auth.user.id) &&
                caso.status !== "concluido" ? (
                  <AssumirCasoButton encaminhamentoId={caso.id} />
                ) : null}
                <Link
                  href={`/dashboard/especialistas/${caso.id}`}
                  className="rounded-xl border border-white/10 px-3 py-2 text-sm text-gray-200"
                >
                  Abrir
                </Link>
              </div>
            </div>
          </div>
        ))}

        {casos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-sm text-gray-400">
            Nenhum encaminhamento disponível para este perfil.
          </div>
        ) : null}
      </div>
    </>
  );
}
