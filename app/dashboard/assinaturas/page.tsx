import { redirect } from "next/navigation";
import AssinaturaAdminPanel from "@/app/components/dashboard/admin/AssinaturaAdminPanel";
import Header from "@/app/components/dashboard/Header";
import { requireAuth } from "@/app/lib/auth/dal";
import { listAssinaturas } from "@/app/lib/data/assinaturas";

export default async function AssinaturasPage() {
  const auth = await requireAuth();

  if (auth.user.role !== "admin_neoguard") {
    redirect("/dashboard");
  }

  const assinaturas = await listAssinaturas();

  return (
    <>
      <Header
        title="Assinaturas"
        subtitle="Controle o status de cada instituição: ativo, inativo ou bloqueado."
        eyebrow="NeoGuardAI · Plataforma"
      />

      <div className="px-6 py-6">
        <AssinaturaAdminPanel assinaturas={assinaturas} />
      </div>
    </>
  );
}
