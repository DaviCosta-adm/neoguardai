import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAuthApi } from "@/app/lib/auth/dal";
import { criarEncaminhamento } from "@/app/lib/data/especialistas";

export async function POST(request: Request) {
  try {
    const auth = await requireAuthApi();
    if (!auth) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }
    const body = await request.json();
    const alunoId = String(body?.alunoId ?? "");
    const motivo = String(body?.motivo ?? "");
    const especialistaId =
      String(body?.especialistaId ?? "") || undefined;

    if (!alunoId || !motivo.trim()) {
      return NextResponse.json(
        { error: "Informe o motivo do encaminhamento." },
        { status: 400 }
      );
    }

    const criado = await criarEncaminhamento(auth, {
      alunoId,
      motivo,
      especialistaId,
    });

    if (!criado) {
      return NextResponse.json(
        { error: "Não foi possível criar o encaminhamento." },
        { status: 400 }
      );
    }

    revalidatePath("/dashboard/especialistas");
    revalidatePath(`/dashboard/alunos/${alunoId}`);
    revalidatePath(`/dashboard/especialistas/${criado.id}`);

    return NextResponse.json({ ok: true, encaminhamento: criado });
  } catch (error) {
    console.error("Erro ao encaminhar:", error);
    return NextResponse.json(
      { error: "Erro ao encaminhar caso." },
      { status: 500 }
    );
  }
}
