"use server";

import { redirect } from "next/navigation";
import {
  createSession,
  deleteSession,
} from "@/app/lib/auth/session";
import { findUserByEmail, verifyUserPassword } from "@/app/lib/auth/users";

export type LoginState = {
  error?: string;
};

function isNextRedirect(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    String((error as { digest: string }).digest).startsWith("NEXT_REDIRECT")
  );
}

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  try {
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      return { error: "Informe e-mail e senha." };
    }

    if (!process.env.DATABASE_URL) {
      return {
        error:
          "Banco não configurado. Defina DATABASE_URL no .env.local e rode npm run db:setup.",
      };
    }

    if (!process.env.AUTH_SECRET) {
      return {
        error:
          "Sessão não configurada. Defina AUTH_SECRET no .env.local.",
      };
    }

    const user = await findUserByEmail(email);

    if (!user || !(await verifyUserPassword(user, password))) {
      return { error: "Credenciais inválidas." };
    }

    await createSession({
      userId: user.id,
      role: user.role,
      instituicaoId: user.instituicaoId,
    });

    redirect("/dashboard");
  } catch (error) {
    if (isNextRedirect(error)) {
      throw error;
    }

    console.error("Erro no login:", error);

    return {
      error:
        "Não foi possível entrar agora. Verifique Postgres, DATABASE_URL e AUTH_SECRET.",
    };
  }
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
