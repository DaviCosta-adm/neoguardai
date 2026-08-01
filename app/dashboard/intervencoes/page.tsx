import Link from "next/link";
import Header from "@/app/components/dashboard/Header";
import { requireAuth } from "@/app/lib/auth/dal";
import { rotuloIntervencao } from "@/app/lib/data/labels";
import {
  getAlunoById,
  getIntervencoes,
} from "@/app/lib/data/repository";

const statusStyle = {
  pendente: "text-amber-300 bg-amber-400/10 border-amber-400/20",
  agendada: "text-cyan-300 bg-cyan-400/10 border-cyan-400/20",
  concluida: "text-emerald-300 bg-emerald-400/10 border-emerald-400/20",
} as const;

export default async function IntervencoesPage() {
  const auth = await requireAuth();
  const itens = getIntervencoes(auth);

  return (
    <>
      <Header
        title="Intervenções"
        subtitle="Ações realizadas, pendentes e agendadas pela equipe."
      />

      <div className="space-y-4 px-6 py-6">
        {itens.map((item) => {
          const aluno = getAlunoById(auth, item.alunoId);

          return (
            <div
              key={item.id}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold">
                      {rotuloIntervencao[item.tipo]}
                    </h2>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs capitalize ${statusStyle[item.status]}`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-400">{item.descricao}</p>
                  <p className="mt-3 text-xs text-gray-500">
                    {item.realizadoPor} ·{" "}
                    {new Date(item.realizadoEm).toLocaleDateString("pt-BR")}
                    {item.proximaRevisao
                      ? ` · revisão em ${new Date(item.proximaRevisao).toLocaleDateString("pt-BR")}`
                      : ""}
                  </p>
                </div>

                {aluno ? (
                  <Link
                    href={`/dashboard/alunos/${aluno.id}`}
                    className="text-sm text-cyan-300 hover:text-cyan-200"
                  >
                    {aluno.nome} →
                  </Link>
                ) : null}
              </div>
            </div>
          );
        })}
        {itens.length === 0 ? (
          <p className="text-sm text-gray-500">
            Nenhuma intervenção no escopo deste perfil.
          </p>
        ) : null}
      </div>
    </>
  );
}
