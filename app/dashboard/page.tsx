import Link from "next/link";
import {
  AlertTriangle,
  ClipboardList,
  Gauge,
  Users,
} from "lucide-react";
import Header from "@/app/components/dashboard/Header";
import RiskBadge from "@/app/components/dashboard/RiskBadge";
import StatCard from "@/app/components/dashboard/StatCard";
import { requireAuth } from "@/app/lib/auth/dal";
import { rotuloStatusAcompanhamento } from "@/app/lib/data/labels";
import {
  getAlertasAtivos,
  getAlunoById,
  getResumoDashboard,
  listarAlunosPorPrioridade,
} from "@/app/lib/data/repository";
import { rotuloRisco } from "@/app/lib/risk/score";

export default async function DashboardPage() {
  const auth = await requireAuth();
  const resumo = getResumoDashboard(auth);
  const prioritarios = listarAlunosPorPrioridade(auth).slice(0, 5);
  const alertas = getAlertasAtivos(auth).slice(0, 4);

  return (
    <>
      <Header
        title={
          auth.user.role === "especialista"
            ? "Casos encaminhados"
            : "Painel da coordenação"
        }
        subtitle="Quais alunos estão em risco e o que precisa de atenção agora."
      />

      <div className="space-y-8 px-6 py-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Estudantes acompanhados"
            value={resumo.totalEstudantes}
            icon={Users}
          />
          <StatCard
            label="Casos imediatos"
            value={resumo.casosImediatos}
            hint={`${resumo.riscoAlto} alto · ${resumo.riscoCritico} crítico`}
            icon={AlertTriangle}
          />
          <StatCard
            label="Frequência média"
            value={`${resumo.frequenciaMedia}%`}
            icon={Gauge}
          />
          <StatCard
            label="Intervenções pendentes"
            value={resumo.intervencoesPendentes}
            icon={ClipboardList}
          />
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          {(
            [
              ["Baixo", resumo.riscoBaixo, "baixo"],
              ["Médio", resumo.riscoMedio, "medio"],
              ["Alto", resumo.riscoAlto, "alto"],
              ["Crítico", resumo.riscoCritico, "critico"],
            ] as const
          ).map(([label, value, nivel]) => (
            <div
              key={label}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">{label}</p>
                <RiskBadge nivel={nivel} />
              </div>
              <p className="mt-3 text-2xl font-semibold">{value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Atenção imediata</h2>
              <Link
                href="/dashboard/alunos"
                className="text-sm text-cyan-300 hover:text-cyan-200"
              >
                Ver todos
              </Link>
            </div>

            <div className="space-y-3">
              {prioritarios.map((aluno) => (
                <Link
                  key={aluno.id}
                  href={`/dashboard/alunos/${aluno.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 transition hover:border-cyan-400/20"
                >
                  <div>
                    <p className="font-medium text-white">{aluno.nome}</p>
                    <p className="text-xs text-gray-500">
                      {aluno.turma} ·{" "}
                      {rotuloStatusAcompanhamento[aluno.statusAcompanhamento]}
                    </p>
                  </div>
                  <RiskBadge
                    nivel={aluno.riscoNivel}
                    percentual={aluno.riscoPercentual}
                  />
                </Link>
              ))}
              {prioritarios.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Nenhum caso disponível para este perfil.
                </p>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Novos alertas</h2>
              {auth.user.role !== "especialista" ? (
                <Link
                  href="/dashboard/alertas"
                  className="text-sm text-cyan-300 hover:text-cyan-200"
                >
                  Ver alertas
                </Link>
              ) : null}
            </div>

            <div className="space-y-3">
              {alertas.map((alerta) => {
                const aluno = getAlunoById(auth, alerta.alunoId);
                return (
                  <div
                    key={alerta.id}
                    className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">{alerta.titulo}</p>
                        <p className="mt-1 text-sm text-gray-400">
                          {alerta.descricao}
                        </p>
                        <p className="mt-2 text-xs text-gray-500">
                          Nível {rotuloRisco(alerta.nivel)}
                          {aluno ? ` · ${aluno.nome}` : ""}
                        </p>
                      </div>
                      <RiskBadge nivel={alerta.nivel} />
                    </div>
                  </div>
                );
              })}
              {alertas.length === 0 ? (
                <p className="text-sm text-gray-500">Sem alertas ativos.</p>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
