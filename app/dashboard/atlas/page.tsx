import Header from "@/app/components/dashboard/Header";
import AtlasConsole from "@/app/components/dashboard/AtlasConsole";
import { requireAuth } from "@/app/lib/auth/dal";
import { listarAlunosPorPrioridade } from "@/app/lib/data/repository";
import { resumoPreditivoAluno } from "@/app/lib/risk/predictive";

export default async function AtlasDashboardPage() {
  const auth = await requireAuth();
  const alunos = await listarAlunosPorPrioridade(auth);
  const preditivos = Object.fromEntries(
    alunos.map((aluno) => [aluno.id, resumoPreditivoAluno(aluno)])
  );

  return (
    <>
      <Header
        title="Atlas"
        subtitle="Assistente contextual com modelo preditivo v2 e fallback local."
      />
      <div className="px-6 py-6">
        {alunos.length > 0 ? (
          <AtlasConsole alunos={alunos} preditivos={preditivos} />
        ) : (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-sm text-gray-400">
            Nenhum caso disponível para análise neste perfil.
          </div>
        )}
      </div>
    </>
  );
}
