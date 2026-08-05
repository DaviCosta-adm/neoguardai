import Link from "next/link";
import { redirect } from "next/navigation";
import Header from "@/app/components/dashboard/Header";
import UsuarioAdminPanel from "@/app/components/dashboard/admin/UsuarioAdminPanel";
import { requireAuth } from "@/app/lib/auth/dal";
import { listUsuarios } from "@/app/lib/auth/users";
import { listInstituicoesSimples } from "@/app/lib/data/admin-crud";

export default async function UsuariosPage() {
  const auth = await requireAuth();

  if (auth.user.role !== "admin_neoguard") {
    redirect("/dashboard/configuracoes");
  }

  const [usuarios, instituicoes] = await Promise.all([
    listUsuarios(),
    listInstituicoesSimples(),
  ]);

  return (
    <>
      <Header
        title="Usuários"
        subtitle="CRUD completo de contas, perfis e vínculos por instituição."
        eyebrow="NeoGuardAI · Plataforma"
      />

      <div className="space-y-4 px-6 py-6">
        <Link
          href="/dashboard/convites"
          className="inline-flex rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100 transition hover:bg-cyan-400/20"
        >
          Convidar por e-mail
        </Link>
        <UsuarioAdminPanel
          usuarios={usuarios}
          instituicoes={instituicoes}
          currentUserId={auth.user.id}
        />
      </div>
    </>
  );
}
