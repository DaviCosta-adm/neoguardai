import "server-only";

import { query } from "@/app/lib/db/client";
import type { Plano } from "@/app/lib/types";

type PlanoRow = {
  id: string;
  nome: string;
  descricao: string;
  preco_centavos: number;
  moeda: string;
  intervalo: string;
  max_alunos: number;
  max_usuarios: number;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  ativo: boolean;
  ordem: number;
};

function envPriceOverride(planoId: string): string | null {
  const key = `STRIPE_PRICE_${planoId.toUpperCase()}`;
  return process.env[key]?.trim() || null;
}

function mapPlano(row: PlanoRow): Plano {
  const override = envPriceOverride(row.id);
  return {
    id: row.id,
    nome: row.nome,
    descricao: row.descricao,
    precoCentavos: Number(row.preco_centavos),
    moeda: row.moeda,
    intervalo: row.intervalo,
    maxAlunos: Number(row.max_alunos),
    maxUsuarios: Number(row.max_usuarios),
    stripeProductId: row.stripe_product_id,
    stripePriceId: override || row.stripe_price_id,
    ativo: row.ativo,
    ordem: Number(row.ordem),
  };
}

export async function listPlanos(activeOnly = true): Promise<Plano[]> {
  const result = await query<PlanoRow>(
    `SELECT *
     FROM planos
     WHERE ($1::boolean = FALSE OR ativo = TRUE)
     ORDER BY ordem, nome`,
    [activeOnly]
  );
  return result.rows.map(mapPlano);
}

export async function getPlanoById(id: string): Promise<Plano | null> {
  const result = await query<PlanoRow>(
    `SELECT * FROM planos WHERE id = $1`,
    [id]
  );
  const row = result.rows[0];
  return row ? mapPlano(row) : null;
}

export async function getPlanoByStripePriceId(
  priceId: string
): Promise<Plano | null> {
  const planos = await listPlanos(false);
  return planos.find((plano) => plano.stripePriceId === priceId) ?? null;
}

export function formatPrecoBRL(centavos: number, moeda = "brl") {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: moeda.toUpperCase(),
  }).format(centavos / 100);
}
