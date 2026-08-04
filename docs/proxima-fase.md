# Próxima fase — ordem revisada

Base do SaaS na seguinte ordem:

1. Modelo de dados mínimo ✅
2. Layout do dashboard + sidebar e header ✅
3. Home da coordenação + lista + ficha do aluno ✅
4. Score de risco explicável + alertas + intervenções ✅
5. Autenticação + multi-tenant ✅
6. Persistência real em PostgreSQL ✅
7. Relatórios ✅
8. Módulo de especialistas ✅
9. IA avançada / modelo preditivo v2 ✅
10. Deploy Coolify com Postgres (Docker Compose) ✅

Próximos refinamentos possíveis: PDF nativo, convites de usuários, treino
supervisionado do modelo com histórico longitudinal.

Stripe + planos: ✅ (Checkout, Portal, webhook e catálogo Essencial/Profissional/Rede).

Deploy: veja `docs/coolify.md`.

## Banco de dados

```bash
npm run db:setup
```

Variável obrigatória: `DATABASE_URL` (veja `.env.example`).

Schema em `db/migrations/001_init.sql`.

## Auth demo

Senha de todas as contas: `demo123`

| E-mail | Perfil | Instituição |
| --- | --- | --- |
| ana@horizonte.edu.br | Coordenação | Colégio Horizonte |
| carlos@horizonte.edu.br | Especialista | Colégio Horizonte |
| admin@horizonte.edu.br | Admin instituição | Colégio Horizonte |
| maria@aurora.edu.br | Coordenação | Escola Aurora |
| suporte@neoguard.ai | Admin NeoGuardAI | — |

## Observações

- O app roda com Next.js + PostgreSQL em qualquer host.
- Leituras e escritas passam pelo Postgres (store em memória removido).
