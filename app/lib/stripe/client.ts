import "server-only";

import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error(
      "Stripe não configurado. Defina STRIPE_SECRET_KEY no ambiente."
    );
  }

  if (!stripeClient) {
    stripeClient = new Stripe(key, {
      apiVersion: "2026-07-29.dahlia",
      typescript: true,
    });
  }

  return stripeClient;
}

export function getAppBaseUrl() {
  const fromEnv =
    process.env.APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.COOLIFY_URL?.trim();

  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  return "https://neoguardai.rcsolucoes.app.br";
}

export function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status
): "ativo" | "inativo" | "bloqueado" {
  switch (status) {
    case "active":
    case "trialing":
      return "ativo";
    case "past_due":
    case "unpaid":
    case "paused":
      return "bloqueado";
    case "canceled":
    case "incomplete":
    case "incomplete_expired":
    default:
      return "inativo";
  }
}
