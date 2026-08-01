import Link from "next/link";
import LoginForm from "@/app/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050816] px-6 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">
          NeoGuardAI
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Entrar no sistema</h1>
        <p className="mt-3 text-sm leading-6 text-gray-400">
          Acesso multi-tenant por instituição e perfil. Sessão protegida por
          cookie HTTP-only.
        </p>

        <LoginForm />

        <Link
          href="/"
          className="mt-6 flex w-full items-center justify-center rounded-xl border border-white/10 px-4 py-3 text-sm text-gray-300 transition hover:border-cyan-400/30"
        >
          Voltar ao site
        </Link>
      </div>
    </main>
  );
}
