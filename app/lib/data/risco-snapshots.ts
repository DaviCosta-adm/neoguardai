import "server-only";

import { query } from "@/app/lib/db/client";
import { calcularRiscoPreditivo } from "@/app/lib/risk/predictive";
import {
  DEFAULT_PESOS,
  normalizePesos,
  type PesosRisco,
} from "@/app/lib/risk/weights";
import type { Aluno, RiskLevel } from "@/app/lib/types";
import type { TendenciaRisco } from "@/app/lib/risk/predictive";

export type SnapshotOrigem =
  | "manual"
  | "intervencao"
  | "status"
  | "batch"
  | "seed";

export type RiscoSnapshot = {
  id: string;
  alunoId: string;
  instituicaoId: string;
  capturadoEm: string;
  frequencia: number;
  desempenho: number;
  faltasConsecutivas: number;
  ocorrencias: number;
  participacao: number;
  riscoPercentual: number;
  riscoNivel: RiskLevel;
  fatoresRisco: string[];
  explicacaoAtlas: string;
  projecao14d: number;
  tendencia: TendenciaRisco;
  probabilidadeEvasao: number;
  modeloVersao: string;
  origem: SnapshotOrigem;
  outcomeRisco: number | null;
  outcomeEm: string | null;
  outcomeFonte: string | null;
};

function slugId(prefix: string) {
  return `${prefix}-${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

export async function registrarSnapshotRisco(input: {
  aluno: Aluno;
  origem: SnapshotOrigem;
  pesos?: Partial<PesosRisco> | null;
  versao?: string;
  capturadoEm?: string;
  outcomeRisco?: number | null;
  outcomeEm?: string | null;
  outcomeFonte?: string | null;
}): Promise<RiscoSnapshot> {
  const pesos = normalizePesos(input.pesos ?? DEFAULT_PESOS);
  const versao = input.versao?.trim() || "v2";
  const preditivo = calcularRiscoPreditivo(input.aluno, { pesos, versao });
  const id = slugId("rs");
  const capturadoEm = input.capturadoEm ?? new Date().toISOString();

  await query(
    `INSERT INTO risco_snapshots (
       id, aluno_id, instituicao_id, capturado_em,
       frequencia, desempenho, faltas_consecutivas, ocorrencias, participacao,
       risco_percentual, risco_nivel, fatores_risco, explicacao_atlas,
       projecao_14d, tendencia, probabilidade_evasao,
       modelo_versao, origem, outcome_risco, outcome_em, outcome_fonte
     ) VALUES (
       $1,$2,$3,$4,
       $5,$6,$7,$8,$9,
       $10,$11,$12::jsonb,$13,
       $14,$15,$16,
       $17,$18,$19,$20,$21
     )`,
    [
      id,
      input.aluno.id,
      input.aluno.instituicaoId,
      capturadoEm,
      input.aluno.frequencia,
      input.aluno.desempenho,
      input.aluno.faltasConsecutivas,
      input.aluno.ocorrencias,
      input.aluno.participacao,
      preditivo.percentual,
      preditivo.nivel,
      JSON.stringify(preditivo.fatores),
      preditivo.explicacao,
      preditivo.projecao14d,
      preditivo.tendencia,
      preditivo.probabilidadeEvasao,
      versao,
      input.origem,
      input.outcomeRisco ?? null,
      input.outcomeEm ?? null,
      input.outcomeFonte ?? null,
    ]
  );

  return {
    id,
    alunoId: input.aluno.id,
    instituicaoId: input.aluno.instituicaoId,
    capturadoEm,
    frequencia: input.aluno.frequencia,
    desempenho: input.aluno.desempenho,
    faltasConsecutivas: input.aluno.faltasConsecutivas,
    ocorrencias: input.aluno.ocorrencias,
    participacao: input.aluno.participacao,
    riscoPercentual: preditivo.percentual,
    riscoNivel: preditivo.nivel,
    fatoresRisco: preditivo.fatores,
    explicacaoAtlas: preditivo.explicacao,
    projecao14d: preditivo.projecao14d,
    tendencia: preditivo.tendencia,
    probabilidadeEvasao: preditivo.probabilidadeEvasao,
    modeloVersao: versao,
    origem: input.origem,
    outcomeRisco: input.outcomeRisco ?? null,
    outcomeEm: input.outcomeEm ?? null,
    outcomeFonte: input.outcomeFonte ?? null,
  };
}

export async function listSnapshotsByAluno(
  alunoId: string,
  limit = 20
): Promise<RiscoSnapshot[]> {
  const result = await query<{
    id: string;
    aluno_id: string;
    instituicao_id: string;
    capturado_em: Date | string;
    frequencia: string | number;
    desempenho: string | number;
    faltas_consecutivas: number;
    ocorrencias: number;
    participacao: number;
    risco_percentual: number;
    risco_nivel: RiskLevel;
    fatores_risco: string[] | string;
    explicacao_atlas: string;
    projecao_14d: number;
    tendencia: TendenciaRisco;
    probabilidade_evasao: number;
    modelo_versao: string;
    origem: SnapshotOrigem;
    outcome_risco: number | null;
    outcome_em: Date | string | null;
    outcome_fonte: string | null;
  }>(
    `SELECT *
     FROM risco_snapshots
     WHERE aluno_id = $1
     ORDER BY capturado_em DESC
     LIMIT $2`,
    [alunoId, limit]
  );

  return result.rows.map((row) => ({
    id: row.id,
    alunoId: row.aluno_id,
    instituicaoId: row.instituicao_id,
    capturadoEm:
      row.capturado_em instanceof Date
        ? row.capturado_em.toISOString()
        : String(row.capturado_em),
    frequencia: Number(row.frequencia),
    desempenho: Number(row.desempenho),
    faltasConsecutivas: row.faltas_consecutivas,
    ocorrencias: row.ocorrencias,
    participacao: row.participacao,
    riscoPercentual: row.risco_percentual,
    riscoNivel: row.risco_nivel,
    fatoresRisco: Array.isArray(row.fatores_risco)
      ? row.fatores_risco
      : (JSON.parse(String(row.fatores_risco || "[]")) as string[]),
    explicacaoAtlas: row.explicacao_atlas,
    projecao14d: row.projecao_14d,
    tendencia: row.tendencia,
    probabilidadeEvasao: row.probabilidade_evasao,
    modeloVersao: row.modelo_versao,
    origem: row.origem,
    outcomeRisco: row.outcome_risco,
    outcomeEm: row.outcome_em
      ? row.outcome_em instanceof Date
        ? row.outcome_em.toISOString()
        : String(row.outcome_em)
      : null,
    outcomeFonte: row.outcome_fonte,
  }));
}

/**
 * Preenche outcomes de snapshots antigos com o risco atual do aluno
 * (proxy supervisionado quando já passaram ~14 dias ou forçado).
 */
export async function backfillOutcomes(options?: {
  minDays?: number;
  force?: boolean;
}): Promise<number> {
  const minDays = options?.minDays ?? 14;
  const force = options?.force ?? false;

  const result = await query<{ updated: string | number }>(
    force
      ? `WITH updated AS (
           UPDATE risco_snapshots s
           SET outcome_risco = a.risco_percentual,
               outcome_em = NOW(),
               outcome_fonte = 'aluno_atual'
           FROM alunos a
           WHERE a.id = s.aluno_id
             AND s.outcome_risco IS NULL
           RETURNING s.id
         )
         SELECT COUNT(*)::int AS updated FROM updated`
      : `WITH updated AS (
           UPDATE risco_snapshots s
           SET outcome_risco = a.risco_percentual,
               outcome_em = NOW(),
               outcome_fonte = 'aluno_atual'
           FROM alunos a
           WHERE a.id = s.aluno_id
             AND s.outcome_risco IS NULL
             AND s.capturado_em <= NOW() - ($1 || ' days')::interval
           RETURNING s.id
         )
         SELECT COUNT(*)::int AS updated FROM updated`,
    force ? [] : [String(minDays)]
  );

  return Number(result.rows[0]?.updated ?? 0);
}

export async function countSnapshots(): Promise<{
  total: number;
  comOutcome: number;
}> {
  const result = await query<{ total: string | number; com_outcome: string | number }>(
    `SELECT
       COUNT(*)::int AS total,
       COUNT(*) FILTER (WHERE outcome_risco IS NOT NULL)::int AS com_outcome
     FROM risco_snapshots`
  );
  return {
    total: Number(result.rows[0]?.total ?? 0),
    comOutcome: Number(result.rows[0]?.com_outcome ?? 0),
  };
}
