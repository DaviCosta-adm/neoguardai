import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminNeoGuardApi } from "@/app/lib/auth/dal";
import {
  ativarModelo,
  getResumoModeloRisco,
  treinarModeloRisco,
} from "@/app/lib/data/modelo-risco";
import { backfillOutcomes } from "@/app/lib/data/risco-snapshots";

export async function GET() {
  const auth = await requireAdminNeoGuardApi();
  if (!auth) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const resumo = await getResumoModeloRisco();
  return NextResponse.json({ ok: true, ...resumo });
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdminNeoGuardApi();
    if (!auth) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const action = String(body?.action ?? "train");

    if (action === "backfill") {
      const updated = await backfillOutcomes({
        minDays: Number(body?.minDays ?? 14),
        force: Boolean(body?.force),
      });
      revalidatePath("/dashboard/modelo");
      return NextResponse.json({ ok: true, updated });
    }

    if (action === "activate") {
      const id = String(body?.id ?? "");
      if (!id) {
        return NextResponse.json(
          { error: "Informe o id do modelo." },
          { status: 400 }
        );
      }
      const modelo = await ativarModelo(id);
      revalidatePath("/dashboard/modelo");
      revalidatePath("/dashboard");
      return NextResponse.json({ ok: true, modelo });
    }

    const result = await treinarModeloRisco({
      backfillForce: Boolean(body?.backfillForce),
      ativar: body?.ativar !== false,
      notas: body?.notas ? String(body.notas) : undefined,
    });

    revalidatePath("/dashboard/modelo");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/alunos");

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao treinar modelo.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
