import "server-only";

import { query } from "@/app/lib/db/client";
import { getPlanoById } from "@/app/lib/data/planos";
import type { Plano } from "@/app/lib/types";

export type UsoPlano = {
  plano: Plano | null;
  totalAlunos: number;
  totalUsuarios: number;
  maxAlunos: number | null;
  maxUsuarios: number | null;
};

export async function getUsoPlanoDaInstituicao(
  instituicaoId: string
): Promise<UsoPlano> {
  const result = await query<{
    plano_id: string | null;
    alunos: string | number;
    usuarios: string | number;
  }>(
    `SELECT
       a.plano_id,
       (SELECT COUNT(*)::int FROM alunos WHERE instituicao_id = $1) AS alunos,
       (SELECT COUNT(*)::int FROM usuarios WHERE instituicao_id = $1) AS usuarios
     FROM assinaturas a
     WHERE a.instituicao_id = $1
     LIMIT 1`,
    [instituicaoId]
  );

  const row = result.rows[0];
  const plano = row?.plano_id ? await getPlanoById(row.plano_id) : null;

  return {
    plano,
    totalAlunos: Number(row?.alunos ?? 0),
    totalUsuarios: Number(row?.usuarios ?? 0),
    maxAlunos: plano?.maxAlunos ?? null,
    maxUsuarios: plano?.maxUsuarios ?? null,
  };
}

export async function assertPodeCriarUsuario(instituicaoId: string) {
  const uso = await getUsoPlanoDaInstituicao(instituicaoId);
  if (uso.maxUsuarios != null && uso.totalUsuarios >= uso.maxUsuarios) {
    throw new Error(
      `Limite do plano atingido: no máximo ${uso.maxUsuarios} usuários (${uso.plano?.nome ?? "plano"}).`
    );
  }
  return uso;
}

export async function assertPodeCriarAluno(instituicaoId: string) {
  const uso = await getUsoPlanoDaInstituicao(instituicaoId);
  if (uso.maxAlunos != null && uso.totalAlunos >= uso.maxAlunos) {
    throw new Error(
      `Limite do plano atingido: no máximo ${uso.maxAlunos} alunos (${uso.plano?.nome ?? "plano"}).`
    );
  }
  return uso;
}

export async function assertPodeCriarConvite(instituicaoId: string) {
  const uso = await getUsoPlanoDaInstituicao(instituicaoId);
  if (uso.maxUsuarios == null) return uso;

  const pending = await query<{ total: string | number }>(
    `SELECT COUNT(*)::int AS total
     FROM convites
     WHERE instituicao_id = $1
       AND status = 'pendente'
       AND expira_em > NOW()`,
    [instituicaoId]
  );
  const pendentes = Number(pending.rows[0]?.total ?? 0);
  if (uso.totalUsuarios + pendentes >= uso.maxUsuarios) {
    throw new Error(
      `Limite do plano atingido: ${uso.totalUsuarios} usuários + ${pendentes} convite(s) pendente(s) (máx. ${uso.maxUsuarios}).`
    );
  }
  return uso;
}
