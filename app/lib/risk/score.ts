import type { IndicadoresAluno, RiskLevel } from "@/app/lib/types";

export interface ResultadoRisco {
  percentual: number;
  nivel: RiskLevel;
  fatores: string[];
  explicacao: string;
}

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

export function classificarRisco(percentual: number): RiskLevel {
  if (percentual >= 85) return "critico";
  if (percentual >= 65) return "alto";
  if (percentual >= 40) return "medio";
  return "baixo";
}

/**
 * Pontuação inicial explicável (v1).
 * Futuramente pode evoluir para modelo preditivo treinado.
 */
export function calcularRisco(indicadores: IndicadoresAluno): ResultadoRisco {
  const fatores: string[] = [];
  let pontos = 0;

  if (indicadores.frequencia < 75) {
    pontos += 30;
    fatores.push("Frequência abaixo de 75%");
  } else if (indicadores.frequencia < 85) {
    pontos += 18;
    fatores.push("Frequência em queda (abaixo de 85%)");
  }

  if (indicadores.faltasConsecutivas >= 5) {
    pontos += 25;
    fatores.push(`${indicadores.faltasConsecutivas} faltas consecutivas`);
  } else if (indicadores.faltasConsecutivas >= 3) {
    pontos += 15;
    fatores.push(`${indicadores.faltasConsecutivas} faltas consecutivas`);
  }

  if (indicadores.desempenho < 5) {
    pontos += 20;
    fatores.push("Desempenho abaixo da média");
  } else if (indicadores.desempenho < 6.5) {
    pontos += 10;
    fatores.push("Queda recente no desempenho");
  }

  if (indicadores.ocorrencias >= 3) {
    pontos += 15;
    fatores.push("Múltiplas ocorrências registradas");
  } else if (indicadores.ocorrencias >= 1) {
    pontos += 8;
    fatores.push("Ocorrências recentes");
  }

  if (indicadores.participacao < 40) {
    pontos += 12;
    fatores.push("Baixa participação em sala");
  } else if (indicadores.participacao < 60) {
    pontos += 6;
    fatores.push("Participação reduzida");
  }

  const percentual = clamp(pontos);
  const nivel = classificarRisco(percentual);

  const recomendacao =
    nivel === "critico" || nivel === "alto"
      ? "Recomenda-se contato com a família e acompanhamento semanal."
      : nivel === "medio"
        ? "Recomenda-se conversa com o aluno e monitoramento da frequência."
        : "Manter observação preventiva periódica.";

  const explicacao =
    fatores.length > 0
      ? `Risco ${rotuloRisco(nivel)} devido a ${fatores
          .slice(0, 2)
          .join(" e ")
          .toLowerCase()}. ${recomendacao}`
      : `Risco ${rotuloRisco(nivel)}. Indicadores estáveis no momento. ${recomendacao}`;

  return { percentual, nivel, fatores, explicacao };
}

export function rotuloRisco(nivel: RiskLevel): string {
  const mapa: Record<RiskLevel, string> = {
    baixo: "baixo",
    medio: "médio",
    alto: "alto",
    critico: "crítico",
  };
  return mapa[nivel];
}

export function corRisco(nivel: RiskLevel): string {
  const mapa: Record<RiskLevel, string> = {
    baixo: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    medio: "text-amber-300 bg-amber-400/10 border-amber-400/20",
    alto: "text-orange-400 bg-orange-400/10 border-orange-400/20",
    critico: "text-rose-400 bg-rose-400/10 border-rose-400/20",
  };
  return mapa[nivel];
}
