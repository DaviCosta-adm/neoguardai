import { NextResponse } from "next/server";
import { requireAdminNeoGuardApi } from "@/app/lib/auth/dal";
import { listPlanos } from "@/app/lib/data/planos";
import { isStripeConfigured } from "@/app/lib/stripe/client";

export async function GET() {
  const auth = await requireAdminNeoGuardApi();
  if (!auth) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  return NextResponse.json({
    ok: true,
    stripeConfigured: isStripeConfigured(),
    planos: await listPlanos(true),
  });
}
