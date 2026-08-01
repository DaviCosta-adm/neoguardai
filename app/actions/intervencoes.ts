"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/app/lib/auth/dal";
import { registrarIntervencao } from "@/app/lib/data/repository";
import type { TipoIntervencao } from "@/app/lib/types";

export type IntervencaoState = {
  error?: string;
  success?: string;
};

export async function criarIntervencao(
  _prev: IntervencaoState,
  formData: FormData
): Promise<IntervencaoState> {
  const auth = await requireAuth();

  const alunoId = String(formData.get("alunoId") ?? "");
  const tipo = String(formData.get("tipo") ?? "") as TipoIntervencao;
  const descricao = String(formData.get("descricao") ?? "");

  if (!alunoId || !tipo || !descricao.trim()) {
    return { error: "Preencha tipo e descrição da intervenção." };
  }

  const criada = registrarIntervencao(auth, {
    alunoId,
    tipo,
    descricao,
    status: "concluida",
  });

  if (!criada) {
    return { error: "Não foi possível registrar a intervenção neste caso." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/intervencoes");
  revalidatePath(`/dashboard/alunos/${alunoId}`);

  return { success: "Intervenção registrada." };
}
