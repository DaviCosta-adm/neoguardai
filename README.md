# NeoGuardAI

Plataforma SaaS para prevenção da evasão escolar — alertas, análise de risco e acompanhamento de casos pela coordenação.

## Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS + Framer Motion
- PostgreSQL (persistência)
- OpenAI (Atlas)
- Sessão JWT (cookie HTTP-only)

## Ambiente local

1. Copie as variáveis:

```bash
cp .env.example .env.local
```

2. Configure pelo menos:

- `AUTH_SECRET`
- `DATABASE_URL` (ex.: `postgresql://neoguard:neoguard@localhost:5432/neoguardai`)
- `OPENAI_API_KEY` (opcional, para o Atlas)

3. Suba o Postgres, rode as migrations/seed e inicie o app:

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

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
- `/login` — autenticação
- `/dashboard` — painel da coordenação

## Documentação interna

Veja `docs/proxima-fase.md` para a ordem de evolução do produto.
