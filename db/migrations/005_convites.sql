CREATE TABLE IF NOT EXISTS convites (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  nome TEXT NOT NULL,
  role TEXT NOT NULL CHECK (
    role IN (
      'coordenacao',
      'especialista',
      'admin_instituicao',
      'admin_neoguard'
    )
  ),
  instituicao_id TEXT NOT NULL REFERENCES instituicoes (id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (
    status IN ('pendente', 'aceito', 'revogado')
  ),
  criado_por TEXT NOT NULL REFERENCES usuarios (id),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expira_em TIMESTAMPTZ NOT NULL,
  aceito_em TIMESTAMPTZ,
  usuario_id TEXT REFERENCES usuarios (id),
  observacao TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_convites_email ON convites (lower(email));
CREATE INDEX IF NOT EXISTS idx_convites_instituicao ON convites (instituicao_id);
CREATE INDEX IF NOT EXISTS idx_convites_status ON convites (status);
