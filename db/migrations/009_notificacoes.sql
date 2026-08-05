CREATE TABLE IF NOT EXISTS notificacoes (
  id TEXT PRIMARY KEY,
  usuario_id TEXT NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
  instituicao_id TEXT REFERENCES instituicoes (id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (
    tipo IN ('risco', 'convite', 'sistema', 'assinatura')
  ),
  titulo TEXT NOT NULL,
  corpo TEXT NOT NULL DEFAULT '',
  href TEXT,
  lida BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario_lida
  ON notificacoes (usuario_id, lida, criado_em DESC);

CREATE INDEX IF NOT EXISTS idx_notificacoes_instituicao
  ON notificacoes (instituicao_id, criado_em DESC);
