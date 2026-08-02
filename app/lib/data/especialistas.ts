import "server-only";

import type { AuthContext } from "@/app/lib/auth/dal";
import { query } from "@/app/lib/db/client";
import type {
  Devolutiva,
  EncaminhamentoDetalhe,
  RiskLevel,
  StatusEncaminhamento,
  TipoDevolutiva,
} from "@/app/lib/types";

type EncaminhamentoRow = {
  id: string;
  aluno_id: string;
  instituicao_id: string;
  especialista_id: string | null;
  criado_por: string;
  motivo: string;
  status: StatusEncaminhamento;
  criado_em: Date | string;
  atualizado_em: Date | string;
  aluno_nome: string;
  aluno_turma: string;
  risco_nivel: RiskLevel;
  risco_percentual: number;
  especialista_nome: string | null;
  criado_por_nome: string;
};

type DevolutivaRow = {
  id: string;
  encaminhamento_id: string;
  autor_id: string;
  tipo: TipoDevolutiva;
  conteudo: string;
  criado_em: Date | string;
  autor_nome?: string;
};

function toIso(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function mapEncaminhamento(row: EncaminhamentoRow): EncaminhamentoDetalhe {
  return {
    id: row.id,
    alunoId: row.aluno_id,
    instituicaoId: row.instituicao_id,
    especialistaId: row.especialista_id ?? undefined,
    criadoPor: row.criado_por,
    motivo: row.motivo,
    status: row.status,
    criadoEm: toIso(row.criado_em),
    atualizadoEm: toIso(row.atualizado_em),
    alunoNome: row.aluno_nome,
    alunoTurma: row.aluno_turma,
    riscoNivel: row.risco_nivel,
    riscoPercentual: row.risco_percentual,
    especialistaNome: row.especialista_nome ?? undefined,
    criadoPorNome: row.criado_por_nome,
  };
}

export async function listarEncaminhamentos(
  auth: AuthContext
): Promise<EncaminhamentoDetalhe[]> {
  if (auth.user.role === "especialista") {
    const result = await query<EncaminhamentoRow>(
      `SELECT e.*,
              a.nome AS aluno_nome,
              a.turma AS aluno_turma,
              a.risco_nivel,
              a.risco_percentual,
              esp.nome AS especialista_nome,
              cri.nome AS criado_por_nome
       FROM encaminhamentos e
       INNER JOIN alunos a ON a.id = e.aluno_id
       INNER JOIN usuarios cri ON cri.id = e.criado_por
       LEFT JOIN usuarios esp ON esp.id = e.especialista_id
       WHERE e.instituicao_id = $1
         AND (e.especialista_id = $2 OR e.especialista_id IS NULL)
       ORDER BY e.atualizado_em DESC`,
      [auth.user.instituicaoId, auth.user.id]
    );
    return result.rows.map(mapEncaminhamento);
  }

  const params =
    auth.user.role === "admin_neoguard"
      ? []
      : [auth.user.instituicaoId];
  const where =
    auth.user.role === "admin_neoguard"
      ? "TRUE"
      : "e.instituicao_id = $1";

  const result = await query<EncaminhamentoRow>(
    `SELECT e.*,
            a.nome AS aluno_nome,
            a.turma AS aluno_turma,
            a.risco_nivel,
            a.risco_percentual,
            esp.nome AS especialista_nome,
            cri.nome AS criado_por_nome
     FROM encaminhamentos e
     INNER JOIN alunos a ON a.id = e.aluno_id
     INNER JOIN usuarios cri ON cri.id = e.criado_por
     LEFT JOIN usuarios esp ON esp.id = e.especialista_id
     WHERE ${where}
     ORDER BY e.atualizado_em DESC`,
    params
  );

  return result.rows.map(mapEncaminhamento);
}

export async function getEncaminhamentoById(
  auth: AuthContext,
  id: string
): Promise<EncaminhamentoDetalhe | null> {
  const itens = await listarEncaminhamentos(auth);
  return itens.find((item) => item.id === id) ?? null;
}

export async function listarDevolutivas(
  encaminhamentoId: string
): Promise<Array<Devolutiva & { autorNome: string }>> {
  const result = await query<DevolutivaRow>(
    `SELECT d.*, u.nome AS autor_nome
     FROM devolutivas d
     INNER JOIN usuarios u ON u.id = d.autor_id
     WHERE d.encaminhamento_id = $1
     ORDER BY d.criado_em DESC`,
    [encaminhamentoId]
  );

  return result.rows.map((row) => ({
    id: row.id,
    encaminhamentoId: row.encaminhamento_id,
    autorId: row.autor_id,
    tipo: row.tipo,
    conteudo: row.conteudo,
    criadoEm: toIso(row.criado_em),
    autorNome: row.autor_nome ?? "Usuário",
  }));
}

export async function criarEncaminhamento(
  auth: AuthContext,
  input: {
    alunoId: string;
    motivo: string;
    especialistaId?: string;
  }
): Promise<EncaminhamentoDetalhe | null> {
  if (
    auth.user.role !== "coordenacao" &&
    auth.user.role !== "admin_instituicao" &&
    auth.user.role !== "admin_neoguard"
  ) {
    return null;
  }

  const aluno = await query<{
    id: string;
    instituicao_id: string;
  }>(
    `SELECT id, instituicao_id FROM alunos WHERE id = $1 LIMIT 1`,
    [input.alunoId]
  );

  const row = aluno.rows[0];
  if (!row) return null;

  if (
    auth.user.role !== "admin_neoguard" &&
    row.instituicao_id !== auth.user.instituicaoId
  ) {
    return null;
  }

  const id = `enc-${crypto.randomUUID()}`;
  const agora = new Date().toISOString();

  await query(
    `INSERT INTO encaminhamentos
      (id, aluno_id, instituicao_id, especialista_id, criado_por, motivo, status, criado_em, atualizado_em)
     VALUES ($1,$2,$3,$4,$5,$6,'aberto',$7,$7)`,
    [
      id,
      input.alunoId,
      row.instituicao_id,
      input.especialistaId ?? null,
      auth.user.id,
      input.motivo.trim(),
      agora,
    ]
  );

  await query(
    `UPDATE alunos
     SET status_acompanhamento = 'encaminhado', atualizado_em = $2
     WHERE id = $1`,
    [input.alunoId, agora]
  );

  await query(
    `INSERT INTO timeline_events
      (id, aluno_id, tipo, titulo, descricao, criado_em)
     VALUES ($1,$2,'encaminhamento',$3,$4,$5)`,
    [
      `tl-${crypto.randomUUID()}`,
      input.alunoId,
      "Encaminhado ao especialista",
      input.motivo.trim(),
      agora,
    ]
  );

  return getEncaminhamentoById(auth, id);
}

export async function assumirEncaminhamento(
  auth: AuthContext,
  encaminhamentoId: string
) {
  if (auth.user.role !== "especialista") return false;

  const result = await query(
    `UPDATE encaminhamentos
     SET especialista_id = $1,
         status = 'em_atendimento',
         atualizado_em = NOW()
     WHERE id = $2
       AND instituicao_id = $3
       AND (especialista_id IS NULL OR especialista_id = $1)`,
    [auth.user.id, encaminhamentoId, auth.user.instituicaoId]
  );

  return (result.rowCount ?? 0) > 0;
}

export async function registrarDevolutiva(
  auth: AuthContext,
  input: {
    encaminhamentoId: string;
    tipo: TipoDevolutiva;
    conteudo: string;
    concluir?: boolean;
  }
) {
  const encaminhamento = await getEncaminhamentoById(
    auth,
    input.encaminhamentoId
  );
  if (!encaminhamento) return null;

  if (
    auth.user.role === "especialista" &&
    encaminhamento.especialistaId &&
    encaminhamento.especialistaId !== auth.user.id
  ) {
    return null;
  }

  const id = `dev-${crypto.randomUUID()}`;
  const agora = new Date().toISOString();

  await query(
    `INSERT INTO devolutivas
      (id, encaminhamento_id, autor_id, tipo, conteudo, criado_em)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [
      id,
      input.encaminhamentoId,
      auth.user.id,
      input.tipo,
      input.conteudo.trim(),
      agora,
    ]
  );

  await query(
    `UPDATE encaminhamentos
     SET status = $2,
         especialista_id = COALESCE(especialista_id, $3),
         atualizado_em = $4
     WHERE id = $1`,
    [
      input.encaminhamentoId,
      input.concluir ? "concluido" : "em_atendimento",
      auth.user.id,
      agora,
    ]
  );

  await query(
    `INSERT INTO timeline_events
      (id, aluno_id, tipo, titulo, descricao, criado_em)
     VALUES ($1,$2,'observacao',$3,$4,$5)`,
    [
      `tl-${crypto.randomUUID()}`,
      encaminhamento.alunoId,
      "Registro do especialista",
      input.conteudo.trim(),
      agora,
    ]
  );

  return {
    id,
    encaminhamentoId: input.encaminhamentoId,
    autorId: auth.user.id,
    tipo: input.tipo,
    conteudo: input.conteudo.trim(),
    criadoEm: agora,
  } satisfies Devolutiva;
}

export async function listarEspecialistasDaInstituicao(
  instituicaoId: string
) {
  const result = await query<{ id: string; nome: string; email: string }>(
    `SELECT id, nome, email
     FROM usuarios
     WHERE instituicao_id = $1 AND role = 'especialista'
     ORDER BY nome`,
    [instituicaoId]
  );

  return result.rows;
}
