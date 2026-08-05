import "server-only";

import { countSnapshots } from "@/app/lib/data/risco-snapshots";
import { getModeloAtivo } from "@/app/lib/data/modelo-risco";
import { isEmailConfigured } from "@/app/lib/email/send";
import { isStripeConfigured } from "@/app/lib/stripe/client";
import { getAppBaseUrl } from "@/app/lib/config/app-url";

export type OperacaoStatus = {
  appUrl: string;
  email: {
    configured: boolean;
    from: string | null;
  };
  cron: {
    secretConfigured: boolean;
    endpoint: string;
  };
  stripe: {
    configured: boolean;
  };
  seedOnStart: boolean;
  modelo: {
    versao: string;
    treinadoEm: string | null;
  };
  snapshots: {
    total: number;
    comOutcome: number;
  };
};

export async function getOperacaoStatus(): Promise<OperacaoStatus> {
  const [snapshots, modelo] = await Promise.all([
    countSnapshots(),
    getModeloAtivo(),
  ]);

  const from = process.env.EMAIL_FROM?.trim() || null;

  return {
    appUrl: getAppBaseUrl(),
    email: {
      configured: isEmailConfigured(),
      from,
    },
    cron: {
      secretConfigured: Boolean(process.env.CRON_SECRET?.trim()),
      endpoint: `${getAppBaseUrl()}/api/cron/risco-snapshots`,
    },
    stripe: {
      configured: isStripeConfigured(),
    },
    seedOnStart: process.env.SEED_ON_START === "true",
    modelo: {
      versao: modelo?.versao ?? "v2",
      treinadoEm: modelo?.treinadoEm ?? null,
    },
    snapshots,
  };
}
