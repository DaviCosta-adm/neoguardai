"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { InstituicaoResumo } from "@/app/lib/types";

export default function InstituicaoAdminPanel({
  instituicoes,
}: {
  instituicoes: InstituicaoResumo[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingNome, setEditingNome] = useState("");

  async function createInstituicao() {
    setError(null);
    const response = await fetch("/api/admin/instituicoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Não foi possível criar.");
      return;
    }
    setNome("");
    startTransition(() => router.refresh());
  }

  async function saveInstituicao(id: string) {
    setError(null);
    const response = await fetch(`/api/admin/instituicoes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: editingNome }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Não foi possível salvar.");
      return;
    }
    setEditingId(null);
    startTransition(() => router.refresh());
  }

  async function removeInstituicao(id: string, label: string) {
    if (!window.confirm(`Excluir a instituição "${label}"?`)) return;
    setError(null);
    const response = await fetch(`/api/admin/instituicoes/${id}`, {
      method: "DELETE",
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Não foi possível excluir.");
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-lg font-semibold">Nova instituição</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            placeholder="Nome da escola ou rede"
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm outline-none focus:border-cyan-400/40"
          />
          <button
            type="button"
            disabled={pending || !nome.trim()}
            onClick={() => startTransition(() => void createInstituicao())}
            className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-gray-100 disabled:opacity-60"
          >
            Criar
          </button>
        </div>
      </section>

      {error ? (
        <p className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-300">
          {error}
        </p>
      ) : null}

      <section className="space-y-3">
        {instituicoes.map((instituicao) => (
          <div
            key={instituicao.id}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
          >
            {editingId === instituicao.id ? (
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={editingNome}
                  onChange={(event) => setEditingNome(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm outline-none focus:border-cyan-400/40"
                />
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    startTransition(() => void saveInstituicao(instituicao.id))
                  }
                  className="rounded-xl bg-cyan-400/20 px-4 py-2.5 text-sm text-cyan-100"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-gray-300"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <Link
                    href={`/dashboard/instituicoes/${instituicao.id}`}
                    className="text-lg font-semibold text-white hover:text-cyan-200"
                  >
                    {instituicao.nome}
                  </Link>
                  <p className="mt-1 text-xs text-gray-500">
                    ID: {instituicao.id} · {instituicao.totalEstudantes}{" "}
                    estudantes · {instituicao.usuarios} usuários
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(instituicao.id);
                      setEditingNome(instituicao.nome);
                    }}
                    className="rounded-xl border border-white/10 px-3 py-2 text-sm text-gray-200 hover:border-cyan-400/30"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      startTransition(() =>
                        void removeInstituicao(instituicao.id, instituicao.nome)
                      )
                    }
                    className="rounded-xl border border-rose-400/20 px-3 py-2 text-sm text-rose-300 hover:bg-rose-400/10"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {instituicoes.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhuma instituição cadastrada.</p>
        ) : null}
      </section>
    </div>
  );
}
