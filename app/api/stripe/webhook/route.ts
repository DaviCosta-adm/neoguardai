import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { handleStripeWebhookEvent } from "@/app/lib/stripe/billing";
import { getStripe, isStripeConfigured } from "@/app/lib/stripe/client";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: "Stripe não configurado." },
        { status: 503 }
      );
    }

    const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
    if (!secret) {
      return NextResponse.json(
        { error: "STRIPE_WEBHOOK_SECRET não configurado." },
        { status: 503 }
      );
    }

    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return NextResponse.json(
        { error: "Assinatura Stripe ausente." },
        { status: 400 }
      );
    }

    const payload = await request.text();
    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(payload, signature, secret);

    await handleStripeWebhookEvent(event);

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/assinaturas");
    revalidatePath("/dashboard/planos");

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Erro no webhook Stripe:", error);
    const message =
      error instanceof Error ? error.message : "Falha ao processar webhook.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
