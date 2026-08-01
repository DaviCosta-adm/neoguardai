import Link from "next/link";
import { redirect } from "next/navigation";
import ExportCsvButton from "@/app/components/dashboard/ExportCsvButton";
import Header from "@/app/components/dashboard/Header";
import RiskBadge from "@/app/components/dashboard/RiskBadge";
import { requireAuth } from "@/app/lib/auth/dal";
import { rotuloStatusAcompanhamento } from "@/app/lib/data/labels";
import {
  csvCasosCriticos,
  csvIntervencoes,
  csvPorTurma,
  getRelatorioResumo,
} from "@/app/lib/data/reports";
import { listarAlunosPorPrioridade } from "@/app/lib/data/repository";

export default async function RelatoriosPage() {
  const auth = await requireAuth();

  if (auth.user.role === "especialista") {
    redirect("/dashboard");
  }

  const relatorio = await getRelatorioResumo(auth);
  const alunos = await listarAlunosPorPrioridade(auth);

  return (
    <>
      <Header
        title="Relatórios"
        subtitle="Visão analítica dos riscos, turmas e intervenções da instituição."
      />

      <div className="space-y-6 px-6 py-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric
            label="Estudantes"
            value={String(relatorio.totalAlunos)}
          />
          <Metric
            label="Casos críticos/altos"
            value={String(relatorio.casosCriticos.length)}
          />
          <Metric
            label="Intervenções"
            value={String(relatorio.intervencoes.length)}
          />
          <Metric
            label="Gerado em"
            value={new Date(relatorio.geradoEm).toLocaleString("pt-BR")}
          />
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Exportações</h2>
            <div className="flex flex-wrap gap-2">
              <ExportCsvButton
                filename={`casos-criticos-${slug(relatorio.instituicao)}.csv`}
                content={csvCasosCriticos(relatorio.casosCriticos)}
                label="Casos críticos CSV"
              />
              <ExportCsvButton
                filename={`intervencoes-${slug(relatorio.instituicao)}.csv`}
                content={csvIntervencoes(relatorio.intervencoes, alunos)}
                label="Intervenções CSV"
              />
              <ExportCsvButton
                filename={`turmas-${slug(relatorio.instituicao)}.csv`}
                content={csvPorTurma(relatorio.porTurma)}
                label="Turmas CSV"
              />
            </div>
          </div>
          <p className="text-sm text-gray-400">
            Exportações em CSV com dados da instituição autenticada. PDF pode
            ser gerado a partir da impressão do relatório individual.
          </p>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="mb-4 text-lg font-semibold">Casos críticos e altos</h2>
            <div className="space-y-3">
              {relatorio.casosCriticos.map((aluno) => (
                <div
                  key={aluno.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3"
                >
                  <div>
                    <p className="font-medium">{aluno.nome}</p>
                    <p className="text-xs text-gray-500">
                      {aluno.turma} ·{" "}
                      {rotuloStatusAcompanhamento[aluno.statusAcompanhamento]}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <RiskBadge
                      nivel={aluno.riscoNivel}
                      percentual={aluno.riscoPercentual}
                    />
                    <Link
                      href={`/dashboard/relatorios/aluno/${aluno.id}`}
                      className="text-sm text-cyan-300 hover:text-cyan-200"
                    >
                      Relatório
                    </Link>
                  </div>
                </div>
              ))}
              {relatorio.casosCriticos.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Nenhum caso crítico ou alto no momento.
                </p>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="mb-4 text-lg font-semibold">Intervenções por tipo</h2>
            <div className="space-y-3">
              {relatorio.intervencoesPorTipo.map((item) => (
                <div
                  key={item.tipo}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3"
                >
                  <p className="text-sm text-gray-300">{item.tipo}</p>
                  <p className="text-lg font-semibold">{item.total}</p>
                </div>
              ))}
              {relatorio.intervencoesPorTipo.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Nenhuma intervenção registrada.
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="mb-4 text-lg font-semibold">Evolução por turma</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Série</th>
                  <th className="px-3 py-2 font-medium">Turma</th>
                  <th className="px-3 py-2 font-medium">Alunos</th>
                  <th className="px-3 py-2 font-medium">Freq. média</th>
                  <th className="px-3 py-2 font-medium">Desemp. médio</th>
                  <th className="px-3 py-2 font-medium">Risco médio</th>
                  <th className="px-3 py-2 font-medium">Críticos</th>
                  <th className="px-3 py-2 font-medium">Altos</th>
                </tr>
              </thead>
              <tbody>
                {relatorio.porTurma.map((turma) => (
                  <tr
                    key={`${turma.serie}-${turma.turma}`}
                    className="border-t border-white/5"
                  >
                    <td className="px-3 py-2 text-gray-300">{turma.serie}</td>
                    <td className="px-3 py-2 text-gray-300">{turma.turma}</td>
                    <td className="px-3 py-2">{turma.total}</td>
                    <td className="px-3 py-2">{turma.frequenciaMedia}%</td>
                    <td className="px-3 py-2">{turma.desempenhoMedio}</td>
                    <td className="px-3 py-2">{turma.riscoMedio}%</td>
                    <td className="px-3 py-2">{turma.criticos}</td>
                    <td className="px-3 py-2">{turma.altos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

function slug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
