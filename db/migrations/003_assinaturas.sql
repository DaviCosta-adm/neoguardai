CREATE TABLE IF NOT EXISTS assinaturas (
  id TEXT PRIMARY KEY,
  instituicao_id TEXT NOT NULL UNIQUE REFERENCES instituicoes (id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('ativo', 'inativo', 'bloqueado')),
  plano TEXT NOT NULL DEFAULT 'padrao',
  iniciada_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizada_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  observacao TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_assinaturas_status ON assinaturas (status);

INSERT INTO assinaturas (id, instituicao_id, status, plano, observacao)
SELECT
  'ass-' || i.id,
  i.id,
  'ativo',
  'padrao',
  'Assinatura inicial criada automaticamente.'
FROM instituicoes i
WHERE NOT EXISTS (
  SELECT 1 FROM assinaturas a WHERE a.instituicao_id = i.id
);
