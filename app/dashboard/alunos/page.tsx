import Header from "@/app/components/dashboard/Header";
import AlunosTable from "@/app/components/dashboard/AlunosTable";
import ImportIndicadoresPanel from "@/app/components/dashboard/ImportIndicadoresPanel";
import { requireAuth } from "@/app/lib/auth/dal";
import { listarAlunosPorPrioridade } from "@/app/lib/data/repository";

export default async function AlunosPage() {
  const auth = await requireAuth();
  const alunos = await listarAlunosPorPrioridade(auth);
  const podeImportar =
    auth.user.role === "coordenacao" ||
    auth.user.role === "admin_instituicao";

  return (
    <>
      <Header
        title={
          auth.user.role === "especialista"
            ? "Casos encaminhados"
            : "Lista de alunos"
        }
        subtitle="Busque, filtre e priorize pelo nível de risco de evasão."
      />

      <div className="px-6 py-6">
        {podeImportar ? <ImportIndicadoresPanel /> : null}
        <AlunosTable alunos={alunos} />
      </div>
    </>
  );
}
