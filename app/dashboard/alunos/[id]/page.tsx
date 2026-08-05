import Link from "next/link";
import { notFound } from "next/navigation";
import EncaminharForm from "@/app/components/dashboard/EncaminharForm";
import Header from "@/app/components/dashboard/Header";
import IntervencaoForm from "@/app/components/dashboard/IntervencaoForm";
import RecalcularRiscoButton from "@/app/components/dashboard/RecalcularRiscoButton";
import RiskBadge from "@/app/components/dashboard/RiskBadge";
import { requireAuth } from "@/app/lib/auth/dal";
import { listarEspecialistasDaInstituicao } from "@/app/lib/data/especialistas";
import {
  rotuloIntervencao,
  rotuloStatusAcompanhamento,
} from "@/app/lib/data/labels";
import { getPesosAtivos } from "@/app/lib/data/modelo-risco";
import {
  getAlertasDoAluno,
  getAlunoById,
  getIntervencoesDoAluno,
  getTimelineDoAluno,
} from "@/app/lib/data/repository";
import { listSnapshotsByAluno } from "@/app/lib/data/risco-snapshots";
import {
  resumoPreditivoAluno,
  textoTendencia,
} from "@/app/lib/risk/predictive";

export default async function AlunoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const auth = await requireAuth();
  const { id } = await params;
  const aluno = await getAlunoById(auth, id);

  if (!aluno) notFound();

  const [alertas, intervencoes, timeline, especialistas, modelo, snapshots] =
    await Promise.all([
      getAlertasDoAluno(auth, aluno.id),
      getIntervencoesDoAluno(auth, aluno.id),
      getTimelineDoAluno(auth, aluno.id),
      listarEspecialistasDaInstituicao(aluno.instituicaoId),
      getPesosAtivos(),
      listSnapshotsByAluno(aluno.id, 8),
    ]);
  const preditivo = resumoPreditivoAluno(aluno, {
    pesos: modelo.pesos,
    versao: modelo.versao,
  });
  const podeEncaminhar =
    auth.user.role === "coordenacao" ||
    auth.user.role === "admin_instituicao" ||
    auth.user.role === "admin_neoguard";

  return (
    <>
      <Header
        title={aluno.nome}
        subtitle="Centro de acompanhamento de risco de evasão."
      />

      <div className="space-y-6 px-6 py-6">
        <Link
          href="/dashboard/alunos"
          className="text-sm text-cyan-300 hover:text-cyan-200"
        >
          ← Voltar para a lista
        </Link>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 lg:col-span-2">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm text-gray-400">
                  {aluno.serie} · Turma {aluno.turma}
                </p>
                <h2 className="mt-1 text-2xl font-semibold">{aluno.nome}</h2>
                <p className="mt-2 text-sm text-gray-400">
                  Situação:{" "}
                  {rotuloStatusAcompanhamento[aluno.statusAcompanhamento]}
                </p>
              </div>
              <RiskBadge
                nivel={aluno.riscoNivel}
                percentual={aluno.riscoPercentual}
              />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Metric label="Frequência" value={`${aluno.frequencia}%`} />
              <Metric
                label="Desempenho"
                value={aluno.desempenho.toFixed(1)}
              />
              <Metric
                label="Faltas consecutivas"
                value={aluno.faltasConsecutivas}
              />
              <Metric label="Participação" value={`${aluno.participacao}%`} />
            </div>
          </div>

          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
              Atlas · modelo {preditivo.versao}
            </p>
            <p className="mt-3 text-sm leading-6 text-gray-200">
              {preditivo.explicacao}
            </p>
            <div className="mt-4 grid gap-2 text-xs text-gray-300">
              <p>Projeção 14 dias: {preditivo.projecao14d}%</p>
              <p>{textoTendencia(preditivo.tendencia)}</p>
              <p>Probabilidade estimada de evasão: {preditivo.probabilidadeEvasao}%</p>
            </div>
            <div className="mt-4">
              <RecalcularRiscoButton alunoId={aluno.id} />
            </div>
          </div>
        </section>

        {snapshots.length > 0 ? (
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="text-lg font-semibold">Histórico longitudinal</h3>
            <p className="mt-1 text-sm text-gray-500">
              Snapshots usados no treino supervisionado do modelo.
            </p>
            <div className="mt-4 space-y-2">
              {snapshots.map((snap) => (
                <div
                  key={snap.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 text-sm"
                >
                  <div>
                    <p className="text-gray-200">
                      {snap.riscoPercentual}% → proj. {snap.projecao14d}%
                      {snap.outcomeRisco != null
                        ? ` · outcome ${snap.outcomeRisco}%`
                        : ""}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(snap.capturadoEm).toLocaleString("pt-BR")} ·{" "}
                      {snap.origem} · {snap.modeloVersao}
                    </p>
                  </div>
                  <RiskBadge
                    nivel={snap.riscoNivel}
                    percentual={snap.riscoPercentual}
                  />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h3 className="text-lg font-semibold">Plano sugerido pelo modelo</h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-gray-300">
            {preditivo.planoSugerido.map((passo) => (
              <li key={passo}>{passo}</li>
            ))}
          </ol>
          <Link
            href={`/dashboard/atlas`}
            className="mt-4 inline-flex text-sm text-cyan-300 hover:text-cyan-200"
          >
            Abrir Atlas com este contexto →
          </Link>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <Panel title="Fatores que influenciaram a análise">
            <ul className="space-y-2">
              {aluno.fatoresRisco.map((fator) => (
                <li
                  key={fator}
                  className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 text-sm text-gray-300"
                >
                  {fator}
                </li>
              ))}
              {aluno.fatoresRisco.length === 0 ? (
                <li className="text-sm text-gray-500">
                  Nenhum fator de risco relevante no momento.
                </li>
              ) : null}
            </ul>
          </Panel>

          <Panel title="Alertas ativos">
            <div className="space-y-3">
              {alertas.map((alerta) => (
                <div
                  key={alerta.id}
                  className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{alerta.titulo}</p>
                      <p className="mt-1 text-sm text-gray-400">
                        {alerta.descricao}
                      </p>
                    </div>
                    <RiskBadge nivel={alerta.nivel} />
                  </div>
                </div>
              ))}
              {alertas.length === 0 ? (
                <p className="text-sm text-gray-500">Nenhum alerta ativo.</p>
              ) : null}
            </div>
          </Panel>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <Panel title="Histórico de intervenções">
            <div className="space-y-3">
              {intervencoes.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-3"
                >
                  <p className="font-medium">{rotuloIntervencao[item.tipo]}</p>
                  <p className="mt-1 text-sm text-gray-400">{item.descricao}</p>
                  <p className="mt-2 text-xs text-gray-500">
                    {item.status} ·{" "}
                    {new Date(item.realizadoEm).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              ))}
              {intervencoes.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Nenhuma intervenção registrada.
                </p>
              ) : null}
            </div>
          </Panel>

          <Panel title="Registrar nova intervenção">
            <IntervencaoForm alunoId={aluno.id} />
          </Panel>
        </section>

        {podeEncaminhar ? (
          <Panel title="Encaminhar para especialista">
            <EncaminharForm
              alunoId={aluno.id}
              especialistas={especialistas}
            />
          </Panel>
        ) : null}

        <Panel title="Linha do tempo do caso">
          <div className="space-y-3">
            {timeline.map((evento) => (
              <div key={evento.id} className="border-l border-cyan-400/30 pl-4">
                <p className="text-xs text-gray-500">
                  {new Date(evento.criadoEm).toLocaleString("pt-BR")}
                </p>
                <p className="mt-1 font-medium">{evento.titulo}</p>
                <p className="mt-1 text-sm text-gray-400">{evento.descricao}</p>
              </div>
            ))}
            {timeline.length === 0 ? (
              <p className="text-sm text-gray-500">
                Sem eventos registrados ainda.
              </p>
            ) : null}
          </div>
        </Panel>
      </div>
    </>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <h3 className="mb-4 text-lg font-semibold">{title}</h3>
      {children}
    </div>
  );
}
