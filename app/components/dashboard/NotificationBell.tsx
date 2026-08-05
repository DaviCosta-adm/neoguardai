"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

type Notificacao = {
  id: string;
  tipo: string;
  titulo: string;
  corpo: string;
  href: string | null;
  lida: boolean;
  criadoEm: string;
};

async function fetchNotificacoes(): Promise<{
  items: Notificacao[];
  naoLidas: number;
} | null> {
  const response = await fetch("/api/notificacoes");
  if (!response.ok) return null;
  const data = await response.json();
  return {
    items: data.notificacoes ?? [],
    naoLidas: data.naoLidas ?? 0,
  };
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notificacao[]>([]);
  const [naoLidas, setNaoLidas] = useState(0);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;

    async function load() {
      const data = await fetchNotificacoes();
      if (!active || !data) return;
      setItems(data.items);
      setNaoLidas(data.naoLidas);
    }

    const timer = window.setInterval(() => {
      void load();
    }, 45000);

    void load();

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  function applyData(data: { items: Notificacao[]; naoLidas: number } | null) {
    if (!data) return;
    setItems(data.items);
    setNaoLidas(data.naoLidas);
  }

  async function markAll() {
    await fetch("/api/notificacoes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    startTransition(() => {
      void fetchNotificacoes().then(applyData);
    });
  }

  async function markOne(id: string) {
    await fetch("/api/notificacoes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    startTransition(() => {
      void fetchNotificacoes().then(applyData);
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((prev) => !prev);
          if (!open) {
            startTransition(() => {
              void fetchNotificacoes().then(applyData);
            });
          }
        }}
        className="relative rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-gray-300 transition hover:border-cyan-400/30 hover:text-cyan-200"
        aria-label="Notificações"
      >
        <Bell size={16} />
        {naoLidas > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
            {naoLidas > 9 ? "9+" : naoLidas}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-40 mt-2 w-[min(100vw-2rem,22rem)] rounded-2xl border border-white/10 bg-[#0a1020] p-2 shadow-xl">
          <div className="mb-2 flex items-center justify-between px-2 py-1">
            <p className="text-xs font-medium text-gray-300">Notificações</p>
            <button
              type="button"
              disabled={pending || naoLidas === 0}
              onClick={() => startTransition(() => void markAll())}
              className="text-[11px] text-cyan-300 disabled:opacity-40"
            >
              Marcar todas
            </button>
          </div>

          {items.length === 0 ? (
            <p className="px-3 py-4 text-sm text-gray-500">
              Nenhuma notificação por enquanto.
            </p>
          ) : (
            <div className="max-h-80 space-y-1 overflow-y-auto">
              {items.map((item) => {
                const content = (
                  <div
                    className={`rounded-xl px-3 py-2 text-sm transition hover:bg-white/[0.05] ${
                      item.lida ? "opacity-70" : ""
                    }`}
                  >
                    <p className="font-medium text-white">{item.titulo}</p>
                    {item.corpo ? (
                      <p className="mt-0.5 line-clamp-2 text-xs text-gray-400">
                        {item.corpo}
                      </p>
                    ) : null}
                    <p className="mt-1 text-[10px] text-gray-600">
                      {new Date(item.criadoEm).toLocaleString("pt-BR")}
                    </p>
                  </div>
                );

                if (item.href) {
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => {
                        setOpen(false);
                        if (!item.lida) void markOne(item.id);
                      }}
                    >
                      {content}
                    </Link>
                  );
                }

                return (
                  <button
                    key={item.id}
                    type="button"
                    className="block w-full text-left"
                    onClick={() => {
                      if (!item.lida) startTransition(() => void markOne(item.id));
                    }}
                  >
                    {content}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
