"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import RiskBadge from "@/app/components/dashboard/RiskBadge";
import { rotuloStatusAcompanhamento } from "@/app/lib/data/labels";
import type { Aluno, RiskLevel } from "@/app/lib/types";

const filtrosRisco: Array<{ label: string; value: "todos" | RiskLevel }> = [
  { label: "Todos", value: "todos" },
  { label: "Crítico", value: "critico" },
  { label: "Alto", value: "alto" },
  { label: "Médio", value: "medio" },
  { label: "Baixo", value: "baixo" },
];

export default function AlunosTable({ alunos }: { alunos: Aluno[] }) {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<"todos" | RiskLevel>("todos");

  const filtrados = useMemo(() => {
    return alunos.filter((aluno) => {
      const matchBusca =
        aluno.nome.toLowerCase().includes(busca.toLowerCase()) ||
        aluno.turma.toLowerCase().includes(busca.toLowerCase());
      const matchRisco = filtro === "todos" || aluno.riscoNivel === filtro;
      return matchBusca && matchRisco;
    });
  }, [alunos, busca, filtro]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <input
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
          placeholder="Buscar por nome ou turma"
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none placeholder:text-gray-500 focus:border-cyan-400/40 lg:max-w-sm"
        />

        <div className="flex flex-wrap gap-2">
          {filtrosRisco.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFiltro(item.value)}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                filtro === item.value
                  ? "border-cyan-400/40 bg-cyan-400/15 text-cyan-200"
                  : "border-white/10 text-gray-400 hover:border-white/20"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/[0.03] text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Aluno</th>
                <th className="px-4 py-3 font-medium">Turma</th>
                <th className="px-4 py-3 font-medium">Frequência</th>
                <th className="px-4 py-3 font-medium">Desempenho</th>
                <th className="px-4 py-3 font-medium">Risco</th>
                <th className="px-4 py-3 font-medium">Situação</th>
                <th className="px-4 py-3 font-medium">Atualização</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((aluno) => (
                <tr
                  key={aluno.id}
                  className="border-t border-white/5 transition hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/alunos/${aluno.id}`}
                      className="font-medium text-white hover:text-cyan-300"
                    >
                      {aluno.nome}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {aluno.turma}
                    <span className="block text-xs text-gray-600">
                      {aluno.serie}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{aluno.frequencia}%</td>
                  <td className="px-4 py-3 text-gray-300">
                    {aluno.desempenho.toFixed(1)}
                  </td>
                  <td className="px-4 py-3">
                    <RiskBadge
                      nivel={aluno.riscoNivel}
                      percentual={aluno.riscoPercentual}
                    />
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {rotuloStatusAcompanhamento[aluno.statusAcompanhamento]}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(aluno.atualizadoEm).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filtrados.length === 0 ? (
        <p className="text-sm text-gray-500">
          Nenhum aluno encontrado com os filtros atuais.
        </p>
      ) : null}
    </div>
  );
}
