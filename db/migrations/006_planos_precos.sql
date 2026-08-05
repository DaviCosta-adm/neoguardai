-- Atualiza preços dos planos NeoGuardAI (R$ 250 / R$ 650 / R$ 1.650)
UPDATE planos SET
  preco_centavos = 25000,
  stripe_price_id = 'price_1U0uLiIlJ41hhTdc7lsxydfy',
  descricao = 'Até 200 alunos e 5 usuários. Ideal para uma unidade escolar.'
WHERE id = 'essencial';

UPDATE planos SET
  preco_centavos = 65000,
  stripe_price_id = 'price_1U0uLiIlJ41hhTdcRdlLGLva',
  descricao = 'Até 1.000 alunos e 20 usuários. Atlas e relatórios avançados.'
WHERE id = 'profissional';

UPDATE planos SET
  preco_centavos = 165000,
  stripe_price_id = 'price_1U0uLiIlJ41hhTdcpAzXYIL1',
  descricao = 'Até 5.000 alunos e 50 usuários. Multi-unidade e suporte prioritário.'
WHERE id = 'rede';
