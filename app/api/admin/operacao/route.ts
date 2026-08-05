import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminNeoGuardApi } from "@/app/lib/auth/dal";
import { getOperacaoStatus } from "@/app/lib/data/operacao";
import { getPesosAtivos } from "@/app/lib/data/modelo-risco";
import {
  backfillOutcomes,
  capturarSnapshotsBatch,
} from "@/app/lib/data/risco-snapshots";
import { sendEmail, isEmailConfigured } from "@/app/lib/email/send";

export async function GET() {
  const auth = await requireAdminNeoGuardApi();
  if (!auth) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const status = await getOperacaoStatus();
  return NextResponse.json({ ok: true, status });
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdminNeoGuardApi();
    if (!auth) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const action = String(body?.action ?? "");

    if (action === "test-email") {
      if (!isEmailConfigured()) {
        return NextResponse.json(
          {
            error:
              "Resend não configurado. Defina RESEND_API_KEY e EMAIL_FROM no Coolify.",
          },
          { status: 400 }
        );
      }
      const to = String(body?.to ?? auth.user.email).trim();
      if (!to) {
        return NextResponse.json(
          { error: "Informe o e-mail de destino." },
          { status: 400 }
        );
      }
      const result = await sendEmail({
        to,
        subject: "[NeoGuardAI] Teste de e-mail",
        text: [
          "Este é um e-mail de teste do painel de operação NeoGuardAI.",
          `Enviado por ${auth.user.nome} (${auth.user.email}).`,
          `Horário: ${new Date().toISOString()}`,
        ].join("\n"),
      });
      return NextResponse.json({ ok: true, result });
    }

    if (action === "run-cron") {
      const { pesos, versao } = await getPesosAtivos();
      const batch = await capturarSnapshotsBatch({ pesos, versao });
      const outcomes = await backfillOutcomes({
        minDays: Number(body?.minDays ?? 14),
        force: Boolean(body?.forceOutcomes),
      });
      revalidatePath("/dashboard/modelo");
      revalidatePath("/dashboard/operacao");
      return NextResponse.json({
        ok: true,
        capturados: batch.capturados,
        outcomesAtualizados: outcomes,
        modeloVersao: versao,
      });
    }

    return NextResponse.json(
      { error: "Ação inválida. Use test-email ou run-cron." },
      { status: 400 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro na operação.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
