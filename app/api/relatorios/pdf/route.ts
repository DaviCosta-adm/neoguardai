import { NextResponse } from "next/server";
import { requireAuthApi } from "@/app/lib/auth/dal";
import { buildRelatorioInstituicaoPdf } from "@/app/lib/data/pdf-reports";
import { getRelatorioResumo } from "@/app/lib/data/reports";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAuthApi();
  if (!auth) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  if (auth.user.role === "especialista") {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const relatorio = await getRelatorioResumo(auth);
  const bytes = await buildRelatorioInstituicaoPdf(relatorio);
  const filename = `relatorio-${relatorio.instituicao
    .toLowerCase()
    .replace(/\s+/g, "-")}.pdf`;

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
