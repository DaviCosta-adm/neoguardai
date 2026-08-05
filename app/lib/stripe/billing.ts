import "server-only";

import type Stripe from "stripe";
import {
  getAssinaturaById,
  setAssinaturaStripeCustomer,
  syncAssinaturaFromStripe,
} from "@/app/lib/data/assinaturas";
import { getPlanoById, getPlanoByStripePriceId } from "@/app/lib/data/planos";
import {
  getAppBaseUrl,
  getStripe,
  mapStripeSubscriptionStatus,
} from "@/app/lib/stripe/client";

function randomSuffix(length = 8) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

function firstSubscriptionItem(subscription: Stripe.Subscription) {
  return subscription.items.data[0] ?? null;
}

export async function createCheckoutSessionForAssinatura(input: {
  assinaturaId: string;
  planoId: string;
  customerEmail?: string;
}) {
  const assinatura = await getAssinaturaById(input.assinaturaId);
  if (!assinatura) {
    throw new Error("Assinatura não encontrada.");
  }

  const plano = await getPlanoById(input.planoId);
  if (!plano?.stripePriceId) {
    throw new Error(
      "Plano sem preço Stripe configurado. Verifique STRIPE_PRICE_* ou a tabela planos."
    );
  }

  const stripe = getStripe();
  const baseUrl = getAppBaseUrl();

  let customerId = assinatura.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      name: assinatura.instituicaoNome,
      email: input.customerEmail || undefined,
      metadata: {
        assinatura_id: assinatura.id,
        instituicao_id: assinatura.instituicaoId,
      },
    });
    customerId = customer.id;
    await setAssinaturaStripeCustomer(assinatura.id, customerId);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: assinatura.id,
    line_items: [{ price: plano.stripePriceId, quantity: 1 }],
    success_url: `${baseUrl}/dashboard/onboarding?checkout=success&assinaturaId=${encodeURIComponent(assinatura.id)}`,
    cancel_url: `${baseUrl}/dashboard/assinaturas?checkout=cancel`,
    subscription_data: {
      metadata: {
        assinatura_id: assinatura.id,
        instituicao_id: assinatura.instituicaoId,
        plano_id: plano.id,
      },
    },
    metadata: {
      assinatura_id: assinatura.id,
      instituicao_id: assinatura.instituicaoId,
      plano_id: plano.id,
    },
    integration_identifier: `neoguard-assinatura-${randomSuffix()}`,
  });

  if (!session.url) {
    throw new Error("Stripe não retornou URL de Checkout.");
  }

  return { url: session.url, sessionId: session.id };
}

export async function createBillingPortalSession(assinaturaId: string) {
  const assinatura = await getAssinaturaById(assinaturaId);
  if (!assinatura) {
    throw new Error("Assinatura não encontrada.");
  }
  if (!assinatura.stripeCustomerId) {
    throw new Error(
      "Esta instituição ainda não tem cliente Stripe. Inicie o Checkout primeiro."
    );
  }

  const stripe = getStripe();
  const baseUrl = getAppBaseUrl();
  const session = await stripe.billingPortal.sessions.create({
    customer: assinatura.stripeCustomerId,
    return_url: `${baseUrl}/dashboard/assinaturas`,
  });

  return { url: session.url };
}

export async function applyStripeSubscription(
  subscription: Stripe.Subscription,
  observacao?: string
) {
  const item = firstSubscriptionItem(subscription);
  const priceId =
    typeof item?.price === "string" ? item.price : item?.price?.id ?? null;

  const planoFromMeta = subscription.metadata?.plano_id
    ? await getPlanoById(subscription.metadata.plano_id)
    : null;
  const planoFromPrice = priceId
    ? await getPlanoByStripePriceId(priceId)
    : null;
  const plano = planoFromMeta ?? planoFromPrice;

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id;

  return syncAssinaturaFromStripe({
    assinaturaId: subscription.metadata?.assinatura_id || undefined,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId,
    planoId: plano?.id ?? null,
    status: mapStripeSubscriptionStatus(subscription.status),
    observacao:
      observacao ??
      `Sincronizado via Stripe (${subscription.status}).`,
  });
}

function subscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const fromParent = invoice.parent?.subscription_details?.subscription;
  if (typeof fromParent === "string") return fromParent;
  if (fromParent && typeof fromParent === "object" && "id" in fromParent) {
    return fromParent.id;
  }
  return null;
}

export async function handleStripeWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription") break;

      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;
      if (!subscriptionId) break;

      const stripe = getStripe();
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      await applyStripeSubscription(
        subscription,
        "Checkout concluído via Stripe."
      );
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      await applyStripeSubscription(subscription);
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await syncAssinaturaFromStripe({
        assinaturaId: subscription.metadata?.assinatura_id || undefined,
        stripeCustomerId:
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id,
        stripeSubscriptionId: subscription.id,
        status: "inativo",
        observacao: "Assinatura cancelada no Stripe.",
      });
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = subscriptionIdFromInvoice(invoice);
      if (!subscriptionId) break;

      const stripe = getStripe();
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      await applyStripeSubscription(
        subscription,
        "Falha no pagamento da fatura Stripe."
      );
      break;
    }
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = subscriptionIdFromInvoice(invoice);
      if (!subscriptionId) break;

      const stripe = getStripe();
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      await applyStripeSubscription(
        subscription,
        "Pagamento confirmado via Stripe."
      );
      break;
    }
    default:
      break;
  }
}
