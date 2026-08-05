"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { rotuloRole } from "@/app/lib/data/labels";
import type { Convite, Instituicao, UserRole } from "@/app/lib/types";

const platformRoles: UserRole[] = [
  "coordenacao",
  "especialista",
  "admin_instituicao",
  "admin_neoguard",
];

const schoolRoles: UserRole[] = [
  "coordenacao",
  "especialista",
  "admin_instituicao",
];

function statusStyles(status: Convite["status"]) {
  if (status === "pendente") {
    return "border-amber-400/20 bg-amber-400/10 text-amber-100";
  }
  if (status === "aceito") {
    return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
  }
  if (status === "revogado") {
    return "border-rose-400/20 bg-rose-400/10 text-rose-200";
  }
  return "border-white/10 bg-white/[0.04] text-gray-300";
}

export default function ConviteAdminPanel({
  convites,
  instituicoes,
  actorRole,
  defaultInstituicaoId,
  emailConfigured,
}: {
  convites: Convite[];
  instituicoes: Instituicao[];
  actorRole: UserRole;
  defaultInstituicaoId: string;
  emailConfigured: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [lastInviteUrl, setLastInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const roles = actorRole === "admin_neoguard" ? platformRoles : schoolRoles;

  const [draft, setDraft] = useState({
    nome: "",
    email: "",
    role: "coordenacao" as UserRole,
    instituicaoId: defaultInstituicaoId || instituicoes[0]?.id || "",
  });

  const instituicaoNome = useMemo(
    () => new Map(instituicoes.map((item) => [item.id, item.nome])),
    [instituicoes]
  );

  async function createInvite() {
    setError(null);
    setCopied(false);
    const response = await fetch("/api/admin/convites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Não foi possível criar o convite.");
      return;
    }
    setLastInviteUrl(data.convite?.inviteUrl ?? null);
    setDraft((prev) => ({
      ...prev,
      nome: "",
      email: "",
    }));
    startTransition(() => router.refresh());
  }

  async function revokeInvite(id: string) {
    if (!window.confirm("Revogar este convite?")) return;
    setError(null);
    const response = await fetch(`/api/admin/convites/${id}`, {
      method: "DELETE",
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Não foi possível revogar.");
      return;
    }
    startTransition(() => router.refresh());
  }

  async function copyLink() {
    if (!lastInviteUrl) return;
    await navigator.clipboard.writeText(lastInviteUrl);
    setCopied(true);
  }

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-cyan-400/40";

  return (
    <div className="space-y-6">
      {!emailConfigured ? (
        <p className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-sm text-amber-100">
          E-mail automático não configurado. O link do convite será exibido para
          você copiar e enviar manualmente. Opcional: `RESEND_API_KEY` +
          `EMAIL_FROM`.
        </p>
      ) : null}

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-lg font-semibold">Novo convite</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="block text-sm text-gray-300">
            <span className="mb-1.5 block text-xs text-gray-500">Nome</span>
            <input
              className={inputClass}
              value={draft.nome}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, nome: event.target.value }))
              }
              placeholder="Nome da pessoa"
            />
          </label>
          <label className="block text-sm text-gray-300">
            <span className="mb-1.5 block text-xs text-gray-500">E-mail</span>
            <input
              type="email"
              className={inputClass}
              value={draft.email}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, email: event.target.value }))
              }
              placeholder="email@escola.edu.br"
            />
          </label>
          <label className="block text-sm text-gray-300">
            <span className="mb-1.5 block text-xs text-gray-500">Perfil</span>
            <select
              className={inputClass}
              value={draft.role}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  role: event.target.value as UserRole,
                }))
              }
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {rotuloRole[role]}
                </option>
              ))}
            </select>
          </label>
          {actorRole === "admin_neoguard" ? (
            <label className="block text-sm text-gray-300">
              <span className="mb-1.5 block text-xs text-gray-500">
                Instituição
              </span>
              <select
                className={inputClass}
                value={draft.instituicaoId}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    instituicaoId: event.target.value,
                  }))
                }
              >
                {instituicoes.map((instituicao) => (
                  <option key={instituicao.id} value={instituicao.id}>
                    {instituicao.nome}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <div className="text-sm text-gray-400">
              <span className="mb-1.5 block text-xs text-gray-500">
                Instituição
              </span>
              <p className="rounded-xl border border-white/10 px-3 py-2">
                {instituicaoNome.get(defaultInstituicaoId) || "Sua instituição"}
              </p>
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={pending || !draft.nome.trim() || !draft.email.trim()}
          onClick={() => startTransition(() => void createInvite())}
          className="mt-4 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-gray-100 disabled:opacity-60"
        >
          Gerar convite
        </button>

        {lastInviteUrl ? (
          <div className="mt-4 rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-3">
            <p className="text-xs text-cyan-100">Link do convite</p>
            <p className="mt-1 break-all text-sm text-white">{lastInviteUrl}</p>
            <button
              type="button"
              onClick={() => void copyLink()}
              className="mt-2 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-100 transition hover:border-cyan-400/40"
            >
              {copied ? "Copiado" : "Copiar link"}
            </button>
          </div>
        ) : null}
      </section>

      {error ? (
        <p className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-300">
          {error}
        </p>
      ) : null}

      <section className="space-y-3">
        {convites.map((convite) => (
          <div
            key={convite.id}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-medium text-white">{convite.nome}</p>
                <p className="text-sm text-gray-500">{convite.email}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {rotuloRole[convite.role]} · {convite.instituicaoNome} · por{" "}
                  {convite.criadoPorNome}
                </p>
                <p className="mt-1 text-xs text-gray-600">
                  Expira em{" "}
                  {new Date(convite.expiraEm).toLocaleString("pt-BR")}
                </p>
              </div>
              <span
                className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-xs capitalize ${statusStyles(
                  convite.status
                )}`}
              >
                {convite.status}
              </span>
            </div>
            {convite.status === "pendente" ? (
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  startTransition(() => void revokeInvite(convite.id))
                }
                className="mt-3 rounded-xl border border-rose-400/20 px-3 py-2 text-sm text-rose-200 transition hover:bg-rose-400/10 disabled:opacity-60"
              >
                Revogar
              </button>
            ) : null}
          </div>
        ))}

        {convites.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-6 text-sm text-gray-500">
            Nenhum convite ainda.
          </p>
        ) : null}
      </section>
    </div>
  );
}
