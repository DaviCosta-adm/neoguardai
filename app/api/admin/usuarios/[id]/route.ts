import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminNeoGuardApi } from "@/app/lib/auth/dal";
import {
  deleteUsuario,
  getUsuarioById,
  isValidRole,
  updateUsuario,
} from "@/app/lib/data/admin-crud";
import type { UserRole } from "@/app/lib/types";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireAdminNeoGuardApi();
  if (!auth) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const { id } = await params;
  const usuario = await getUsuarioById(id);
  if (!usuario) {
    return NextResponse.json(
      { error: "Usuário não encontrado." },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, usuario });
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const auth = await requireAdminNeoGuardApi();
    if (!auth) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const role = String(body?.role ?? "");
    if (!isValidRole(role)) {
      return NextResponse.json({ error: "Perfil inválido." }, { status: 400 });
    }

    const usuario = await updateUsuario(id, {
      nome: String(body?.nome ?? ""),
      email: String(body?.email ?? ""),
      role: role as UserRole,
      instituicaoId: String(body?.instituicaoId ?? ""),
      password: body?.password ? String(body.password) : undefined,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/usuarios");
    revalidatePath("/dashboard/instituicoes");
    revalidatePath("/dashboard/configuracoes");

    return NextResponse.json({ ok: true, usuario });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao atualizar usuário.";
    const status = message.includes("não encontrado") ? 404 : 400;
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
    await deleteUsuario(id, auth.user.id);

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/usuarios");
    revalidatePath("/dashboard/instituicoes");
    revalidatePath("/dashboard/configuracoes");

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao excluir usuário.";
    const status = message.includes("não encontrado")
      ? 404
      : message.includes("Não é possível") || message.includes("própria")
        ? 409
        : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
