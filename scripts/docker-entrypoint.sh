#!/bin/sh
set -e

echo "[neoguard] aguardando DATABASE_URL..."

if [ -z "$DATABASE_URL" ]; then
  echo "[neoguard] ERRO: DATABASE_URL não configurada."
  echo "[neoguard] No Coolify, adicione um serviço PostgreSQL e aponte DATABASE_URL para ele,"
  echo "[neoguard] ou use o docker-compose.yml deste repositório (serviço db)."
  exit 1
fi

if [ -z "$AUTH_SECRET" ]; then
  echo "[neoguard] ERRO: AUTH_SECRET não configurada."
  exit 1
fi

echo "[neoguard] aplicando migrations..."
npx tsx scripts/db-migrate.ts

if [ "$SEED_ON_START" = "true" ]; then
  echo "[neoguard] executando seed inicial..."
  npx tsx scripts/db-seed.ts
fi

echo "[neoguard] iniciando Next.js..."
exec node server.js
