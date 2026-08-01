import type {
  Alerta,
  Aluno,
  Intervencao,
  RiskLevel,
  TimelineEvent,
  TimelineTipo,
  TipoIntervencao,
  AcompanhamentoStatus,
  StatusIntervencao,
} from "@/app/lib/types";

export type AlunoRow = {
  id: string;
  instituicao_id: string;
  nome: string;
  turma: string;
  serie: string;
  frequencia: string | number;
  desempenho: string | number;
  faltas_consecutivas: number;
  ocorrencias: number;
  participacao: number;
  risco_percentual: number;
  risco_nivel: RiskLevel;
  fatores_risco: string[] | string;
  explicacao_atlas: string;
  status_acompanhamento: AcompanhamentoStatus;
  atualizado_em: Date | string;
};

export type AlertaRow = {
  id: string;
  aluno_id: string;
  titulo: string;
  descricao: string;
  nivel: RiskLevel;
  criado_em: Date | string;
  ativo: boolean;
};

export type IntervencaoRow = {
  id: string;
  aluno_id: string;
  tipo: TipoIntervencao;
  descricao: string;
  realizado_por: string;
  realizado_em: Date | string;
  status: StatusIntervencao;
  proxima_revisao: Date | string | null;
};

export type TimelineRow = {
  id: string;
  aluno_id: string;
  tipo: TimelineTipo;
  titulo: string;
  descricao: string;
  criado_em: Date | string;
};

function toIso(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function parseFatores(value: string[] | string): string[] {
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function mapAluno(row: AlunoRow): Aluno {
  return {
    id: row.id,
    instituicaoId: row.instituicao_id,
    nome: row.nome,
    turma: row.turma,
    serie: row.serie,
    frequencia: Number(row.frequencia),
    desempenho: Number(row.desempenho),
    faltasConsecutivas: row.faltas_consecutivas,
    ocorrencias: row.ocorrencias,
    participacao: row.participacao,
    riscoPercentual: row.risco_percentual,
    riscoNivel: row.risco_nivel,
    fatoresRisco: parseFatores(row.fatores_risco),
    explicacaoAtlas: row.explicacao_atlas,
    statusAcompanhamento: row.status_acompanhamento,
    atualizadoEm: toIso(row.atualizado_em),
  };
}

export function mapAlerta(row: AlertaRow): Alerta {
  return {
    id: row.id,
    alunoId: row.aluno_id,
    titulo: row.titulo,
    descricao: row.descricao,
    nivel: row.nivel,
    criadoEm: toIso(row.criado_em),
    ativo: row.ativo,
  };
}

export function mapIntervencao(row: IntervencaoRow): Intervencao {
  return {
    id: row.id,
    alunoId: row.aluno_id,
    tipo: row.tipo,
    descricao: row.descricao,
    realizadoPor: row.realizado_por,
    realizadoEm: toIso(row.realizado_em),
    status: row.status,
    proximaRevisao: row.proxima_revisao ? toIso(row.proxima_revisao) : undefined,
  };
}

export function mapTimeline(row: TimelineRow): TimelineEvent {
  return {
    id: row.id,
    alunoId: row.aluno_id,
    tipo: row.tipo,
    titulo: row.titulo,
    descricao: row.descricao,
    criadoEm: toIso(row.criado_em),
  };
}
