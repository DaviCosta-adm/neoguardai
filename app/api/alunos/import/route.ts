import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAuthApi } from "@/app/lib/auth/dal";
import { importarIndicadoresCsv } from "@/app/lib/data/repository";

export async function POST(request: Request) {
  try {
    const auth = await requireAuthApi();
    if (!auth) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") || "";
    let csvText = "";

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      if (file && typeof file === "object" && "text" in file) {
        csvText = await (file as File).text();
      } else {
        csvText = String(form.get("csv") ?? "");
      }
    } else {
      const body = await request.json().catch(() => ({}));
      csvText = String(body?.csv ?? "");
    }

    if (!csvText.trim()) {
      return NextResponse.json(
        { error: "Envie o CSV no campo file ou csv." },
        { status: 400 }
      );
    }

    const result = await importarIndicadoresCsv(auth, csvText);

    revalidatePath("/dashboard/alunos");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/modelo");

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao importar CSV.";
    const status = message.includes("permissão") ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
