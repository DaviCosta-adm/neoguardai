import "server-only";

import type { AuthContext } from "@/app/lib/auth/dal";
import { rotuloIntervencao, rotuloStatusAcompanhamento } from "@/app/lib/data/labels";
import {
  getIntervencoes,
  listarAlunosPorPrioridade,
} from "@/app/lib/data/repository";
import { rotuloRisco } from "@/app/lib/risk/score";
import type { Aluno, Intervencao, RiskLevel } from "@/app/lib/types";

export type RelatorioTurma = {
  turma: string;
  serie: string;
  total: number;
  frequenciaMedia: number;
  desempenhoMedio: number;
  riscoMedio: number;
  criticos: number;
  altos: number;
};

export type RelatorioResumo = {
  geradoEm: string;
  instituicao: string;
  totalAlunos: number;
  casosCriticos: Aluno[];
  porTurma: RelatorioTurma[];
  intervencoes: Intervencao[];
  intervencoesPorTipo: Array<{ tipo: string; total: number }>;
  distribuicaoRisco: Record<RiskLevel, number>;
};

function media(valores: number[]) {
  if (valores.length === 0) return 0;
  return Number(
    (valores.reduce((acc, value) => acc + value, 0) / valores.length).toFixed(1)
  );
}

export async function getRelatorioResumo(
  auth: AuthContext
): Promise<RelatorioResumo> {
  const alunos = await listarAlunosPorPrioridade(auth);
  const intervencoes = await getIntervencoes(auth);

  const turmas = new Map<string, Aluno[]>();
  for (const aluno of alunos) {
    const key = `${aluno.serie}::${aluno.turma}`;
    const grupo = turmas.get(key) ?? [];
    grupo.push(aluno);
    turmas.set(key, grupo);
  }

  const porTurma: RelatorioTurma[] = [...turmas.entries()]
    .map(([, grupo]) => ({
      turma: grupo[0].turma,
      serie: grupo[0].serie,
      total: grupo.length,
      frequenciaMedia: media(grupo.map((a) => a.frequencia)),
      desempenhoMedio: media(grupo.map((a) => a.desempenho)),
      riscoMedio: media(grupo.map((a) => a.riscoPercentual)),
      criticos: grupo.filter((a) => a.riscoNivel === "critico").length,
      altos: grupo.filter((a) => a.riscoNivel === "alto").length,
    }))
    .sort((a, b) => b.riscoMedio - a.riscoMedio);

  const tipos = new Map<string, number>();
  for (const item of intervencoes) {
    const label = rotuloIntervencao[item.tipo];
    tipos.set(label, (tipos.get(label) ?? 0) + 1);
  }

  return {
    geradoEm: new Date().toISOString(),
    instituicao: auth.instituicao.nome,
    totalAlunos: alunos.length,
    casosCriticos: alunos.filter(
      (aluno) => aluno.riscoNivel === "critico" || aluno.riscoNivel === "alto"
    ),
    porTurma,
    intervencoes,
    intervencoesPorTipo: [...tipos.entries()]
      .map(([tipo, total]) => ({ tipo, total }))
      .sort((a, b) => b.total - a.total),
    distribuicaoRisco: {
      baixo: alunos.filter((a) => a.riscoNivel === "baixo").length,
      medio: alunos.filter((a) => a.riscoNivel === "medio").length,
      alto: alunos.filter((a) => a.riscoNivel === "alto").length,
      critico: alunos.filter((a) => a.riscoNivel === "critico").length,
    },
  };
}

export function csvCasosCriticos(alunos: Aluno[]) {
  const header = [
    "nome",
    "turma",
    "serie",
    "frequencia",
    "desempenho",
    "risco_percentual",
    "risco_nivel",
    "status",
    "fatores",
  ];

  const rows = alunos.map((aluno) => [
    aluno.nome,
    aluno.turma,
    aluno.serie,
    String(aluno.frequencia),
    String(aluno.desempenho),
    String(aluno.riscoPercentual),
    rotuloRisco(aluno.riscoNivel),
    rotuloStatusAcompanhamento[aluno.statusAcompanhamento],
    aluno.fatoresRisco.join(" | "),
  ]);

  return toCsv([header, ...rows]);
}

export function csvIntervencoes(itens: Intervencao[], alunos: Aluno[]) {
  const nomes = new Map(alunos.map((aluno) => [aluno.id, aluno.nome]));
  const header = [
    "aluno",
    "tipo",
    "descricao",
    "status",
    "realizado_por",
    "realizado_em",
  ];

  const rows = itens.map((item) => [
    nomes.get(item.alunoId) ?? item.alunoId,
    rotuloIntervencao[item.tipo],
    item.descricao,
    item.status,
    item.realizadoPor,
    new Date(item.realizadoEm).toLocaleString("pt-BR"),
  ]);

  return toCsv([header, ...rows]);
}

export function csvPorTurma(turmas: RelatorioTurma[]) {
  const header = [
    "serie",
    "turma",
    "total",
    "frequencia_media",
    "desempenho_medio",
    "risco_medio",
    "criticos",
    "altos",
  ];

  const rows = turmas.map((turma) => [
    turma.serie,
    turma.turma,
    String(turma.total),
    String(turma.frequenciaMedia),
    String(turma.desempenhoMedio),
    String(turma.riscoMedio),
    String(turma.criticos),
    String(turma.altos),
  ]);

  return toCsv([header, ...rows]);
}

function toCsv(rows: string[][]) {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const value = cell.replaceAll('"', '""');
          return `"${value}"`;
        })
        .join(",")
    )
    .join("\n");
}
