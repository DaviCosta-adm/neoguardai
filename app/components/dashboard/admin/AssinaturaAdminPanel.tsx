"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { rotuloAssinaturaStatus } from "@/app/lib/data/labels";
import type { Assinatura, AssinaturaStatus, Plano } from "@/app/lib/types";

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

function formatPreco(centavos: number, moeda: string) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: moeda.toUpperCase(),
  }).format(centavos / 100);
}

export default function AssinaturaAdminPanel({
  assinaturas,
  planos,
  stripeConfigured,
}: {
  assinaturas: Assinatura[];
  planos: Plano[];
  stripeConfigured: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>(() =>
    Object.fromEntries(assinaturas.map((item) => [item.id, item.observacao]))
  );
  const [selectedPlan, setSelectedPlan] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        assinaturas.map((item) => [
          item.id,
          item.planoId || planos[0]?.id || "essencial",
        ])
      )
  );

  const planoMap = useMemo(
    () => new Map(planos.map((plano) => [plano.id, plano])),
    [planos]
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
        plano: selectedPlan[id],
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Não foi possível salvar.");
      return;
    }
    startTransition(() => router.refresh());
  }

  async function openCheckout(id: string) {
    setError(null);
    const planoId = selectedPlan[id];
    const response = await fetch(`/api/admin/assinaturas/${id}/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planoId }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Não foi possível abrir o Checkout.");
      return;
    }
    window.location.href = data.url;
  }

  async function openPortal(id: string) {
    setError(null);
    const response = await fetch(`/api/admin/assinaturas/${id}/portal`, {
      method: "POST",
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Não foi possível abrir o portal.");
      return;
    }
    window.location.href = data.url;
  }

  return (
    <div className="space-y-6">
      {!stripeConfigured ? (
        <p className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-sm text-amber-100">
          Stripe ainda não está configurado neste ambiente. Defina{" "}
          <code className="text-xs">STRIPE_SECRET_KEY</code> e{" "}
          <code className="text-xs">STRIPE_WEBHOOK_SECRET</code> no Coolify.
          Você ainda pode alterar status e plano manualmente.
        </p>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-300">
          {error}
        </p>
      ) : null}

      <section className="space-y-3">
        {assinaturas.map((assinatura) => {
          const plano =
            planoMap.get(selectedPlan[assinatura.id] || assinatura.planoId) ??
            planoMap.get(assinatura.planoId);

          return (
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
                    {assinatura.planoNome || assinatura.plano}
                    {plano
                      ? ` · ${formatPreco(plano.precoCentavos, plano.moeda)}/mês`
                      : ""}{" "}
                    · atualizada em{" "}
                    {new Date(assinatura.atualizadaEm).toLocaleString("pt-BR")}
                  </p>
                  {assinatura.stripeSubscriptionId ? (
                    <p className="mt-1 text-xs text-cyan-300/80">
                      Stripe: {assinatura.stripeSubscriptionId}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-gray-600">
                      Sem assinatura Stripe vinculada
                    </p>
                  )}
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
                          startTransition(() =>
                            void changeStatus(assinatura.id, status)
                          )
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
                <span className="mb-1.5 block text-xs text-gray-500">Plano</span>
                <select
                  value={selectedPlan[assinatura.id] ?? assinatura.planoId}
                  onChange={(event) =>
                    setSelectedPlan((prev) => ({
                      ...prev,
                      [assinatura.id]: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-cyan-400/40"
                >
                  {planos.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nome} —{" "}
                      {formatPreco(item.precoCentavos, item.moeda)}/mês
                    </option>
                  ))}
                </select>
              </label>

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

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    startTransition(() => void saveObservacao(assinatura.id))
                  }
                  className="rounded-xl border border-white/10 px-3 py-2 text-sm text-gray-200 transition hover:border-cyan-400/30 disabled:opacity-60"
                >
                  Salvar plano/observação
                </button>
                <button
                  type="button"
                  disabled={pending || !stripeConfigured}
                  onClick={() =>
                    startTransition(() => void openCheckout(assinatura.id))
                  }
                  className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black transition hover:bg-gray-100 disabled:opacity-60"
                >
                  Checkout Stripe
                </button>
                <button
                  type="button"
                  disabled={
                    pending ||
                    !stripeConfigured ||
                    !assinatura.stripeCustomerId
                  }
                  onClick={() =>
                    startTransition(() => void openPortal(assinatura.id))
                  }
                  className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-100 transition hover:bg-cyan-400/20 disabled:opacity-60"
                >
                  Portal do cliente
                </button>
                <Link
                  href="/dashboard/planos"
                  className="rounded-xl border border-white/10 px-3 py-2 text-sm text-gray-300 transition hover:border-cyan-400/30"
                >
                  Ver catálogo
                </Link>
              </div>
            </div>
          );
        })}

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
