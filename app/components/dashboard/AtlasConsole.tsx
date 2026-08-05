"use client";

import { useMemo, useState } from "react";
import type { Aluno } from "@/app/lib/types";
import type { ResultadoPreditivo } from "@/app/lib/risk/predictive";

type Message = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

export default function AtlasConsole({
  alunos,
  preditivos,
}: {
  alunos: Aluno[];
  preditivos: Record<string, ResultadoPreditivo>;
}) {
  const [alunoId, setAlunoId] = useState(alunos[0]?.id ?? "");
  const [input, setInput] = useState("Por que este aluno está em risco?");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Olá! Selecione um aluno e pergunte sobre risco, alertas ou próximos passos.",
    },
  ]);

  const selecionado = useMemo(
    () => alunos.find((aluno) => aluno.id === alunoId) ?? null,
    [alunoId, alunos]
  );
  const preditivo = alunoId ? preditivos[alunoId] : null;

  async function sendMessage(question?: string) {
    const text = (question ?? input).trim();
    if (!text || typing) return;

    setMessages((old) => [
      ...old,
      { id: `${Date.now()}-u`, role: "user", content: text },
    ]);
    setInput("");
    setTyping(true);

    try {
      const response = await fetch("/api/atlas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, alunoId: alunoId || undefined }),
      });

      const data = await response.json();
      setMessages((old) => [
        ...old,
        {
          id: `${Date.now()}-a`,
          role: "assistant",
          content:
            data.reply ??
            "Não consegui gerar uma resposta no momento.",
        },
      ]);
    } catch {
      setMessages((old) => [
        ...old,
        {
          id: `${Date.now()}-e`,
          role: "assistant",
          content: "Desculpe, ocorreu um erro ao processar sua solicitação.",
        },
      ]);
    } finally {
      setTyping(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div>
          <label htmlFor="alunoId" className="text-xs text-gray-500">
            Caso em análise
          </label>
          <select
            id="alunoId"
            value={alunoId}
            onChange={(event) => setAlunoId(event.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-[#0a1024] px-3 py-2 text-sm outline-none focus:border-cyan-400/40"
          >
            {alunos.map((aluno) => (
              <option key={aluno.id} value={aluno.id}>
                {aluno.nome} · {aluno.riscoPercentual}%
              </option>
            ))}
          </select>
        </div>

        {selecionado && preditivo ? (
          <div className="space-y-2 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-3 text-sm text-gray-300">
            <p className="font-medium text-white">{selecionado.nome}</p>
            <p>Risco atual: {preditivo.percentual}%</p>
            <p>Projeção 14d: {preditivo.projecao14d}%</p>
            <p>Tendência: {preditivo.tendencia}</p>
            <p>Prob. evasão: {preditivo.probabilidadeEvasao}%</p>
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          {[
            "Por que este aluno está em risco?",
            "Qual o próximo passo?",
            "Resuma os alertas do caso",
          ].map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => sendMessage(suggestion)}
              className="rounded-xl border border-white/10 px-3 py-2 text-left text-xs text-gray-300 hover:border-cyan-400/30"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </aside>

      <section className="flex min-h-[420px] flex-col rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                message.role === "user"
                  ? "ml-auto bg-cyan-400/15 text-cyan-50"
                  : "bg-white/[0.04] text-gray-200"
              }`}
            >
              {message.content}
            </div>
          ))}
          {typing ? (
            <p className="text-xs text-gray-500">Atlas está digitando...</p>
          ) : null}
        </div>

        <form
          className="flex gap-2 border-t border-white/10 p-3"
          onSubmit={(event) => {
            event.preventDefault();
            void sendMessage();
          }}
        >
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Pergunte ao Atlas sobre o caso..."
            className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-cyan-400/40"
          />
          <button
            type="submit"
            disabled={typing}
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
          >
            Enviar
          </button>
        </form>
      </section>
    </div>
  );
}
