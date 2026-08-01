import "server-only";

import {
  alertasSeed,
  buildAlunosSeed,
  intervencoesSeed,
  timelineSeed,
} from "@/app/lib/data/seed";
import type {
  Alerta,
  Aluno,
  Intervencao,
  TimelineEvent,
} from "@/app/lib/types";

/**
 * Store em memória tipado — ponte temporária até o banco real.
 * Em serverless os dados voltam ao seed a cada cold start.
 */
type DataStore = {
  alunos: Aluno[];
  alertas: Alerta[];
  intervencoes: Intervencao[];
  timeline: TimelineEvent[];
};

const globalStore = globalThis as typeof globalThis & {
  __neoguardStore?: DataStore;
};

function createStore(): DataStore {
  return {
    alunos: buildAlunosSeed(),
    alertas: structuredClone(alertasSeed),
    intervencoes: structuredClone(intervencoesSeed),
    timeline: structuredClone(timelineSeed),
  };
}

export function getStore(): DataStore {
  if (!globalStore.__neoguardStore) {
    globalStore.__neoguardStore = createStore();
  }

  return globalStore.__neoguardStore;
}

export function resetStore() {
  globalStore.__neoguardStore = createStore();
}
