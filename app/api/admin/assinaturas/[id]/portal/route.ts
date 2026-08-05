import { NextResponse } from "next/server";
import { requireAdminNeoGuardApi } from "@/app/lib/auth/dal";
import { createBillingPortalSession } from "@/app/lib/stripe/billing";
import { isStripeConfigured } from "@/app/lib/stripe/client";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  try {
    const auth = await requireAdminNeoGuardApi();
    if (!auth) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    if (!isStripeConfigured()) {
      return NextResponse.json(
        {
          error:
            "Stripe não configurado. Defina STRIPE_SECRET_KEY no Coolify.",
        },
        { status: 503 }
      );
    }

    const { id } = await params;
    const session = await createBillingPortalSession(id);
    return NextResponse.json({ ok: true, ...session });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao abrir o portal.";
    const status = message.includes("não encontrada")
      ? 404
      : message.includes("ainda não tem")
        ? 409
        : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
