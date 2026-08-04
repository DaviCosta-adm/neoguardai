import { redirect } from "next/navigation";
import AssinaturaAdminPanel from "@/app/components/dashboard/admin/AssinaturaAdminPanel";
import Header from "@/app/components/dashboard/Header";
import { requireAuth } from "@/app/lib/auth/dal";
import { listAssinaturas } from "@/app/lib/data/assinaturas";
import { listPlanos } from "@/app/lib/data/planos";
import { isStripeConfigured } from "@/app/lib/stripe/client";

export default async function AssinaturasPage() {
  const auth = await requireAuth();

  if (auth.user.role !== "admin_neoguard") {
    redirect("/dashboard");
  }

  const [assinaturas, planos] = await Promise.all([
    listAssinaturas(),
    listPlanos(true),
  ]);

  return (
    <>
      <Header
        title="Assinaturas"
        subtitle="Status, planos e cobrança Stripe por instituição."
        eyebrow="NeoGuardAI · Plataforma"
      />

      <div className="px-6 py-6">
        <AssinaturaAdminPanel
          assinaturas={assinaturas}
          planos={planos}
          stripeConfigured={isStripeConfigured()}
        />
      </div>
    </>
  );
}
