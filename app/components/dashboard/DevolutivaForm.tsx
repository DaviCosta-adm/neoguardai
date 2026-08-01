"use client";

import { useActionState } from "react";
import {
  registrarDevolutivaAction,
  type EspecialistaFormState,
} from "@/app/actions/especialistas";
import { rotuloTipoDevolutiva } from "@/app/lib/data/labels";
import type { TipoDevolutiva } from "@/app/lib/types";

const initialState: EspecialistaFormState = {};
const tipos = Object.keys(rotuloTipoDevolutiva) as TipoDevolutiva[];

export default function DevolutivaForm({
  encaminhamentoId,
}: {
  encaminhamentoId: string;
}) {
  const [state, action, pending] = useActionState(
    registrarDevolutivaAction,
    initialState
  );

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="encaminhamentoId" value={encaminhamentoId} />

      <div>
        <label htmlFor="tipo" className="text-xs text-gray-500">
          Tipo de registro
        </label>
        <select
          id="tipo"
          name="tipo"
          defaultValue="devolutiva"
          className="mt-1 w-full rounded-xl border border-white/10 bg-[#0a1024] px-3 py-2 text-sm outline-none focus:border-cyan-400/40"
        >
          {tipos.map((tipo) => (
            <option key={tipo} value={tipo}>
              {rotuloTipoDevolutiva[tipo]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="conteudo" className="text-xs text-gray-500">
          Conteúdo
        </label>
        <textarea
          id="conteudo"
          name="conteudo"
          required
          rows={4}
          placeholder="Atendimento, observação, devolutiva ou recomendação."
          className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none placeholder:text-gray-600 focus:border-cyan-400/40"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-400">
        <input type="checkbox" name="concluir" className="rounded border-white/20" />
        Concluir encaminhamento
      </label>

      {state?.error ? (
        <p className="text-sm text-rose-300">{state.error}</p>
      ) : null}
      {state?.success ? (
        <p className="text-sm text-emerald-300">{state.success}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-cyan-400/90 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Registrar"}
      </button>
    </form>
  );
}
