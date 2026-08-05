"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  CheckCircle2,
  GraduationCap,
  MailPlus,
  Sparkles,
  Users,
} from "lucide-react";
import type { Assinatura } from "@/app/lib/types";

const steps = [
  { id: 1, label: "Boas-vindas" },
  { id: 2, label: "Instituição" },
  { id: 3, label: "Equipe" },
  { id: 4, label: "Concluir" },
] as const;

export default function OnboardingWizard({
  assinatura,
  checkoutSuccess,
  canInvite,
  isPlatformAdmin,
}: {
  assinatura: Assinatura;
  checkoutSuccess: boolean;
  canInvite: boolean;
  isPlatformAdmin: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState(1);
  const [nome, setNome] = useState(assinatura.instituicaoNome);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(assinatura.onboardingCompleto);

  async function saveNome() {
    setError(null);
    const response = await fetch("/api/onboarding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assinaturaId: assinatura.id,
        nome,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Não foi possível salvar o nome.");
      return false;
    }
    return true;
  }

  async function finish() {
    setError(null);
    const response = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assinaturaId: assinatura.id }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Não foi possível concluir o onboarding.");
      return;
    }
    setDone(true);
    startTransition(() => router.refresh());
  }

  if (done) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-8 text-center">
          <CheckCircle2 className="mx-auto text-emerald-300" size={40} />
          <h2 className="mt-4 text-2xl font-semibold text-white">
            Onboarding concluído
          </h2>
          <p className="mt-2 text-sm text-emerald-100/80">
            {assinatura.instituicaoNome} está pronta para usar o NeoGuardAI.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-gray-100"
            >
              Ir ao painel
            </Link>
            {canInvite ? (
              <Link
                href="/dashboard/convites"
                className="rounded-xl border border-white/15 px-4 py-2.5 text-sm text-gray-200 transition hover:border-cyan-400/30"
              >
                Convidar mais usuários
              </Link>
            ) : null}
            {isPlatformAdmin ? (
              <Link
                href="/dashboard/assinaturas"
                className="rounded-xl border border-white/15 px-4 py-2.5 text-sm text-gray-200 transition hover:border-cyan-400/30"
              >
                Voltar às assinaturas
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {checkoutSuccess ? (
        <p className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
          Pagamento confirmado. Complete os passos abaixo para liberar o uso da
          instituição.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {steps.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setStep(item.id)}
            className={`rounded-full border px-3 py-1.5 text-xs transition ${
              step === item.id
                ? "border-cyan-400/40 bg-cyan-400/15 text-cyan-100"
                : "border-white/10 text-gray-500 hover:border-white/20"
            }`}
          >
            {item.id}. {item.label}
          </button>
        ))}
      </div>

      {error ? (
        <p className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-300">
          {error}
        </p>
      ) : null}

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        {step === 1 ? (
          <div className="space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300">
              <Sparkles size={22} />
            </div>
            <h2 className="text-2xl font-semibold text-white">
              Bem-vindo ao NeoGuardAI
            </h2>
            <p className="text-sm leading-relaxed text-gray-400">
              Vamos configurar{" "}
              <span className="text-gray-200">{assinatura.instituicaoNome}</span>{" "}
              em poucos passos: confirmar o nome, convidar a equipe e liberar o
              painel de prevenção de evasão.
            </p>
            <p className="text-xs text-gray-500">
              Plano: {assinatura.planoNome || assinatura.plano} · status{" "}
              {assinatura.status}
            </p>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-gray-100"
            >
              Começar
            </button>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300">
              <GraduationCap size={22} />
            </div>
            <h2 className="text-xl font-semibold text-white">
              Confirme o nome da instituição
            </h2>
            <p className="text-sm text-gray-400">
              Esse nome aparece no painel, nos relatórios e nos convites.
            </p>
            <label className="block text-sm text-gray-300">
              <span className="mb-1.5 block text-xs text-gray-500">Nome</span>
              <input
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm outline-none focus:border-cyan-400/40"
                placeholder="Ex.: Colégio Horizonte"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  startTransition(() => {
                    void (async () => {
                      const ok = await saveNome();
                      if (ok) setStep(3);
                    })();
                  })
                }
                className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-gray-100 disabled:opacity-60"
              >
                Salvar e continuar
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-gray-300"
              >
                Voltar
              </button>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300">
              <Users size={22} />
            </div>
            <h2 className="text-xl font-semibold text-white">
              Monte a equipe inicial
            </h2>
            <p className="text-sm text-gray-400">
              Convide coordenação, especialistas e outros admins. Sem e-mail
              configurado, o link do convite pode ser copiado no painel.
            </p>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex gap-2">
                <MailPlus size={16} className="mt-0.5 shrink-0 text-cyan-300" />
                Coordenação acompanha risco e intervenções no dia a dia.
              </li>
              <li className="flex gap-2">
                <MailPlus size={16} className="mt-0.5 shrink-0 text-cyan-300" />
                Especialistas recebem encaminhamentos e registram devolutivas.
              </li>
            </ul>
            <div className="flex flex-wrap gap-2">
              {canInvite ? (
                <Link
                  href="/dashboard/convites"
                  className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2.5 text-sm text-cyan-100 transition hover:bg-cyan-400/20"
                >
                  Abrir convites
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => setStep(4)}
                className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-gray-100"
              >
                Continuar
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-gray-300"
              >
                Voltar
              </button>
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300">
              <CheckCircle2 size={22} />
            </div>
            <h2 className="text-xl font-semibold text-white">
              Pronto para começar
            </h2>
            <p className="text-sm text-gray-400">
              Depois de concluir, a equipe pode cadastrar alunos, revisar
              alertas e gerar relatórios. Você pode convidar mais pessoas a
              qualquer momento.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() => startTransition(() => void finish())}
                className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-gray-100 disabled:opacity-60"
              >
                Concluir onboarding
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-gray-300"
              >
                Voltar
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
