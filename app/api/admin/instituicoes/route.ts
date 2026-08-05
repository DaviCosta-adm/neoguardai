import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminNeoGuardApi } from "@/app/lib/auth/dal";
import {
  createInstituicao,
  listInstituicoesSimples,
} from "@/app/lib/data/admin-crud";
import { listarInstituicoesComMetricas } from "@/app/lib/data/plataforma";

export async function GET(request: Request) {
  const auth = await requireAdminNeoGuardApi();
  if (!auth) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const simple = searchParams.get("simple") === "1";

  if (simple) {
    return NextResponse.json({
      ok: true,
      instituicoes: await listInstituicoesSimples(),
    });
  }

  return NextResponse.json({
    ok: true,
    instituicoes: await listarInstituicoesComMetricas(),
  });
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdminNeoGuardApi();
    if (!auth) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const body = await request.json();
    const instituicao = await createInstituicao(String(body?.nome ?? ""));

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/instituicoes");
    revalidatePath("/dashboard/assinaturas");
    revalidatePath("/dashboard/usuarios");
    revalidatePath("/dashboard/configuracoes");

    return NextResponse.json({ ok: true, instituicao }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao criar instituição.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
