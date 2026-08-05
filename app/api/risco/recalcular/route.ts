import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAuthApi } from "@/app/lib/auth/dal";
import { getAlunoById } from "@/app/lib/data/repository";
import { query } from "@/app/lib/db/client";
import { calcularRiscoPreditivo } from "@/app/lib/risk/predictive";

export async function POST(request: Request) {
  try {
    const auth = await requireAuthApi();
    if (!auth) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }
    const body = await request.json();
    const alunoId = String(body?.alunoId ?? "");
    const aluno = await getAlunoById(auth, alunoId);

    if (!aluno) {
      return NextResponse.json(
        { error: "Aluno não encontrado." },
        { status: 404 }
      );
    }

    const preditivo = calcularRiscoPreditivo(aluno);
    const agora = new Date().toISOString();

    await query(
      `UPDATE alunos
       SET risco_percentual = $2,
           risco_nivel = $3,
           fatores_risco = $4::jsonb,
           explicacao_atlas = $5,
           atualizado_em = $6
       WHERE id = $1`,
      [
        aluno.id,
        preditivo.percentual,
        preditivo.nivel,
        JSON.stringify(preditivo.fatores),
        preditivo.explicacao,
        agora,
      ]
    );

    await query(
      `INSERT INTO timeline_events
        (id, aluno_id, tipo, titulo, descricao, criado_em)
       VALUES ($1,$2,'atualizacao_risco',$3,$4,$5)`,
      [
        `tl-${crypto.randomUUID()}`,
        aluno.id,
        "Risco recalculado (modelo v2)",
        `Novo score ${preditivo.percentual}% com projeção ${preditivo.projecao14d}% em 14 dias.`,
        agora,
      ]
    );

    revalidatePath(`/dashboard/alunos/${aluno.id}`);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/atlas");
    revalidatePath("/dashboard/relatorios");

    return NextResponse.json({ ok: true, preditivo });
  } catch (error) {
    console.error("Erro ao recalcular risco:", error);
    return NextResponse.json(
      { error: "Erro ao recalcular risco." },
      { status: 500 }
    );
  }
}
