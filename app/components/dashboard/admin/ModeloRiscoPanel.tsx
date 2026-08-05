"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { ModeloRisco } from "@/app/lib/data/modelo-risco";
import type { PesosRisco } from "@/app/lib/risk/weights";

function formatMetric(value: number | null | undefined, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }
  return value.toFixed(digits);
}

const PESO_LABELS: Record<keyof PesosRisco, string> = {
  frequenciaBaixa: "Frequência baixa",
  frequenciaMedia: "Frequência média",
  faltasAltas: "Faltas altas",
  faltasMedias: "Faltas médias",
  desempenhoBaixo: "Desempenho baixo",
  desempenhoMedio: "Desempenho médio",
  ocorrenciasAltas: "Ocorrências altas",
  ocorrenciasMedias: "Ocorrências médias",
  participacaoBaixa: "Participação baixa",
  participacaoMedia: "Participação média",
  pressaoFaltas: "Pressão faltas",
  pressaoFrequencia: "Pressão frequência",
  pressaoDesempenho: "Pressão desempenho",
  pressaoParticipacao: "Pressão participação",
  pressaoOcorrencias: "Pressão ocorrências",
  pressaoProjecao: "Pressão projeção",
};

export default function ModeloRiscoPanel({
  ativo,
  modelos,
  snapshots,
}: {
  ativo: ModeloRisco | null;
  modelos: ModeloRisco[];
  snapshots: { total: number; comOutcome: number };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function run(action: string, body: Record<string, unknown> = {}) {
    setError(null);
    setMessage(null);
    const response = await fetch("/api/admin/modelo-risco", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...body }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Falha na operação.");
      return;
    }
    if (action === "train") {
      setMessage(
        `Modelo ${data.modelo?.versao} treinado com ${data.modelo?.metricas?.amostras ?? 0} amostras.`
      );
    } else if (action === "backfill") {
      setMessage(`${data.updated ?? 0} snapshots receberam outcome.`);
    } else if (action === "activate") {
      setMessage(`Modelo ${data.modelo?.versao} ativado.`);
    }
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-6">
      {error ? (
        <p className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-300">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">
          {message}
        </p>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs text-gray-500">Modelo ativo</p>
          <p className="mt-2 text-xl font-semibold text-white">
            {ativo?.versao ?? "v2 (fallback)"}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {ativo?.treinadoEm
              ? `Treinado em ${new Date(ativo.treinadoEm).toLocaleString("pt-BR")}`
              : "Pesos padrão"}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs text-gray-500">Snapshots longitudinais</p>
          <p className="mt-2 text-xl font-semibold text-white">
            {snapshots.total}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {snapshots.comOutcome} com outcome supervisionado
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs text-gray-500">MAE / Brier (ativo)</p>
          <p className="mt-2 text-xl font-semibold text-white">
            {formatMetric(ativo?.metricas?.mae as number | null)} /{" "}
            {formatMetric(ativo?.metricas?.brier as number | null)}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Melhoria MAE:{" "}
            {ativo?.metricas?.melhoriaMaePct != null
              ? `${ativo.metricas.melhoriaMaePct}%`
              : "—"}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-lg font-semibold text-white">Ações</h2>
        <p className="mt-2 text-sm text-gray-400">
          O treino calibra multiplicadores das regras explicáveis usando
          snapshots com outcome (risco observado depois). Sem caixa-preta.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(() => void run("train", { backfillForce: true }))
            }
            className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-gray-100 disabled:opacity-60"
          >
            Treinar agora
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(() =>
                void run("backfill", { force: true, minDays: 0 })
              )
            }
            className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2.5 text-sm text-cyan-100 transition hover:bg-cyan-400/20 disabled:opacity-60"
          >
            Preencher outcomes
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(() => {
                void (async () => {
                  setError(null);
                  setMessage(null);
                  const response = await fetch("/api/cron/risco-snapshots", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({}),
                  });
                  const data = await response.json();
                  if (!response.ok) {
                    setError(data.error ?? "Falha no batch de snapshots.");
                    return;
                  }
                  setMessage(
                    `${data.capturados ?? 0} snapshots capturados (batch).`
                  );
                  startTransition(() => router.refresh());
                })();
              })
            }
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-gray-200 transition hover:border-cyan-400/30 disabled:opacity-60"
          >
            Rodar batch de snapshots
          </button>
        </div>
      </section>

      {ativo ? (
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-lg font-semibold text-white">
            Pesos ativos ({ativo.versao})
          </h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {(Object.keys(PESO_LABELS) as (keyof PesosRisco)[]).map((key) => (
              <div
                key={key}
                className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2"
              >
                <p className="text-[11px] text-gray-500">{PESO_LABELS[key]}</p>
                <p className="text-sm text-gray-200">
                  {formatMetric(ativo.pesos[key], 2)}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Histórico de modelos</h2>
        {modelos.map((modelo) => (
          <div
            key={modelo.id}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-medium text-white">
                  {modelo.versao}
                  {modelo.ativo ? (
                    <span className="ml-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-xs text-emerald-200">
                      ativo
                    </span>
                  ) : null}
                </p>
                <p className="mt-1 text-xs text-gray-500">{modelo.notas}</p>
                <p className="mt-1 text-xs text-gray-600">
                  MAE {formatMetric(modelo.metricas.mae as number | null)} ·
                  Brier {formatMetric(modelo.metricas.brier as number | null)} ·{" "}
                  {modelo.metricas.amostras ?? 0} amostras
                </p>
              </div>
              {!modelo.ativo ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    startTransition(() =>
                      void run("activate", { id: modelo.id })
                    )
                  }
                  className="rounded-xl border border-white/10 px-3 py-2 text-sm text-gray-200 transition hover:border-cyan-400/30 disabled:opacity-60"
                >
                  Ativar
                </button>
              ) : null}
            </div>
          </div>
        ))}
        {modelos.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhum modelo registrado.</p>
        ) : null}
      </section>
    </div>
  );
}
