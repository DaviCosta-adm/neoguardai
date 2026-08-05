import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAuthApi } from "@/app/lib/auth/dal";
import { updateInstituicao } from "@/app/lib/data/admin-crud";
import {
  completeOnboarding,
  getAssinaturaById,
  getAssinaturaByInstituicaoId,
} from "@/app/lib/data/assinaturas";

function canManageAssinatura(
  role: string,
  userInstituicaoId: string,
  assinaturaInstituicaoId: string
) {
  if (role === "admin_neoguard") return true;
  if (role === "admin_instituicao") {
    return userInstituicaoId === assinaturaInstituicaoId;
  }
  return false;
}

export async function GET(request: Request) {
  const auth = await requireAuthApi();
  if (!auth) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const assinaturaId = searchParams.get("assinaturaId");

  let assinatura = null;
  if (assinaturaId) {
    assinatura = await getAssinaturaById(assinaturaId);
  } else if (auth.user.role !== "admin_neoguard") {
    assinatura = await getAssinaturaByInstituicaoId(auth.user.instituicaoId);
  }

  if (!assinatura) {
    return NextResponse.json(
      { error: "Assinatura não encontrada." },
      { status: 404 }
    );
  }

  if (
    !canManageAssinatura(
      auth.user.role,
      auth.user.instituicaoId,
      assinatura.instituicaoId
    ) &&
    auth.user.instituicaoId !== assinatura.instituicaoId
  ) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  return NextResponse.json({ ok: true, assinatura });
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireAuthApi();
    if (!auth) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    if (
      auth.user.role !== "admin_neoguard" &&
      auth.user.role !== "admin_instituicao"
    ) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const body = await request.json();
    const assinaturaId =
      body?.assinaturaId !== undefined ? String(body.assinaturaId) : null;
    const nome = body?.nome !== undefined ? String(body.nome) : "";

    let assinatura = assinaturaId
      ? await getAssinaturaById(assinaturaId)
      : await getAssinaturaByInstituicaoId(auth.user.instituicaoId);

    if (!assinatura) {
      return NextResponse.json(
        { error: "Assinatura não encontrada." },
        { status: 404 }
      );
    }

    if (
      !canManageAssinatura(
        auth.user.role,
        auth.user.instituicaoId,
        assinatura.instituicaoId
      )
    ) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const instituicao = await updateInstituicao(assinatura.instituicaoId, nome);
    assinatura = (await getAssinaturaById(assinatura.id)) ?? assinatura;

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/onboarding");
    revalidatePath("/dashboard/assinaturas");
    revalidatePath("/dashboard/instituicoes");
    revalidatePath("/dashboard/configuracoes");

    return NextResponse.json({ ok: true, instituicao, assinatura });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao atualizar onboarding.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuthApi();
    if (!auth) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    if (
      auth.user.role !== "admin_neoguard" &&
      auth.user.role !== "admin_instituicao"
    ) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const assinaturaId =
      body?.assinaturaId !== undefined ? String(body.assinaturaId) : null;

    let assinatura = assinaturaId
      ? await getAssinaturaById(assinaturaId)
      : await getAssinaturaByInstituicaoId(auth.user.instituicaoId);

    if (!assinatura) {
      return NextResponse.json(
        { error: "Assinatura não encontrada." },
        { status: 404 }
      );
    }

    if (
      !canManageAssinatura(
        auth.user.role,
        auth.user.instituicaoId,
        assinatura.instituicaoId
      )
    ) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    if (assinatura.status !== "ativo") {
      return NextResponse.json(
        {
          error:
            "A assinatura precisa estar ativa para concluir o onboarding.",
        },
        { status: 400 }
      );
    }

    assinatura = await completeOnboarding(assinatura.id);

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/onboarding");
    revalidatePath("/dashboard/assinaturas");
    revalidatePath("/dashboard/instituicoes");
    revalidatePath("/dashboard/configuracoes");

    return NextResponse.json({ ok: true, assinatura });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro ao concluir onboarding.";
    const status = message.includes("não encontrada") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
