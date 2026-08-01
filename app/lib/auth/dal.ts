import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import {
  findUserById,
  getInstituicaoById,
  toPublicUser,
} from "@/app/lib/auth/users";
import { getSession } from "@/app/lib/auth/session";
import type { Instituicao, Usuario } from "@/app/lib/types";

export type AuthContext = {
  user: Usuario;
  instituicao: Instituicao;
  session: NonNullable<Awaited<ReturnType<typeof getSession>>>;
};

export const verifySession = cache(async () => {
  const session = await getSession();

  if (!session?.userId) {
    return null;
  }

  return session;
});

export const getAuthContext = cache(async (): Promise<AuthContext | null> => {
  const session = await verifySession();
  if (!session) return null;

  const dbUser = await findUserById(session.userId);
  if (!dbUser) return null;

  const instituicao =
    (await getInstituicaoById(dbUser.instituicaoId)) ??
    ({
      id: dbUser.instituicaoId,
      nome: "NeoGuardAI",
    } satisfies Instituicao);

  return {
    user: toPublicUser(dbUser),
    instituicao,
    session,
  };
});

export async function requireAuth(): Promise<AuthContext> {
  const auth = await getAuthContext();

  if (!auth) {
    redirect("/login");
  }

  return auth;
}
