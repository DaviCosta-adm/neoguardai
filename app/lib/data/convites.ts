import "server-only";

import { createHash, randomBytes } from "crypto";
import { createUsuario, isValidRole } from "@/app/lib/data/admin-crud";
import { getAppBaseUrl } from "@/app/lib/config/app-url";
import { sendEmail } from "@/app/lib/email/send";
import { query } from "@/app/lib/db/client";
import type { Convite, ConviteStatus, UserRole } from "@/app/lib/types";

type ConviteRow = {
  id: string;
  email: string;
  nome: string;
  role: UserRole;
  instituicao_id: string;
  instituicao_nome: string;
  status: "pendente" | "aceito" | "revogado";
  criado_por: string;
  criado_por_nome: string;
  criado_em: Date | string;
  expira_em: Date | string;
  aceito_em: Date | string | null;
  usuario_id: string | null;
  observacao: string;
};

const INVITE_ROLES_INSTITUICAO: UserRole[] = [
  "coordenacao",
  "especialista",
  "admin_instituicao",
];

function toIso(value: Date | string) {
  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString();
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function resolveStatus(row: ConviteRow): ConviteStatus {
  if (row.status === "aceito" || row.status === "revogado") {
    return row.status;
  }
  if (new Date(row.expira_em).getTime() < Date.now()) {
    return "expirado";
  }
  return "pendente";
}

function mapConvite(row: ConviteRow, inviteUrl?: string): Convite {
  return {
    id: row.id,
    email: row.email,
    nome: row.nome,
    role: row.role,
    instituicaoId: row.instituicao_id,
    instituicaoNome: row.instituicao_nome,
    status: resolveStatus(row),
    criadoPor: row.criado_por,
    criadoPorNome: row.criado_por_nome,
    criadoEm: toIso(row.criado_em),
    expiraEm: toIso(row.expira_em),
    aceitoEm: row.aceito_em ? toIso(row.aceito_em) : null,
    usuarioId: row.usuario_id,
    observacao: row.observacao,
    inviteUrl,
  };
}

const SELECT_CONVITE = `
  SELECT
    c.id,
    c.email,
    c.nome,
    c.role,
    c.instituicao_id,
    i.nome AS instituicao_nome,
    c.status,
    c.criado_por,
    u.nome AS criado_por_nome,
    c.criado_em,
    c.expira_em,
    c.aceito_em,
    c.usuario_id,
    c.observacao
  FROM convites c
  JOIN instituicoes i ON i.id = c.instituicao_id
  JOIN usuarios u ON u.id = c.criado_por
`;

export function canInviteRole(
  actorRole: UserRole,
  targetRole: UserRole
): boolean {
  if (actorRole === "admin_neoguard") {
    return isValidRole(targetRole);
  }
  if (actorRole === "admin_instituicao") {
    return INVITE_ROLES_INSTITUICAO.includes(targetRole);
  }
  return false;
}

export async function listConvites(options?: {
  instituicaoId?: string;
}): Promise<Convite[]> {
  const result = options?.instituicaoId
    ? await query<ConviteRow>(
        `${SELECT_CONVITE}
         WHERE c.instituicao_id = $1
         ORDER BY c.criado_em DESC`,
        [options.instituicaoId]
      )
    : await query<ConviteRow>(
        `${SELECT_CONVITE}
         ORDER BY c.criado_em DESC`
      );

  return result.rows.map((row) => mapConvite(row));
}

export async function getConviteById(id: string): Promise<Convite | null> {
  const result = await query<ConviteRow>(
    `${SELECT_CONVITE} WHERE c.id = $1`,
    [id]
  );
  const row = result.rows[0];
  return row ? mapConvite(row) : null;
}

export async function getConviteByRawToken(
  token: string
): Promise<Convite | null> {
  const tokenHash = hashToken(token.trim());
  const result = await query<ConviteRow>(
    `${SELECT_CONVITE} WHERE c.token_hash = $1`,
    [tokenHash]
  );
  const row = result.rows[0];
  return row ? mapConvite(row) : null;
}

export async function createConvite(input: {
  nome: string;
  email: string;
  role: UserRole;
  instituicaoId: string;
  criadoPor: string;
  actorRole: UserRole;
  diasValidade?: number;
  observacao?: string;
  sendEmail?: boolean;
}): Promise<Convite> {
  const nome = input.nome.trim();
  const email = input.email.trim().toLowerCase();
  const dias = Math.min(Math.max(input.diasValidade ?? 7, 1), 30);

  if (!nome || !email) {
    throw new Error("Informe nome e e-mail.");
  }

  if (!canInviteRole(input.actorRole, input.role)) {
    throw new Error("Você não pode convidar para este perfil.");
  }

  if (input.actorRole === "admin_instituicao") {
    // instituição é forçada no caller; validação defensiva
  }

  const instituicao = await query<{ id: string }>(
    `SELECT id FROM instituicoes WHERE id = $1`,
    [input.instituicaoId]
  );
  if (!instituicao.rows[0]) {
    throw new Error("Instituição inválida.");
  }

  const existingUser = await query(
    `SELECT id FROM usuarios WHERE lower(email) = lower($1) LIMIT 1`,
    [email]
  );
  if (existingUser.rows[0]) {
    throw new Error("Já existe um usuário com este e-mail.");
  }

  const pending = await query(
    `SELECT id FROM convites
     WHERE lower(email) = lower($1)
       AND status = 'pendente'
       AND expira_em > NOW()
     LIMIT 1`,
    [email]
  );
  if (pending.rows[0]) {
    throw new Error("Já existe um convite pendente para este e-mail.");
  }

  const id = `conv-${randomBytes(8).toString("hex")}`;
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const inviteUrl = `${getAppBaseUrl()}/convite/${rawToken}`;

  await query(
    `INSERT INTO convites (
       id, email, nome, role, instituicao_id, token_hash, status,
       criado_por, expira_em, observacao
     ) VALUES (
       $1, $2, $3, $4, $5, $6, 'pendente',
       $7, NOW() + ($8::text || ' days')::interval, $9
     )`,
    [
      id,
      email,
      nome,
      input.role,
      input.instituicaoId,
      tokenHash,
      input.criadoPor,
      String(dias),
      input.observacao?.trim() || "",
    ]
  );

  const created = await getConviteById(id);
  if (!created) {
    throw new Error("Não foi possível criar o convite.");
  }

  const convite: Convite = { ...created, inviteUrl };

  if (input.sendEmail !== false) {
    try {
      await sendEmail({
        to: email,
        subject: "Convite NeoGuardAI",
        text: [
          `Olá, ${nome}!`,
          "",
          `Você foi convidado(a) para o NeoGuardAI (${convite.instituicaoNome}).`,
          `Acesse o link abaixo para definir sua senha e entrar:`,
          inviteUrl,
          "",
          `O convite expira em ${new Date(convite.expiraEm).toLocaleString("pt-BR")}.`,
        ].join("\n"),
      });
    } catch (error) {
      console.error("Falha ao enviar e-mail de convite:", error);
    }
  }

  return convite;
}

export async function revokeConvite(id: string): Promise<Convite> {
  const current = await getConviteById(id);
  if (!current) {
    throw new Error("Convite não encontrado.");
  }
  if (current.status === "aceito") {
    throw new Error("Não é possível revogar um convite já aceito.");
  }

  await query(
    `UPDATE convites
     SET status = 'revogado'
     WHERE id = $1`,
    [id]
  );

  const updated = await getConviteById(id);
  if (!updated) {
    throw new Error("Convite não encontrado.");
  }
  return updated;
}

export async function acceptConvite(input: {
  token: string;
  password: string;
  nome?: string;
}): Promise<{ usuarioId: string; email: string }> {
  const token = input.token.trim();
  const password = input.password;
  if (!token) {
    throw new Error("Token inválido.");
  }
  if (!password || password.length < 6) {
    throw new Error("A senha deve ter pelo menos 6 caracteres.");
  }

  const tokenHash = hashToken(token);
  const result = await query<ConviteRow>(
    `${SELECT_CONVITE} WHERE c.token_hash = $1`,
    [tokenHash]
  );
  const row = result.rows[0];

  if (!row) {
    throw new Error("Convite inválido.");
  }

  const status = resolveStatus(row);
  if (status === "aceito") {
    throw new Error("Este convite já foi aceito.");
  }
  if (status === "revogado") {
    throw new Error("Este convite foi revogado.");
  }
  if (status === "expirado") {
    throw new Error("Este convite expirou.");
  }

  const usuario = await createUsuario({
    nome: (input.nome ?? row.nome).trim() || row.nome,
    email: row.email,
    password,
    role: row.role,
    instituicaoId: row.instituicao_id,
  });

  await query(
    `UPDATE convites
     SET status = 'aceito',
         aceito_em = NOW(),
         usuario_id = $2
     WHERE id = $1`,
    [row.id, usuario.id]
  );

  return { usuarioId: usuario.id, email: usuario.email };
}
