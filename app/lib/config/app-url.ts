import "server-only";

export function getAppBaseUrl() {
  const fromEnv =
    process.env.APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.COOLIFY_URL?.trim() ||
    process.env.SERVICE_URL_APP?.trim();

  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  return "https://neoguardai.rcsolucoes.app.br";
}
