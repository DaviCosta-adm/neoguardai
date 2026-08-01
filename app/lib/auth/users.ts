import "server-only";

import { compare } from "bcryptjs";
import { query } from "@/app/lib/db/client";
import type { Instituicao, UserRole, Usuario } from "@/app/lib/types";

export type DbUser = Usuario & {
  passwordHash: string;
};

type UsuarioRow = {
  id: string;
  nome: string;
  email: string;
  password_hash: string;
  role: UserRole;
  instituicao_id: string;
};

type InstituicaoRow = {
  id: string;
  nome: string;
};

function mapUser(row: UsuarioRow): DbUser {
  return {
    id: row.id,
    nome: row.nome,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    instituicaoId: row.instituicao_id,
  };
}

export function toPublicUser(user: DbUser | Usuario): Usuario {
  return {
    id: user.id,
    nome: user.nome,
    email: user.email,
    role: user.role,
    instituicaoId: user.instituicaoId,
  };
}

export async function findUserByEmail(email: string): Promise<DbUser | null> {
  const result = await query<UsuarioRow>(
    `SELECT id, nome, email, password_hash, role, instituicao_id
     FROM usuarios
     WHERE lower(email) = lower($1)
     LIMIT 1`,
    [email.trim()]
  );

  const row = result.rows[0];
  return row ? mapUser(row) : null;
}

export async function findUserById(id: string): Promise<DbUser | null> {
  const result = await query<UsuarioRow>(
    `SELECT id, nome, email, password_hash, role, instituicao_id
     FROM usuarios
     WHERE id = $1
     LIMIT 1`,
    [id]
  );

  const row = result.rows[0];
  return row ? mapUser(row) : null;
}

export async function verifyUserPassword(
  user: DbUser,
  password: string
): Promise<boolean> {
  return compare(password, user.passwordHash);
}

export async function getInstituicaoById(
  id: string
): Promise<Instituicao | null> {
  const result = await query<InstituicaoRow>(
    `SELECT id, nome FROM instituicoes WHERE id = $1 LIMIT 1`,
    [id]
  );

  return result.rows[0] ?? null;
}

export async function listUsuarios(options?: {
  instituicaoId?: string;
}): Promise<Usuario[]> {
  const result = options?.instituicaoId
    ? await query<UsuarioRow>(
        `SELECT id, nome, email, password_hash, role, instituicao_id
         FROM usuarios
         WHERE instituicao_id = $1
         ORDER BY nome`,
        [options.instituicaoId]
      )
    : await query<UsuarioRow>(
        `SELECT id, nome, email, password_hash, role, instituicao_id
         FROM usuarios
         ORDER BY nome`
      );

  return result.rows.map((row) => toPublicUser(mapUser(row)));
}
