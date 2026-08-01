import Link from "next/link";
import { redirect } from "next/navigation";
import Header from "@/app/components/dashboard/Header";
import RiskBadge from "@/app/components/dashboard/RiskBadge";
import { requireAuth } from "@/app/lib/auth/dal";
import { getAlertasAtivos, getAlunoById } from "@/app/lib/data/repository";

export default async function AlertasPage() {
  const auth = await requireAuth();

  if (auth.user.role === "especialista") {
    redirect("/dashboard");
  }

  const alertas = await getAlertasAtivos(auth);
  const alunos = await Promise.all(
    alertas.map(async (alerta) => ({
      alertaId: alerta.id,
      aluno: await getAlunoById(auth, alerta.alunoId),
    }))
  );
  const alunoPorAlerta = new Map(
    alunos.map((item) => [item.alertaId, item.aluno])
  );

  return (
    <>
      <Header
        title="Alertas prioritários"
        subtitle="Casos que precisam da atenção da coordenação agora."
      />

      <div className="space-y-4 px-6 py-6">
        {alertas.map((alerta) => {
          const aluno = alunoPorAlerta.get(alerta.id) ?? null;

          return (
            <div
              key={alerta.id}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold">{alerta.titulo}</h2>
                    <RiskBadge nivel={alerta.nivel} />
                  </div>
                  <p className="mt-2 text-sm text-gray-400">{alerta.descricao}</p>
                  <p className="mt-3 text-xs text-gray-500">
                    {new Date(alerta.criadoEm).toLocaleString("pt-BR")}
                    {aluno ? ` · ${aluno.nome} · ${aluno.turma}` : ""}
                  </p>
                </div>

                {aluno ? (
                  <Link
                    href={`/dashboard/alunos/${aluno.id}`}
                    className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200 transition hover:bg-cyan-400/15"
                  >
                    Abrir caso
                  </Link>
                ) : null}
              </div>
            </div>
          );
        })}
        {alertas.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhum alerta ativo.</p>
        ) : null}
      </div>
    </>
  );
}
