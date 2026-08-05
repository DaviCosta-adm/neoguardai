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

Próximos refinamentos possíveis: treino supervisionado do modelo com histórico
longitudinal; e-mail real via Resend (`RESEND_API_KEY` + `EMAIL_FROM`).

Stripe + planos: ✅ (Checkout, Portal, webhook; preços R$ 250 / R$ 650 / R$ 1.650).
Convites de usuários: ✅
PDF nativo de relatórios: ✅
Limites por plano (usuários/convites): ✅
Onboarding da instituição pós-checkout: ✅
(`/dashboard/onboarding`, migration `007_onboarding.sql`)

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
