import OpenAI from "openai";

let client: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY não configurada.");
    }

    client = new OpenAI({ apiKey });
  }

  return client;
}

export default getOpenAI;
