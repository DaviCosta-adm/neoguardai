import { NextResponse } from "next/server";
import { createSessionToken } from "@/app/lib/auth/session";
import { findUserByEmail, verifyUserPassword } from "@/app/lib/auth/users";
import { getAssinaturaStatusByInstituicaoId } from "@/app/lib/data/assinaturas";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body?.email ?? "");
    const password = String(body?.password ?? "");

    if (!email || !password) {
      return NextResponse.json(
        { error: "Informe e-mail e senha." },
        { status: 400 }
      );
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          error:
            "Banco não configurado. Defina DATABASE_URL e suba o serviço Postgres.",
        },
        { status: 500 }
      );
    }

    if (!process.env.AUTH_SECRET) {
      return NextResponse.json(
        { error: "Sessão não configurada. Defina AUTH_SECRET." },
        { status: 500 }
      );
    }

    const user = await findUserByEmail(email);

    if (!user || !(await verifyUserPassword(user, password))) {
      return NextResponse.json(
        { error: "Credenciais inválidas." },
        { status: 401 }
      );
    }

    if (user.role !== "admin_neoguard") {
      const status = await getAssinaturaStatusByInstituicaoId(
        user.instituicaoId
      );

      if (status === "inativo") {
        return NextResponse.json(
          {
            error:
              "Assinatura inativa. Entre em contato com o suporte NeoGuardAI.",
          },
          { status: 403 }
        );
      }

      if (status === "bloqueado") {
        return NextResponse.json(
          {
            error:
              "Assinatura bloqueada. Entre em contato com o suporte NeoGuardAI.",
          },
          { status: 403 }
        );
      }
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
    console.error("Erro no login API:", error);
    return NextResponse.json(
      {
        error:
          "Não foi possível entrar. Verifique Postgres, DATABASE_URL e AUTH_SECRET.",
      },
      { status: 500 }
    );
  }
}
