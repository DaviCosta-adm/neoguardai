"use client";

import { useState, useTransition } from "react";
import { rotuloTipoDevolutiva } from "@/app/lib/data/labels";
import type { TipoDevolutiva } from "@/app/lib/types";

const tipos = Object.keys(rotuloTipoDevolutiva) as TipoDevolutiva[];

export default function DevolutivaForm({
  encaminhamentoId,
}: {
  encaminhamentoId: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const tipo = String(formData.get("tipo") ?? "");
    const conteudo = String(formData.get("conteudo") ?? "");
    const concluir = formData.get("concluir") === "on";

    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const response = await fetch("/api/especialistas/devolutiva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          encaminhamentoId,
          tipo,
          conteudo,
          concluir,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Erro ao salvar.");
        return;
      }

      setSuccess("Registro salvo com sucesso.");
      window.location.reload();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="tipo" className="text-xs text-gray-500">
          Tipo de registro
        </label>
        <select
          id="tipo"
          name="tipo"
          defaultValue="devolutiva"
          className="mt-1 w-full rounded-xl border border-white/10 bg-[#0a1024] px-3 py-2 text-sm outline-none focus:border-cyan-400/40"
        >
          {tipos.map((tipo) => (
            <option key={tipo} value={tipo}>
              {rotuloTipoDevolutiva[tipo]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="conteudo" className="text-xs text-gray-500">
          Conteúdo
        </label>
        <textarea
          id="conteudo"
          name="conteudo"
          required
          rows={4}
          placeholder="Atendimento, observação, devolutiva ou recomendação."
          className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none placeholder:text-gray-600 focus:border-cyan-400/40"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-400">
        <input
          type="checkbox"
          name="concluir"
          className="rounded border-white/20"
        />
        Concluir encaminhamento
      </label>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-300">{success}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-cyan-400/90 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Registrar"}
      </button>
    </form>
  );
}
