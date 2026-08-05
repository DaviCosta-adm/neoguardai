import "server-only";

import { query } from "@/app/lib/db/client";
import {
  backfillOutcomes,
  countSnapshots,
} from "@/app/lib/data/risco-snapshots";
import {
  DEFAULT_PESOS,
  normalizePesos,
  type PesosRisco,
} from "@/app/lib/risk/weights";
import {
  treinarPesosSupervisionado,
  type MetricasTreino,
} from "@/app/lib/risk/train";
import type { IndicadoresAluno } from "@/app/lib/types";

export type ModeloRisco = {
  id: string;
  versao: string;
  ativo: boolean;
  pesos: PesosRisco;
  metricas: MetricasTreino & Record<string, unknown>;
  notas: string;
  treinadoEm: string | null;
  criadoEm: string;
};

type ModeloRow = {
  id: string;
  versao: string;
  ativo: boolean;
  pesos: PesosRisco | string;
  metricas: MetricasTreino & Record<string, unknown> | string;
  notas: string;
  treinado_em: Date | string | null;
  criado_em: Date | string;
};

function parseJson<T>(value: T | string, fallback: T): T {
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value ?? fallback;
}

function mapModelo(row: ModeloRow): ModeloRisco {
  return {
    id: row.id,
    versao: row.versao,
    ativo: row.ativo,
    pesos: normalizePesos(parseJson(row.pesos, DEFAULT_PESOS)),
    metricas: parseJson(row.metricas, {
      amostras: 0,
      mae: null,
      brier: null,
      maeBase: null,
      melhoriaMaePct: null,
    }),
    notas: row.notas,
    treinadoEm: row.treinado_em
      ? row.treinado_em instanceof Date
        ? row.treinado_em.toISOString()
        : String(row.treinado_em)
      : null,
    criadoEm:
      row.criado_em instanceof Date
        ? row.criado_em.toISOString()
        : String(row.criado_em),
  };
}

export async function listModelosRisco(): Promise<ModeloRisco[]> {
  const result = await query<ModeloRow>(
    `SELECT * FROM modelo_risco ORDER BY criado_em DESC`
  );
  return result.rows.map(mapModelo);
}

export async function getModeloAtivo(): Promise<ModeloRisco | null> {
  const result = await query<ModeloRow>(
    `SELECT * FROM modelo_risco WHERE ativo = TRUE ORDER BY criado_em DESC LIMIT 1`
  );
  const row = result.rows[0];
  return row ? mapModelo(row) : null;
}

export async function getPesosAtivos(): Promise<{
  pesos: PesosRisco;
  versao: string;
}> {
  const ativo = await getModeloAtivo();
  if (!ativo) {
    return { pesos: DEFAULT_PESOS, versao: "v2" };
  }
  return { pesos: ativo.pesos, versao: ativo.versao };
}

export async function ativarModelo(id: string): Promise<ModeloRisco> {
  await query(`UPDATE modelo_risco SET ativo = FALSE WHERE ativo = TRUE`);
  const result = await query<ModeloRow>(
    `UPDATE modelo_risco SET ativo = TRUE WHERE id = $1 RETURNING *`,
    [id]
  );
  const row = result.rows[0];
  if (!row) {
    throw new Error("Modelo não encontrado.");
  }
  return mapModelo(row);
}

async function carregarAmostrasTreino() {
  const result = await query<{
    frequencia: string | number;
    desempenho: string | number;
    faltas_consecutivas: number;
    ocorrencias: number;
    participacao: number;
    outcome_risco: number;
  }>(
    `SELECT
       frequencia,
       desempenho,
       faltas_consecutivas,
       ocorrencias,
       participacao,
       outcome_risco
     FROM risco_snapshots
     WHERE outcome_risco IS NOT NULL
     ORDER BY capturado_em DESC
     LIMIT 500`
  );

  return result.rows.map((row) => ({
    indicadores: {
      frequencia: Number(row.frequencia),
      desempenho: Number(row.desempenho),
      faltasConsecutivas: row.faltas_consecutivas,
      ocorrencias: row.ocorrencias,
      participacao: row.participacao,
    } satisfies IndicadoresAluno,
    outcomeRisco: row.outcome_risco,
  }));
}

export async function treinarModeloRisco(options?: {
  backfillForce?: boolean;
  ativar?: boolean;
  notas?: string;
}): Promise<{ modelo: ModeloRisco; snapshots: { total: number; comOutcome: number } }> {
  await backfillOutcomes({
    minDays: 14,
    force: options?.backfillForce ?? false,
  });

  const amostras = await carregarAmostrasTreino();
  if (amostras.length < 3) {
    throw new Error(
      `Amostras insuficientes para treino (mínimo 3 com outcome). Encontradas: ${amostras.length}.`
    );
  }

  const ativo = await getModeloAtivo();
  const resultado = treinarPesosSupervisionado(amostras, ativo?.pesos);
  const id = `modelo-${resultado.versao}`;

  if (options?.ativar !== false) {
    await query(`UPDATE modelo_risco SET ativo = FALSE WHERE ativo = TRUE`);
  }

  const result = await query<ModeloRow>(
    `INSERT INTO modelo_risco
       (id, versao, ativo, pesos, metricas, notas, treinado_em)
     VALUES ($1,$2,$3,$4::jsonb,$5::jsonb,$6,NOW())
     ON CONFLICT (versao) DO UPDATE SET
       pesos = EXCLUDED.pesos,
       metricas = EXCLUDED.metricas,
       notas = EXCLUDED.notas,
       treinado_em = NOW(),
       ativo = EXCLUDED.ativo
     RETURNING *`,
    [
      id,
      resultado.versao,
      options?.ativar !== false,
      JSON.stringify(resultado.pesos),
      JSON.stringify(resultado.metricas),
      options?.notas?.trim() ||
        `Calibração supervisionada com ${resultado.metricas.amostras} amostras longitudinais.`,
    ]
  );

  const modelo = mapModelo(result.rows[0]);
  const snapshots = await countSnapshots();
  return { modelo, snapshots };
}

export async function getResumoModeloRisco() {
  const [modelos, ativo, snapshots] = await Promise.all([
    listModelosRisco(),
    getModeloAtivo(),
    countSnapshots(),
  ]);
  return { modelos, ativo, snapshots };
}
