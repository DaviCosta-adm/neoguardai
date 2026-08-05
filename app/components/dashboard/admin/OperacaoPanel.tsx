"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { OperacaoStatus } from "@/app/lib/data/operacao";

function Badge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs ${
        ok
          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
          : "border-amber-400/30 bg-amber-400/10 text-amber-100"
      }`}
    >
      {label}
    </span>
  );
}

export default function OperacaoPanel({ status }: { status: OperacaoStatus }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [testTo, setTestTo] = useState("");

  async function run(action: string, extra: Record<string, unknown> = {}) {
    setError(null);
    setMessage(null);
    const response = await fetch("/api/admin/operacao", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Falha na operação.");
      return;
    }
    if (action === "test-email") {
      setMessage(
        data.result?.sent
          ? "E-mail de teste enviado."
          : "Resend respondeu, mas o envio não foi confirmado."
      );
    } else if (action === "run-cron") {
      setMessage(
        `Cron manual: ${data.capturados ?? 0} snapshots · ${data.outcomesAtualizados ?? 0} outcomes.`
      );
    }
    startTransition(() => router.refresh());
  }

  const cronCurl = `curl -X POST ${status.cron.endpoint} \\\n  -H "Authorization: Bearer $CRON_SECRET" \\\n  -H "Content-Type: application/json" \\\n  -d '{}'`;

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

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs text-gray-500">E-mail (Resend)</p>
          <div className="mt-3">
            <Badge
              ok={status.email.configured}
              label={status.email.configured ? "configurado" : "pendente"}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {status.email.from ?? "EMAIL_FROM não definido"}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs text-gray-500">Cron snapshots</p>
          <div className="mt-3">
            <Badge
              ok={status.cron.secretConfigured}
              label={
                status.cron.secretConfigured
                  ? "CRON_SECRET ok"
                  : "sem CRON_SECRET"
              }
            />
          </div>
          <p className="mt-2 break-all text-xs text-gray-500">
            {status.cron.endpoint}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs text-gray-500">Stripe</p>
          <div className="mt-3">
            <Badge
              ok={status.stripe.configured}
              label={status.stripe.configured ? "ok" : "ausente"}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            SEED_ON_START={String(status.seedOnStart)}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs text-gray-500">Modelo / snapshots</p>
          <p className="mt-2 text-lg font-semibold text-white">
            {status.modelo.versao}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {status.snapshots.total} snapshots · {status.snapshots.comOutcome}{" "}
            com outcome
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-lg font-semibold text-white">Testar e-mail</h2>
        <p className="mt-1 text-sm text-gray-400">
          Requer <code className="text-xs">RESEND_API_KEY</code> +{" "}
          <code className="text-xs">EMAIL_FROM</code> no Coolify.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <input
            value={testTo}
            onChange={(event) => setTestTo(event.target.value)}
            placeholder="destino@exemplo.com (vazio = seu e-mail)"
            className="min-w-[240px] flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-cyan-400/40"
          />
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(() =>
                void run("test-email", testTo.trim() ? { to: testTo.trim() } : {})
              )
            }
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
          >
            Enviar teste
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-lg font-semibold text-white">
          Agendar cron de snapshots
        </h2>
        <p className="mt-1 text-sm text-gray-400">
          No Coolify → Scheduled Tasks (ou cron externo), rode diariamente:
        </p>
        <pre className="mt-3 overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-cyan-100">
          {cronCurl}
        </pre>
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => void run("run-cron"))}
          className="mt-4 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100 disabled:opacity-60"
        >
          Rodar cron agora
        </button>
      </section>
    </div>
  );
}
