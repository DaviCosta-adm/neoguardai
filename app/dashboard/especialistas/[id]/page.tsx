import Link from "next/link";
import { notFound } from "next/navigation";
import DevolutivaForm from "@/app/components/dashboard/DevolutivaForm";
import Header from "@/app/components/dashboard/Header";
import RiskBadge from "@/app/components/dashboard/RiskBadge";
import { requireAuth } from "@/app/lib/auth/dal";
import {
  getEncaminhamentoById,
  listarDevolutivas,
} from "@/app/lib/data/especialistas";
import {
  rotuloStatusEncaminhamento,
  rotuloTipoDevolutiva,
} from "@/app/lib/data/labels";

export default async function EncaminhamentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const auth = await requireAuth();
  const { id } = await params;
  const caso = await getEncaminhamentoById(auth, id);

  if (!caso) notFound();

  const devolutivas = await listarDevolutivas(caso.id);
  const podeRegistrar =
    auth.user.role === "especialista" ||
    auth.user.role === "coordenacao" ||
    auth.user.role === "admin_instituicao";

  return (
    <>
      <Header
        title={caso.alunoNome}
        subtitle="Acompanhamento especializado do caso encaminhado."
      />

      <div className="space-y-6 px-6 py-6">
        <Link
          href="/dashboard/especialistas"
          className="text-sm text-cyan-300 hover:text-cyan-200"
        >
          ← Voltar aos encaminhamentos
        </Link>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-gray-400">{caso.alunoTurma}</p>
              <h2 className="mt-1 text-2xl font-semibold">{caso.alunoNome}</h2>
              <p className="mt-2 text-sm text-gray-400">{caso.motivo}</p>
              <p className="mt-2 text-xs text-gray-500">
                Status: {rotuloStatusEncaminhamento[caso.status]}
                {caso.especialistaNome
                  ? ` · ${caso.especialistaNome}`
                  : " · aguardando especialista"}
              </p>
            </div>
            <RiskBadge
              nivel={caso.riscoNivel}
              percentual={caso.riscoPercentual}
            />
          </div>
          <Link
            href={`/dashboard/alunos/${caso.alunoId}`}
            className="mt-4 inline-flex text-sm text-cyan-300 hover:text-cyan-200"
          >
            Ver ficha completa do aluno →
          </Link>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="mb-4 text-lg font-semibold">Registros</h3>
            <div className="space-y-3">
              {devolutivas.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-3"
                >
                  <p className="text-xs text-cyan-300">
                    {rotuloTipoDevolutiva[item.tipo]} · {item.autorNome}
                  </p>
                  <p className="mt-1 text-sm text-gray-300">{item.conteudo}</p>
                  <p className="mt-2 text-xs text-gray-500">
                    {new Date(item.criadoEm).toLocaleString("pt-BR")}
                  </p>
                </div>
              ))}
              {devolutivas.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Nenhum atendimento ou devolutiva ainda.
                </p>
              ) : null}
            </div>
          </div>

          {podeRegistrar && caso.status !== "concluido" ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="mb-4 text-lg font-semibold">Novo registro</h3>
              <DevolutivaForm encaminhamentoId={caso.id} />
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-5 text-sm text-gray-400">
              Este encaminhamento está concluído ou seu perfil não registra
              devolutivas.
            </div>
          )}
        </section>
      </div>
    </>
  );
}
