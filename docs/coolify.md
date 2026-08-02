# Deploy no Coolify (com PostgreSQL)

O NeoGuardAI **precisa** de PostgreSQL. Sem `DATABASE_URL`, o login e o dashboard falham.

## Opção A — Docker Compose do repositório (recomendada)

1. No Coolify, crie um recurso **Docker Compose**.
2. Aponte para este repositório e use o `docker-compose.yml`.
3. Defina as variáveis:

| Variável | Exemplo |
| --- | --- |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `DATABASE_URL` | `postgresql://neoguard:neoguard@db:5432/neoguardai` |
| `SEED_ON_START` | `true` (primeira subida) |
| `OPENAI_API_KEY` | opcional |

O Compose sobe:
- `db` → PostgreSQL 16
- `app` → Next.js (roda migrate/seed no boot e depois `next start`)

## Opção B — App + Postgres separados no Coolify

1. Crie um serviço **PostgreSQL** no Coolify.
2. Crie o app (Dockerfile deste repo).
3. No app, configure:

```env
AUTH_SECRET=...
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB
SEED_ON_START=true
```

Use o host interno do Postgres do Coolify (não `127.0.0.1` do container do app).

## Após o primeiro deploy

1. Abra `/login`
2. Entre com `ana@horizonte.edu.br` / `demo123`
3. Quando estiver estável, defina `SEED_ON_START=false` para não resetar dados a cada restart

## Erros comuns

### `DATABASE_URL não configurada`
Não há Postgres ligado ao app. Adicione o serviço `db` ou um Postgres do Coolify e preencha `DATABASE_URL`.

### `Server Reference ID did not match`
Login antigo via Server Actions após redeploy. Esta versão usa `/api/auth/login` (API Route). Faça redeploy limpo e hard refresh no navegador.
