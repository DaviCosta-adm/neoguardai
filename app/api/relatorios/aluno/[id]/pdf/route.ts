import { NextResponse } from "next/server";
import { requireAuthApi } from "@/app/lib/auth/dal";
import { buildRelatorioAlunoPdf } from "@/app/lib/data/pdf-reports";
import {
  getAlertasDoAluno,
  getAlunoById,
  getIntervencoesDoAluno,
  getTimelineDoAluno,
} from "@/app/lib/data/repository";

type Params = { params: Promise<{ id: string }> };

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireAuthApi();
  if (!auth) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { id } = await params;
  const aluno = await getAlunoById(auth, id);
  if (!aluno) {
    return NextResponse.json(
      { error: "Aluno não encontrado." },
      { status: 404 }
    );
  }

  const [alertas, intervencoes, timeline] = await Promise.all([
    getAlertasDoAluno(auth, aluno.id),
    getIntervencoesDoAluno(auth, aluno.id),
    getTimelineDoAluno(auth, aluno.id),
  ]);

  const bytes = await buildRelatorioAlunoPdf({
    instituicao: auth.instituicao.nome,
    aluno,
    alertas,
    intervencoes,
    timeline,
  });

  const filename = `relatorio-${aluno.nome.toLowerCase().replace(/\s+/g, "-")}.pdf`;

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
