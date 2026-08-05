import { redirect } from "next/navigation";
import Header from "@/app/components/dashboard/Header";
import InstituicaoAdminPanel from "@/app/components/dashboard/admin/InstituicaoAdminPanel";
import { requireAuth } from "@/app/lib/auth/dal";
import { listarInstituicoesComMetricas } from "@/app/lib/data/plataforma";

export default async function InstituicoesPage() {
  const auth = await requireAuth();

  if (auth.user.role !== "admin_neoguard") {
    redirect("/dashboard");
  }

  const instituicoes = await listarInstituicoesComMetricas();

  return (
    <>
      <Header
        title="Instituições"
        subtitle="CRUD completo das escolas e redes na plataforma."
        eyebrow="NeoGuardAI · Plataforma"
      />

      <div className="px-6 py-6">
        <InstituicaoAdminPanel instituicoes={instituicoes} />
      </div>
    </>
  );
}
