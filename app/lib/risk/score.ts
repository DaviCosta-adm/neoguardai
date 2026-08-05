import type { IndicadoresAluno, RiskLevel } from "@/app/lib/types";
import {
  DEFAULT_PESOS,
  listarContribuicoesBase,
  normalizePesos,
  type PesosRisco,
} from "@/app/lib/risk/weights";

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
 * Pontuação explicável com pesos calibráveis.
 * Pesos default (=1) reproduzem o comportamento histórico do v1/v2.
 */
export function calcularRisco(
  indicadores: IndicadoresAluno,
  pesosInput?: Partial<PesosRisco> | null
): ResultadoRisco {
  const pesos = normalizePesos(pesosInput ?? DEFAULT_PESOS);
  const contribuicoes = listarContribuicoesBase(indicadores);
  const fatores: string[] = [];
  let pontos = 0;

  for (const item of contribuicoes) {
    pontos += item.pontosBase * pesos[item.chave];
    fatores.push(item.rotulo);
  }

  const percentual = clamp(Math.round(pontos));
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
