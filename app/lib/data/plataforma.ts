import "server-only";

import { query } from "@/app/lib/db/client";
import type { InstituicaoResumo, PlataformaResumo } from "@/app/lib/types";

type InstituicaoMetricRow = {
  id: string;
  nome: string;
  total_estudantes: string | number;
  casos_imediatos: string | number;
  risco_critico: string | number;
  risco_alto: string | number;
  alertas_ativos: string | number;
  usuarios: string | number;
  frequencia_media: string | number | null;
};

function toNumber(value: string | number | null | undefined) {
  return Number(value ?? 0);
}

function mapInstituicao(row: InstituicaoMetricRow): InstituicaoResumo {
  return {
    id: row.id,
    nome: row.nome,
    totalEstudantes: toNumber(row.total_estudantes),
    casosImediatos: toNumber(row.casos_imediatos),
    riscoCritico: toNumber(row.risco_critico),
    riscoAlto: toNumber(row.risco_alto),
    alertasAtivos: toNumber(row.alertas_ativos),
    usuarios: toNumber(row.usuarios),
    frequenciaMedia: Number(toNumber(row.frequencia_media).toFixed(1)),
  };
}

export async function listarInstituicoesComMetricas(): Promise<
  InstituicaoResumo[]
> {
  const result = await query<InstituicaoMetricRow>(
    `SELECT
       i.id,
       i.nome,
       COUNT(DISTINCT a.id)::int AS total_estudantes,
       COUNT(DISTINCT a.id) FILTER (
         WHERE a.risco_nivel IN ('alto', 'critico')
       )::int AS casos_imediatos,
       COUNT(DISTINCT a.id) FILTER (
         WHERE a.risco_nivel = 'critico'
       )::int AS risco_critico,
       COUNT(DISTINCT a.id) FILTER (
         WHERE a.risco_nivel = 'alto'
       )::int AS risco_alto,
       COUNT(DISTINCT al.id) FILTER (WHERE al.ativo = TRUE)::int AS alertas_ativos,
       COUNT(DISTINCT u.id)::int AS usuarios,
       COALESCE(AVG(a.frequencia), 0) AS frequencia_media
     FROM instituicoes i
     LEFT JOIN alunos a ON a.instituicao_id = i.id
     LEFT JOIN alertas al ON al.aluno_id = a.id
     LEFT JOIN usuarios u ON u.instituicao_id = i.id
     GROUP BY i.id, i.nome
     ORDER BY i.nome`
  );

  return result.rows.map(mapInstituicao);
}

export async function getInstituicaoResumoById(
  id: string
): Promise<InstituicaoResumo | null> {
  const result = await query<InstituicaoMetricRow>(
    `SELECT
       i.id,
       i.nome,
       COUNT(DISTINCT a.id)::int AS total_estudantes,
       COUNT(DISTINCT a.id) FILTER (
         WHERE a.risco_nivel IN ('alto', 'critico')
       )::int AS casos_imediatos,
       COUNT(DISTINCT a.id) FILTER (
         WHERE a.risco_nivel = 'critico'
       )::int AS risco_critico,
       COUNT(DISTINCT a.id) FILTER (
         WHERE a.risco_nivel = 'alto'
       )::int AS risco_alto,
       COUNT(DISTINCT al.id) FILTER (WHERE al.ativo = TRUE)::int AS alertas_ativos,
       COUNT(DISTINCT u.id)::int AS usuarios,
       COALESCE(AVG(a.frequencia), 0) AS frequencia_media
     FROM instituicoes i
     LEFT JOIN alunos a ON a.instituicao_id = i.id
     LEFT JOIN alertas al ON al.aluno_id = a.id
     LEFT JOIN usuarios u ON u.instituicao_id = i.id
     WHERE i.id = $1
     GROUP BY i.id, i.nome
     LIMIT 1`,
    [id]
  );

  const row = result.rows[0];
  return row ? mapInstituicao(row) : null;
}

export async function getResumoPlataforma(): Promise<PlataformaResumo> {
  const instituicoes = await listarInstituicoesComMetricas();

  const totalEstudantes = instituicoes.reduce(
    (acc, item) => acc + item.totalEstudantes,
    0
  );
  const casosImediatos = instituicoes.reduce(
    (acc, item) => acc + item.casosImediatos,
    0
  );
  const alertasAtivos = instituicoes.reduce(
    (acc, item) => acc + item.alertasAtivos,
    0
  );
  const totalUsuarios = instituicoes.reduce(
    (acc, item) => acc + item.usuarios,
    0
  );

  const frequenciaMedia =
    totalEstudantes === 0
      ? 0
      : Number(
          (
            instituicoes.reduce(
              (acc, item) => acc + item.frequenciaMedia * item.totalEstudantes,
              0
            ) / totalEstudantes
          ).toFixed(1)
        );

  const intervencoes = await query<{ total: string | number }>(
    `SELECT COUNT(*)::int AS total
     FROM intervencoes
     WHERE status IN ('pendente', 'agendada')`
  );

  return {
    totalInstituicoes: instituicoes.length,
    totalUsuarios,
    totalEstudantes,
    casosImediatos,
    alertasAtivos,
    intervencoesPendentes: toNumber(intervencoes.rows[0]?.total),
    frequenciaMedia,
    instituicoes,
  };
}
