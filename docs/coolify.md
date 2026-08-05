# Deploy no Coolify (com PostgreSQL)

O NeoGuardAI **precisa** de PostgreSQL. Sem `DATABASE_URL`, o login e o dashboard falham.

## Instância atual (RC Soluções)

| Campo | Valor |
| --- | --- |
| App | `neoguardai` |
| UUID | `b114n2paozyfbfjc7en35pgv` |
| URL | https://neoguardai.rcsolucoes.app.br |
| Repo | `DaviCosta-adm/neoguardai` |
| Branch no Coolify | `main` |
| Build pack atual | **Nixpacks** → mudar para **Docker Compose** |
| Postgres no projeto | **nenhum** |

> O MCP `coolify-rc` é **somente leitura**. Alterar build pack, envs e redeploy exige o painel Coolify (ou token com escrita).

## Checklist rápido (acesso bem-sucedido)

1. Código com Compose já está em `main` (PR #4).
2. No Coolify → app `neoguardai` → Build Pack: **Docker Compose**.
3. Compose file: `docker-compose.yaml`.
4. Envs abaixo → **Deploy**.
5. https://neoguardai.rcsolucoes.app.br/api/health → `{"ok":true,"database":"up"}`.
6. `/login` → `ana@horizonte.edu.br` / `demo123`.

## Opção A — Docker Compose do repositório (recomendada)

1. No Coolify, crie um recurso **Docker Compose**.
2. Aponte para este repositório e use o `docker-compose.yml`.
3. Defina as variáveis:

| Variável | Exemplo |
| --- | --- |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `DATABASE_URL` | `postgresql://neoguard:neoguard@db:5432/neoguardai` |
| `APP_URL` | `https://neoguardai.rcsolucoes.app.br` |
| `SEED_ON_START` | `true` (primeira subida) |
| `STRIPE_SECRET_KEY` | chave secreta Stripe (mesmo modo dos price IDs) |
| `STRIPE_WEBHOOK_SECRET` | secret do endpoint `POST /api/stripe/webhook` |
| `OPENAI_API_KEY` | opcional |

### Stripe (assinaturas)

1. Crie um webhook no Dashboard apontando para:
   `https://neoguardai.rcsolucoes.app.br/api/stripe/webhook`
2. Eventos mínimos:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
3. No painel admin: **Planos** (catálogo) e **Assinaturas** (Checkout / Portal).

Planos seed: Essencial (R$ 250), Profissional (R$ 650), Rede (R$ 1.650).

### Convites (opcional)

| Variável | Exemplo |
| --- | --- |
| `RESEND_API_KEY` | chave Resend |
| `EMAIL_FROM` | `NeoGuardAI <onboarding@seudominio.com>` |

Sem e-mail, o painel mostra o link do convite para copiar.

O Compose sobe:
- `db` → PostgreSQL 16
- `app` → Next.js (roda migrate/seed no boot e depois `next start`)

### Redeploy automático via GitHub Actions

Há um workflow em `.github/workflows/coolify-deploy.yml`. No GitHub → Secrets → Actions:

- `COOLIFY_WEBHOOK_URL` — URL do Deploy Webhook do recurso no Coolify
- `COOLIFY_TOKEN` — opcional, se o webhook exigir Bearer token

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

### Onboarding pós-checkout

Após o Checkout Stripe, o `success_url` aponta para `/dashboard/onboarding`.
A migration `007_onboarding.sql` adiciona `onboarding_completo` / `onboarding_em`
em `assinaturas`. Instituições novas passam pelo wizard; demos já vêm concluídas.

## Erros comuns

### Coolify API 500 / site 503 (`MISCONF Redis`)

Se o Coolify não responde (`/api/v1/*` → 500) e o app fica 503, o Redis do
Coolify provavelmente está sem disco para persistir (`MISCONF ... unable to
persist to disk`). Corrija o Redis/disco do host Coolify antes de redeploy ou
alterar envs (`SEED_ON_START`).

### `DATABASE_URL não configurada`
Não há Postgres ligado ao app. Adicione o serviço `db` ou um Postgres do Coolify e preencha `DATABASE_URL`.

### `Server Reference ID did not match`
Login antigo via Server Actions após redeploy. Esta versão usa `/api/auth/login` (API Route). Faça redeploy limpo e hard refresh no navegador.
