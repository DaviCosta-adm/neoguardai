# NeoGuardAI

Plataforma SaaS para prevenção da evasão escolar — alertas, análise de risco e acompanhamento de casos pela coordenação.

## Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS + Framer Motion
- PostgreSQL (obrigatório)
- OpenAI (Atlas, opcional)
- Sessão JWT via cookie HTTP-only

## Ambiente local

```bash
cp .env.example .env.local
# ajuste AUTH_SECRET e DATABASE_URL
npm install
npm run db:migrate:local
npm run db:seed:local
npm run dev
```

## Docker / Coolify

O projeto já inclui Postgres no `docker-compose.yml`.

```bash
export AUTH_SECRET="$(openssl rand -base64 32)"
docker compose up -d --build
```

Guia completo: `docs/coolify.md`

Variáveis obrigatórias:

- `AUTH_SECRET`
- `DATABASE_URL`

## Contas demo

Senha: `demo123`

| E-mail | Perfil |
| --- | --- |
| ana@horizonte.edu.br | Coordenação (Horizonte) |
| carlos@horizonte.edu.br | Especialista (Horizonte) |
| maria@aurora.edu.br | Coordenação (Aurora) |
| admin@horizonte.edu.br | Admin da instituição |

## Rotas

- `/` — site institucional
- `/login` — autenticação (`POST /api/auth/login`)
- `/dashboard` — painel da coordenação
