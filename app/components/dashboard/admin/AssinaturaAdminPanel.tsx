"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { rotuloAssinaturaStatus } from "@/app/lib/data/labels";
import type { Assinatura, AssinaturaStatus } from "@/app/lib/types";

const statuses: AssinaturaStatus[] = ["ativo", "inativo", "bloqueado"];

function statusStyles(status: AssinaturaStatus) {
  if (status === "ativo") {
    return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
  }
  if (status === "bloqueado") {
    return "border-rose-400/20 bg-rose-400/10 text-rose-200";
  }
  return "border-amber-400/20 bg-amber-400/10 text-amber-100";
}

export default function AssinaturaAdminPanel({
  assinaturas,
}: {
  assinaturas: Assinatura[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>(() =>
    Object.fromEntries(assinaturas.map((item) => [item.id, item.observacao]))
  );

  async function changeStatus(id: string, status: AssinaturaStatus) {
    setError(null);
    const response = await fetch(`/api/admin/assinaturas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        observacao: notes[id] ?? "",
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Não foi possível atualizar o status.");
      return;
    }
    startTransition(() => router.refresh());
  }

  async function saveObservacao(id: string) {
    setError(null);
    const response = await fetch(`/api/admin/assinaturas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        observacao: notes[id] ?? "",
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Não foi possível salvar a observação.");
      return;
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

      <section className="space-y-3">
        {assinaturas.map((assinatura) => (
          <div
            key={assinatura.id}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-medium text-white">
                  {assinatura.instituicaoNome}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Plano {assinatura.plano} · atualizada em{" "}
                  {new Date(assinatura.atualizadaEm).toLocaleString("pt-BR")}
                </p>
              </div>
              <span
                className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-xs ${statusStyles(
                  assinatura.status
                )}`}
              >
                {rotuloAssinaturaStatus[assinatura.status]}
              </span>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-xs text-gray-500">Alterar status</p>
              <div className="flex flex-wrap gap-2">
                {statuses.map((status) => {
                  const active = assinatura.status === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      disabled={pending || active}
                      onClick={() =>
                        startTransition(() => void changeStatus(assinatura.id, status))
                      }
                      className={`rounded-xl border px-3 py-2 text-sm transition disabled:opacity-60 ${
                        active
                          ? statusStyles(status)
                          : "border-white/10 text-gray-300 hover:border-cyan-400/30"
                      }`}
                    >
                      {rotuloAssinaturaStatus[status]}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="mt-4 block text-sm text-gray-300">
              <span className="mb-1.5 block text-xs text-gray-500">
                Observação
              </span>
              <textarea
                value={notes[assinatura.id] ?? ""}
                onChange={(event) =>
                  setNotes((prev) => ({
                    ...prev,
                    [assinatura.id]: event.target.value,
                  }))
                }
                rows={2}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-cyan-400/40"
                placeholder="Motivo da mudança de status, contato comercial, etc."
              />
            </label>

            <div className="mt-3">
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  startTransition(() => void saveObservacao(assinatura.id))
                }
                className="rounded-xl border border-white/10 px-3 py-2 text-sm text-gray-200 transition hover:border-cyan-400/30 disabled:opacity-60"
              >
                Salvar observação
              </button>
            </div>
          </div>
        ))}

        {assinaturas.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-6 text-sm text-gray-500">
            Nenhuma assinatura cadastrada. Crie uma instituição para gerar a
            assinatura automaticamente.
          </p>
        ) : null}
      </section>
    </div>
  );
}
