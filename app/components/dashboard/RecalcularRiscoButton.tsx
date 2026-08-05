"use client";

import { useTransition } from "react";

export default function RecalcularRiscoButton({ alunoId }: { alunoId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await fetch("/api/risco/recalcular", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ alunoId }),
          });
          window.location.reload();
        });
      }}
      className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-200 disabled:opacity-60"
    >
      {pending ? "Recalculando..." : "Recalcular risco preditivo"}
    </button>
  );
}
