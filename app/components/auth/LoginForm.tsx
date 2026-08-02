"use client";

import { useState, useTransition } from "react";

const contasDemo = [
  "ana@horizonte.edu.br — Coordenação (Horizonte)",
  "carlos@horizonte.edu.br — Especialista (Horizonte)",
  "maria@aurora.edu.br — Coordenação (Aurora)",
  "admin@horizonte.edu.br — Admin instituição",
];

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error ?? "Não foi possível entrar.");
          return;
        }

        window.location.href = data.redirectTo ?? "/dashboard";
      } catch {
        setError("Falha de rede ao tentar entrar.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <div>
        <label htmlFor="email" className="text-sm text-gray-300">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue="ana@horizonte.edu.br"
          className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm outline-none focus:border-cyan-400/40"
        />
      </div>

      <div>
        <label htmlFor="password" className="text-sm text-gray-300">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          defaultValue="demo123"
          className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm outline-none focus:border-cyan-400/40"
        />
      </div>

      {error ? (
        <p className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-300">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-gray-100 disabled:opacity-60"
      >
        {pending ? "Entrando..." : "Entrar"}
      </button>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs leading-5 text-gray-500">
        <p className="mb-1 font-medium text-gray-400">
          Contas demo (senha: demo123)
        </p>
        <ul className="space-y-1">
          {contasDemo.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </form>
  );
}
