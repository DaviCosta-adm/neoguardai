import { NextResponse } from "next/server";
import { requireAuthApi } from "@/app/lib/auth/dal";
import { registrarIntervencao } from "@/app/lib/data/repository";
import type { TipoIntervencao } from "@/app/lib/types";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  try {
    const auth = await requireAuthApi();
    if (!auth) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }
    const body = await request.json();
    const alunoId = String(body?.alunoId ?? "");
    const tipo = String(body?.tipo ?? "") as TipoIntervencao;
    const descricao = String(body?.descricao ?? "");

    if (!alunoId || !tipo || !descricao.trim()) {
      return NextResponse.json(
        { error: "Preencha tipo e descrição da intervenção." },
        { status: 400 }
      );
    }

    const criada = await registrarIntervencao(auth, {
      alunoId,
      tipo,
      descricao,
      status: "concluida",
    });

    if (!criada) {
      return NextResponse.json(
        { error: "Não foi possível registrar a intervenção neste caso." },
        { status: 400 }
      );
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/intervencoes");
    revalidatePath(`/dashboard/alunos/${alunoId}`);

    return NextResponse.json({ ok: true, intervencao: criada });
  } catch (error) {
    console.error("Erro ao registrar intervenção:", error);
    return NextResponse.json(
      { error: "Erro ao registrar intervenção." },
      { status: 500 }
    );
  }
}
