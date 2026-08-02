"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { rotuloRole } from "@/app/lib/data/labels";
import type { Instituicao, UserRole, Usuario } from "@/app/lib/types";

const roles: UserRole[] = [
  "coordenacao",
  "especialista",
  "admin_instituicao",
  "admin_neoguard",
];

type Draft = {
  nome: string;
  email: string;
  role: UserRole;
  instituicaoId: string;
  password: string;
};

const emptyDraft = (instituicaoId = ""): Draft => ({
  nome: "",
  email: "",
  role: "coordenacao",
  instituicaoId,
  password: "",
});

export default function UsuarioAdminPanel({
  usuarios,
  instituicoes,
  currentUserId,
}: {
  usuarios: Usuario[];
  instituicoes: Instituicao[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(
    emptyDraft(instituicoes[0]?.id ?? "")
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>(emptyDraft());

  const instituicaoNome = useMemo(() => {
    return new Map(instituicoes.map((item) => [item.id, item.nome]));
  }, [instituicoes]);

  async function createUsuario() {
    setError(null);
    const response = await fetch("/api/admin/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Não foi possível criar.");
      return;
    }
    setDraft(emptyDraft(instituicoes[0]?.id ?? ""));
    startTransition(() => router.refresh());
  }

  async function saveUsuario(id: string) {
    setError(null);
    const response = await fetch(`/api/admin/usuarios/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editDraft),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Não foi possível salvar.");
      return;
    }
    setEditingId(null);
    startTransition(() => router.refresh());
  }

  async function removeUsuario(id: string, label: string) {
    if (!window.confirm(`Excluir o usuário "${label}"?`)) return;
    setError(null);
    const response = await fetch(`/api/admin/usuarios/${id}`, {
      method: "DELETE",
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Não foi possível excluir.");
      return;
    }
    startTransition(() => router.refresh());
  }

  function Field({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) {
    return (
      <label className="block text-sm text-gray-300">
        <span className="mb-1.5 block text-xs text-gray-500">{label}</span>
        {children}
      </label>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-cyan-400/40";

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-lg font-semibold">Novo usuário</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Field label="Nome">
            <input
              className={inputClass}
              value={draft.nome}
              onChange={(event) =>
                setDraft((current) => ({ ...current, nome: event.target.value }))
              }
            />
          </Field>
          <Field label="E-mail">
            <input
              type="email"
              className={inputClass}
              value={draft.email}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
            />
          </Field>
          <Field label="Senha">
            <input
              type="password"
              className={inputClass}
              value={draft.password}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
            />
          </Field>
          <Field label="Perfil">
            <select
              className={inputClass}
              value={draft.role}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
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
          </Field>
          <Field label="Instituição">
            <select
              className={inputClass}
              value={draft.instituicaoId}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
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
          </Field>
        </div>
        <button
          type="button"
          disabled={pending || instituicoes.length === 0}
          onClick={() => startTransition(() => void createUsuario())}
          className="mt-4 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-gray-100 disabled:opacity-60"
        >
          Criar usuário
        </button>
      </section>

      {error ? (
        <p className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-300">
          {error}
        </p>
      ) : null}

      <section className="space-y-3">
        {usuarios.map((usuario) => (
          <div
            key={usuario.id}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
          >
            {editingId === usuario.id ? (
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Nome">
                  <input
                    className={inputClass}
                    value={editDraft.nome}
                    onChange={(event) =>
                      setEditDraft((current) => ({
                        ...current,
                        nome: event.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="E-mail">
                  <input
                    type="email"
                    className={inputClass}
                    value={editDraft.email}
                    onChange={(event) =>
                      setEditDraft((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="Nova senha (opcional)">
                  <input
                    type="password"
                    className={inputClass}
                    value={editDraft.password}
                    onChange={(event) =>
                      setEditDraft((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="Perfil">
                  <select
                    className={inputClass}
                    value={editDraft.role}
                    onChange={(event) =>
                      setEditDraft((current) => ({
                        ...current,
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
                </Field>
                <Field label="Instituição">
                  <select
                    className={inputClass}
                    value={editDraft.instituicaoId}
                    onChange={(event) =>
                      setEditDraft((current) => ({
                        ...current,
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
                </Field>
                <div className="flex flex-wrap items-end gap-2">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      startTransition(() => void saveUsuario(usuario.id))
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
              </div>
            ) : (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-white">{usuario.nome}</p>
                  <p className="text-sm text-gray-500">{usuario.email}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {instituicaoNome.get(usuario.instituicaoId) ??
                      usuario.instituicaoId}{" "}
                    · {rotuloRole[usuario.role]}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(usuario.id);
                      setEditDraft({
                        nome: usuario.nome,
                        email: usuario.email,
                        role: usuario.role,
                        instituicaoId: usuario.instituicaoId,
                        password: "",
                      });
                    }}
                    className="rounded-xl border border-white/10 px-3 py-2 text-sm text-gray-200 hover:border-cyan-400/30"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    disabled={pending || usuario.id === currentUserId}
                    onClick={() =>
                      startTransition(() =>
                        void removeUsuario(usuario.id, usuario.nome)
                      )
                    }
                    className="rounded-xl border border-rose-400/20 px-3 py-2 text-sm text-rose-300 hover:bg-rose-400/10 disabled:opacity-40"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
