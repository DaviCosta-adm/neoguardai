"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { rotuloRole } from "@/app/lib/data/labels";
import type { ConviteStatus, UserRole } from "@/app/lib/types";

type ConvitePublico = {
  nome: string;
  email: string;
  role: UserRole;
  instituicaoNome: string;
  status: ConviteStatus;
  expiraEm: string;
};

export default function AceitarConvitePage() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const [convite, setConvite] = useState<ConvitePublico | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [nome, setNome] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const response = await fetch(`/api/convites/${token}`);
      const data = await response.json();
      if (cancelled) return;
      if (!response.ok) {
        setLoadError(data.error ?? "Convite inválido.");
        return;
      }
      setConvite(data.convite);
      setNome(data.convite.nome ?? "");
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }

    startTransition(async () => {
      const response = await fetch(`/api/convites/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, nome }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Não foi possível aceitar o convite.");
        return;
      }
      window.location.href = data.redirectTo ?? "/dashboard";
    });
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050816] px-4 py-10 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.12),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(56,189,248,0.08),transparent_35%)]" />
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">
          NeoGuardAI
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Aceitar convite</h1>

        {loadError ? (
          <p className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
            {loadError}
          </p>
        ) : null}

        {convite ? (
          <>
            <p className="mt-3 text-sm text-gray-400">
              {convite.instituicaoNome} · {rotuloRole[convite.role]}
            </p>
            <p className="mt-1 text-sm text-gray-500">{convite.email}</p>

            {convite.status !== "pendente" ? (
              <p className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-sm text-amber-100">
                Este convite está {convite.status} e não pode ser usado.
              </p>
            ) : (
              <form onSubmit={submit} className="mt-5 space-y-3">
                <label className="block text-sm text-gray-300">
                  <span className="mb-1.5 block text-xs text-gray-500">Nome</span>
                  <input
                    value={nome}
                    onChange={(event) => setNome(event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-cyan-400/40"
                    required
                  />
                </label>
                <label className="block text-sm text-gray-300">
                  <span className="mb-1.5 block text-xs text-gray-500">
                    Senha
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    minLength={6}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-cyan-400/40"
                    required
                  />
                </label>
                <label className="block text-sm text-gray-300">
                  <span className="mb-1.5 block text-xs text-gray-500">
                    Confirmar senha
                  </span>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(event) => setConfirm(event.target.value)}
                    minLength={6}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-cyan-400/40"
                    required
                  />
                </label>

                {error ? (
                  <p className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-300">
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={pending}
                  className="w-full rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-gray-100 disabled:opacity-60"
                >
                  {pending ? "Criando conta..." : "Criar conta e entrar"}
                </button>
              </form>
            )}
          </>
        ) : !loadError ? (
          <p className="mt-4 text-sm text-gray-500">Carregando convite...</p>
        ) : null}
      </div>
    </main>
  );
}
