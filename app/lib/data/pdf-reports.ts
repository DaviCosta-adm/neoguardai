import "server-only";

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import {
  rotuloIntervencao,
  rotuloStatusAcompanhamento,
} from "@/app/lib/data/labels";
import type { RelatorioResumo } from "@/app/lib/data/reports";
import { rotuloRisco } from "@/app/lib/risk/score";
import type { Aluno, Alerta, Intervencao, TimelineEvent } from "@/app/lib/types";

type PdfWriter = {
  page: ReturnType<PDFDocument["addPage"]>;
  font: Awaited<ReturnType<PDFDocument["embedFont"]>>;
  bold: Awaited<ReturnType<PDFDocument["embedFont"]>>;
  y: number;
  doc: PDFDocument;
};

function ensureSpace(writer: PdfWriter, needed = 24) {
  if (writer.y < needed) {
    writer.page = writer.doc.addPage([595, 842]);
    writer.y = 800;
  }
}

function drawTitle(writer: PdfWriter, text: string) {
  ensureSpace(writer, 40);
  writer.page.drawText(text, {
    x: 48,
    y: writer.y,
    size: 16,
    font: writer.bold,
    color: rgb(0.05, 0.1, 0.25),
  });
  writer.y -= 28;
}

function drawLine(writer: PdfWriter, text: string, size = 11) {
  const maxWidth = 500;
  const words = text.split(" ");
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    const width = writer.font.widthOfTextAtSize(next, size);
    if (width > maxWidth && line) {
      ensureSpace(writer);
      writer.page.drawText(line, {
        x: 48,
        y: writer.y,
        size,
        font: writer.font,
        color: rgb(0.15, 0.18, 0.25),
      });
      writer.y -= 16;
      line = word;
    } else {
      line = next;
    }
  }
  if (line) {
    ensureSpace(writer);
    writer.page.drawText(line, {
      x: 48,
      y: writer.y,
      size,
      font: writer.font,
      color: rgb(0.15, 0.18, 0.25),
    });
    writer.y -= 16;
  }
}

async function createWriter() {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([595, 842]);
  return { doc, font, bold, page, y: 800 } satisfies PdfWriter;
}

export async function buildRelatorioInstituicaoPdf(
  relatorio: RelatorioResumo
): Promise<Uint8Array> {
  const writer = await createWriter();
  drawTitle(writer, "NeoGuardAI — Relatório institucional");
  drawLine(writer, `Instituição: ${relatorio.instituicao}`);
  drawLine(
    writer,
    `Gerado em: ${new Date(relatorio.geradoEm).toLocaleString("pt-BR")}`
  );
  drawLine(writer, `Total de estudantes: ${relatorio.totalAlunos}`);
  writer.y -= 8;

  drawTitle(writer, "Distribuição de risco");
  drawLine(
    writer,
    `Baixo ${relatorio.distribuicaoRisco.baixo} · Médio ${relatorio.distribuicaoRisco.medio} · Alto ${relatorio.distribuicaoRisco.alto} · Crítico ${relatorio.distribuicaoRisco.critico}`
  );
  writer.y -= 8;

  drawTitle(writer, "Casos críticos e altos");
  if (relatorio.casosCriticos.length === 0) {
    drawLine(writer, "Nenhum caso crítico/alto no momento.");
  } else {
    for (const aluno of relatorio.casosCriticos.slice(0, 40)) {
      drawLine(
        writer,
        `${aluno.nome} — ${aluno.turma}/${aluno.serie} — ${rotuloRisco(aluno.riscoNivel)} ${aluno.riscoPercentual}%`
      );
    }
  }
  writer.y -= 8;

  drawTitle(writer, "Turmas");
  for (const turma of relatorio.porTurma.slice(0, 30)) {
    drawLine(
      writer,
      `${turma.serie} ${turma.turma}: ${turma.total} alunos · risco médio ${turma.riscoMedio}% · críticos ${turma.criticos}`
    );
  }
  writer.y -= 8;

  drawTitle(writer, "Intervenções por tipo");
  for (const item of relatorio.intervencoesPorTipo) {
    drawLine(writer, `${item.tipo}: ${item.total}`);
  }

  return writer.doc.save();
}

export async function buildRelatorioAlunoPdf(input: {
  instituicao: string;
  aluno: Aluno;
  alertas: Alerta[];
  intervencoes: Intervencao[];
  timeline: TimelineEvent[];
}): Promise<Uint8Array> {
  const writer = await createWriter();
  const { aluno } = input;

  drawTitle(writer, "NeoGuardAI — Relatório individual");
  drawLine(writer, `Instituição: ${input.instituicao}`);
  drawLine(writer, `Aluno: ${aluno.nome}`);
  drawLine(writer, `Turma: ${aluno.serie} · ${aluno.turma}`);
  drawLine(
    writer,
    `Status: ${rotuloStatusAcompanhamento[aluno.statusAcompanhamento]}`
  );
  drawLine(
    writer,
    `Risco: ${rotuloRisco(aluno.riscoNivel)} (${aluno.riscoPercentual}%)`
  );
  drawLine(writer, `Frequência: ${aluno.frequencia}% · Desempenho: ${aluno.desempenho}`);
  drawLine(writer, `Faltas consecutivas: ${aluno.faltasConsecutivas}`);
  writer.y -= 8;

  drawTitle(writer, "Fatores de risco");
  if (aluno.fatoresRisco.length === 0) {
    drawLine(writer, "Nenhum fator listado.");
  } else {
    for (const fator of aluno.fatoresRisco) {
      drawLine(writer, `• ${fator}`);
    }
  }
  writer.y -= 8;

  drawTitle(writer, "Explicação Atlas");
  drawLine(writer, aluno.explicacaoAtlas || "Sem explicação registrada.");
  writer.y -= 8;

  drawTitle(writer, "Alertas");
  if (input.alertas.length === 0) {
    drawLine(writer, "Sem alertas.");
  } else {
    for (const alerta of input.alertas.slice(0, 20)) {
      drawLine(
        writer,
        `${alerta.titulo} — ${rotuloRisco(alerta.nivel)} — ${new Date(alerta.criadoEm).toLocaleString("pt-BR")}`
      );
    }
  }
  writer.y -= 8;

  drawTitle(writer, "Intervenções");
  if (input.intervencoes.length === 0) {
    drawLine(writer, "Sem intervenções.");
  } else {
    for (const item of input.intervencoes.slice(0, 20)) {
      drawLine(
        writer,
        `${rotuloIntervencao[item.tipo]} (${item.status}) — ${item.descricao}`
      );
    }
  }
  writer.y -= 8;

  drawTitle(writer, "Linha do tempo");
  if (input.timeline.length === 0) {
    drawLine(writer, "Sem eventos.");
  } else {
    for (const event of input.timeline.slice(0, 25)) {
      drawLine(
        writer,
        `${new Date(event.criadoEm).toLocaleString("pt-BR")} — ${event.titulo}`
      );
    }
  }

  return writer.doc.save();
}
