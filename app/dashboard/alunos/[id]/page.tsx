import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/app/components/dashboard/Header";
import RiskBadge from "@/app/components/dashboard/RiskBadge";
import {
  getAlertasDoAluno,
  getAlunoById,
  getIntervencoesDoAluno,
  getTimelineDoAluno,
  rotuloIntervencao,
  rotuloStatusAcompanhamento,
} from "@/app/lib/data/mock";

export default async function AlunoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const aluno = getAlunoById(id);

  if (!aluno) notFound();

  const alertas = getAlertasDoAluno(aluno.id);
  const intervencoes = getIntervencoesDoAluno(aluno.id);
  const timeline = getTimelineDoAluno(aluno.id);

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
              Atlas
            </p>
            <p className="mt-3 text-sm leading-6 text-gray-200">
              {aluno.explicacaoAtlas}
            </p>
          </div>
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

          <Panel title="Linha do tempo do caso">
            <div className="space-y-3">
              {timeline.map((evento) => (
                <div
                  key={evento.id}
                  className="border-l border-cyan-400/30 pl-4"
                >
                  <p className="text-xs text-gray-500">
                    {new Date(evento.criadoEm).toLocaleString("pt-BR")}
                  </p>
                  <p className="mt-1 font-medium">{evento.titulo}</p>
                  <p className="mt-1 text-sm text-gray-400">
                    {evento.descricao}
                  </p>
                </div>
              ))}
              {timeline.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Sem eventos registrados ainda.
                </p>
              ) : null}
            </div>
          </Panel>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h3 className="text-lg font-semibold">Próximos passos sugeridos</h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-gray-300">
            <li>Revisar alertas ativos e fatores de risco com a equipe.</li>
            <li>Registrar uma intervenção ou agendar revisão do caso.</li>
            <li>
              Encaminhar para especialista se o risco permanecer alto ou
              crítico.
            </li>
          </ol>
        </section>
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
