"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useDeferredValue, useEffect, useState } from "react";

type Resultado = {
  id: string;
  nome: string;
  turma: string;
  serie: string;
  riscoNivel: string;
  riscoPercentual: number;
  href: string;
};

export default function QuickSearch() {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [open, setOpen] = useState(false);
  const buscaAtiva = deferred.trim().length >= 2;
  const resultadosVisiveis = buscaAtiva ? resultados : [];

  useEffect(() => {
    const q = deferred.trim();
    if (q.length < 2) {
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      void fetch(`/api/busca?q=${encodeURIComponent(q)}`, {
        signal: controller.signal,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.ok) setResultados(data.resultados ?? []);
        })
        .catch(() => {
          /* ignore abort */
        });
    }, 180);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [deferred]);

  return (
    <div className="relative min-w-[220px] flex-1 lg:flex-none">
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-300">
        <Search size={15} className="shrink-0 text-gray-500" />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            window.setTimeout(() => setOpen(false), 150);
          }}
          placeholder="Buscar aluno, turma..."
          className="w-full bg-transparent outline-none placeholder:text-gray-500"
          aria-label="Busca rápida"
        />
      </div>

      {open && query.trim().length >= 2 ? (
        <div className="absolute right-0 z-30 mt-2 w-[min(100vw-2rem,22rem)] rounded-2xl border border-white/10 bg-[#0a1020] p-2 shadow-xl">
          {resultadosVisiveis.length === 0 ? (
            <p className="px-3 py-2 text-sm text-gray-500">Nenhum resultado.</p>
          ) : (
            resultadosVisiveis.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="block rounded-xl px-3 py-2 text-sm transition hover:bg-white/[0.05]"
                onClick={() => {
                  setQuery("");
                  setOpen(false);
                }}
              >
                <p className="font-medium text-white">{item.nome}</p>
                <p className="text-xs text-gray-500">
                  {item.turma} · {item.serie} · {item.riscoPercentual}%
                </p>
              </Link>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
