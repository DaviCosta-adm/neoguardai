import "server-only";

import { query } from "@/app/lib/db/client";
import type { Assinatura, AssinaturaStatus } from "@/app/lib/types";

type AssinaturaRow = {
  id: string;
  instituicao_id: string;
  instituicao_nome: string;
  status: AssinaturaStatus;
  plano: string;
  iniciada_em: Date | string;
  atualizada_em: Date | string;
  observacao: string;
};

const STATUSES: AssinaturaStatus[] = ["ativo", "inativo", "bloqueado"];

function toIso(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function mapAssinatura(row: AssinaturaRow): Assinatura {
  return {
    id: row.id,
    instituicaoId: row.instituicao_id,
    instituicaoNome: row.instituicao_nome,
    status: row.status,
    plano: row.plano,
    iniciadaEm: toIso(row.iniciada_em),
    atualizadaEm: toIso(row.atualizada_em),
    observacao: row.observacao,
  };
}

export function isValidAssinaturaStatus(
  status: string
): status is AssinaturaStatus {
  return STATUSES.includes(status as AssinaturaStatus);
}

export async function listAssinaturas(): Promise<Assinatura[]> {
  const result = await query<AssinaturaRow>(
    `SELECT
       a.id,
       a.instituicao_id,
       i.nome AS instituicao_nome,
       a.status,
       a.plano,
       a.iniciada_em,
       a.atualizada_em,
       a.observacao
     FROM assinaturas a
     JOIN instituicoes i ON i.id = a.instituicao_id
     ORDER BY i.nome`
  );

  return result.rows.map(mapAssinatura);
}

export async function getAssinaturaById(
  id: string
): Promise<Assinatura | null> {
  const result = await query<AssinaturaRow>(
    `SELECT
       a.id,
       a.instituicao_id,
       i.nome AS instituicao_nome,
       a.status,
       a.plano,
       a.iniciada_em,
       a.atualizada_em,
       a.observacao
     FROM assinaturas a
     JOIN instituicoes i ON i.id = a.instituicao_id
     WHERE a.id = $1`,
    [id]
  );

  const row = result.rows[0];
  return row ? mapAssinatura(row) : null;
}

export async function getAssinaturaStatusByInstituicaoId(
  instituicaoId: string
): Promise<AssinaturaStatus | null> {
  const result = await query<{ status: AssinaturaStatus }>(
    `SELECT status FROM assinaturas WHERE instituicao_id = $1`,
    [instituicaoId]
  );

  return result.rows[0]?.status ?? null;
}

export async function createAssinaturaForInstituicao(
  instituicaoId: string,
  options?: { plano?: string; observacao?: string }
): Promise<void> {
  const id = `ass-${instituicaoId}`;
  await query(
    `INSERT INTO assinaturas
       (id, instituicao_id, status, plano, observacao)
     VALUES ($1, $2, 'ativo', $3, $4)
     ON CONFLICT (instituicao_id) DO NOTHING`,
    [
      id,
      instituicaoId,
      options?.plano?.trim() || "padrao",
      options?.observacao?.trim() ||
        "Assinatura inicial criada automaticamente.",
    ]
  );
}

export async function updateAssinaturaStatus(
  id: string,
  status: AssinaturaStatus,
  observacao?: string
): Promise<Assinatura> {
  if (!isValidAssinaturaStatus(status)) {
    throw new Error("Status de assinatura inválido.");
  }

  const result = await query<AssinaturaRow>(
    `UPDATE assinaturas a
     SET
       status = $2,
       observacao = COALESCE($3, a.observacao),
       atualizada_em = NOW()
     FROM instituicoes i
     WHERE a.id = $1 AND i.id = a.instituicao_id
     RETURNING
       a.id,
       a.instituicao_id,
       i.nome AS instituicao_nome,
       a.status,
       a.plano,
       a.iniciada_em,
       a.atualizada_em,
       a.observacao`,
    [id, status, observacao?.trim() ?? null]
  );

  const row = result.rows[0];
  if (!row) {
    throw new Error("Assinatura não encontrada.");
  }

  return mapAssinatura(row);
}

export async function updateAssinatura(
  id: string,
  input: {
    status?: AssinaturaStatus;
    plano?: string;
    observacao?: string;
  }
): Promise<Assinatura> {
  const current = await getAssinaturaById(id);
  if (!current) {
    throw new Error("Assinatura não encontrada.");
  }

  const status = input.status ?? current.status;
  if (!isValidAssinaturaStatus(status)) {
    throw new Error("Status de assinatura inválido.");
  }

  const plano = (input.plano ?? current.plano).trim() || "padrao";
  const observacao =
    input.observacao !== undefined
      ? input.observacao.trim()
      : current.observacao;

  const result = await query<AssinaturaRow>(
    `UPDATE assinaturas a
     SET
       status = $2,
       plano = $3,
       observacao = $4,
       atualizada_em = NOW()
     FROM instituicoes i
     WHERE a.id = $1 AND i.id = a.instituicao_id
     RETURNING
       a.id,
       a.instituicao_id,
       i.nome AS instituicao_nome,
       a.status,
       a.plano,
       a.iniciada_em,
       a.atualizada_em,
       a.observacao`,
    [id, status, plano, observacao]
  );

  const row = result.rows[0];
  if (!row) {
    throw new Error("Assinatura não encontrada.");
  }

  return mapAssinatura(row);
}
