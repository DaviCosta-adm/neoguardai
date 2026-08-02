"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/app/lib/auth/dal";
import {
  assumirEncaminhamento,
  criarEncaminhamento,
  registrarDevolutiva,
} from "@/app/lib/data/especialistas";
import type { TipoDevolutiva } from "@/app/lib/types";

export type EspecialistaFormState = {
  error?: string;
  success?: string;
};

export async function encaminharAlunoAction(
  _prev: EspecialistaFormState,
  formData: FormData
): Promise<EspecialistaFormState> {
  const auth = await requireAuth();
  const alunoId = String(formData.get("alunoId") ?? "");
  const motivo = String(formData.get("motivo") ?? "");
  const especialistaId = String(formData.get("especialistaId") ?? "") || undefined;

  if (!alunoId || !motivo.trim()) {
    return { error: "Informe o motivo do encaminhamento." };
  }

  const criado = await criarEncaminhamento(auth, {
    alunoId,
    motivo,
    especialistaId,
  });

  if (!criado) {
    return { error: "Não foi possível criar o encaminhamento." };
  }

  revalidatePath("/dashboard/especialistas");
  revalidatePath(`/dashboard/alunos/${alunoId}`);
  revalidatePath(`/dashboard/especialistas/${criado.id}`);

  return { success: "Caso encaminhado ao especialista." };
}

export async function assumirCasoAction(formData: FormData) {
  const auth = await requireAuth();
  const encaminhamentoId = String(formData.get("encaminhamentoId") ?? "");
  await assumirEncaminhamento(auth, encaminhamentoId);
  revalidatePath("/dashboard/especialistas");
  revalidatePath(`/dashboard/especialistas/${encaminhamentoId}`);
}

export async function registrarDevolutivaAction(
  _prev: EspecialistaFormState,
  formData: FormData
): Promise<EspecialistaFormState> {
  const auth = await requireAuth();
  const encaminhamentoId = String(formData.get("encaminhamentoId") ?? "");
  const tipo = String(formData.get("tipo") ?? "") as TipoDevolutiva;
  const conteudo = String(formData.get("conteudo") ?? "");
  const concluir = formData.get("concluir") === "on";

  if (!encaminhamentoId || !tipo || !conteudo.trim()) {
    return { error: "Preencha tipo e conteúdo da devolutiva." };
  }

  const criada = await registrarDevolutiva(auth, {
    encaminhamentoId,
    tipo,
    conteudo,
    concluir,
  });

  if (!criada) {
    return { error: "Não foi possível registrar a devolutiva." };
  }

  revalidatePath("/dashboard/especialistas");
  revalidatePath(`/dashboard/especialistas/${encaminhamentoId}`);

  return { success: "Registro salvo com sucesso." };
}
