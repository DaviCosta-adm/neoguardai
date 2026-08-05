import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminOrInstituicaoApi } from "@/app/lib/auth/dal";
import { createConvite, listConvites } from "@/app/lib/data/convites";
import { isValidRole } from "@/app/lib/data/admin-crud";
import { isEmailConfigured } from "@/app/lib/email/send";
import type { UserRole } from "@/app/lib/types";

export async function GET() {
  const auth = await requireAdminOrInstituicaoApi();
  if (!auth) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const instituicaoId =
    auth.user.role === "admin_neoguard" ? undefined : auth.user.instituicaoId;

  return NextResponse.json({
    ok: true,
    emailConfigured: isEmailConfigured(),
    convites: await listConvites({ instituicaoId }),
  });
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdminOrInstituicaoApi();
    if (!auth) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const body = await request.json();
    const role = String(body?.role ?? "");
    if (!isValidRole(role)) {
      return NextResponse.json({ error: "Perfil inválido." }, { status: 400 });
    }

    const instituicaoId =
      auth.user.role === "admin_neoguard"
        ? String(body?.instituicaoId ?? "")
        : auth.user.instituicaoId;

    if (!instituicaoId) {
      return NextResponse.json(
        { error: "Informe a instituição." },
        { status: 400 }
      );
    }

    const convite = await createConvite({
      nome: String(body?.nome ?? ""),
      email: String(body?.email ?? ""),
      role: role as UserRole,
      instituicaoId,
      criadoPor: auth.user.id,
      actorRole: auth.user.role,
      diasValidade: body?.diasValidade
        ? Number(body.diasValidade)
        : undefined,
      observacao:
        body?.observacao !== undefined ? String(body.observacao) : undefined,
      sendEmail: body?.sendEmail !== false,
    });

    revalidatePath("/dashboard/usuarios");
    revalidatePath("/dashboard/configuracoes");
    revalidatePath("/dashboard/convites");

    return NextResponse.json({ ok: true, convite }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao criar convite.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
