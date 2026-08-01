"use server";

import { redirect } from "next/navigation";
import { createSession, deleteSession } from "@/app/lib/auth/session";
import { findUserByEmail } from "@/app/lib/auth/users";

export type LoginState = {
  error?: string;
};

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Informe e-mail e senha." };
  }

  const user = findUserByEmail(email);

  if (!user || user.password !== password) {
    return { error: "Credenciais inválidas." };
  }

  await createSession({
    userId: user.id,
    role: user.role,
    instituicaoId: user.instituicaoId,
  });

  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
