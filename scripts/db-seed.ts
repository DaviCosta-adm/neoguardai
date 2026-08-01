import { hashSync } from "bcryptjs";
import { Pool } from "pg";
import { calcularRisco } from "../app/lib/risk/score";
import {
  alertasSeed,
  buildAlunosSeed,
  intervencoesSeed,
  timelineSeed,
} from "../app/lib/data/seed";

const instituicoes = [
  { id: "inst-001", nome: "Colégio Horizonte" },
  { id: "inst-002", nome: "Escola Aurora" },
];

const usuarios = [
  {
    id: "user-001",
    nome: "Ana Coordenadora",
    email: "ana@horizonte.edu.br",
    password: "demo123",
    role: "coordenacao",
    instituicaoId: "inst-001",
  },
  {
    id: "user-002",
    nome: "Carlos Especialista",
    email: "carlos@horizonte.edu.br",
    password: "demo123",
    role: "especialista",
    instituicaoId: "inst-001",
  },
  {
    id: "user-003",
    nome: "Helena Admin",
    email: "admin@horizonte.edu.br",
    password: "demo123",
    role: "admin_instituicao",
    instituicaoId: "inst-001",
  },
  {
    id: "user-004",
    nome: "Maria Coordenadora",
    email: "maria@aurora.edu.br",
    password: "demo123",
    role: "coordenacao",
    instituicaoId: "inst-002",
  },
  {
    id: "user-005",
    nome: "Suporte NeoGuard",
    email: "suporte@neoguard.ai",
    password: "demo123",
    role: "admin_neoguard",
    instituicaoId: "inst-001",
  },
];

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL não configurada.");
  }

  const pool = new Pool({ connectionString });
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query("DELETE FROM timeline_events");
    await client.query("DELETE FROM intervencoes");
    await client.query("DELETE FROM alertas");
    await client.query("DELETE FROM alunos");
    await client.query("DELETE FROM usuarios");
    await client.query("DELETE FROM instituicoes");

    for (const instituicao of instituicoes) {
      await client.query(
        "INSERT INTO instituicoes (id, nome) VALUES ($1, $2)",
        [instituicao.id, instituicao.nome]
      );
    }

    for (const user of usuarios) {
      await client.query(
        `INSERT INTO usuarios
          (id, nome, email, password_hash, role, instituicao_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          user.id,
          user.nome,
          user.email,
          hashSync(user.password, 10),
          user.role,
          user.instituicaoId,
        ]
      );
    }

    // Recalcula risco no seed para manter consistência com a regra atual
    const alunos = buildAlunosSeed().map((aluno) => {
      const risco = calcularRisco(aluno);
      return {
        ...aluno,
        riscoPercentual: risco.percentual,
        riscoNivel: risco.nivel,
        fatoresRisco: risco.fatores,
        explicacaoAtlas: risco.explicacao,
      };
    });

    for (const aluno of alunos) {
      await client.query(
        `INSERT INTO alunos (
          id, instituicao_id, nome, turma, serie,
          frequencia, desempenho, faltas_consecutivas, ocorrencias, participacao,
          risco_percentual, risco_nivel, fatores_risco, explicacao_atlas,
          status_acompanhamento, atualizado_em
        ) VALUES (
          $1,$2,$3,$4,$5,
          $6,$7,$8,$9,$10,
          $11,$12,$13::jsonb,$14,
          $15,$16
        )`,
        [
          aluno.id,
          aluno.instituicaoId,
          aluno.nome,
          aluno.turma,
          aluno.serie,
          aluno.frequencia,
          aluno.desempenho,
          aluno.faltasConsecutivas,
          aluno.ocorrencias,
          aluno.participacao,
          aluno.riscoPercentual,
          aluno.riscoNivel,
          JSON.stringify(aluno.fatoresRisco),
          aluno.explicacaoAtlas,
          aluno.statusAcompanhamento,
          aluno.atualizadoEm,
        ]
      );
    }

    for (const alerta of alertasSeed) {
      await client.query(
        `INSERT INTO alertas
          (id, aluno_id, titulo, descricao, nivel, criado_em, ativo)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          alerta.id,
          alerta.alunoId,
          alerta.titulo,
          alerta.descricao,
          alerta.nivel,
          alerta.criadoEm,
          alerta.ativo,
        ]
      );
    }

    for (const item of intervencoesSeed) {
      await client.query(
        `INSERT INTO intervencoes
          (id, aluno_id, tipo, descricao, realizado_por, realizado_em, status, proxima_revisao)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          item.id,
          item.alunoId,
          item.tipo,
          item.descricao,
          item.realizadoPor,
          item.realizadoEm,
          item.status,
          item.proximaRevisao ?? null,
        ]
      );
    }

    for (const evento of timelineSeed) {
      await client.query(
        `INSERT INTO timeline_events
          (id, aluno_id, tipo, titulo, descricao, criado_em)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [
          evento.id,
          evento.alunoId,
          evento.tipo,
          evento.titulo,
          evento.descricao,
          evento.criadoEm,
        ]
      );
    }

    await client.query("COMMIT");
    console.log("seed ok");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
