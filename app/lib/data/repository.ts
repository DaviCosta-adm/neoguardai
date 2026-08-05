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
  IndicadoresAluno,
  Intervencao,
  TimelineEvent,
  TipoIntervencao,
  Usuario,
} from "@/app/lib/types";
import { calcularRiscoPreditivo } from "@/app/lib/risk/predictive";
import { notificarRiscoCritico } from "@/app/lib/email/alerts";
import { assertPodeCriarAluno } from "@/app/lib/data/plan-limits";

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

function parseIndicadores(input: Partial<IndicadoresAluno>): IndicadoresAluno {
  const frequencia = Number(input.frequencia);
  const desempenho = Number(input.desempenho);
  const faltasConsecutivas = Number(input.faltasConsecutivas);
  const ocorrencias = Number(input.ocorrencias);
  const participacao = Number(input.participacao);

  if (
    [frequencia, desempenho, faltasConsecutivas, ocorrencias, participacao].some(
      (v) => Number.isNaN(v)
    )
  ) {
    throw new Error("Indicadores inválidos.");
  }

  return {
    frequencia: Math.min(100, Math.max(0, frequencia)),
    desempenho: Math.min(10, Math.max(0, desempenho)),
    faltasConsecutivas: Math.max(0, Math.round(faltasConsecutivas)),
    ocorrencias: Math.max(0, Math.round(ocorrencias)),
    participacao: Math.min(100, Math.max(0, Math.round(participacao))),
  };
}

export async function atualizarIndicadoresAluno(
  auth: AuthContext,
  alunoId: string,
  indicadoresInput: Partial<IndicadoresAluno>,
  options?: { notificar?: boolean }
): Promise<Aluno> {
  if (
    auth.user.role !== "coordenacao" &&
    auth.user.role !== "admin_instituicao" &&
    auth.user.role !== "admin_neoguard"
  ) {
    throw new Error("Sem permissão para editar indicadores.");
  }

  const aluno = await getAlunoById(auth, alunoId);
  if (!aluno) {
    throw new Error("Aluno não encontrado.");
  }

  const indicadores = parseIndicadores(indicadoresInput);
  const { pesos, versao } = await getPesosAtivos();
  const preditivo = calcularRiscoPreditivo(indicadores, { pesos, versao });
  const agora = new Date().toISOString();
  const nivelAnterior = aluno.riscoNivel;

  await query(
    `UPDATE alunos
     SET frequencia = $2,
         desempenho = $3,
         faltas_consecutivas = $4,
         ocorrencias = $5,
         participacao = $6,
         risco_percentual = $7,
         risco_nivel = $8,
         fatores_risco = $9::jsonb,
         explicacao_atlas = $10,
         atualizado_em = $11
     WHERE id = $1`,
    [
      aluno.id,
      indicadores.frequencia,
      indicadores.desempenho,
      indicadores.faltasConsecutivas,
      indicadores.ocorrencias,
      indicadores.participacao,
      preditivo.percentual,
      preditivo.nivel,
      JSON.stringify(preditivo.fatores),
      preditivo.explicacao,
      agora,
    ]
  );

  await query(
    `INSERT INTO timeline_events
      (id, aluno_id, tipo, titulo, descricao, criado_em)
     VALUES ($1,$2,'atualizacao_risco',$3,$4,$5)`,
    [
      `tl-${crypto.randomUUID()}`,
      aluno.id,
      "Indicadores atualizados",
      `Score ${preditivo.percentual}% (${preditivo.nivel}) · modelo ${versao}.`,
      agora,
    ]
  );

  const atualizado: Aluno = {
    ...aluno,
    ...indicadores,
    riscoPercentual: preditivo.percentual,
    riscoNivel: preditivo.nivel,
    fatoresRisco: preditivo.fatores,
    explicacaoAtlas: preditivo.explicacao,
    atualizadoEm: agora,
  };

  await registrarSnapshotRisco({
    aluno: atualizado,
    origem: "manual",
    pesos,
    versao,
    capturadoEm: agora,
  });

  if (options?.notificar !== false) {
    try {
      await notificarRiscoCritico({
        aluno: atualizado,
        nivelAnterior,
        percentual: preditivo.percentual,
        nivel: preditivo.nivel,
        explicacao: preditivo.explicacao,
      });
    } catch (error) {
      console.error("Falha ao notificar risco crítico:", error);
    }
  }

  return atualizado;
}

export async function buscarAlunos(
  auth: AuthContext,
  termo: string,
  limit = 8
): Promise<Aluno[]> {
  const q = termo.trim();
  if (q.length < 2) return [];

  const alunos = await listarAlunosPorPrioridade(auth);
  const lower = q.toLowerCase();
  return alunos
    .filter(
      (aluno) =>
        aluno.nome.toLowerCase().includes(lower) ||
        aluno.turma.toLowerCase().includes(lower) ||
        aluno.serie.toLowerCase().includes(lower)
    )
    .slice(0, limit);
}

export async function importarIndicadoresCsv(
  auth: AuthContext,
  csvText: string
): Promise<{ atualizados: number; criados: number; erros: string[] }> {
  if (
    auth.user.role !== "coordenacao" &&
    auth.user.role !== "admin_instituicao" &&
    auth.user.role !== "admin_neoguard"
  ) {
    throw new Error("Sem permissão para importar indicadores.");
  }

  if (auth.user.role === "admin_neoguard") {
    throw new Error(
      "Importe como admin/coordenação da instituição (multi-tenant)."
    );
  }

  const linhas = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (linhas.length < 2) {
    throw new Error("CSV vazio. Inclua cabeçalho e ao menos uma linha.");
  }

  const header = linhas[0].toLowerCase().split(",").map((h) => h.trim());
  const required = [
    "nome",
    "turma",
    "serie",
    "frequencia",
    "desempenho",
    "faltas_consecutivas",
    "ocorrencias",
    "participacao",
  ];
  for (const col of required) {
    if (!header.includes(col)) {
      throw new Error(`CSV precisa da coluna "${col}".`);
    }
  }

  const idx = (name: string) => header.indexOf(name);
  const existentes = await listarAlunosPorPrioridade(auth);
  const byNome = new Map(
    existentes.map((a) => [a.nome.trim().toLowerCase(), a])
  );

  let atualizados = 0;
  let criados = 0;
  const erros: string[] = [];

  for (let i = 1; i < linhas.length; i += 1) {
    const cols = linhas[i].split(",").map((c) => c.trim());
    try {
      const nome = cols[idx("nome")];
      const turma = cols[idx("turma")];
      const serie = cols[idx("serie")];
      const indicadores = parseIndicadores({
        frequencia: Number(cols[idx("frequencia")]),
        desempenho: Number(cols[idx("desempenho")]),
        faltasConsecutivas: Number(cols[idx("faltas_consecutivas")]),
        ocorrencias: Number(cols[idx("ocorrencias")]),
        participacao: Number(cols[idx("participacao")]),
      });

      if (!nome || !turma || !serie) {
        throw new Error("nome/turma/série obrigatórios");
      }

      const atual = byNome.get(nome.toLowerCase());
      if (atual) {
        await atualizarIndicadoresAluno(auth, atual.id, indicadores, {
          notificar: false,
        });
        atualizados += 1;
      } else {
        await assertPodeCriarAluno(auth.user.instituicaoId);
        const { pesos, versao } = await getPesosAtivos();
        const preditivo = calcularRiscoPreditivo(indicadores, {
          pesos,
          versao,
        });
        const id = `alu-${crypto.randomUUID().replace(/-/g, "").slice(0, 10)}`;
        const agora = new Date().toISOString();
        await query(
          `INSERT INTO alunos (
             id, instituicao_id, nome, turma, serie,
             frequencia, desempenho, faltas_consecutivas, ocorrencias, participacao,
             risco_percentual, risco_nivel, fatores_risco, explicacao_atlas,
             status_acompanhamento, atualizado_em
           ) VALUES (
             $1,$2,$3,$4,$5,
             $6,$7,$8,$9,$10,
             $11,$12,$13::jsonb,$14,
             'novo',$15
           )`,
          [
            id,
            auth.user.instituicaoId,
            nome,
            turma,
            serie,
            indicadores.frequencia,
            indicadores.desempenho,
            indicadores.faltasConsecutivas,
            indicadores.ocorrencias,
            indicadores.participacao,
            preditivo.percentual,
            preditivo.nivel,
            JSON.stringify(preditivo.fatores),
            preditivo.explicacao,
            agora,
          ]
        );
        const novo: Aluno = {
          id,
          instituicaoId: auth.user.instituicaoId,
          nome,
          turma,
          serie,
          ...indicadores,
          riscoPercentual: preditivo.percentual,
          riscoNivel: preditivo.nivel,
          fatoresRisco: preditivo.fatores,
          explicacaoAtlas: preditivo.explicacao,
          statusAcompanhamento: "novo",
          atualizadoEm: agora,
        };
        await registrarSnapshotRisco({
          aluno: novo,
          origem: "batch",
          pesos,
          versao,
          capturadoEm: agora,
        });
        byNome.set(nome.toLowerCase(), novo);
        criados += 1;
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "erro desconhecido";
      erros.push(`Linha ${i + 1}: ${message}`);
    }
  }

  return { atualizados, criados, erros };
}
