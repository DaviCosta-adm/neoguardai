import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAuthApi } from "@/app/lib/auth/dal";
import { assumirEncaminhamento } from "@/app/lib/data/especialistas";

export async function POST(request: Request) {
  try {
    const auth = await requireAuthApi();
    if (!auth) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }
    const body = await request.json();
    const encaminhamentoId = String(body?.encaminhamentoId ?? "");

    if (!encaminhamentoId) {
      return NextResponse.json(
        { error: "Encaminhamento não informado." },
        { status: 400 }
      );
    }

    const ok = await assumirEncaminhamento(auth, encaminhamentoId);

    if (!ok) {
      return NextResponse.json(
        { error: "Não foi possível assumir o caso." },
        { status: 400 }
      );
    }

    revalidatePath("/dashboard/especialistas");
    revalidatePath(`/dashboard/especialistas/${encaminhamentoId}`);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao assumir caso:", error);
    return NextResponse.json(
      { error: "Erro ao assumir caso." },
      { status: 500 }
    );
  }
}
