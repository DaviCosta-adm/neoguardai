import "server-only";

import type { Instituicao, Usuario } from "@/app/lib/types";

export type DemoUser = Usuario & {
  password: string;
};

export const instituicoes: Instituicao[] = [
  { id: "inst-001", nome: "Colégio Horizonte" },
  { id: "inst-002", nome: "Escola Aurora" },
];

/** Contas demo — senha padrão: demo123 */
export const demoUsers: DemoUser[] = [
  {
    id: "user-001",
    nome: "Ana Coordenadora",
    email: "ana@horizonte.edu.br",
    password: "demo123",
    role: "coordenacao",
    instituicaoId: "inst-001",
  },
  {
    id: "user-002",
    nome: "Carlos Especialista",
    email: "carlos@horizonte.edu.br",
    password: "demo123",
    role: "especialista",
    instituicaoId: "inst-001",
  },
  {
    id: "user-003",
    nome: "Helena Admin",
    email: "admin@horizonte.edu.br",
    password: "demo123",
    role: "admin_instituicao",
    instituicaoId: "inst-001",
  },
  {
    id: "user-004",
    nome: "Maria Coordenadora",
    email: "maria@aurora.edu.br",
    password: "demo123",
    role: "coordenacao",
    instituicaoId: "inst-002",
  },
  {
    id: "user-005",
    nome: "Suporte NeoGuard",
    email: "suporte@neoguard.ai",
    password: "demo123",
    role: "admin_neoguard",
    instituicaoId: "inst-001",
  },
];

export function findUserByEmail(email: string): DemoUser | undefined {
  return demoUsers.find(
    (user) => user.email.toLowerCase() === email.trim().toLowerCase()
  );
}

export function findUserById(id: string): DemoUser | undefined {
  return demoUsers.find((user) => user.id === id);
}

export function toPublicUser(user: DemoUser): Usuario {
  return {
    id: user.id,
    nome: user.nome,
    email: user.email,
    role: user.role,
    instituicaoId: user.instituicaoId,
  };
}

export function getInstituicaoById(id: string): Instituicao | undefined {
  return instituicoes.find((item) => item.id === id);
}
