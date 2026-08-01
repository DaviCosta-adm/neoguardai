"use client";

import { useActionState } from "react";
import {
  criarIntervencao,
  type IntervencaoState,
} from "@/app/actions/intervencoes";
import { rotuloIntervencao } from "@/app/lib/data/labels";
import type { TipoIntervencao } from "@/app/lib/types";

const initialState: IntervencaoState = {};

const tipos = Object.keys(rotuloIntervencao) as TipoIntervencao[];

export default function IntervencaoForm({ alunoId }: { alunoId: string }) {
  const [state, action, pending] = useActionState(criarIntervencao, initialState);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="alunoId" value={alunoId} />

      <div>
        <label htmlFor="tipo" className="text-xs text-gray-500">
          Tipo de ação
        </label>
        <select
          id="tipo"
          name="tipo"
          className="mt-1 w-full rounded-xl border border-white/10 bg-[#0a1024] px-3 py-2 text-sm outline-none focus:border-cyan-400/40"
          defaultValue="conversa_aluno"
        >
          {tipos.map((tipo) => (
            <option key={tipo} value={tipo}>
              {rotuloIntervencao[tipo]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="descricao" className="text-xs text-gray-500">
          Descrição
        </label>
        <textarea
          id="descricao"
          name="descricao"
          required
          rows={3}
          placeholder="O que foi feito e qual o próximo passo?"
          className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none placeholder:text-gray-600 focus:border-cyan-400/40"
        />
      </div>

      {state?.error ? (
        <p className="text-sm text-rose-300">{state.error}</p>
      ) : null}
      {state?.success ? (
        <p className="text-sm text-emerald-300">{state.success}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-cyan-400/90 px-4 py-2 text-sm font-semibold text-black transition hover:bg-cyan-300 disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Registrar intervenção"}
      </button>
    </form>
  );
}
