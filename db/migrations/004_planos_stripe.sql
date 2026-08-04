CREATE TABLE IF NOT EXISTS planos (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL DEFAULT '',
  preco_centavos INTEGER NOT NULL,
  moeda TEXT NOT NULL DEFAULT 'brl',
  intervalo TEXT NOT NULL DEFAULT 'month',
  max_alunos INTEGER NOT NULL,
  max_usuarios INTEGER NOT NULL,
  stripe_product_id TEXT,
  stripe_price_id TEXT,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  ordem INTEGER NOT NULL DEFAULT 0
);

INSERT INTO planos (
  id, nome, descricao, preco_centavos, moeda, intervalo,
  max_alunos, max_usuarios, stripe_product_id, stripe_price_id, ativo, ordem
) VALUES
  (
    'essencial',
    'Essencial',
    'Até 200 alunos e 5 usuários. Ideal para uma unidade escolar.',
    29700,
    'brl',
    'month',
    200,
    5,
    'prod_V0ZbRSSo0kZJIS',
    'price_1U0YSFIlJ41hhTdcYXkUi2ej',
    TRUE,
    1
  ),
  (
    'profissional',
    'Profissional',
    'Até 1.000 alunos e 20 usuários. Atlas e relatórios avançados.',
    69700,
    'brl',
    'month',
    1000,
    20,
    'prod_V0ZbMGMCn7MQrj',
    'price_1U0YSGIlJ41hhTdcAsvv7jco',
    TRUE,
    2
  ),
  (
    'rede',
    'Rede',
    'Até 5.000 alunos e 50 usuários. Multi-unidade e suporte prioritário.',
    149700,
    'brl',
    'month',
    5000,
    50,
    'prod_V0ZbTxbgbUfz8P',
    'price_1U0YSGIlJ41hhTdcckylEpkq',
    TRUE,
    3
  )
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  descricao = EXCLUDED.descricao,
  preco_centavos = EXCLUDED.preco_centavos,
  moeda = EXCLUDED.moeda,
  intervalo = EXCLUDED.intervalo,
  max_alunos = EXCLUDED.max_alunos,
  max_usuarios = EXCLUDED.max_usuarios,
  stripe_product_id = COALESCE(NULLIF(EXCLUDED.stripe_product_id, ''), planos.stripe_product_id),
  stripe_price_id = COALESCE(NULLIF(EXCLUDED.stripe_price_id, ''), planos.stripe_price_id),
  ativo = EXCLUDED.ativo,
  ordem = EXCLUDED.ordem;

ALTER TABLE assinaturas
  ADD COLUMN IF NOT EXISTS plano_id TEXT REFERENCES planos (id),
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

UPDATE assinaturas
SET plano_id = 'essencial',
    plano = 'essencial'
WHERE plano_id IS NULL
   OR plano IN ('padrao', 'essencial', '');

CREATE INDEX IF NOT EXISTS idx_assinaturas_stripe_customer
  ON assinaturas (stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_assinaturas_stripe_subscription
  ON assinaturas (stripe_subscription_id);
