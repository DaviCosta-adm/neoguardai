import "server-only";

import type { AuthContext } from "@/app/lib/auth/dal";
import {
  getAlertasDoAluno,
  getAlunoById,
  getIntervencoesDoAluno,
} from "@/app/lib/data/repository";
import { resumoPreditivoAluno } from "@/app/lib/risk/predictive";
import { rotuloIntervencao } from "@/app/lib/data/labels";

export async function buildAtlasCaseContext(
  auth: AuthContext,
  alunoId: string
) {
  const aluno = await getAlunoById(auth, alunoId);
  if (!aluno) return null;

  const [alertas, intervencoes] = await Promise.all([
    getAlertasDoAluno(auth, aluno.id),
    getIntervencoesDoAluno(auth, aluno.id),
  ]);

  const preditivo = resumoPreditivoAluno(aluno);

  return {
    aluno,
    preditivo,
    alertas,
    intervencoes,
    prompt: `
Contexto do caso selecionado:
- Aluno: ${aluno.nome}
- Turma/série: ${aluno.turma} / ${aluno.serie}
- Frequência: ${aluno.frequencia}%
- Desempenho: ${aluno.desempenho}
- Faltas consecutivas: ${aluno.faltasConsecutivas}
- Participação: ${aluno.participacao}%
- Ocorrências: ${aluno.ocorrencias}
- Risco atual: ${preditivo.percentual}% (${preditivo.nivel})
- Projeção 14 dias: ${preditivo.projecao14d}%
- Tendência: ${preditivo.tendencia}
- Probabilidade estimada de evasão: ${preditivo.probabilidadeEvasao}%
- Fatores: ${preditivo.fatores.join("; ") || "nenhum fator crítico"}
- Alertas ativos: ${
      alertas.map((a) => a.titulo).join("; ") || "nenhum"
    }
- Intervenções recentes: ${
      intervencoes
        .slice(0, 3)
        .map((i) => rotuloIntervencao[i.tipo])
        .join("; ") || "nenhuma"
    }
- Plano sugerido: ${preditivo.planoSugerido.join("; ")}
`.trim(),
  };
}
