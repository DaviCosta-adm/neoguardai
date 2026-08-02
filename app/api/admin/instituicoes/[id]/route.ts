import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminNeoGuardApi } from "@/app/lib/auth/dal";
import {
  deleteInstituicao,
  updateInstituicao,
} from "@/app/lib/data/admin-crud";
import { getInstituicaoResumoById } from "@/app/lib/data/plataforma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireAdminNeoGuardApi();
  if (!auth) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const { id } = await params;
  const instituicao = await getInstituicaoResumoById(id);
  if (!instituicao) {
    return NextResponse.json(
      { error: "Instituição não encontrada." },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, instituicao });
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const auth = await requireAdminNeoGuardApi();
    if (!auth) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const instituicao = await updateInstituicao(id, String(body?.nome ?? ""));

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/instituicoes");
    revalidatePath(`/dashboard/instituicoes/${id}`);
    revalidatePath("/dashboard/usuarios");
    revalidatePath("/dashboard/configuracoes");

    return NextResponse.json({ ok: true, instituicao });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao atualizar instituição.";
    const status = message.includes("não encontrada") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const auth = await requireAdminNeoGuardApi();
    if (!auth) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const { id } = await params;
    await deleteInstituicao(id);

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/instituicoes");
    revalidatePath("/dashboard/usuarios");
    revalidatePath("/dashboard/configuracoes");

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao excluir instituição.";
    const status = message.includes("não encontrada")
      ? 404
      : message.includes("Não é possível")
        ? 409
        : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
