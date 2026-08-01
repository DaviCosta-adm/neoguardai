import { NextResponse } from "next/server";
import { getOpenAI } from "@/app/lib/openai";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        {
          error: "Mensagem não informada.",
        },
        {
          status: 400,
        }
      );
    }


    const response = await getOpenAI().chat.completions.create({

      model: "gpt-4.1-mini",

      messages: [

        {
          role: "system",
          content: `
Você é Atlas, o assistente oficial da NeoGuardAI.

Sua função é ajudar visitantes e usuários da plataforma.

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
          `,
        },

        {
          role: "user",
          content: message,
        },

      ],

      temperature: 0.7,

    });


    const reply =
      response.choices[0].message.content ??
      "Não consegui gerar uma resposta.";


    return NextResponse.json({
      reply,
    });


   } catch (error) {
    console.error("Erro no Atlas:", error);

    return NextResponse.json(
      {
        error: "Erro ao conectar com o Atlas.",
      },
      {
        status: 500,
      }
    );
  }
}