import Link from "next/link";
import { needsInstitutionOnboarding } from "@/app/lib/data/assinaturas";
import type { UserRole } from "@/app/lib/types";

export default async function OnboardingBanner({
  role,
  instituicaoId,
  pathname,
}: {
  role: UserRole;
  instituicaoId: string;
  pathname?: string;
}) {
  if (role === "admin_neoguard") return null;
  if (pathname?.startsWith("/dashboard/onboarding")) return null;

  const needs = await needsInstitutionOnboarding(instituicaoId);
  if (!needs) return null;

  const canManage =
    role === "admin_instituicao" || role === "coordenacao";

  return (
    <div className="border-b border-amber-400/20 bg-amber-400/10 px-6 py-3 text-sm text-amber-50">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p>
          O onboarding desta instituição ainda não foi concluído. Complete a
          configuração para liberar o uso pleno do painel.
        </p>
        {canManage ? (
          <Link
            href="/dashboard/onboarding"
            className="inline-flex shrink-0 rounded-xl border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 text-xs font-medium text-amber-50 transition hover:bg-amber-300/20"
          >
            Continuar onboarding
          </Link>
        ) : null}
      </div>
    </div>
  );
}
