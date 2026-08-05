import "server-only";

import { query } from "@/app/lib/db/client";

export type NotificacaoTipo = "risco" | "convite" | "sistema" | "assinatura";

export type Notificacao = {
  id: string;
  usuarioId: string;
  instituicaoId: string | null;
  tipo: NotificacaoTipo;
  titulo: string;
  corpo: string;
  href: string | null;
  lida: boolean;
  criadoEm: string;
};

type NotificacaoRow = {
  id: string;
  usuario_id: string;
  instituicao_id: string | null;
  tipo: NotificacaoTipo;
  titulo: string;
  corpo: string;
  href: string | null;
  lida: boolean;
  criado_em: Date | string;
};

function mapNotificacao(row: NotificacaoRow): Notificacao {
  return {
    id: row.id,
    usuarioId: row.usuario_id,
    instituicaoId: row.instituicao_id,
    tipo: row.tipo,
    titulo: row.titulo,
    corpo: row.corpo,
    href: row.href,
    lida: row.lida,
    criadoEm:
      row.criado_em instanceof Date
        ? row.criado_em.toISOString()
        : String(row.criado_em),
  };
}

function slugId() {
  return `ntf-${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

export async function criarNotificacao(input: {
  usuarioId: string;
  instituicaoId?: string | null;
  tipo: NotificacaoTipo;
  titulo: string;
  corpo?: string;
  href?: string | null;
}): Promise<Notificacao> {
  const id = slugId();
  const result = await query<NotificacaoRow>(
    `INSERT INTO notificacoes
       (id, usuario_id, instituicao_id, tipo, titulo, corpo, href)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [
      id,
      input.usuarioId,
      input.instituicaoId ?? null,
      input.tipo,
      input.titulo.trim(),
      (input.corpo ?? "").trim(),
      input.href ?? null,
    ]
  );
  return mapNotificacao(result.rows[0]);
}

export async function criarNotificacoesParaUsuarios(input: {
  usuarioIds: string[];
  instituicaoId?: string | null;
  tipo: NotificacaoTipo;
  titulo: string;
  corpo?: string;
  href?: string | null;
}): Promise<number> {
  let count = 0;
  for (const usuarioId of input.usuarioIds) {
    await criarNotificacao({
      usuarioId,
      instituicaoId: input.instituicaoId,
      tipo: input.tipo,
      titulo: input.titulo,
      corpo: input.corpo,
      href: input.href,
    });
    count += 1;
  }
  return count;
}

export async function listNotificacoesDoUsuario(
  usuarioId: string,
  options?: { limit?: number; apenasNaoLidas?: boolean }
): Promise<Notificacao[]> {
  const limit = options?.limit ?? 20;
  const result = options?.apenasNaoLidas
    ? await query<NotificacaoRow>(
        `SELECT * FROM notificacoes
         WHERE usuario_id = $1 AND lida = FALSE
         ORDER BY criado_em DESC
         LIMIT $2`,
        [usuarioId, limit]
      )
    : await query<NotificacaoRow>(
        `SELECT * FROM notificacoes
         WHERE usuario_id = $1
         ORDER BY criado_em DESC
         LIMIT $2`,
        [usuarioId, limit]
      );
  return result.rows.map(mapNotificacao);
}

export async function countNotificacoesNaoLidas(
  usuarioId: string
): Promise<number> {
  const result = await query<{ total: string | number }>(
    `SELECT COUNT(*)::int AS total
     FROM notificacoes
     WHERE usuario_id = $1 AND lida = FALSE`,
    [usuarioId]
  );
  return Number(result.rows[0]?.total ?? 0);
}

export async function marcarNotificacaoLida(
  usuarioId: string,
  id: string
): Promise<Notificacao | null> {
  const result = await query<NotificacaoRow>(
    `UPDATE notificacoes
     SET lida = TRUE
     WHERE id = $1 AND usuario_id = $2
     RETURNING *`,
    [id, usuarioId]
  );
  const row = result.rows[0];
  return row ? mapNotificacao(row) : null;
}

export async function marcarTodasNotificacoesLidas(
  usuarioId: string
): Promise<number> {
  const result = await query<{ total: string | number }>(
    `WITH updated AS (
       UPDATE notificacoes
       SET lida = TRUE
       WHERE usuario_id = $1 AND lida = FALSE
       RETURNING id
     )
     SELECT COUNT(*)::int AS total FROM updated`,
    [usuarioId]
  );
  return Number(result.rows[0]?.total ?? 0);
}
