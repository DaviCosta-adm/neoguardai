/** Modelo de domínio mínimo do NeoGuardAI (pré-persistência). */

export type UserRole =
  | "coordenacao"
  | "especialista"
  | "admin_instituicao"
  | "admin_neoguard";

export type RiskLevel = "baixo" | "medio" | "alto" | "critico";

export type AcompanhamentoStatus =
  | "novo"
  | "em_acompanhamento"
  | "encaminhado"
  | "estavel"
  | "critico";

export type TipoIntervencao =
  | "conversa_aluno"
  | "contato_familia"
  | "reuniao"
  | "acompanhamento_semanal"
  | "encaminhamento_especialista"
  | "plano_permanencia"
  | "revisao_caso";

export type StatusIntervencao = "pendente" | "concluida" | "agendada";

export type TimelineTipo =
  | "alerta"
  | "intervencao"
  | "observacao"
  | "encaminhamento"
  | "atualizacao_risco";

export interface Instituicao {
  id: string;
  nome: string;
}

export type AssinaturaStatus = "ativo" | "inativo" | "bloqueado";

export interface Plano {
  id: string;
  nome: string;
  descricao: string;
  precoCentavos: number;
  moeda: string;
  intervalo: string;
  maxAlunos: number;
  maxUsuarios: number;
  stripeProductId: string | null;
  stripePriceId: string | null;
  ativo: boolean;
  ordem: number;
}

export interface Assinatura {
  id: string;
  instituicaoId: string;
  instituicaoNome: string;
  status: AssinaturaStatus;
  plano: string;
  planoId: string;
  planoNome: string;
  iniciadaEm: string;
  atualizadaEm: string;
  observacao: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  instituicaoId: string;
}

export interface IndicadoresAluno {
  frequencia: number;
  desempenho: number;
  faltasConsecutivas: number;
  ocorrencias: number;
  participacao: number;
}

export interface Aluno extends IndicadoresAluno {
  id: string;
  instituicaoId: string;
  nome: string;
  turma: string;
  serie: string;
  riscoPercentual: number;
  riscoNivel: RiskLevel;
  fatoresRisco: string[];
  explicacaoAtlas: string;
  statusAcompanhamento: AcompanhamentoStatus;
  atualizadoEm: string;
}

export interface Alerta {
  id: string;
  alunoId: string;
  titulo: string;
  descricao: string;
  nivel: RiskLevel;
  criadoEm: string;
  ativo: boolean;
}

export interface Intervencao {
  id: string;
  alunoId: string;
  tipo: TipoIntervencao;
  descricao: string;
  realizadoPor: string;
  realizadoEm: string;
  status: StatusIntervencao;
  proximaRevisao?: string;
}

export interface TimelineEvent {
  id: string;
  alunoId: string;
  tipo: TimelineTipo;
  titulo: string;
  descricao: string;
  criadoEm: string;
}

export interface DashboardResumo {
  totalEstudantes: number;
  riscoBaixo: number;
  riscoMedio: number;
  riscoAlto: number;
  riscoCritico: number;
  novosAlertas: number;
  casosImediatos: number;
  frequenciaMedia: number;
  intervencoesPendentes: number;
}

export interface InstituicaoResumo extends Instituicao {
  totalEstudantes: number;
  casosImediatos: number;
  riscoCritico: number;
  riscoAlto: number;
  alertasAtivos: number;
  usuarios: number;
  frequenciaMedia: number;
}

export interface PlataformaResumo {
  totalInstituicoes: number;
  totalUsuarios: number;
  totalEstudantes: number;
  casosImediatos: number;
  alertasAtivos: number;
  intervencoesPendentes: number;
  frequenciaMedia: number;
  instituicoes: InstituicaoResumo[];
}

export type StatusEncaminhamento = "aberto" | "em_atendimento" | "concluido";

export type TipoDevolutiva =
  | "atendimento"
  | "observacao"
  | "devolutiva"
  | "recomendacao";

export interface Encaminhamento {
  id: string;
  alunoId: string;
  instituicaoId: string;
  especialistaId?: string;
  criadoPor: string;
  motivo: string;
  status: StatusEncaminhamento;
  criadoEm: string;
  atualizadoEm: string;
}

export interface Devolutiva {
  id: string;
  encaminhamentoId: string;
  autorId: string;
  tipo: TipoDevolutiva;
  conteudo: string;
  criadoEm: string;
}

export type EncaminhamentoDetalhe = Encaminhamento & {
  alunoNome: string;
  alunoTurma: string;
  riscoNivel: RiskLevel;
  riscoPercentual: number;
  especialistaNome?: string;
  criadoPorNome: string;
};
