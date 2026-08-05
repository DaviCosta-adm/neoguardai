import { NextResponse } from "next/server";
import { Pool } from "pg";

export const dynamic = "force-dynamic";

export async function GET() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return NextResponse.json(
      { ok: false, database: "missing_DATABASE_URL" },
      { status: 503 },
    );
  }

  const pool = new Pool({ connectionString: databaseUrl, max: 1 });

  try {
    await pool.query("SELECT 1");
    return NextResponse.json({ ok: true, database: "up" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "db_error";
    return NextResponse.json(
      { ok: false, database: "down", error: message },
      { status: 503 },
    );
  } finally {
    await pool.end().catch(() => undefined);
  }
}
