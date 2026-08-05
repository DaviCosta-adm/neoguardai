import { redirect } from "next/navigation";
import Header from "@/app/components/dashboard/Header";
import OperacaoPanel from "@/app/components/dashboard/admin/OperacaoPanel";
import { requireAuth } from "@/app/lib/auth/dal";
import { getOperacaoStatus } from "@/app/lib/data/operacao";

export default async function OperacaoPage() {
  const auth = await requireAuth();
  if (auth.user.role !== "admin_neoguard") {
    redirect("/dashboard");
  }

  const status = await getOperacaoStatus();

  return (
    <>
      <Header
        title="Operação"
        subtitle="Status de e-mail, cron, Stripe e modelo — checklist pós-deploy."
        eyebrow="NeoGuardAI · Plataforma"
      />
      <div className="px-6 py-6">
        <OperacaoPanel status={status} />
      </div>
    </>
  );
}
