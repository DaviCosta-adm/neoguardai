"use client";

import { useState, useTransition } from "react";

export default function EncaminharForm({
  alunoId,
  especialistas,
}: {
  alunoId: string;
  especialistas: Array<{ id: string; nome: string }>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const motivo = String(formData.get("motivo") ?? "");
    const especialistaId = String(formData.get("especialistaId") ?? "");

    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const response = await fetch("/api/especialistas/encaminhar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alunoId, motivo, especialistaId }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Erro ao encaminhar.");
        return;
      }

      setSuccess("Caso encaminhado ao especialista.");
      window.location.href = "/dashboard/especialistas";
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="especialistaId" className="text-xs text-gray-500">
          Especialista (opcional)
        </label>
        <select
          id="especialistaId"
          name="especialistaId"
          className="mt-1 w-full rounded-xl border border-white/10 bg-[#0a1024] px-3 py-2 text-sm outline-none focus:border-cyan-400/40"
          defaultValue=""
        >
          <option value="">Fila geral da instituição</option>
          {especialistas.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nome}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="motivo" className="text-xs text-gray-500">
          Motivo do encaminhamento
        </label>
        <textarea
          id="motivo"
          name="motivo"
          required
          rows={3}
          placeholder="Descreva o motivo e o que já foi feito."
          className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none placeholder:text-gray-600 focus:border-cyan-400/40"
        />
      </div>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-300">{success}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
      >
        {pending ? "Encaminhando..." : "Encaminhar caso"}
      </button>
    </form>
  );
}
