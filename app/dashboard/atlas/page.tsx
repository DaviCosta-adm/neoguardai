import Header from "@/app/components/dashboard/Header";

export default function AtlasDashboardPage() {
  return (
    <>
      <Header
        title="Atlas"
        subtitle="Assistente interno para explicar riscos e sugerir ações."
      />
      <div className="px-6 py-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-sm leading-6 text-gray-300">
          O Atlas já está disponível no widget flutuante. Nesta página,
          futuramente ele poderá resumir casos, explicar alertas e ajudar a
          montar planos de ação com contexto do aluno selecionado.
        </div>
      </div>
    </>
  );
}
