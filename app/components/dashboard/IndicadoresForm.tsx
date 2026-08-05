"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Aluno } from "@/app/lib/types";

export default function IndicadoresForm({ aluno }: { aluno: Aluno }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [form, setForm] = useState({
    frequencia: String(aluno.frequencia),
    desempenho: String(aluno.desempenho),
    faltasConsecutivas: String(aluno.faltasConsecutivas),
    ocorrencias: String(aluno.ocorrencias),
    participacao: String(aluno.participacao),
  });

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setOk(false);
    const response = await fetch(`/api/alunos/${aluno.id}/indicadores`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        frequencia: Number(form.frequencia),
        desempenho: Number(form.desempenho),
        faltasConsecutivas: Number(form.faltasConsecutivas),
        ocorrencias: Number(form.ocorrencias),
        participacao: Number(form.participacao),
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Não foi possível salvar.");
      return;
    }
    setOk(true);
    startTransition(() => router.refresh());
  }

  return (
    <form
      onSubmit={(event) => void onSubmit(event)}
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
    >
      <h3 className="text-lg font-semibold">Atualizar indicadores</h3>
      <p className="mt-1 text-sm text-gray-500">
        Salvar recalcula o risco, grava snapshot longitudinal e pode notificar
        a coordenação se o nível for alto/crítico.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(
          [
            ["frequencia", "Frequência (%)"],
            ["desempenho", "Desempenho (0–10)"],
            ["faltasConsecutivas", "Faltas consecutivas"],
            ["ocorrencias", "Ocorrências"],
            ["participacao", "Participação (%)"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="block text-sm text-gray-300">
            <span className="mb-1.5 block text-xs text-gray-500">{label}</span>
            <input
              type="number"
              step="any"
              value={form[key]}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, [key]: event.target.value }))
              }
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-cyan-400/40"
            />
          </label>
        ))}
      </div>

      {error ? (
        <p className="mt-3 text-sm text-rose-300">{error}</p>
      ) : null}
      {ok ? (
        <p className="mt-3 text-sm text-emerald-300">Indicadores salvos.</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-4 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-gray-100 disabled:opacity-60"
      >
        Salvar e recalcular
      </button>
    </form>
  );
}
