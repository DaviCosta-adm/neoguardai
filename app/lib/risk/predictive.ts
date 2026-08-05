import {
  calcularRisco,
  classificarRisco,
  rotuloRisco,
  type ResultadoRisco,
} from "@/app/lib/risk/score";
import {
  DEFAULT_PESOS,
  normalizePesos,
  pressaoTendencia,
  type PesosRisco,
} from "@/app/lib/risk/weights";
import type { Aluno, IndicadoresAluno } from "@/app/lib/types";

export type TendenciaRisco = "subindo" | "estavel" | "caindo";

export type ResultadoPreditivo = ResultadoRisco & {
  versao: string;
  projecao14d: number;
  tendencia: TendenciaRisco;
  probabilidadeEvasao: number;
  planoSugerido: string[];
};

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Modelo preditivo explicável.
 * Aceita pesos calibrados a partir do histórico longitudinal.
 */
export function calcularRiscoPreditivo(
  indicadores: IndicadoresAluno,
  options?: { pesos?: Partial<PesosRisco> | null; versao?: string }
): ResultadoPreditivo {
  const pesos = normalizePesos(options?.pesos ?? DEFAULT_PESOS);
  const versao = options?.versao?.trim() || "v2";
  const base = calcularRisco(indicadores, pesos);
  const pressao = pressaoTendencia(indicadores, pesos);

  const projecao14d = clamp(Math.round(base.percentual + pressao * 0.45));
  const delta = projecao14d - base.percentual;

  const tendencia: TendenciaRisco =
    delta >= 8 ? "subindo" : delta <= -8 ? "caindo" : "estavel";

  const probabilidadeEvasao = clamp(
    Math.round(base.percentual * 0.55 + projecao14d * 0.45)
  );

  const planoSugerido =
    base.nivel === "critico" || base.nivel === "alto"
      ? [
          "Contato imediato com a família",
          "Acompanhamento semanal da frequência",
          "Avaliar encaminhamento para especialista",
        ]
      : base.nivel === "medio"
        ? [
            "Conversa acolhedora com o aluno",
            "Monitorar faltas nas próximas duas semanas",
            "Revisar desempenho com o tutor",
          ]
        : [
            "Manter observação preventiva",
            "Registrar qualquer mudança de engajamento",
          ];

  const tendenciaTexto =
    tendencia === "subindo"
      ? "A projeção de 14 dias indica tendência de piora."
      : tendencia === "caindo"
        ? "A projeção de 14 dias indica tendência de melhora."
        : "A projeção de 14 dias permanece estável.";

  return {
    ...base,
    versao,
    projecao14d,
    tendencia,
    probabilidadeEvasao,
    planoSugerido,
    explicacao: `${base.explicacao} ${tendenciaTexto} Probabilidade estimada de evasão: ${probabilidadeEvasao}%. Modelo ${versao}.`,
    nivel: classificarRisco(base.percentual),
  };
}

export function resumoPreditivoAluno(
  aluno: Aluno,
  options?: { pesos?: Partial<PesosRisco> | null; versao?: string }
): ResultadoPreditivo {
  return calcularRiscoPreditivo(aluno, options);
}

export function textoTendencia(tendencia: TendenciaRisco) {
  const mapa: Record<TendenciaRisco, string> = {
    subindo: "Tendência de alta",
    estavel: "Tendência estável",
    caindo: "Tendência de queda",
  };
  return mapa[tendencia];
}

export function explicacaoLocalAtlas(
  pergunta: string,
  aluno?: Aluno | null
): string {
  const preditivo = aluno ? resumoPreditivoAluno(aluno) : null;
  const lower = pergunta.toLowerCase();

  if (!aluno || !preditivo) {
    if (lower.includes("evas")) {
      return "A evasão escolar pode ser antecipada por quedas de frequência, desempenho e engajamento. O NeoGuardAI prioriza esses sinais para a coordenação agir cedo.";
    }
    return "Sou o Atlas. Posso explicar riscos, sugerir intervenções e resumir casos quando um aluno estiver selecionado.";
  }

  if (lower.includes("próxim") || lower.includes("proxim") || lower.includes("plano")) {
    return `Para ${aluno.nome}, sugiro: ${preditivo.planoSugerido.slice(0, 2).join("; ")}.`;
  }

  if (lower.includes("por que") || lower.includes("porque") || lower.includes("fator")) {
    const fatores = preditivo.fatores.slice(0, 2).join(" e ") || "indicadores combinados";
    return `${aluno.nome} foi sinalizado com risco ${rotuloRisco(preditivo.nivel)} principalmente por ${fatores.toLowerCase()}.`;
  }

  if (lower.includes("alerta") || lower.includes("risco")) {
    return `Risco atual de ${aluno.nome}: ${preditivo.percentual}% (${rotuloRisco(preditivo.nivel)}). Projeção em 14 dias: ${preditivo.projecao14d}% (${textoTendencia(preditivo.tendencia).toLowerCase()}).`;
  }

  return `Caso ${aluno.nome}: risco ${rotuloRisco(preditivo.nivel)} (${preditivo.percentual}%), projeção ${preditivo.projecao14d}% em 14 dias. ${preditivo.planoSugerido[0]}.`;
}
