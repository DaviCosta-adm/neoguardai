import { corRisco, rotuloRisco } from "@/app/lib/risk/score";
import type { RiskLevel } from "@/app/lib/types";

export default function RiskBadge({
  nivel,
  percentual,
}: {
  nivel: RiskLevel;
  percentual?: number;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${corRisco(nivel)}`}
    >
      {rotuloRisco(nivel)}
      {typeof percentual === "number" ? (
        <span className="opacity-80">{percentual}%</span>
      ) : null}
    </span>
  );
}
