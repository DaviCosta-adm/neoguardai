import { NextResponse } from "next/server";
import { createSessionToken } from "@/app/lib/auth/session";
import { findUserById } from "@/app/lib/auth/users";
import {
  acceptConvite,
  getConviteByRawToken,
} from "@/app/lib/data/convites";

type Params = { params: Promise<{ token: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { token } = await params;
  const convite = await getConviteByRawToken(token);

  if (!convite) {
    return NextResponse.json(
      { error: "Convite inválido." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    convite: {
      nome: convite.nome,
      email: convite.email,
      role: convite.role,
      instituicaoNome: convite.instituicaoNome,
      status: convite.status,
      expiraEm: convite.expiraEm,
    },
  });
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { token } = await params;
    const body = await request.json();
    const password = String(body?.password ?? "");
    const nome = body?.nome ? String(body.nome) : undefined;

    const accepted = await acceptConvite({ token, password, nome });
    const user = await findUserById(accepted.usuarioId);
    if (!user) {
      throw new Error("Usuário criado, mas não foi possível abrir a sessão.");
    }

    const cookie = await createSessionToken({
      userId: user.id,
      role: user.role,
      instituicaoId: user.instituicaoId,
    });

    const response = NextResponse.json({
      ok: true,
      redirectTo: "/dashboard",
    });
    response.cookies.set(cookie.name, cookie.value, cookie.options);
    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao aceitar convite.";
    const status =
      message.includes("inválido") || message.includes("expirou")
        ? 404
        : message.includes("já foi") || message.includes("revogado")
          ? 409
          : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
