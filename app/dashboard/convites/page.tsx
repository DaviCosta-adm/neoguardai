import { redirect } from "next/navigation";
import ConviteAdminPanel from "@/app/components/dashboard/admin/ConviteAdminPanel";
import Header from "@/app/components/dashboard/Header";
import { requireAuth } from "@/app/lib/auth/dal";
import { listInstituicoesSimples } from "@/app/lib/data/admin-crud";
import { listConvites } from "@/app/lib/data/convites";
import { isEmailConfigured } from "@/app/lib/email/send";

export default async function ConvitesPage() {
  const auth = await requireAuth();

  if (
    auth.user.role !== "admin_neoguard" &&
    auth.user.role !== "admin_instituicao"
  ) {
    redirect("/dashboard");
  }

  const isPlatform = auth.user.role === "admin_neoguard";
  const [convites, instituicoes] = await Promise.all([
    listConvites(
      isPlatform ? undefined : { instituicaoId: auth.user.instituicaoId }
    ),
    isPlatform
      ? listInstituicoesSimples()
      : Promise.resolve([auth.instituicao]),
  ]);

  return (
    <>
      <Header
        title="Convites"
        subtitle="Convide usuários por e-mail com link seguro para definir a senha."
        eyebrow={isPlatform ? "NeoGuardAI · Plataforma" : undefined}
      />

      <div className="px-6 py-6">
        <ConviteAdminPanel
          convites={convites}
          instituicoes={instituicoes}
          actorRole={auth.user.role}
          defaultInstituicaoId={auth.user.instituicaoId}
          emailConfigured={isEmailConfigured()}
        />
      </div>
    </>
  );
}
