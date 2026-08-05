import "server-only";

import { listUsuarios } from "@/app/lib/auth/users";
import { getAppBaseUrl } from "@/app/lib/config/app-url";
import { sendEmail } from "@/app/lib/email/send";
import type { Aluno, RiskLevel } from "@/app/lib/types";

const NIVEIS_ALERTA: RiskLevel[] = ["alto", "critico"];

export async function notificarRiscoCritico(input: {
  aluno: Aluno;
  nivelAnterior?: RiskLevel | null;
  percentual: number;
  nivel: RiskLevel;
  explicacao: string;
}): Promise<{ sent: number; mode: "resend" | "log" | "skip" }> {
  if (!NIVEIS_ALERTA.includes(input.nivel)) {
    return { sent: 0, mode: "skip" };
  }

  // Evita spam se já estava no mesmo patamar alto/crítico.
  if (
    input.nivelAnterior &&
    NIVEIS_ALERTA.includes(input.nivelAnterior) &&
    input.nivelAnterior === input.nivel
  ) {
    return { sent: 0, mode: "skip" };
  }

  const destinatarios = (
    await listUsuarios({ instituicaoId: input.aluno.instituicaoId })
  ).filter(
    (u) => u.role === "coordenacao" || u.role === "admin_instituicao"
  );

  if (destinatarios.length === 0) {
    return { sent: 0, mode: "skip" };
  }

  const baseUrl = getAppBaseUrl();
  const link = `${baseUrl}/dashboard/alunos/${input.aluno.id}`;
  const subject = `[NeoGuardAI] Risco ${input.nivel} — ${input.aluno.nome}`;
  const text = [
    `O aluno ${input.aluno.nome} (${input.aluno.turma} · ${input.aluno.serie}) atingiu risco ${input.nivel} (${input.percentual}%).`,
    "",
    input.explicacao,
    "",
    `Abrir ficha: ${link}`,
  ].join("\n");

  let sent = 0;
  let mode: "resend" | "log" = "log";
  for (const user of destinatarios) {
    const result = await sendEmail({
      to: user.email,
      subject,
      text,
    });
    mode = result.mode;
    if (result.sent) sent += 1;
  }

  return { sent, mode };
}
