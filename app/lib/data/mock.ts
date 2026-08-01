import { calcularRisco } from "@/app/lib/risk/score";
import type {
  Alerta,
  Aluno,
  DashboardResumo,
  IndicadoresAluno,
  Instituicao,
  Intervencao,
  TimelineEvent,
  Usuario,
} from "@/app/lib/types";

export const instituicaoAtual: Instituicao = {
  id: "inst-001",
  nome: "Colégio Horizonte",
};

export const usuarioAtual: Usuario = {
  id: "user-001",
  nome: "Ana Coordenadora",
  email: "ana@horizonte.edu.br",
  role: "coordenacao",
  instituicaoId: instituicaoAtual.id,
};

type AlunoSeed = {
  id: string;
  nome: string;
  turma: string;
  serie: string;
  indicadores: IndicadoresAluno;
  statusAcompanhamento: Aluno["statusAcompanhamento"];
  atualizadoEm: string;
};

const seeds: AlunoSeed[] = [
  {
    id: "alu-001",
    nome: "Lucas Ferreira",
    turma: "3º A",
    serie: "3º Ano EM",
    indicadores: {
      frequencia: 68,
      desempenho: 4.8,
      faltasConsecutivas: 6,
      ocorrencias: 2,
      participacao: 35,
    },
    statusAcompanhamento: "critico",
    atualizadoEm: "2026-07-30T14:20:00.000Z",
  },
  {
    id: "alu-002",
    nome: "Mariana Souza",
    turma: "2º B",
    serie: "2º Ano EM",
    indicadores: {
      frequencia: 78,
      desempenho: 5.9,
      faltasConsecutivas: 3,
      ocorrencias: 1,
      participacao: 48,
    },
    statusAcompanhamento: "em_acompanhamento",
    atualizadoEm: "2026-07-31T09:10:00.000Z",
  },
  {
    id: "alu-003",
    nome: "Pedro Almeida",
    turma: "1º C",
    serie: "1º Ano EM",
    indicadores: {
      frequencia: 91,
      desempenho: 7.4,
      faltasConsecutivas: 0,
      ocorrencias: 0,
      participacao: 72,
    },
    statusAcompanhamento: "estavel",
    atualizadoEm: "2026-07-29T16:45:00.000Z",
  },
  {
    id: "alu-004",
    nome: "Beatriz Lima",
    turma: "9º A",
    serie: "9º Ano EF",
    indicadores: {
      frequencia: 82,
      desempenho: 6.1,
      faltasConsecutivas: 2,
      ocorrencias: 1,
      participacao: 55,
    },
    statusAcompanhamento: "novo",
    atualizadoEm: "2026-08-01T11:00:00.000Z",
  },
  {
    id: "alu-005",
    nome: "Rafael Costa",
    turma: "3º B",
    serie: "3º Ano EM",
    indicadores: {
      frequencia: 71,
      desempenho: 5.2,
      faltasConsecutivas: 4,
      ocorrencias: 3,
      participacao: 30,
    },
    statusAcompanhamento: "encaminhado",
    atualizadoEm: "2026-07-28T13:30:00.000Z",
  },
  {
    id: "alu-006",
    nome: "Camila Rocha",
    turma: "2º A",
    serie: "2º Ano EM",
    indicadores: {
      frequencia: 88,
      desempenho: 8.1,
      faltasConsecutivas: 1,
      ocorrencias: 0,
      participacao: 80,
    },
    statusAcompanhamento: "estavel",
    atualizadoEm: "2026-07-27T10:15:00.000Z",
  },
  {
    id: "alu-007",
    nome: "Thiago Martins",
    turma: "1º A",
    serie: "1º Ano EM",
    indicadores: {
      frequencia: 74,
      desempenho: 5.5,
      faltasConsecutivas: 3,
      ocorrencias: 2,
      participacao: 42,
    },
    statusAcompanhamento: "em_acompanhamento",
    atualizadoEm: "2026-07-31T18:00:00.000Z",
  },
  {
    id: "alu-008",
    nome: "Julia Nascimento",
    turma: "8º B",
    serie: "8º Ano EF",
    indicadores: {
      frequencia: 95,
      desempenho: 8.6,
      faltasConsecutivas: 0,
      ocorrencias: 0,
      participacao: 88,
    },
    statusAcompanhamento: "estavel",
    atualizadoEm: "2026-07-26T08:40:00.000Z",
  },
];

export const alunosMock: Aluno[] = seeds.map((seed) => {
  const risco = calcularRisco(seed.indicadores);
  return {
    id: seed.id,
    instituicaoId: instituicaoAtual.id,
    nome: seed.nome,
    turma: seed.turma,
    serie: seed.serie,
    ...seed.indicadores,
    riscoPercentual: risco.percentual,
    riscoNivel: risco.nivel,
    fatoresRisco: risco.fatores,
    explicacaoAtlas: risco.explicacao,
    statusAcompanhamento: seed.statusAcompanhamento,
    atualizadoEm: seed.atualizadoEm,
  };
});

export const alertasMock: Alerta[] = [
  {
    id: "alt-001",
    alunoId: "alu-001",
    titulo: "Queda crítica de frequência",
    descricao: "Seis faltas consecutivas nas últimas duas semanas.",
    nivel: "critico",
    criadoEm: "2026-07-30T14:20:00.000Z",
    ativo: true,
  },
  {
    id: "alt-002",
    alunoId: "alu-005",
    titulo: "Risco alto de evasão",
    descricao: "Desempenho em queda e baixa participação combinados.",
    nivel: "alto",
    criadoEm: "2026-07-28T13:30:00.000Z",
    ativo: true,
  },
  {
    id: "alt-003",
    alunoId: "alu-002",
    titulo: "Frequência abaixo do esperado",
    descricao: "Três faltas consecutivas e participação reduzida.",
    nivel: "medio",
    criadoEm: "2026-07-31T09:10:00.000Z",
    ativo: true,
  },
  {
    id: "alt-004",
    alunoId: "alu-007",
    titulo: "Novo sinal de risco",
    descricao: "Indicadores combinados apontam necessidade de acompanhamento.",
    nivel: "alto",
    criadoEm: "2026-07-31T18:00:00.000Z",
    ativo: true,
  },
  {
    id: "alt-005",
    alunoId: "alu-004",
    titulo: "Monitorar evolução",
    descricao: "Primeiros sinais de queda de engajamento.",
    nivel: "medio",
    criadoEm: "2026-08-01T11:00:00.000Z",
    ativo: true,
  },
];

export const intervencoesMock: Intervencao[] = [
  {
    id: "int-001",
    alunoId: "alu-001",
    tipo: "contato_familia",
    descricao: "Contato telefônico com a responsável sobre as faltas.",
    realizadoPor: "Ana Coordenadora",
    realizadoEm: "2026-07-29T15:00:00.000Z",
    status: "concluida",
  },
  {
    id: "int-002",
    alunoId: "alu-001",
    tipo: "acompanhamento_semanal",
    descricao: "Check-in semanal agendado com a coordenação.",
    realizadoPor: "Ana Coordenadora",
    realizadoEm: "2026-07-30T10:00:00.000Z",
    status: "agendada",
    proximaRevisao: "2026-08-06T10:00:00.000Z",
  },
  {
    id: "int-003",
    alunoId: "alu-005",
    tipo: "encaminhamento_especialista",
    descricao: "Encaminhado para orientação educacional.",
    realizadoPor: "Ana Coordenadora",
    realizadoEm: "2026-07-28T14:00:00.000Z",
    status: "concluida",
  },
  {
    id: "int-004",
    alunoId: "alu-002",
    tipo: "conversa_aluno",
    descricao: "Conversa acolhedora sobre rotina e dificuldades.",
    realizadoPor: "Ana Coordenadora",
    realizadoEm: "2026-07-31T11:30:00.000Z",
    status: "concluida",
  },
  {
    id: "int-005",
    alunoId: "alu-007",
    tipo: "reuniao",
    descricao: "Reunião com família e professor tutor.",
    realizadoPor: "Ana Coordenadora",
    realizadoEm: "2026-08-02T14:00:00.000Z",
    status: "pendente",
    proximaRevisao: "2026-08-02T14:00:00.000Z",
  },
  {
    id: "int-006",
    alunoId: "alu-004",
    tipo: "plano_permanencia",
    descricao: "Elaborar plano de permanência preventivo.",
    realizadoPor: "Ana Coordenadora",
    realizadoEm: "2026-08-01T12:00:00.000Z",
    status: "pendente",
  },
];

export const timelineMock: TimelineEvent[] = [
  {
    id: "tl-001",
    alunoId: "alu-001",
    tipo: "atualizacao_risco",
    titulo: "Risco elevado para crítico",
    descricao: "Score atualizado após nova sequência de faltas.",
    criadoEm: "2026-07-30T14:20:00.000Z",
  },
  {
    id: "tl-002",
    alunoId: "alu-001",
    tipo: "intervencao",
    titulo: "Contato com a família",
    descricao: "Responsável foi informada e combinou retorno semanal.",
    criadoEm: "2026-07-29T15:00:00.000Z",
  },
  {
    id: "tl-003",
    alunoId: "alu-001",
    tipo: "alerta",
    titulo: "Alerta de frequência",
    descricao: "Sistema sinalizou 6 faltas consecutivas.",
    criadoEm: "2026-07-28T09:00:00.000Z",
  },
  {
    id: "tl-004",
    alunoId: "alu-005",
    tipo: "encaminhamento",
    titulo: "Encaminhado ao especialista",
    descricao: "Caso enviado para orientação educacional.",
    criadoEm: "2026-07-28T14:00:00.000Z",
  },
  {
    id: "tl-005",
    alunoId: "alu-002",
    tipo: "observacao",
    titulo: "Observação da coordenação",
    descricao: "Aluna relatou dificuldade de transporte pela manhã.",
    criadoEm: "2026-07-31T11:40:00.000Z",
  },
];

const prioridadeRisco: Record<Aluno["riscoNivel"], number> = {
  critico: 0,
  alto: 1,
  medio: 2,
  baixo: 3,
};

export function listarAlunosPorPrioridade(): Aluno[] {
  return [...alunosMock].sort((a, b) => {
    const diff = prioridadeRisco[a.riscoNivel] - prioridadeRisco[b.riscoNivel];
    if (diff !== 0) return diff;
    return b.riscoPercentual - a.riscoPercentual;
  });
}

export function getAlunoById(id: string): Aluno | undefined {
  return alunosMock.find((aluno) => aluno.id === id);
}

export function getAlertasDoAluno(alunoId: string): Alerta[] {
  return alertasMock.filter((alerta) => alerta.alunoId === alunoId && alerta.ativo);
}

export function getIntervencoesDoAluno(alunoId: string): Intervencao[] {
  return intervencoesMock.filter((item) => item.alunoId === alunoId);
}

export function getTimelineDoAluno(alunoId: string): TimelineEvent[] {
  return timelineMock
    .filter((evento) => evento.alunoId === alunoId)
    .sort((a, b) => +new Date(b.criadoEm) - +new Date(a.criadoEm));
}

export function getAlertasAtivos(): Alerta[] {
  return [...alertasMock]
    .filter((alerta) => alerta.ativo)
    .sort((a, b) => prioridadeRisco[a.nivel] - prioridadeRisco[b.nivel]);
}

export function getResumoDashboard(): DashboardResumo {
  const total = alunosMock.length;
  const frequenciaMedia =
    alunosMock.reduce((acc, aluno) => acc + aluno.frequencia, 0) / total;

  return {
    totalEstudantes: total,
    riscoBaixo: alunosMock.filter((a) => a.riscoNivel === "baixo").length,
    riscoMedio: alunosMock.filter((a) => a.riscoNivel === "medio").length,
    riscoAlto: alunosMock.filter((a) => a.riscoNivel === "alto").length,
    riscoCritico: alunosMock.filter((a) => a.riscoNivel === "critico").length,
    novosAlertas: alertasMock.filter((a) => a.ativo).length,
    casosImediatos: alunosMock.filter(
      (a) => a.riscoNivel === "alto" || a.riscoNivel === "critico"
    ).length,
    frequenciaMedia: Number(frequenciaMedia.toFixed(1)),
    intervencoesPendentes: intervencoesMock.filter(
      (i) => i.status === "pendente" || i.status === "agendada"
    ).length,
  };
}

export const rotuloIntervencao: Record<Intervencao["tipo"], string> = {
  conversa_aluno: "Conversa com o aluno",
  contato_familia: "Contato com a família",
  reuniao: "Reunião",
  acompanhamento_semanal: "Acompanhamento semanal",
  encaminhamento_especialista: "Encaminhamento para especialista",
  plano_permanencia: "Plano de permanência",
  revisao_caso: "Revisão do caso",
};

export const rotuloStatusAcompanhamento: Record<
  Aluno["statusAcompanhamento"],
  string
> = {
  novo: "Novo",
  em_acompanhamento: "Em acompanhamento",
  encaminhado: "Encaminhado",
  estavel: "Estável",
  critico: "Crítico",
};
