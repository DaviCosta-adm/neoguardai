import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminOrInstituicaoApi } from "@/app/lib/auth/dal";
import { getConviteById, revokeConvite } from "@/app/lib/data/convites";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireAdminOrInstituicaoApi();
  if (!auth) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const { id } = await params;
  const convite = await getConviteById(id);
  if (!convite) {
    return NextResponse.json(
      { error: "Convite não encontrado." },
      { status: 404 }
    );
  }

  if (
    auth.user.role !== "admin_neoguard" &&
    convite.instituicaoId !== auth.user.instituicaoId
  ) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  return NextResponse.json({ ok: true, convite });
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const auth = await requireAdminOrInstituicaoApi();
    if (!auth) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const { id } = await params;
    const current = await getConviteById(id);
    if (!current) {
      return NextResponse.json(
        { error: "Convite não encontrado." },
        { status: 404 }
      );
    }

    if (
      auth.user.role !== "admin_neoguard" &&
      current.instituicaoId !== auth.user.instituicaoId
    ) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const convite = await revokeConvite(id);

    revalidatePath("/dashboard/usuarios");
    revalidatePath("/dashboard/configuracoes");
    revalidatePath("/dashboard/convites");

    return NextResponse.json({ ok: true, convite });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao revogar convite.";
    const status = message.includes("não encontrado")
      ? 404
      : message.includes("já aceito")
        ? 409
        : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
