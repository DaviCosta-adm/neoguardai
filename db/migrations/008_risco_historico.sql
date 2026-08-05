-- Histórico longitudinal de risco + registro de modelos calibrados.

CREATE TABLE IF NOT EXISTS modelo_risco (
  id TEXT PRIMARY KEY,
  versao TEXT NOT NULL UNIQUE,
  ativo BOOLEAN NOT NULL DEFAULT FALSE,
  pesos JSONB NOT NULL DEFAULT '{}'::jsonb,
  metricas JSONB NOT NULL DEFAULT '{}'::jsonb,
  notas TEXT NOT NULL DEFAULT '',
  treinado_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_modelo_risco_ativo
  ON modelo_risco (ativo)
  WHERE ativo = TRUE;

CREATE TABLE IF NOT EXISTS risco_snapshots (
  id TEXT PRIMARY KEY,
  aluno_id TEXT NOT NULL REFERENCES alunos (id) ON DELETE CASCADE,
  instituicao_id TEXT NOT NULL REFERENCES instituicoes (id),
  capturado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  frequencia NUMERIC(5, 2) NOT NULL,
  desempenho NUMERIC(4, 2) NOT NULL,
  faltas_consecutivas INTEGER NOT NULL DEFAULT 0,
  ocorrencias INTEGER NOT NULL DEFAULT 0,
  participacao INTEGER NOT NULL DEFAULT 0,
  risco_percentual INTEGER NOT NULL DEFAULT 0,
  risco_nivel TEXT NOT NULL CHECK (
    risco_nivel IN ('baixo', 'medio', 'alto', 'critico')
  ),
  fatores_risco JSONB NOT NULL DEFAULT '[]'::jsonb,
  explicacao_atlas TEXT NOT NULL DEFAULT '',
  projecao_14d INTEGER NOT NULL DEFAULT 0,
  tendencia TEXT NOT NULL CHECK (
    tendencia IN ('subindo', 'estavel', 'caindo')
  ),
  probabilidade_evasao INTEGER NOT NULL DEFAULT 0,
  modelo_versao TEXT NOT NULL DEFAULT 'v2',
  origem TEXT NOT NULL DEFAULT 'manual' CHECK (
    origem IN ('manual', 'intervencao', 'status', 'batch', 'seed')
  ),
  -- Rótulo supervisionado preenchido depois (ex.: risco observado 14d depois).
  outcome_risco INTEGER,
  outcome_em TIMESTAMPTZ,
  outcome_fonte TEXT
);

CREATE INDEX IF NOT EXISTS idx_risco_snapshots_aluno
  ON risco_snapshots (aluno_id, capturado_em DESC);

CREATE INDEX IF NOT EXISTS idx_risco_snapshots_instituicao
  ON risco_snapshots (instituicao_id, capturado_em DESC);

CREATE INDEX IF NOT EXISTS idx_risco_snapshots_outcome
  ON risco_snapshots (outcome_risco)
  WHERE outcome_risco IS NOT NULL;

-- Modelo base (pesos = 1.0) já ativo.
INSERT INTO modelo_risco (id, versao, ativo, pesos, metricas, notas, treinado_em)
VALUES (
  'modelo-v2-base',
  'v2',
  TRUE,
  '{
    "frequenciaBaixa": 1,
    "frequenciaMedia": 1,
    "faltasAltas": 1,
    "faltasMedias": 1,
    "desempenhoBaixo": 1,
    "desempenhoMedio": 1,
    "ocorrenciasAltas": 1,
    "ocorrenciasMedias": 1,
    "participacaoBaixa": 1,
    "participacaoMedia": 1,
    "pressaoFaltas": 1,
    "pressaoFrequencia": 1,
    "pressaoDesempenho": 1,
    "pressaoParticipacao": 1,
    "pressaoOcorrencias": 1,
    "pressaoProjecao": 1
  }'::jsonb,
  '{"amostras":0,"mae":null,"brier":null,"fonte":"defaults"}'::jsonb,
  'Pesos padrão do modelo explicável v2.',
  NOW()
)
ON CONFLICT (id) DO NOTHING;
