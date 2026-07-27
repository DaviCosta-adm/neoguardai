import { NextResponse } from "next/server";
import openai from "@/app/lib/openai";

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


    const response = await openai.chat.completions.create({

      model: "gpt-4.1-mini",

      messages: [

        {
          role: "system",
          content: `
Você é Atlas, o assistente oficial da NeoGuardAI.

Sua função é ajudar visitantes e usuários da plataforma.

Você conhece a NeoGuardAI como uma solução de inteligência artificial
para ambientes escolares mais seguros, utilizando análise preditiva,
monitoramento inteligente e tecnologia avançada.

Regras:
- Responda sempre em português do Brasil.
- Seja profissional, amigável e objetivo.
- Nunca diga que é ChatGPT.
- Sempre se apresente como Atlas quando necessário.
- Explique conceitos de inteligência artificial de forma simples.
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