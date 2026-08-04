import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminNeoGuardApi } from "@/app/lib/auth/dal";
import { createCheckoutSessionForAssinatura } from "@/app/lib/stripe/billing";
import { isStripeConfigured } from "@/app/lib/stripe/client";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
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
    const body = await request.json();
    const planoId = String(body?.planoId ?? "").trim();
    if (!planoId) {
      return NextResponse.json(
        { error: "Informe o plano (planoId)." },
        { status: 400 }
      );
    }

    const session = await createCheckoutSessionForAssinatura({
      assinaturaId: id,
      planoId,
      customerEmail: auth.user.email,
    });

    revalidatePath("/dashboard/assinaturas");

    return NextResponse.json({ ok: true, ...session });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao criar Checkout.";
    const status = message.includes("não encontrada") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
