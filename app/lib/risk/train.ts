import "server-only";

import { calcularRiscoPreditivo } from "@/app/lib/risk/predictive";
import {
  DEFAULT_PESOS,
  listarContribuicoesBase,
  normalizePesos,
  pressaoTendencia,
  type PesosRisco,
} from "@/app/lib/risk/weights";
import type { IndicadoresAluno } from "@/app/lib/types";

export type AmostraTreino = {
  indicadores: IndicadoresAluno;
  /** Risco observado depois (rótulo supervisionado). */
  outcomeRisco: number;
};

export type MetricasTreino = {
  amostras: number;
  mae: number | null;
  brier: number | null;
  maeBase: number | null;
  melhoriaMaePct: number | null;
};

export type ResultadoTreino = {
  pesos: PesosRisco;
  metricas: MetricasTreino;
  versao: string;
};

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function predicaoComPesos(
  indicadores: IndicadoresAluno,
  pesos: PesosRisco
) {
  const contribuicoes = listarContribuicoesBase(indicadores);
  let pontos = 0;
  for (const item of contribuicoes) {
    pontos += item.pontosBase * pesos[item.chave];
  }
  const percentual = clamp(Math.round(pontos));
  const pressao = pressaoTendencia(indicadores, pesos);
  const projecao = clamp(Math.round(percentual + pressao * 0.45));
  return { percentual, projecao };
}

function mae(
  amostras: AmostraTreino[],
  pesos: PesosRisco,
  usarProjecao: boolean
) {
  if (amostras.length === 0) return null;
  let soma = 0;
  for (const amostra of amostras) {
    const pred = predicaoComPesos(amostra.indicadores, pesos);
    const yHat = usarProjecao ? pred.projecao : pred.percentual;
    soma += Math.abs(yHat - amostra.outcomeRisco);
  }
  return soma / amostras.length;
}

/** Brier score em “piora” (outcome >= 65). */
function brierPiora(amostras: AmostraTreino[], pesos: PesosRisco) {
  if (amostras.length === 0) return null;
  let soma = 0;
  for (const amostra of amostras) {
    const pred = predicaoComPesos(amostra.indicadores, pesos);
    const p = pred.projecao / 100;
    const y = amostra.outcomeRisco >= 65 ? 1 : 0;
    soma += (p - y) ** 2;
  }
  return soma / amostras.length;
}

const SCORE_KEYS: (keyof PesosRisco)[] = [
  "frequenciaBaixa",
  "frequenciaMedia",
  "faltasAltas",
  "faltasMedias",
  "desempenhoBaixo",
  "desempenhoMedio",
  "ocorrenciasAltas",
  "ocorrenciasMedias",
  "participacaoBaixa",
  "participacaoMedia",
];

const PRESSAO_KEYS: (keyof PesosRisco)[] = [
  "pressaoFaltas",
  "pressaoFrequencia",
  "pressaoDesempenho",
  "pressaoParticipacao",
  "pressaoOcorrencias",
  "pressaoProjecao",
];

/**
 * Calibração supervisionada por busca em grade (explicável).
 * Minimiza MAE da projeção 14d vs outcome observado.
 */
export function treinarPesosSupervisionado(
  amostras: AmostraTreino[],
  basePesos?: Partial<PesosRisco> | null
): ResultadoTreino {
  const base = normalizePesos(basePesos ?? DEFAULT_PESOS);
  const maeBase = mae(amostras, base, true);

  if (amostras.length < 3) {
    return {
      pesos: base,
      metricas: {
        amostras: amostras.length,
        mae: maeBase,
        brier: brierPiora(amostras, base),
        maeBase,
        melhoriaMaePct: null,
      },
      versao: `v2-cal-${Date.now().toString(36)}`,
    };
  }

  let melhor = base;
  let melhorMae = maeBase ?? Number.POSITIVE_INFINITY;
  const candidatos = [0.6, 0.8, 1, 1.2, 1.5];

  // Ajuste dos pesos de score (uma dimensão por vez).
  for (const key of SCORE_KEYS) {
    let localMelhor = melhor;
    let localMae = melhorMae;
    for (const fator of candidatos) {
      const tentativa = { ...melhor, [key]: fator };
      const atual = mae(amostras, tentativa, true);
      if (atual !== null && atual < localMae) {
        localMae = atual;
        localMelhor = tentativa;
      }
    }
    melhor = localMelhor;
    melhorMae = localMae;
  }

  for (const key of PRESSAO_KEYS) {
    let localMelhor = melhor;
    let localMae = melhorMae;
    for (const fator of candidatos) {
      const tentativa = { ...melhor, [key]: fator };
      const atual = mae(amostras, tentativa, true);
      if (atual !== null && atual < localMae) {
        localMae = atual;
        localMelhor = tentativa;
      }
    }
    melhor = localMelhor;
    melhorMae = localMae;
  }

  const maeFinal = mae(amostras, melhor, true);
  const melhoriaMaePct =
    maeBase && maeBase > 0 && maeFinal !== null
      ? Math.round(((maeBase - maeFinal) / maeBase) * 1000) / 10
      : null;

  return {
    pesos: normalizePesos(melhor),
    metricas: {
      amostras: amostras.length,
      mae: maeFinal,
      brier: brierPiora(amostras, melhor),
      maeBase,
      melhoriaMaePct,
    },
    versao: `v3-cal-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${amostras.length}`,
  };
}

/** Utilitário de teste: compara predição default vs calibrada. */
export function avaliarAmostra(
  indicadores: IndicadoresAluno,
  pesos: PesosRisco
) {
  return calcularRiscoPreditivo(indicadores, { pesos });
}
