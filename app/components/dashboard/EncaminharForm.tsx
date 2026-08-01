"use client";

import { useActionState } from "react";
import {
  encaminharAlunoAction,
  type EspecialistaFormState,
} from "@/app/actions/especialistas";

const initialState: EspecialistaFormState = {};

export default function EncaminharForm({
  alunoId,
  especialistas,
}: {
  alunoId: string;
  especialistas: Array<{ id: string; nome: string }>;
}) {
  const [state, action, pending] = useActionState(
    encaminharAlunoAction,
    initialState
  );

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="alunoId" value={alunoId} />

      <div>
        <label htmlFor="especialistaId" className="text-xs text-gray-500">
          Especialista (opcional)
        </label>
        <select
          id="especialistaId"
          name="especialistaId"
          className="mt-1 w-full rounded-xl border border-white/10 bg-[#0a1024] px-3 py-2 text-sm outline-none focus:border-cyan-400/40"
          defaultValue=""
        >
          <option value="">Fila geral da instituição</option>
          {especialistas.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nome}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="motivo" className="text-xs text-gray-500">
          Motivo do encaminhamento
        </label>
        <textarea
          id="motivo"
          name="motivo"
          required
          rows={3}
          placeholder="Descreva o motivo e o que já foi feito."
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
        className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
      >
        {pending ? "Encaminhando..." : "Encaminhar caso"}
      </button>
    </form>
  );
}
