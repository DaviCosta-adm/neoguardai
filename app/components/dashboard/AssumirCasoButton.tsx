"use client";

import { useTransition } from "react";

export default function AssumirCasoButton({
  encaminhamentoId,
}: {
  encaminhamentoId: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await fetch("/api/especialistas/assumir", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ encaminhamentoId }),
          });
          window.location.reload();
        });
      }}
      className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-200 disabled:opacity-60"
    >
      {pending ? "Assumindo..." : "Assumir caso"}
    </button>
  );
}
