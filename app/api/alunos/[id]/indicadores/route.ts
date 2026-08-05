import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAuthApi } from "@/app/lib/auth/dal";
import { atualizarIndicadoresAluno } from "@/app/lib/data/repository";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const auth = await requireAuthApi();
    if (!auth) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const aluno = await atualizarIndicadoresAluno(auth, id, {
      frequencia: body?.frequencia,
      desempenho: body?.desempenho,
      faltasConsecutivas: body?.faltasConsecutivas,
      ocorrencias: body?.ocorrencias,
      participacao: body?.participacao,
    });

    revalidatePath(`/dashboard/alunos/${id}`);
    revalidatePath("/dashboard/alunos");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/relatorios");
    revalidatePath("/dashboard/modelo");

    return NextResponse.json({ ok: true, aluno });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao atualizar indicadores.";
    const status = message.includes("não encontrado")
      ? 404
      : message.includes("permissão")
        ? 403
        : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
