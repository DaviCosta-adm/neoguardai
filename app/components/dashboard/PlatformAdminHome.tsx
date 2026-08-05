import Link from "next/link";
import {
  AlertTriangle,
  Building2,
  ClipboardList,
  CreditCard,
  Gauge,
  Shield,
  Users,
} from "lucide-react";
import Header from "@/app/components/dashboard/Header";
import StatCard from "@/app/components/dashboard/StatCard";
import type { PlataformaResumo } from "@/app/lib/types";

export default function PlatformAdminHome({
  resumo,
}: {
  resumo: PlataformaResumo;
}) {
  return (
    <>
      <Header
        title="Painel administrativo"
        subtitle="Visão da plataforma NeoGuardAI — instituições, assinaturas, usuários e risco agregado."
        eyebrow="NeoGuardAI · Plataforma"
      />

      <div className="space-y-8 px-6 py-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Instituições"
            value={resumo.totalInstituicoes}
            icon={Building2}
          />
          <StatCard
            label="Usuários ativos"
            value={resumo.totalUsuarios}
            icon={Users}
          />
          <StatCard
            label="Estudantes na rede"
            value={resumo.totalEstudantes}
            icon={Shield}
          />
          <StatCard
            label="Casos imediatos"
            value={resumo.casosImediatos}
            hint={`${resumo.alertasAtivos} alertas · ${resumo.intervencoesPendentes} intervenções`}
            icon={AlertTriangle}
          />
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-2 text-cyan-300">
              <Gauge size={16} />
              <p className="text-sm font-medium">Frequência média da rede</p>
            </div>
            <p className="mt-3 text-3xl font-semibold">
              {resumo.frequenciaMedia}%
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Agregado de todas as instituições monitoradas.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-2 text-cyan-300">
              <ClipboardList size={16} />
              <p className="text-sm font-medium">Operação da plataforma</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/dashboard/instituicoes"
                className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100 transition hover:bg-cyan-400/20"
              >
                Gerenciar instituições
              </Link>
              <Link
                href="/dashboard/assinaturas"
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-200 transition hover:border-cyan-400/30"
              >
                <span className="inline-flex items-center gap-1.5">
                  <CreditCard size={14} />
                  Assinaturas
                </span>
              </Link>
              <Link
                href="/dashboard/planos"
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-200 transition hover:border-cyan-400/30"
              >
                Planos Stripe
              </Link>
              <Link
                href="/dashboard/usuarios"
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-200 transition hover:border-cyan-400/30"
              >
                Ver usuários
              </Link>
              <Link
                href="/dashboard/convites"
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-200 transition hover:border-cyan-400/30"
              >
                Convites
              </Link>
              <Link
                href="/dashboard/configuracoes"
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-200 transition hover:border-cyan-400/30"
              >
                Configurações
              </Link>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Instituições</h2>
            <Link
              href="/dashboard/instituicoes"
              className="text-sm text-cyan-300 hover:text-cyan-200"
            >
              Ver todas
            </Link>
          </div>

          <div className="space-y-3">
            {resumo.instituicoes.map((instituicao) => (
              <Link
                key={instituicao.id}
                href={`/dashboard/instituicoes/${instituicao.id}`}
                className="flex flex-col gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 transition hover:border-cyan-400/20 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-white">{instituicao.nome}</p>
                  <p className="text-xs text-gray-500">
                    {instituicao.totalEstudantes} estudantes ·{" "}
                    {instituicao.usuarios} usuários · freq.{" "}
                    {instituicao.frequenciaMedia}%
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full border border-rose-400/20 bg-rose-400/10 px-2.5 py-1 text-rose-200">
                    {instituicao.riscoCritico} críticos
                  </span>
                  <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-amber-100">
                    {instituicao.riscoAlto} altos
                  </span>
                  <span className="rounded-full border border-white/10 px-2.5 py-1 text-gray-300">
                    {instituicao.alertasAtivos} alertas
                  </span>
                </div>
              </Link>
            ))}
            {resumo.instituicoes.length === 0 ? (
              <p className="text-sm text-gray-500">
                Nenhuma instituição cadastrada.
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </>
  );
}
