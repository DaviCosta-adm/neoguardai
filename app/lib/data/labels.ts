import type { Aluno, Intervencao, UserRole } from "@/app/lib/types";

export const rotuloIntervencao: Record<Intervencao["tipo"], string> = {
  conversa_aluno: "Conversa com o aluno",
  contato_familia: "Contato com a família",
  reuniao: "Reunião",
  acompanhamento_semanal: "Acompanhamento semanal",
  encaminhamento_especialista: "Encaminhamento para especialista",
  plano_permanencia: "Plano de permanência",
  revisao_caso: "Revisão do caso",
};

export const rotuloStatusAcompanhamento: Record<
  Aluno["statusAcompanhamento"],
  string
> = {
  novo: "Novo",
  em_acompanhamento: "Em acompanhamento",
  encaminhado: "Encaminhado",
  estavel: "Estável",
  critico: "Crítico",
};

export const rotuloRole: Record<UserRole, string> = {
  coordenacao: "Coordenação",
  especialista: "Especialista",
  admin_instituicao: "Admin da instituição",
  admin_neoguard: "Admin NeoGuardAI",
};

export const prioridadeRisco: Record<Aluno["riscoNivel"], number> = {
  critico: 0,
  alto: 1,
  medio: 2,
  baixo: 3,
};
