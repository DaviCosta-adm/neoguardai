import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/app/components/dashboard/Header";
import RiskBadge from "@/app/components/dashboard/RiskBadge";
import { requireAuth } from "@/app/lib/auth/dal";
import {
  rotuloIntervencao,
  rotuloStatusAcompanhamento,
} from "@/app/lib/data/labels";
import {
  getAlertasDoAluno,
  getAlunoById,
  getIntervencoesDoAluno,
  getTimelineDoAluno,
} from "@/app/lib/data/repository";

export default async function RelatorioAlunoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const auth = await requireAuth();
  const { id } = await params;
  const aluno = await getAlunoById(auth, id);

  if (!aluno) notFound();

  const [alertas, intervencoes, timeline] = await Promise.all([
    getAlertasDoAluno(auth, aluno.id),
    getIntervencoesDoAluno(auth, aluno.id),
    getTimelineDoAluno(auth, aluno.id),
  ]);

  return (
    <>
      <Header
        title={`Relatório · ${aluno.nome}`}
        subtitle="Documento individual para acompanhamento e impressão."
      />

      <div className="space-y-6 px-6 py-6 print:px-0">
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link
            href="/dashboard/relatorios"
            className="text-sm text-cyan-300 hover:text-cyan-200"
          >
            ← Voltar aos relatórios
          </Link>
          <Link
            href={`/dashboard/alunos/${aluno.id}`}
            className="rounded-xl border border-white/10 px-3 py-2 text-sm text-gray-300"
          >
            Abrir caso
          </Link>
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">
                {auth.instituicao.nome}
              </p>
              <h2 className="mt-2 text-2xl font-semibold">{aluno.nome}</h2>
              <p className="mt-1 text-sm text-gray-400">
                {aluno.serie} · Turma {aluno.turma} ·{" "}
                {rotuloStatusAcompanhamento[aluno.statusAcompanhamento]}
              </p>
            </div>
            <RiskBadge
              nivel={aluno.riscoNivel}
              percentual={aluno.riscoPercentual}
            />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Info label="Frequência" value={`${aluno.frequencia}%`} />
            <Info label="Desempenho" value={aluno.desempenho.toFixed(1)} />
            <Info
              label="Faltas consecutivas"
              value={String(aluno.faltasConsecutivas)}
            />
            <Info label="Participação" value={`${aluno.participacao}%`} />
          </div>

          <div className="mt-6 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
              Análise Atlas
            </p>
            <p className="mt-2 text-sm leading-6 text-gray-200">
              {aluno.explicacaoAtlas}
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Panel title="Fatores de risco">
            <ul className="space-y-2 text-sm text-gray-300">
              {aluno.fatoresRisco.map((fator) => (
                <li key={fator}>• {fator}</li>
              ))}
            </ul>
          </Panel>
          <Panel title="Alertas ativos">
            <ul className="space-y-2 text-sm text-gray-300">
              {alertas.map((alerta) => (
                <li key={alerta.id}>
                  • {alerta.titulo} — {alerta.descricao}
                </li>
              ))}
              {alertas.length === 0 ? <li>Nenhum alerta ativo.</li> : null}
            </ul>
          </Panel>
        </section>

        <Panel title="Intervenções realizadas">
          <ul className="space-y-3 text-sm text-gray-300">
            {intervencoes.map((item) => (
              <li key={item.id} className="border-b border-white/5 pb-3">
                <p className="font-medium text-white">
                  {rotuloIntervencao[item.tipo]}
                </p>
                <p className="mt-1">{item.descricao}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {item.realizadoPor} ·{" "}
                  {new Date(item.realizadoEm).toLocaleDateString("pt-BR")}
                </p>
              </li>
            ))}
            {intervencoes.length === 0 ? (
              <li>Nenhuma intervenção registrada.</li>
            ) : null}
          </ul>
        </Panel>

        <Panel title="Linha do tempo">
          <ul className="space-y-3 text-sm text-gray-300">
            {timeline.map((evento) => (
              <li key={evento.id}>
                <p className="text-xs text-gray-500">
                  {new Date(evento.criadoEm).toLocaleString("pt-BR")}
                </p>
                <p className="font-medium text-white">{evento.titulo}</p>
                <p>{evento.descricao}</p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
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
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <h3 className="mb-3 text-lg font-semibold">{title}</h3>
      {children}
    </section>
  );
}
