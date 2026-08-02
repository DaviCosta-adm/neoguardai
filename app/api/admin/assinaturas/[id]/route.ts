import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminNeoGuardApi } from "@/app/lib/auth/dal";
import {
  getAssinaturaById,
  isValidAssinaturaStatus,
  updateAssinatura,
} from "@/app/lib/data/assinaturas";
import type { AssinaturaStatus } from "@/app/lib/types";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireAdminNeoGuardApi();
  if (!auth) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const { id } = await params;
  const assinatura = await getAssinaturaById(id);
  if (!assinatura) {
    return NextResponse.json(
      { error: "Assinatura não encontrada." },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, assinatura });
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const auth = await requireAdminNeoGuardApi();
    if (!auth) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const statusRaw =
      body?.status !== undefined ? String(body.status) : undefined;
    if (statusRaw !== undefined && !isValidAssinaturaStatus(statusRaw)) {
      return NextResponse.json(
        { error: "Status inválido. Use ativo, inativo ou bloqueado." },
        { status: 400 }
      );
    }

    const assinatura = await updateAssinatura(id, {
      status: statusRaw as AssinaturaStatus | undefined,
      plano: body?.plano !== undefined ? String(body.plano) : undefined,
      observacao:
        body?.observacao !== undefined ? String(body.observacao) : undefined,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/assinaturas");
    revalidatePath("/dashboard/instituicoes");

    return NextResponse.json({ ok: true, assinatura });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao atualizar assinatura.";
    const status = message.includes("não encontrada") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
