"use client";

import { useState, useTransition } from "react";
import { rotuloIntervencao } from "@/app/lib/data/labels";
import type { TipoIntervencao } from "@/app/lib/types";

const tipos = Object.keys(rotuloIntervencao) as TipoIntervencao[];

export default function IntervencaoForm({ alunoId }: { alunoId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const tipo = String(formData.get("tipo") ?? "");
    const descricao = String(formData.get("descricao") ?? "");

    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const response = await fetch("/api/intervencoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alunoId, tipo, descricao }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Erro ao salvar.");
        return;
      }

      setSuccess("Intervenção registrada.");
      window.location.reload();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="tipo" className="text-xs text-gray-500">
          Tipo de ação
        </label>
        <select
          id="tipo"
          name="tipo"
          className="mt-1 w-full rounded-xl border border-white/10 bg-[#0a1024] px-3 py-2 text-sm outline-none focus:border-cyan-400/40"
          defaultValue="conversa_aluno"
        >
          {tipos.map((tipo) => (
            <option key={tipo} value={tipo}>
              {rotuloIntervencao[tipo]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="descricao" className="text-xs text-gray-500">
          Descrição
        </label>
        <textarea
          id="descricao"
          name="descricao"
          required
          rows={3}
          placeholder="O que foi feito e qual o próximo passo?"
          className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none placeholder:text-gray-600 focus:border-cyan-400/40"
        />
      </div>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-300">{success}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-cyan-400/90 px-4 py-2 text-sm font-semibold text-black transition hover:bg-cyan-300 disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Registrar intervenção"}
      </button>
    </form>
  );
}
