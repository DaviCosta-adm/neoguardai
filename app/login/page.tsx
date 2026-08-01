import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050816] px-6 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">
          NeoGuardAI
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Entrar no sistema</h1>
        <p className="mt-3 text-sm leading-6 text-gray-400">
          A autenticação e o multi-tenant entram na próxima etapa da base SaaS,
          depois do fluxo operacional com dados simulados.
        </p>

        <div className="mt-8 space-y-3">
          <Link
            href="/dashboard"
            className="flex w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-gray-100"
          >
            Acessar dashboard (demo)
          </Link>
          <Link
            href="/"
            className="flex w-full items-center justify-center rounded-xl border border-white/10 px-4 py-3 text-sm text-gray-300 transition hover:border-cyan-400/30"
          >
            Voltar ao site
          </Link>
        </div>
      </div>
    </main>
  );
}
