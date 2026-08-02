import "server-only";

import { hashSync } from "bcryptjs";
import { query } from "@/app/lib/db/client";
import type { Instituicao, UserRole, Usuario } from "@/app/lib/types";
import { toPublicUser, type DbUser } from "@/app/lib/auth/users";

const ROLES: UserRole[] = [
  "coordenacao",
  "especialista",
  "admin_instituicao",
  "admin_neoguard",
];

type UsuarioRow = {
  id: string;
  nome: string;
  email: string;
  password_hash: string;
  role: UserRole;
  instituicao_id: string;
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

function slugId(prefix: string) {
  return `${prefix}-${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

export function isValidRole(role: string): role is UserRole {
  return ROLES.includes(role as UserRole);
}

export async function listInstituicoesSimples(): Promise<Instituicao[]> {
  const result = await query<Instituicao>(
    `SELECT id, nome FROM instituicoes ORDER BY nome`
  );
  return result.rows;
}

export async function createInstituicao(nome: string): Promise<Instituicao> {
  const clean = nome.trim();
  if (!clean) {
    throw new Error("Informe o nome da instituição.");
  }

  const id = slugId("inst");
  await query(`INSERT INTO instituicoes (id, nome) VALUES ($1, $2)`, [
    id,
    clean,
  ]);

  return { id, nome: clean };
}

export async function updateInstituicao(
  id: string,
  nome: string
): Promise<Instituicao> {
  const clean = nome.trim();
  if (!clean) {
    throw new Error("Informe o nome da instituição.");
  }

  const result = await query<Instituicao>(
    `UPDATE instituicoes SET nome = $2 WHERE id = $1
     RETURNING id, nome`,
    [id, clean]
  );

  const row = result.rows[0];
  if (!row) {
    throw new Error("Instituição não encontrada.");
  }

  return row;
}

export async function deleteInstituicao(id: string): Promise<void> {
  const counts = await query<{
    alunos: string | number;
    usuarios: string | number;
  }>(
    `SELECT
       (SELECT COUNT(*)::int FROM alunos WHERE instituicao_id = $1) AS alunos,
       (SELECT COUNT(*)::int FROM usuarios WHERE instituicao_id = $1) AS usuarios`,
    [id]
  );

  const alunos = Number(counts.rows[0]?.alunos ?? 0);
  const usuarios = Number(counts.rows[0]?.usuarios ?? 0);

  if (alunos > 0 || usuarios > 0) {
    throw new Error(
      `Não é possível excluir: há ${usuarios} usuário(s) e ${alunos} aluno(s) vinculados.`
    );
  }

  const result = await query(`DELETE FROM instituicoes WHERE id = $1`, [id]);
  if ((result.rowCount ?? 0) === 0) {
    throw new Error("Instituição não encontrada.");
  }
}

export async function createUsuario(input: {
  nome: string;
  email: string;
  password: string;
  role: UserRole;
  instituicaoId: string;
}): Promise<Usuario> {
  const nome = input.nome.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!nome || !email || !password) {
    throw new Error("Preencha nome, e-mail e senha.");
  }

  if (password.length < 6) {
    throw new Error("A senha deve ter pelo menos 6 caracteres.");
  }

  if (!isValidRole(input.role)) {
    throw new Error("Perfil inválido.");
  }

  const instituicao = await query(
    `SELECT id FROM instituicoes WHERE id = $1 LIMIT 1`,
    [input.instituicaoId]
  );
  if (!instituicao.rows[0]) {
    throw new Error("Instituição inválida.");
  }

  const exists = await query(
    `SELECT id FROM usuarios WHERE lower(email) = lower($1) LIMIT 1`,
    [email]
  );
  if (exists.rows[0]) {
    throw new Error("Já existe um usuário com este e-mail.");
  }

  const id = slugId("user");
  const passwordHash = hashSync(password, 10);

  const result = await query<UsuarioRow>(
    `INSERT INTO usuarios (id, nome, email, password_hash, role, instituicao_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, nome, email, password_hash, role, instituicao_id`,
    [id, nome, email, passwordHash, input.role, input.instituicaoId]
  );

  return toPublicUser(mapUser(result.rows[0]));
}

export async function updateUsuario(
  id: string,
  input: {
    nome: string;
    email: string;
    role: UserRole;
    instituicaoId: string;
    password?: string;
  }
): Promise<Usuario> {
  const nome = input.nome.trim();
  const email = input.email.trim().toLowerCase();

  if (!nome || !email) {
    throw new Error("Preencha nome e e-mail.");
  }

  if (!isValidRole(input.role)) {
    throw new Error("Perfil inválido.");
  }

  const instituicao = await query(
    `SELECT id FROM instituicoes WHERE id = $1 LIMIT 1`,
    [input.instituicaoId]
  );
  if (!instituicao.rows[0]) {
    throw new Error("Instituição inválida.");
  }

  const emailTaken = await query(
    `SELECT id FROM usuarios
     WHERE lower(email) = lower($1) AND id <> $2
     LIMIT 1`,
    [email, id]
  );
  if (emailTaken.rows[0]) {
    throw new Error("Já existe um usuário com este e-mail.");
  }

  let result;
  if (input.password && input.password.trim()) {
    if (input.password.trim().length < 6) {
      throw new Error("A senha deve ter pelo menos 6 caracteres.");
    }
    const passwordHash = hashSync(input.password.trim(), 10);
    result = await query<UsuarioRow>(
      `UPDATE usuarios
       SET nome = $2,
           email = $3,
           role = $4,
           instituicao_id = $5,
           password_hash = $6
       WHERE id = $1
       RETURNING id, nome, email, password_hash, role, instituicao_id`,
      [id, nome, email, input.role, input.instituicaoId, passwordHash]
    );
  } else {
    result = await query<UsuarioRow>(
      `UPDATE usuarios
       SET nome = $2,
           email = $3,
           role = $4,
           instituicao_id = $5
       WHERE id = $1
       RETURNING id, nome, email, password_hash, role, instituicao_id`,
      [id, nome, email, input.role, input.instituicaoId]
    );
  }

  const row = result.rows[0];
  if (!row) {
    throw new Error("Usuário não encontrado.");
  }

  return toPublicUser(mapUser(row));
}

export async function deleteUsuario(
  id: string,
  currentUserId: string
): Promise<void> {
  if (id === currentUserId) {
    throw new Error("Você não pode excluir a própria conta.");
  }

  const refs = await query<{
    criados: string | number;
    devolutivas: string | number;
  }>(
    `SELECT
       (SELECT COUNT(*)::int FROM encaminhamentos WHERE criado_por = $1) AS criados,
       (SELECT COUNT(*)::int FROM devolutivas WHERE autor_id = $1) AS devolutivas`,
    [id]
  );

  const criados = Number(refs.rows[0]?.criados ?? 0);
  const devolutivas = Number(refs.rows[0]?.devolutivas ?? 0);

  if (criados > 0 || devolutivas > 0) {
    throw new Error(
      "Não é possível excluir: o usuário possui encaminhamentos ou devolutivas vinculadas."
    );
  }

  await query(
    `UPDATE encaminhamentos SET especialista_id = NULL WHERE especialista_id = $1`,
    [id]
  );

  const result = await query(`DELETE FROM usuarios WHERE id = $1`, [id]);
  if ((result.rowCount ?? 0) === 0) {
    throw new Error("Usuário não encontrado.");
  }
}

export async function getUsuarioById(id: string): Promise<Usuario | null> {
  const result = await query<UsuarioRow>(
    `SELECT id, nome, email, password_hash, role, instituicao_id
     FROM usuarios WHERE id = $1 LIMIT 1`,
    [id]
  );
  const row = result.rows[0];
  return row ? toPublicUser(mapUser(row)) : null;
}
