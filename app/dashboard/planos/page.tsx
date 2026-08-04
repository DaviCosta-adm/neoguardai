import { redirect } from "next/navigation";
import Header from "@/app/components/dashboard/Header";
import { requireAuth } from "@/app/lib/auth/dal";
import { listPlanos, formatPrecoBRL } from "@/app/lib/data/planos";
import { isStripeConfigured } from "@/app/lib/stripe/client";

export default async function PlanosPage() {
  const auth = await requireAuth();

  if (auth.user.role !== "admin_neoguard") {
    redirect("/dashboard");
  }

  const planos = await listPlanos(true);
  const stripeConfigured = isStripeConfigured();

  return (
    <>
      <Header
        title="Planos"
        subtitle="Catálogo NeoGuardAI sincronizado com produtos e preços do Stripe."
        eyebrow="NeoGuardAI · Plataforma"
      />

      <div className="space-y-6 px-6 py-6">
        {!stripeConfigured ? (
          <p className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-sm text-amber-100">
            Cobrança automática exige <code>STRIPE_SECRET_KEY</code> e webhook
            em <code>/api/stripe/webhook</code>.
          </p>
        ) : (
          <p className="text-sm text-emerald-300/90">
            Stripe conectado. Use Assinaturas para abrir Checkout ou o Portal.
          </p>
        )}

        <section className="grid gap-4 lg:grid-cols-3">
          {planos.map((plano) => (
            <article
              key={plano.id}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">
                {plano.id}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                {plano.nome}
              </h2>
              <p className="mt-3 text-3xl font-semibold text-white">
                {formatPrecoBRL(plano.precoCentavos, plano.moeda)}
                <span className="ml-1 text-sm font-normal text-gray-500">
                  /mês
                </span>
              </p>
              <p className="mt-3 text-sm text-gray-400">{plano.descricao}</p>
              <ul className="mt-4 space-y-1 text-sm text-gray-300">
                <li>Até {plano.maxAlunos.toLocaleString("pt-BR")} alunos</li>
                <li>Até {plano.maxUsuarios} usuários</li>
              </ul>
              <p className="mt-4 break-all text-xs text-gray-600">
                Price: {plano.stripePriceId || "não configurado"}
              </p>
            </article>
          ))}
        </section>
      </div>
    </>
  );
}
