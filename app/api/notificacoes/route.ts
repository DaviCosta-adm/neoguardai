import { NextResponse } from "next/server";
import { requireAuthApi } from "@/app/lib/auth/dal";
import {
  countNotificacoesNaoLidas,
  listNotificacoesDoUsuario,
  marcarNotificacaoLida,
  marcarTodasNotificacoesLidas,
} from "@/app/lib/data/notificacoes";

export async function GET(request: Request) {
  const auth = await requireAuthApi();
  if (!auth) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get("unread") === "1";
  const [notificacoes, naoLidas] = await Promise.all([
    listNotificacoesDoUsuario(auth.user.id, {
      limit: 30,
      apenasNaoLidas: unreadOnly,
    }),
    countNotificacoesNaoLidas(auth.user.id),
  ]);

  return NextResponse.json({ ok: true, notificacoes, naoLidas });
}

export async function PATCH(request: Request) {
  const auth = await requireAuthApi();
  if (!auth) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  if (body?.all === true) {
    const updated = await marcarTodasNotificacoesLidas(auth.user.id);
    return NextResponse.json({ ok: true, updated });
  }

  const id = String(body?.id ?? "");
  if (!id) {
    return NextResponse.json({ error: "Informe o id." }, { status: 400 });
  }

  const notificacao = await marcarNotificacaoLida(auth.user.id, id);
  if (!notificacao) {
    return NextResponse.json(
      { error: "Notificação não encontrada." },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, notificacao });
}
