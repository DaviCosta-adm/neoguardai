import { NextResponse } from "next/server";
import { getAuthContext } from "@/app/lib/auth/dal";
import { buildAtlasCaseContext } from "@/app/lib/atlas/context";
import { explicacaoLocalAtlas } from "@/app/lib/risk/predictive";
import { getOpenAI } from "@/app/lib/openai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = String(body?.message ?? "").trim();
    const alunoId = body?.alunoId ? String(body.alunoId) : undefined;

    if (!message) {
      return NextResponse.json(
        { error: "Mensagem não informada." },
        { status: 400 }
      );
    }

    const auth = await getAuthContext();
    const caseContext =
      auth && alunoId ? await buildAtlasCaseContext(auth, alunoId) : null;

    const systemBase = `
Você é Atlas, o assistente oficial da NeoGuardAI.

A NeoGuardAI é uma plataforma SaaS especializada exclusivamente na
prevenção da evasão escolar. Ela transforma dados educacionais em
alertas, análises e ações preventivas para a coordenação pedagógica.
Não é um ERP escolar e não controla matrículas, disciplinas ou pagamentos.

Você pode: explicar o NeoGuardAI, responder dúvidas sobre evasão escolar,
interpretar indicadores, resumir casos, explicar alertas, sugerir
intervenções e ajudar na criação de planos de ação.

Regras:
- Responda sempre em português do Brasil.
- Seja curto: geralmente entre uma e três frases.
- Seja profissional, amigável e objetivo.
- Nunca diga que é ChatGPT.
- Sempre se apresente como Atlas quando necessário.
- Não invente funcionalidades que a plataforma ainda não possui.
- Explique riscos e conceitos de forma simples.
- Se houver contexto de caso, baseie a resposta nele e não invente dados.
`.trim();

    try {
      const response = await getOpenAI().chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: caseContext
              ? `${systemBase}\n\n${caseContext.prompt}`
              : systemBase,
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.5,
      });

      const reply =
        response.choices[0]?.message?.content ??
        "Não consegui gerar uma resposta.";

      return NextResponse.json({
        reply,
        source: "openai",
        preditivo: caseContext?.preditivo ?? null,
      });
    } catch (error) {
      console.error("Atlas fallback local:", error);

      const reply = explicacaoLocalAtlas(message, caseContext?.aluno ?? null);

      return NextResponse.json({
        reply,
        source: "local",
        preditivo: caseContext?.preditivo ?? null,
      });
    }
  } catch (error) {
    console.error("Erro no Atlas:", error);

    return NextResponse.json(
      { error: "Erro ao conectar com o Atlas." },
      { status: 500 }
    );
  }
}
