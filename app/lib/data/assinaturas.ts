import "server-only";

import { query } from "@/app/lib/db/client";
import type { Assinatura, AssinaturaStatus } from "@/app/lib/types";

type AssinaturaRow = {
  id: string;
  instituicao_id: string;
  instituicao_nome: string;
  status: AssinaturaStatus;
  plano: string;
  plano_id: string | null;
  plano_nome: string | null;
  iniciada_em: Date | string;
  atualizada_em: Date | string;
  observacao: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
};

const STATUSES: AssinaturaStatus[] = ["ativo", "inativo", "bloqueado"];

function toIso(value: Date | string) {
  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString();
}

function mapAssinatura(row: AssinaturaRow): Assinatura {
  return {
    id: row.id,
    instituicaoId: row.instituicao_id,
    instituicaoNome: row.instituicao_nome,
    status: row.status,
    plano: row.plano_id || row.plano,
    planoId: row.plano_id || row.plano,
    planoNome: row.plano_nome || row.plano,
    iniciadaEm: toIso(row.iniciada_em),
    atualizadaEm: toIso(row.atualizada_em),
    observacao: row.observacao,
    stripeCustomerId: row.stripe_customer_id,
    stripeSubscriptionId: row.stripe_subscription_id,
    stripePriceId: row.stripe_price_id,
  };
}

const ASSINATURA_SELECT = `
  SELECT
    a.id,
    a.instituicao_id,
    i.nome AS instituicao_nome,
    a.status,
    a.plano,
    a.plano_id,
    p.nome AS plano_nome,
    a.iniciada_em,
    a.atualizada_em,
    a.observacao,
    a.stripe_customer_id,
    a.stripe_subscription_id,
    a.stripe_price_id
  FROM assinaturas a
  JOIN instituicoes i ON i.id = a.instituicao_id
  LEFT JOIN planos p ON p.id = a.plano_id
`;

export function isValidAssinaturaStatus(
  status: string
): status is AssinaturaStatus {
  return STATUSES.includes(status as AssinaturaStatus);
}

export async function listAssinaturas(): Promise<Assinatura[]> {
  const result = await query<AssinaturaRow>(
    `${ASSINATURA_SELECT} ORDER BY i.nome`
  );
  return result.rows.map(mapAssinatura);
}

export async function getAssinaturaById(
  id: string
): Promise<Assinatura | null> {
  const result = await query<AssinaturaRow>(
    `${ASSINATURA_SELECT} WHERE a.id = $1`,
    [id]
  );
  const row = result.rows[0];
  return row ? mapAssinatura(row) : null;
}

export async function getAssinaturaByStripeCustomerId(
  customerId: string
): Promise<Assinatura | null> {
  const result = await query<AssinaturaRow>(
    `${ASSINATURA_SELECT} WHERE a.stripe_customer_id = $1`,
    [customerId]
  );
  const row = result.rows[0];
  return row ? mapAssinatura(row) : null;
}

export async function getAssinaturaByStripeSubscriptionId(
  subscriptionId: string
): Promise<Assinatura | null> {
  const result = await query<AssinaturaRow>(
    `${ASSINATURA_SELECT} WHERE a.stripe_subscription_id = $1`,
    [subscriptionId]
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
  const planoId = options?.plano?.trim() || "essencial";
  await query(
    `INSERT INTO assinaturas
       (id, instituicao_id, status, plano, plano_id, observacao)
     VALUES ($1, $2, 'ativo', $3, $3, $4)
     ON CONFLICT (instituicao_id) DO NOTHING`,
    [
      id,
      instituicaoId,
      planoId,
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

  await query(
    `UPDATE assinaturas
     SET
       status = $2,
       observacao = COALESCE($3, observacao),
       atualizada_em = NOW()
     WHERE id = $1`,
    [id, status, observacao?.trim() ?? null]
  );

  const updated = await getAssinaturaById(id);
  if (!updated) {
    throw new Error("Assinatura não encontrada.");
  }
  return updated;
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

  const plano =
    (input.plano ?? current.planoId ?? current.plano).trim() || "essencial";

  if (input.plano !== undefined) {
    const planoExists = await query<{ id: string }>(
      `SELECT id FROM planos WHERE id = $1 AND ativo = TRUE`,
      [plano]
    );
    if (!planoExists.rows[0]) {
      throw new Error("Plano inválido.");
    }
  }

  const observacao =
    input.observacao !== undefined
      ? input.observacao.trim()
      : current.observacao;

  await query(
    `UPDATE assinaturas
     SET
       status = $2,
       plano = $3,
       plano_id = $3,
       observacao = $4,
       atualizada_em = NOW()
     WHERE id = $1`,
    [id, status, plano, observacao]
  );

  const updated = await getAssinaturaById(id);
  if (!updated) {
    throw new Error("Assinatura não encontrada.");
  }
  return updated;
}

export async function syncAssinaturaFromStripe(input: {
  assinaturaId?: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripePriceId?: string | null;
  planoId?: string | null;
  status: AssinaturaStatus;
  observacao?: string;
}): Promise<Assinatura | null> {
  let targetId = input.assinaturaId ?? null;

  if (!targetId && input.stripeSubscriptionId) {
    const bySub = await getAssinaturaByStripeSubscriptionId(
      input.stripeSubscriptionId
    );
    targetId = bySub?.id ?? null;
  }

  if (!targetId && input.stripeCustomerId) {
    const byCustomer = await getAssinaturaByStripeCustomerId(
      input.stripeCustomerId
    );
    targetId = byCustomer?.id ?? null;
  }

  if (!targetId) {
    return null;
  }

  const current = await getAssinaturaById(targetId);
  if (!current) {
    return null;
  }

  const planoId = input.planoId ?? current.planoId ?? current.plano;

  await query(
    `UPDATE assinaturas
     SET
       status = $2,
       plano = $3,
       plano_id = $3,
       stripe_customer_id = COALESCE($4, stripe_customer_id),
       stripe_subscription_id = COALESCE($5, stripe_subscription_id),
       stripe_price_id = COALESCE($6, stripe_price_id),
       observacao = COALESCE($7, observacao),
       atualizada_em = NOW()
     WHERE id = $1`,
    [
      targetId,
      input.status,
      planoId,
      input.stripeCustomerId ?? null,
      input.stripeSubscriptionId ?? null,
      input.stripePriceId ?? null,
      input.observacao?.trim() ?? null,
    ]
  );

  return getAssinaturaById(targetId);
}

export async function setAssinaturaStripeCustomer(
  id: string,
  stripeCustomerId: string
): Promise<void> {
  await query(
    `UPDATE assinaturas
     SET stripe_customer_id = $2, atualizada_em = NOW()
     WHERE id = $1`,
    [id, stripeCustomerId]
  );
}
