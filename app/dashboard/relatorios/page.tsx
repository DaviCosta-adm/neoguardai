import Header from "@/app/components/dashboard/Header";

export default function RelatoriosPage() {
  return (
    <>
      <Header
        title="Relatórios"
        subtitle="Próxima etapa após autenticação e persistência dos dados."
      />
      <div className="px-6 py-6">
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-sm text-gray-400">
          Em breve: relatórios individuais, casos críticos, evolução de riscos e
          exportações em PDF, Excel ou CSV.
        </div>
      </div>
    </>
  );
}
