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

  const demoUser = findUserById(session.userId);
  if (!demoUser) return null;

  const instituicao = getInstituicaoById(demoUser.instituicaoId);
  if (!instituicao && demoUser.role !== "admin_neoguard") return null;

  return {
    user: toPublicUser(demoUser),
    instituicao: instituicao ?? {
      id: demoUser.instituicaoId,
      nome: "NeoGuardAI",
    },
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
