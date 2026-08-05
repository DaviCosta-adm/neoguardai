import "server-only";

import { listUsuarios } from "@/app/lib/auth/users";
import { getAppBaseUrl } from "@/app/lib/config/app-url";
import { criarNotificacoesParaUsuarios } from "@/app/lib/data/notificacoes";
import { sendEmail } from "@/app/lib/email/send";
import type { Aluno, RiskLevel } from "@/app/lib/types";

const NIVEIS_ALERTA: RiskLevel[] = ["alto", "critico"];

export async function notificarRiscoCritico(input: {
  aluno: Aluno;
  nivelAnterior?: RiskLevel | null;
  percentual: number;
  nivel: RiskLevel;
  explicacao: string;
}): Promise<{
  sent: number;
  inApp: number;
  mode: "resend" | "log" | "skip";
}> {
  if (!NIVEIS_ALERTA.includes(input.nivel)) {
    return { sent: 0, inApp: 0, mode: "skip" };
  }

  // Evita spam se já estava no mesmo patamar alto/crítico.
  if (
    input.nivelAnterior &&
    NIVEIS_ALERTA.includes(input.nivelAnterior) &&
    input.nivelAnterior === input.nivel
  ) {
    return { sent: 0, inApp: 0, mode: "skip" };
  }

  const destinatarios = (
    await listUsuarios({ instituicaoId: input.aluno.instituicaoId })
  ).filter(
    (u) => u.role === "coordenacao" || u.role === "admin_instituicao"
  );

  if (destinatarios.length === 0) {
    return { sent: 0, inApp: 0, mode: "skip" };
  }

  const baseUrl = getAppBaseUrl();
  const href = `/dashboard/alunos/${input.aluno.id}`;
  const link = `${baseUrl}${href}`;
  const titulo = `Risco ${input.nivel} — ${input.aluno.nome}`;
  const corpo = `${input.aluno.turma} · ${input.aluno.serie} · ${input.percentual}% — ${input.explicacao}`;
  const subject = `[NeoGuardAI] ${titulo}`;
  const text = [
    `O aluno ${input.aluno.nome} (${input.aluno.turma} · ${input.aluno.serie}) atingiu risco ${input.nivel} (${input.percentual}%).`,
    "",
    input.explicacao,
    "",
    `Abrir ficha: ${link}`,
  ].join("\n");

  const inApp = await criarNotificacoesParaUsuarios({
    usuarioIds: destinatarios.map((u) => u.id),
    instituicaoId: input.aluno.instituicaoId,
    tipo: "risco",
    titulo,
    corpo,
    href,
  });

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

  return { sent, inApp, mode };
}
