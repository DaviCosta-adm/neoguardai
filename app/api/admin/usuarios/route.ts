import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminNeoGuardApi } from "@/app/lib/auth/dal";
import { listUsuarios } from "@/app/lib/auth/users";
import { createUsuario, isValidRole } from "@/app/lib/data/admin-crud";
import type { UserRole } from "@/app/lib/types";

export async function GET() {
  const auth = await requireAdminNeoGuardApi();
  if (!auth) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  return NextResponse.json({ ok: true, usuarios: await listUsuarios() });
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdminNeoGuardApi();
    if (!auth) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const body = await request.json();
    const role = String(body?.role ?? "");
    if (!isValidRole(role)) {
      return NextResponse.json({ error: "Perfil inválido." }, { status: 400 });
    }

    const usuario = await createUsuario({
      nome: String(body?.nome ?? ""),
      email: String(body?.email ?? ""),
      password: String(body?.password ?? ""),
      role: role as UserRole,
      instituicaoId: String(body?.instituicaoId ?? ""),
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/usuarios");
    revalidatePath("/dashboard/instituicoes");
    revalidatePath("/dashboard/configuracoes");

    return NextResponse.json({ ok: true, usuario }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao criar usuário.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
