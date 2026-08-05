import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminNeoGuardApi, requireAuthApi } from "@/app/lib/auth/dal";
import { getPesosAtivos } from "@/app/lib/data/modelo-risco";
import {
  backfillOutcomes,
  capturarSnapshotsBatch,
} from "@/app/lib/data/risco-snapshots";

function authorizeCron(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const header = request.headers.get("authorization") || "";
  return header === `Bearer ${secret}`;
}

export async function POST(request: Request) {
  try {
    const cronOk = authorizeCron(request);
    if (!cronOk) {
      const auth = await requireAdminNeoGuardApi();
      if (!auth) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
      }
    }

    const body = await request.json().catch(() => ({}));
    const { pesos, versao } = await getPesosAtivos();
    const batch = await capturarSnapshotsBatch({
      instituicaoId: body?.instituicaoId
        ? String(body.instituicaoId)
        : undefined,
      pesos,
      versao,
    });

    const outcomes = await backfillOutcomes({
      minDays: Number(body?.minDays ?? 14),
      force: Boolean(body?.forceOutcomes),
    });

    revalidatePath("/dashboard/modelo");

    return NextResponse.json({
      ok: true,
      capturados: batch.capturados,
      outcomesAtualizados: outcomes,
      modeloVersao: versao,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro no batch de snapshots.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  // Health/ping para cron GET opcional
  if (!authorizeCron(request)) {
    const auth = await requireAuthApi();
    if (!auth || auth.user.role !== "admin_neoguard") {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }
  }
  return NextResponse.json({
    ok: true,
    endpoint: "/api/cron/risco-snapshots",
    method: "POST",
  });
}
