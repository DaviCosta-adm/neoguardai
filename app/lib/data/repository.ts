import "server-only";

import type { AuthContext } from "@/app/lib/auth/dal";
import { listUsuarios } from "@/app/lib/auth/users";
import { prioridadeRisco } from "@/app/lib/data/labels";
import {
  mapAlerta,
  mapAluno,
  mapIntervencao,
  mapTimeline,
  type AlertaRow,
  type AlunoRow,
  type IntervencaoRow,
  type TimelineRow,
} from "@/app/lib/data/mappers";
import { getPesosAtivos } from "@/app/lib/data/modelo-risco";
import { registrarSnapshotRisco } from "@/app/lib/data/risco-snapshots";
import { query } from "@/app/lib/db/client";
import type {
  Alerta,
  Aluno,
  DashboardResumo,
  Intervencao,
  TimelineEvent,
  TipoIntervencao,
  Usuario,
} from "@/app/lib/types";

function alunosScopeSql(
  auth: AuthContext,
  alias = ""
): {
  where: string;
  params: unknown[];
} {
  const col = (name: string) => (alias ? `${alias}.${name}` : name);

  if (auth.user.role === "admin_neoguard") {
    return { where: "TRUE", params: [] };
  }

  if (auth.user.role === "especialista") {
    return {
      where: `${col("instituicao_id")} = $1 AND ${col("status_acompanhamento")} = 'encaminhado'`,
      params: [auth.user.instituicaoId],
    };
  }

  return {
    where: `${col("instituicao_id")} = $1`,
    params: [auth.user.instituicaoId],
  };
}

export async function listarAlunosPorPrioridade(
  auth: AuthContext
): Promise<Aluno[]> {
  const scope = alunosScopeSql(auth);
  const result = await query<AlunoRow>(
    `SELECT * FROM alunos WHERE ${scope.where}`,
    scope.params
  );

  return result.rows
    .map(mapAluno)
    .sort((a, b) => {
      const diff = prioridadeRisco[a.riscoNivel] - prioridadeRisco[b.riscoNivel];
      if (diff !== 0) return diff;
      return b.riscoPercentual - a.riscoPercentual;
    });
}

export async function getAlunoById(
  auth: AuthContext,
  id: string
): Promise<Aluno | null> {
  const scope = alunosScopeSql(auth);
  const params = [...scope.params, id];
  const idParam = `$${params.length}`;

  const result = await query<AlunoRow>(
    `SELECT * FROM alunos WHERE ${scope.where} AND id = ${idParam} LIMIT 1`,
    params
  );

  const row = result.rows[0];
  return row ? mapAluno(row) : null;
}

export async function getAlertasDoAluno(
  auth: AuthContext,
  alunoId: string
): Promise<Alerta[]> {
  const aluno = await getAlunoById(auth, alunoId);
  if (!aluno) return [];

  const result = await query<AlertaRow>(
    `SELECT * FROM alertas
     WHERE aluno_id = $1 AND ativo = TRUE
     ORDER BY criado_em DESC`,
    [alunoId]
  );

  return result.rows.map(mapAlerta);
}

export async function getIntervencoesDoAluno(
  auth: AuthContext,
  alunoId: string
): Promise<Intervencao[]> {
  const aluno = await getAlunoById(auth, alunoId);
  if (!aluno) return [];

  const result = await query<IntervencaoRow>(
    `SELECT * FROM intervencoes
     WHERE aluno_id = $1
     ORDER BY realizado_em DESC`,
    [alunoId]
  );

  return result.rows.map(mapIntervencao);
}

export async function getTimelineDoAluno(
  auth: AuthContext,
  alunoId: string
): Promise<TimelineEvent[]> {
  const aluno = await getAlunoById(auth, alunoId);
  if (!aluno) return [];

  const result = await query<TimelineRow>(
    `SELECT * FROM timeline_events
     WHERE aluno_id = $1
     ORDER BY criado_em DESC`,
    [alunoId]
  );

  return result.rows.map(mapTimeline);
}

export async function getAlertasAtivos(auth: AuthContext): Promise<Alerta[]> {
  const scope = alunosScopeSql(auth, "al");
  const result = await query<AlertaRow>(
    `SELECT a.*
     FROM alertas a
     INNER JOIN alunos al ON al.id = a.aluno_id
     WHERE a.ativo = TRUE AND (${scope.where})
     ORDER BY a.criado_em DESC`,
    scope.params
  );

  return result.rows
    .map(mapAlerta)
    .sort((a, b) => prioridadeRisco[a.nivel] - prioridadeRisco[b.nivel]);
}

export async function getIntervencoes(
  auth: AuthContext
): Promise<Intervencao[]> {
  const scope = alunosScopeSql(auth, "al");
  const result = await query<IntervencaoRow>(
    `SELECT i.*
     FROM intervencoes i
     INNER JOIN alunos al ON al.id = i.aluno_id
     WHERE (${scope.where})
     ORDER BY i.realizado_em DESC`,
    scope.params
  );

  return result.rows.map(mapIntervencao);
}

export async function getResumoDashboard(
  auth: AuthContext
): Promise<DashboardResumo> {
  const alunos = await listarAlunosPorPrioridade(auth);
  const alertas = await getAlertasAtivos(auth);
  const intervencoes = await getIntervencoes(auth);

  const frequenciaMedia =
    alunos.reduce((acc, aluno) => acc + aluno.frequencia, 0) /
    (alunos.length || 1);

  return {
    totalEstudantes: alunos.length,
    riscoBaixo: alunos.filter((a) => a.riscoNivel === "baixo").length,
    riscoMedio: alunos.filter((a) => a.riscoNivel === "medio").length,
    riscoAlto: alunos.filter((a) => a.riscoNivel === "alto").length,
    riscoCritico: alunos.filter((a) => a.riscoNivel === "critico").length,
    novosAlertas: alertas.length,
    casosImediatos: alunos.filter(
      (a) => a.riscoNivel === "alto" || a.riscoNivel === "critico"
    ).length,
    frequenciaMedia: Number(frequenciaMedia.toFixed(1)),
    intervencoesPendentes: intervencoes.filter(
      (i) => i.status === "pendente" || i.status === "agendada"
    ).length,
  };
}

export async function listarUsuariosDaInstituicao(
  auth: AuthContext
): Promise<Usuario[]> {
  if (
    auth.user.role !== "admin_instituicao" &&
    auth.user.role !== "admin_neoguard" &&
    auth.user.role !== "coordenacao"
  ) {
    return [auth.user];
  }

  if (auth.user.role === "admin_neoguard") {
    return listUsuarios();
  }

  return listUsuarios({ instituicaoId: auth.user.instituicaoId });
}

export async function registrarIntervencao(
  auth: AuthContext,
  input: {
    alunoId: string;
    tipo: TipoIntervencao;
    descricao: string;
    status?: Intervencao["status"];
    proximaRevisao?: string;
  }
): Promise<Intervencao | null> {
  const aluno = await getAlunoById(auth, input.alunoId);
  if (!aluno) return null;

  const descricao = input.descricao.trim();
  if (!descricao) return null;

  const id = `int-${crypto.randomUUID()}`;
  const timelineId = `tl-${crypto.randomUUID()}`;
  const agora = new Date().toISOString();
  const status = input.status ?? "concluida";

  await query(
    `INSERT INTO intervencoes
      (id, aluno_id, tipo, descricao, realizado_por, realizado_em, status, proxima_revisao)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [
      id,
      input.alunoId,
      input.tipo,
      descricao,
      auth.user.nome,
      agora,
      status,
      input.proximaRevisao ?? null,
    ]
  );

  await query(
    `INSERT INTO timeline_events
      (id, aluno_id, tipo, titulo, descricao, criado_em)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [
      timelineId,
      input.alunoId,
      input.tipo === "encaminhamento_especialista"
        ? "encaminhamento"
        : "intervencao",
      "Nova intervenção registrada",
      descricao,
      agora,
    ]
  );

  if (input.tipo === "encaminhamento_especialista") {
    await query(
      `UPDATE alunos
       SET status_acompanhamento = 'encaminhado', atualizado_em = $2
       WHERE id = $1`,
      [input.alunoId, agora]
    );
  }

  try {
    const { pesos, versao } = await getPesosAtivos();
    await registrarSnapshotRisco({
      aluno,
      origem: "intervencao",
      pesos,
      versao,
      capturadoEm: agora,
    });
  } catch (error) {
    console.error("Falha ao registrar snapshot de risco:", error);
  }

  return {
    id,
    alunoId: input.alunoId,
    tipo: input.tipo,
    descricao,
    realizadoPor: auth.user.nome,
    realizadoEm: agora,
    status,
    proximaRevisao: input.proximaRevisao,
  };
}
