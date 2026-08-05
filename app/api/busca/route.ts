import { NextResponse } from "next/server";
import { requireAuthApi } from "@/app/lib/auth/dal";
import { buscarAlunos } from "@/app/lib/data/repository";

export async function GET(request: Request) {
  const auth = await requireAuthApi();
  if (!auth) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const alunos = await buscarAlunos(auth, q, 8);

  return NextResponse.json({
    ok: true,
    resultados: alunos.map((aluno) => ({
      id: aluno.id,
      nome: aluno.nome,
      turma: aluno.turma,
      serie: aluno.serie,
      riscoNivel: aluno.riscoNivel,
      riscoPercentual: aluno.riscoPercentual,
      href: `/dashboard/alunos/${aluno.id}`,
    })),
  });
}
