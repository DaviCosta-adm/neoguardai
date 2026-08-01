CREATE TABLE IF NOT EXISTS instituicoes (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS usuarios (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (
    role IN (
      'coordenacao',
      'especialista',
      'admin_instituicao',
      'admin_neoguard'
    )
  ),
  instituicao_id TEXT NOT NULL REFERENCES instituicoes (id)
);

CREATE TABLE IF NOT EXISTS alunos (
  id TEXT PRIMARY KEY,
  instituicao_id TEXT NOT NULL REFERENCES instituicoes (id),
  nome TEXT NOT NULL,
  turma TEXT NOT NULL,
  serie TEXT NOT NULL,
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
  status_acompanhamento TEXT NOT NULL CHECK (
    status_acompanhamento IN (
      'novo',
      'em_acompanhamento',
      'encaminhado',
      'estavel',
      'critico'
    )
  ),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alertas (
  id TEXT PRIMARY KEY,
  aluno_id TEXT NOT NULL REFERENCES alunos (id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  nivel TEXT NOT NULL CHECK (nivel IN ('baixo', 'medio', 'alto', 'critico')),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ativo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS intervencoes (
  id TEXT PRIMARY KEY,
  aluno_id TEXT NOT NULL REFERENCES alunos (id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  realizado_por TEXT NOT NULL,
  realizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('pendente', 'concluida', 'agendada')),
  proxima_revisao TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS timeline_events (
  id TEXT PRIMARY KEY,
  aluno_id TEXT NOT NULL REFERENCES alunos (id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios (email);
CREATE INDEX IF NOT EXISTS idx_alunos_instituicao ON alunos (instituicao_id);
CREATE INDEX IF NOT EXISTS idx_alunos_status ON alunos (status_acompanhamento);
CREATE INDEX IF NOT EXISTS idx_alertas_aluno ON alertas (aluno_id);
CREATE INDEX IF NOT EXISTS idx_intervencoes_aluno ON intervencoes (aluno_id);
CREATE INDEX IF NOT EXISTS idx_timeline_aluno ON timeline_events (aluno_id);
