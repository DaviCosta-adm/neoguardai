import Link from "next/link";
import { redirect } from "next/navigation";
import Header from "@/app/components/dashboard/Header";
import OnboardingWizard from "@/app/components/dashboard/OnboardingWizard";
import { requireAuth } from "@/app/lib/auth/dal";
import {
  getAssinaturaById,
  getAssinaturaByInstituicaoId,
} from "@/app/lib/data/assinaturas";

type SearchParams = Promise<{
  checkout?: string;
  assinaturaId?: string;
}>;

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const auth = await requireAuth();
  const params = await searchParams;
  const checkoutSuccess = params.checkout === "success";
  const requestedId = params.assinaturaId?.trim() || null;

  let assinatura = null;

  if (requestedId) {
    assinatura = await getAssinaturaById(requestedId);
    if (!assinatura) {
      redirect("/dashboard");
    }
    if (
      auth.user.role !== "admin_neoguard" &&
      auth.user.instituicaoId !== assinatura.instituicaoId
    ) {
      redirect("/dashboard");
    }
  } else if (auth.user.role === "admin_neoguard") {
    redirect("/dashboard/assinaturas");
  } else {
    assinatura = await getAssinaturaByInstituicaoId(auth.user.instituicaoId);
  }

  if (!assinatura) {
    return (
      <>
        <Header
          title="Onboarding"
          subtitle="Nenhuma assinatura encontrada para esta instituição."
        />
        <div className="px-6 py-6">
          <Link
            href="/dashboard"
            className="text-sm text-cyan-300 hover:underline"
          >
            Voltar ao painel
          </Link>
        </div>
      </>
    );
  }

  const canInvite =
    auth.user.role === "admin_neoguard" ||
    auth.user.role === "admin_instituicao";

  return (
    <>
      <Header
        title="Onboarding"
        subtitle="Configure a instituição após a ativação da assinatura."
        eyebrow={
          auth.user.role === "admin_neoguard"
            ? "NeoGuardAI · Plataforma"
            : undefined
        }
      />
      <div className="px-6 py-6">
        <OnboardingWizard
          assinatura={assinatura}
          checkoutSuccess={checkoutSuccess}
          canInvite={canInvite}
          isPlatformAdmin={auth.user.role === "admin_neoguard"}
        />
      </div>
    </>
  );
}
