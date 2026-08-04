import { hashSync } from "bcryptjs";
import { Pool } from "pg";
import { calcularRiscoPreditivo } from "../app/lib/risk/predictive";
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

    await client.query("DELETE FROM devolutivas");
    await client.query("DELETE FROM encaminhamentos");
    await client.query("DELETE FROM timeline_events");
    await client.query("DELETE FROM intervencoes");
    await client.query("DELETE FROM alertas");
    await client.query("DELETE FROM alunos");
    await client.query("DELETE FROM usuarios");
    await client.query("DELETE FROM assinaturas");
    await client.query("DELETE FROM instituicoes");

    for (const instituicao of instituicoes) {
      await client.query(
        "INSERT INTO instituicoes (id, nome) VALUES ($1, $2)",
        [instituicao.id, instituicao.nome]
      );
      await client.query(
        `INSERT INTO assinaturas
          (id, instituicao_id, status, plano, plano_id, observacao)
         VALUES ($1, $2, 'ativo', 'essencial', 'essencial', $3)`,
        [
          `ass-${instituicao.id}`,
          instituicao.id,
          "Assinatura demo ativa.",
        ]
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

    // Recalcula risco no seed com o modelo preditivo v2
    const alunos = buildAlunosSeed().map((aluno) => {
      const risco = calcularRiscoPreditivo(aluno);
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

    await client.query(
      `INSERT INTO encaminhamentos
        (id, aluno_id, instituicao_id, especialista_id, criado_por, motivo, status, criado_em, atualizado_em)
       VALUES
        ('enc-001','alu-005','inst-001','user-002','user-001','Baixa participação e risco alto persistente.','em_atendimento','2026-07-28T14:00:00.000Z','2026-07-29T10:00:00.000Z'),
        ('enc-103','alu-103','inst-002',NULL,'user-004','Caso crítico com múltiplos indicadores negativos.','aberto','2026-07-31T16:00:00.000Z','2026-07-31T16:00:00.000Z')`
    );

    await client.query(
      `INSERT INTO devolutivas
        (id, encaminhamento_id, autor_id, tipo, conteudo, criado_em)
       VALUES
        ('dev-001','enc-001','user-002','atendimento','Primeiro atendimento realizado com escuta ativa e plano semanal.','2026-07-29T10:00:00.000Z'),
        ('dev-002','enc-001','user-002','recomendacao','Manter contato semanal com a família e revisar frequência em 7 dias.','2026-07-29T10:10:00.000Z')`
    );

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
