"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function InstituicaoDetailActions({
  id,
  nome,
}: {
  id: string;
  nome: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(nome);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setError(null);
    const response = await fetch(`/api/admin/instituicoes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: value }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Não foi possível salvar.");
      return;
    }
    setEditing(false);
    startTransition(() => router.refresh());
  }

  async function remove() {
    if (!window.confirm(`Excluir a instituição "${nome}"?`)) return;
    setError(null);
    const response = await fetch(`/api/admin/instituicoes/${id}`, {
      method: "DELETE",
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Não foi possível excluir.");
      return;
    }
    router.push("/dashboard/instituicoes");
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <h2 className="text-lg font-semibold">Administrar instituição</h2>
      {editing ? (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm outline-none focus:border-cyan-400/40"
          />
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => void save())}
            className="rounded-xl bg-cyan-400/20 px-4 py-2.5 text-sm text-cyan-100"
          >
            Salvar
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setValue(nome);
            }}
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-gray-300"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-xl border border-white/10 px-3 py-2 text-sm text-gray-200"
          >
            Renomear
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => void remove())}
            className="rounded-xl border border-rose-400/20 px-3 py-2 text-sm text-rose-300"
          >
            Excluir
          </button>
        </div>
      )}
      {error ? (
        <p className="mt-3 text-sm text-rose-300">{error}</p>
      ) : null}
    </div>
  );
}
