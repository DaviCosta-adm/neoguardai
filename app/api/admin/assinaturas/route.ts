import { NextResponse } from "next/server";
import { requireAdminNeoGuardApi } from "@/app/lib/auth/dal";
import { listAssinaturas } from "@/app/lib/data/assinaturas";

export async function GET() {
  const auth = await requireAdminNeoGuardApi();
  if (!auth) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  return NextResponse.json({
    ok: true,
    assinaturas: await listAssinaturas(),
  });
}
