CREATE TABLE IF NOT EXISTS encaminhamentos (
  id TEXT PRIMARY KEY,
  aluno_id TEXT NOT NULL REFERENCES alunos (id) ON DELETE CASCADE,
  instituicao_id TEXT NOT NULL REFERENCES instituicoes (id),
  especialista_id TEXT REFERENCES usuarios (id),
  criado_por TEXT NOT NULL REFERENCES usuarios (id),
  motivo TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('aberto', 'em_atendimento', 'concluido')),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS devolutivas (
  id TEXT PRIMARY KEY,
  encaminhamento_id TEXT NOT NULL REFERENCES encaminhamentos (id) ON DELETE CASCADE,
  autor_id TEXT NOT NULL REFERENCES usuarios (id),
  tipo TEXT NOT NULL CHECK (
    tipo IN ('atendimento', 'observacao', 'devolutiva', 'recomendacao')
  ),
  conteudo TEXT NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_encaminhamentos_aluno ON encaminhamentos (aluno_id);
CREATE INDEX IF NOT EXISTS idx_encaminhamentos_especialista ON encaminhamentos (especialista_id);
CREATE INDEX IF NOT EXISTS idx_encaminhamentos_instituicao ON encaminhamentos (instituicao_id);
CREATE INDEX IF NOT EXISTS idx_devolutivas_encaminhamento ON devolutivas (encaminhamento_id);
