import "server-only";

import { Pool, type QueryResultRow } from "pg";

const globalForDb = globalThis as typeof globalThis & {
  __neoguardPool?: Pool;
};

function createPool() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL não configurada.");
  }

  return new Pool({
    connectionString,
    max: 10,
  });
}

export function getPool() {
  if (!globalForDb.__neoguardPool) {
    globalForDb.__neoguardPool = createPool();
  }

  return globalForDb.__neoguardPool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
) {
  return getPool().query<T>(text, params);
}
