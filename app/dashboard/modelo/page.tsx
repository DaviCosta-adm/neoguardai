import { redirect } from "next/navigation";
import Header from "@/app/components/dashboard/Header";
import ModeloRiscoPanel from "@/app/components/dashboard/admin/ModeloRiscoPanel";
import { requireAuth } from "@/app/lib/auth/dal";
import { getResumoModeloRisco } from "@/app/lib/data/modelo-risco";

export default async function ModeloRiscoPage() {
  const auth = await requireAuth();
  if (auth.user.role !== "admin_neoguard") {
    redirect("/dashboard");
  }

  const { ativo, modelos, snapshots } = await getResumoModeloRisco();

  return (
    <>
      <Header
        title="Modelo de risco"
        subtitle="Treino supervisionado com histórico longitudinal — pesos explicáveis."
        eyebrow="NeoGuardAI · Plataforma"
      />
      <div className="px-6 py-6">
        <ModeloRiscoPanel
          ativo={ativo}
          modelos={modelos}
          snapshots={snapshots}
        />
      </div>
    </>
  );
}
