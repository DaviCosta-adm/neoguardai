import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Header from "@/app/components/dashboard/Header";
import InstituicaoDetailActions from "@/app/components/dashboard/admin/InstituicaoDetailActions";
import { requireAuth } from "@/app/lib/auth/dal";
import { listUsuarios } from "@/app/lib/auth/users";
import { rotuloRole } from "@/app/lib/data/labels";
import { getInstituicaoResumoById } from "@/app/lib/data/plataforma";

export default async function InstituicaoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const auth = await requireAuth();

  if (auth.user.role !== "admin_neoguard") {
    redirect("/dashboard");
  }

  const { id } = await params;
  const instituicao = await getInstituicaoResumoById(id);

  if (!instituicao) {
    notFound();
  }

  const usuarios = await listUsuarios({ instituicaoId: id });

  return (
    <>
      <Header
        title={instituicao.nome}
        subtitle="Detalhe administrativo da instituição na plataforma."
        eyebrow="NeoGuardAI · Plataforma"
      />

      <div className="space-y-6 px-6 py-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs text-gray-500">Estudantes</p>
            <p className="mt-2 text-2xl font-semibold">
              {instituicao.totalEstudantes}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs text-gray-500">Casos imediatos</p>
            <p className="mt-2 text-2xl font-semibold">
              {instituicao.casosImediatos}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs text-gray-500">Alertas ativos</p>
            <p className="mt-2 text-2xl font-semibold">
              {instituicao.alertasAtivos}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs text-gray-500">Frequência média</p>
            <p className="mt-2 text-2xl font-semibold">
              {instituicao.frequenciaMedia}%
            </p>
          </div>
        </section>

        <InstituicaoDetailActions id={instituicao.id} nome={instituicao.nome} />

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Usuários da instituição</h2>
            <Link
              href="/dashboard/usuarios"
              className="text-sm text-cyan-300 hover:text-cyan-200"
            >
              Ver todos
            </Link>
          </div>

          <div className="space-y-3">
            {usuarios.map((usuario) => (
              <div
                key={usuario.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3"
              >
                <div>
                  <p className="font-medium">{usuario.nome}</p>
                  <p className="text-sm text-gray-500">{usuario.email}</p>
                </div>
                <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-gray-300">
                  {rotuloRole[usuario.role]}
                </span>
              </div>
            ))}
            {usuarios.length === 0 ? (
              <p className="text-sm text-gray-500">
                Nenhum usuário nesta instituição.
              </p>
            ) : null}
          </div>
        </section>

        <Link
          href="/dashboard/instituicoes"
          className="inline-flex text-sm text-cyan-300 hover:text-cyan-200"
        >
          ← Voltar às instituições
        </Link>
      </div>
    </>
  );
}
