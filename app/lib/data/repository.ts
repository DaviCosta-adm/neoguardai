import "server-only";

import type { AuthContext } from "@/app/lib/auth/dal";
import { prioridadeRisco } from "@/app/lib/data/labels";
import { getStore } from "@/app/lib/data/store";
import type {
  Alerta,
  Aluno,
  DashboardResumo,
  Intervencao,
  TimelineEvent,
  TipoIntervencao,
  Usuario,
} from "@/app/lib/types";
import { demoUsers, toPublicUser } from "@/app/lib/auth/users";

function scopedAlunos(auth: AuthContext): Aluno[] {
  const { alunos } = getStore();
  const daInstituicao = alunos.filter(
    (aluno) => aluno.instituicaoId === auth.user.instituicaoId
  );

  if (auth.user.role === "especialista") {
    return daInstituicao.filter(
      (aluno) => aluno.statusAcompanhamento === "encaminhado"
    );
  }

  if (auth.user.role === "admin_neoguard") {
    return [...alunos];
  }

  return daInstituicao;
}

function alunoIdsPermitidos(auth: AuthContext): Set<string> {
  return new Set(scopedAlunos(auth).map((aluno) => aluno.id));
}

export function listarAlunosPorPrioridade(auth: AuthContext): Aluno[] {
  return [...scopedAlunos(auth)].sort((a, b) => {
    const diff = prioridadeRisco[a.riscoNivel] - prioridadeRisco[b.riscoNivel];
    if (diff !== 0) return diff;
    return b.riscoPercentual - a.riscoPercentual;
  });
}

export function getAlunoById(
  auth: AuthContext,
  id: string
): Aluno | undefined {
  return scopedAlunos(auth).find((aluno) => aluno.id === id);
}

export function getAlertasDoAluno(
  auth: AuthContext,
  alunoId: string
): Alerta[] {
  if (!alunoIdsPermitidos(auth).has(alunoId)) return [];

  return getStore().alertas.filter(
    (alerta) => alerta.alunoId === alunoId && alerta.ativo
  );
}

export function getIntervencoesDoAluno(
  auth: AuthContext,
  alunoId: string
): Intervencao[] {
  if (!alunoIdsPermitidos(auth).has(alunoId)) return [];

  return getStore().intervencoes.filter((item) => item.alunoId === alunoId);
}

export function getTimelineDoAluno(
  auth: AuthContext,
  alunoId: string
): TimelineEvent[] {
  if (!alunoIdsPermitidos(auth).has(alunoId)) return [];

  return getStore()
    .timeline.filter((evento) => evento.alunoId === alunoId)
    .sort((a, b) => +new Date(b.criadoEm) - +new Date(a.criadoEm));
}

export function getAlertasAtivos(auth: AuthContext): Alerta[] {
  const ids = alunoIdsPermitidos(auth);

  return [...getStore().alertas]
    .filter((alerta) => alerta.ativo && ids.has(alerta.alunoId))
    .sort((a, b) => prioridadeRisco[a.nivel] - prioridadeRisco[b.nivel]);
}

export function getIntervencoes(auth: AuthContext): Intervencao[] {
  const ids = alunoIdsPermitidos(auth);

  return [...getStore().intervencoes]
    .filter((item) => ids.has(item.alunoId))
    .sort((a, b) => +new Date(b.realizadoEm) - +new Date(a.realizadoEm));
}

export function getResumoDashboard(auth: AuthContext): DashboardResumo {
  const alunos = scopedAlunos(auth);
  const ids = new Set(alunos.map((aluno) => aluno.id));
  const intervencoes = getStore().intervencoes.filter((item) =>
    ids.has(item.alunoId)
  );
  const alertas = getStore().alertas.filter(
    (alerta) => alerta.ativo && ids.has(alerta.alunoId)
  );

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

export function listarUsuariosDaInstituicao(auth: AuthContext): Usuario[] {
  if (
    auth.user.role !== "admin_instituicao" &&
    auth.user.role !== "admin_neoguard" &&
    auth.user.role !== "coordenacao"
  ) {
    return [auth.user];
  }

  if (auth.user.role === "admin_neoguard") {
    return demoUsers.map(toPublicUser);
  }

  return demoUsers
    .filter((user) => user.instituicaoId === auth.user.instituicaoId)
    .map(toPublicUser);
}

export function registrarIntervencao(
  auth: AuthContext,
  input: {
    alunoId: string;
    tipo: TipoIntervencao;
    descricao: string;
    status?: Intervencao["status"];
    proximaRevisao?: string;
  }
): Intervencao | null {
  const aluno = getAlunoById(auth, input.alunoId);
  if (!aluno) return null;

  if (auth.user.role === "especialista" && !input.descricao.trim()) {
    return null;
  }

  const store = getStore();
  const agora = new Date().toISOString();
  const intervencao: Intervencao = {
    id: `int-${crypto.randomUUID()}`,
    alunoId: input.alunoId,
    tipo: input.tipo,
    descricao: input.descricao.trim(),
    realizadoPor: auth.user.nome,
    realizadoEm: agora,
    status: input.status ?? "concluida",
    proximaRevisao: input.proximaRevisao,
  };

  store.intervencoes.unshift(intervencao);
  store.timeline.unshift({
    id: `tl-${crypto.randomUUID()}`,
    alunoId: input.alunoId,
    tipo:
      input.tipo === "encaminhamento_especialista"
        ? "encaminhamento"
        : "intervencao",
    titulo: "Nova intervenção registrada",
    descricao: intervencao.descricao,
    criadoEm: agora,
  });

  if (input.tipo === "encaminhamento_especialista") {
    const alvo = store.alunos.find((item) => item.id === aluno.id);
    if (alvo) alvo.statusAcompanhamento = "encaminhado";
  }

  return intervencao;
}
