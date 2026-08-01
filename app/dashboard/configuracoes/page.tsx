import Header from "@/app/components/dashboard/Header";

export default function ConfiguracoesPage() {
  return (
    <>
      <Header
        title="Configurações"
        subtitle="Usuários, permissões e instituição — após autenticação."
      />
      <div className="px-6 py-6">
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-sm text-gray-400">
          Em breve: gestão de usuários da coordenação, especialistas e
          administradores da instituição.
        </div>
      </div>
    </>
  );
}
