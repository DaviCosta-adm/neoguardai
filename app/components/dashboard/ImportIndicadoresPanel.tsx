"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

const EXEMPLO = `nome,turma,serie,frequencia,desempenho,faltas_consecutivas,ocorrencias,participacao
Maria Silva,9A,9º ano,72,5.5,3,1,48`;

export default function ImportIndicadoresPanel() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [csv, setCsv] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  async function sendCsv(text: string) {
    setError(null);
    setResult(null);
    const response = await fetch("/api/alunos/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv: text }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Falha na importação.");
      return;
    }
    setResult(
      `${data.atualizados} atualizado(s), ${data.criados} criado(s)${
        data.erros?.length ? ` · ${data.erros.length} erro(s)` : ""
      }`
    );
    if (data.erros?.length) {
      setError(data.erros.slice(0, 5).join(" · "));
    }
    startTransition(() => router.refresh());
  }

  return (
    <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <h2 className="text-lg font-semibold">Importar indicadores (CSV)</h2>
      <p className="mt-1 text-sm text-gray-500">
        Atualiza por nome ou cria aluno novo (respeita limite do plano).
      </p>
      <textarea
        value={csv}
        onChange={(event) => setCsv(event.target.value)}
        rows={5}
        placeholder={EXEMPLO}
        className="mt-3 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 font-mono text-xs outline-none focus:border-cyan-400/40"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending || !csv.trim()}
          onClick={() => startTransition(() => void sendCsv(csv))}
          className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
        >
          Importar
        </button>
        <button
          type="button"
          onClick={() => setCsv(EXEMPLO)}
          className="rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-300"
        >
          Ver exemplo
        </button>
        <label className="cursor-pointer rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100">
          Enviar arquivo
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              void file.text().then((text) => {
                setCsv(text);
                startTransition(() => void sendCsv(text));
              });
            }}
          />
        </label>
      </div>
      {result ? (
        <p className="mt-3 text-sm text-emerald-300">{result}</p>
      ) : null}
      {error ? <p className="mt-2 text-sm text-rose-300">{error}</p> : null}
    </div>
  );
}
