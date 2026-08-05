import type { IndicadoresAluno } from "@/app/lib/types";

/** Multiplicadores calibráveis sobre as regras fixas do score explicável. */
export type PesosRisco = {
  frequenciaBaixa: number;
  frequenciaMedia: number;
  faltasAltas: number;
  faltasMedias: number;
  desempenhoBaixo: number;
  desempenhoMedio: number;
  ocorrenciasAltas: number;
  ocorrenciasMedias: number;
  participacaoBaixa: number;
  participacaoMedia: number;
  pressaoFaltas: number;
  pressaoFrequencia: number;
  pressaoDesempenho: number;
  pressaoParticipacao: number;
  pressaoOcorrencias: number;
  pressaoProjecao: number;
};

export const DEFAULT_PESOS: PesosRisco = {
  frequenciaBaixa: 1,
  frequenciaMedia: 1,
  faltasAltas: 1,
  faltasMedias: 1,
  desempenhoBaixo: 1,
  desempenhoMedio: 1,
  ocorrenciasAltas: 1,
  ocorrenciasMedias: 1,
  participacaoBaixa: 1,
  participacaoMedia: 1,
  pressaoFaltas: 1,
  pressaoFrequencia: 1,
  pressaoDesempenho: 1,
  pressaoParticipacao: 1,
  pressaoOcorrencias: 1,
  pressaoProjecao: 1,
};

export type FeatureContribuicao = {
  chave: keyof PesosRisco;
  pontosBase: number;
  rotulo: string;
};

function clampWeight(value: number) {
  if (!Number.isFinite(value)) return 1;
  return Math.min(2.5, Math.max(0.25, value));
}

export function normalizePesos(input?: Partial<PesosRisco> | null): PesosRisco {
  const out = { ...DEFAULT_PESOS };
  if (!input) return out;
  for (const key of Object.keys(DEFAULT_PESOS) as (keyof PesosRisco)[]) {
    if (input[key] !== undefined) {
      out[key] = clampWeight(Number(input[key]));
    }
  }
  return out;
}

/** Contribuições base (antes do peso) usadas no score v1. */
export function listarContribuicoesBase(
  indicadores: IndicadoresAluno
): FeatureContribuicao[] {
  const items: FeatureContribuicao[] = [];

  if (indicadores.frequencia < 75) {
    items.push({
      chave: "frequenciaBaixa",
      pontosBase: 30,
      rotulo: "Frequência abaixo de 75%",
    });
  } else if (indicadores.frequencia < 85) {
    items.push({
      chave: "frequenciaMedia",
      pontosBase: 18,
      rotulo: "Frequência em queda (abaixo de 85%)",
    });
  }

  if (indicadores.faltasConsecutivas >= 5) {
    items.push({
      chave: "faltasAltas",
      pontosBase: 25,
      rotulo: `${indicadores.faltasConsecutivas} faltas consecutivas`,
    });
  } else if (indicadores.faltasConsecutivas >= 3) {
    items.push({
      chave: "faltasMedias",
      pontosBase: 15,
      rotulo: `${indicadores.faltasConsecutivas} faltas consecutivas`,
    });
  }

  if (indicadores.desempenho < 5) {
    items.push({
      chave: "desempenhoBaixo",
      pontosBase: 20,
      rotulo: "Desempenho abaixo da média",
    });
  } else if (indicadores.desempenho < 6.5) {
    items.push({
      chave: "desempenhoMedio",
      pontosBase: 10,
      rotulo: "Queda recente no desempenho",
    });
  }

  if (indicadores.ocorrencias >= 3) {
    items.push({
      chave: "ocorrenciasAltas",
      pontosBase: 15,
      rotulo: "Múltiplas ocorrências registradas",
    });
  } else if (indicadores.ocorrencias >= 1) {
    items.push({
      chave: "ocorrenciasMedias",
      pontosBase: 8,
      rotulo: "Ocorrências recentes",
    });
  }

  if (indicadores.participacao < 40) {
    items.push({
      chave: "participacaoBaixa",
      pontosBase: 12,
      rotulo: "Baixa participação em sala",
    });
  } else if (indicadores.participacao < 60) {
    items.push({
      chave: "participacaoMedia",
      pontosBase: 6,
      rotulo: "Participação reduzida",
    });
  }

  return items;
}

export function pressaoTendencia(
  indicadores: IndicadoresAluno,
  pesos: PesosRisco = DEFAULT_PESOS
) {
  let pressao = 0;

  if (indicadores.faltasConsecutivas >= 3) {
    pressao += indicadores.faltasConsecutivas * 3 * pesos.pressaoFaltas;
  }
  if (indicadores.frequencia < 80) {
    pressao += (80 - indicadores.frequencia) * 0.6 * pesos.pressaoFrequencia;
  }
  if (indicadores.desempenho < 6) {
    pressao += (6 - indicadores.desempenho) * 4 * pesos.pressaoDesempenho;
  }
  if (indicadores.participacao < 50) {
    pressao +=
      (50 - indicadores.participacao) * 0.25 * pesos.pressaoParticipacao;
  }
  if (indicadores.ocorrencias > 0) {
    pressao += indicadores.ocorrencias * 2 * pesos.pressaoOcorrencias;
  }

  return pressao * pesos.pressaoProjecao;
}
