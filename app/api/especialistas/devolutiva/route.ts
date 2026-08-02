import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAuthApi } from "@/app/lib/auth/dal";
import { registrarDevolutiva } from "@/app/lib/data/especialistas";
import type { TipoDevolutiva } from "@/app/lib/types";

export async function POST(request: Request) {
  try {
    const auth = await requireAuthApi();
    if (!auth) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }
    const body = await request.json();
    const encaminhamentoId = String(body?.encaminhamentoId ?? "");
    const tipo = String(body?.tipo ?? "") as TipoDevolutiva;
    const conteudo = String(body?.conteudo ?? "");
    const concluir = Boolean(body?.concluir);

    if (!encaminhamentoId || !tipo || !conteudo.trim()) {
      return NextResponse.json(
        { error: "Preencha tipo e conteúdo da devolutiva." },
        { status: 400 }
      );
    }

    const criada = await registrarDevolutiva(auth, {
      encaminhamentoId,
      tipo,
      conteudo,
      concluir,
    });

    if (!criada) {
      return NextResponse.json(
        { error: "Não foi possível registrar a devolutiva." },
        { status: 400 }
      );
    }

    revalidatePath("/dashboard/especialistas");
    revalidatePath(`/dashboard/especialistas/${encaminhamentoId}`);

    return NextResponse.json({ ok: true, devolutiva: criada });
  } catch (error) {
    console.error("Erro na devolutiva:", error);
    return NextResponse.json(
      { error: "Erro ao registrar devolutiva." },
      { status: 500 }
    );
  }
}
