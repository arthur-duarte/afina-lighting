// ============================================================
// AFINA v2.0 — High-Resolution Technical PDF Export (jsPDF A3/A4)
// Pure White Page Background, Header (Show Name & Date), Equipment Legend & Seal
// ============================================================

import { jsPDF } from 'jspdf';
import type { CanvasElement, TechnicalSeal, FixtureType } from '@/lib/types';
import { generatePatchTable } from '@/lib/dmx/patchEngine';
import { getFixtureDef } from '@/lib/fixtures/fixtureLibrary';

interface KonvaStage {
  toDataURL: (config: { mimeType: string; quality: number; pixelRatio: number }) => string;
}

// Light theme color palette for technical printing
const COLORS = {
  bg: [255, 255, 255] as [number, number, number],        // Pure white
  surface: [248, 250, 252] as [number, number, number],   // Light Slate 50
  border: [203, 213, 225] as [number, number, number],    // Slate 300
  darkBorder: [15, 23, 42] as [number, number, number],   // Slate 900
  accent: [239, 71, 50] as [number, number, number],      // Afina Red
  blue: [2, 132, 199] as [number, number, number],        // Sky Blue
  text: [15, 23, 42] as [number, number, number],         // Dark Charcoal
  muted: [100, 116, 139] as [number, number, number],     // Slate 500
  red: [220, 38, 38] as [number, number, number],         // Conflict Red
};

export async function exportTechnicalPDF(
  stage: KonvaStage,
  elements: CanvasElement[],
  seal: TechnicalSeal,
  format: 'a3' | 'a4' = 'a3'
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: format.toUpperCase(),
  });

  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  const showName = (seal.show || 'NOVO ESPETÁCULO').toUpperCase();
  const dateStr = seal.date || new Date().toLocaleDateString('pt-BR');

  // ── PAGE 1: LIGHTING MAP ──────────────────────────────────

  // Pure White Background
  doc.setFillColor(...COLORS.bg);
  doc.rect(0, 0, W, H, 'F');

  // Header band
  doc.setFillColor(...COLORS.surface);
  doc.rect(0, 0, W, 18, 'F');
  doc.setDrawColor(...COLORS.darkBorder);
  doc.setLineWidth(0.6);
  doc.line(0, 18, W, 18);

  // Title Logo
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.accent);
  doc.text('AFINA', 8, 11);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.muted);
  doc.text('PLANTA E MAPA DE ILUMINAÇÃO CÊNICA', 28, 11);

  // Show name & Date (Top Right)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.text);
  doc.text(showName, W - 8, 10, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.blue);
  doc.text(`DATA: ${dateStr}   ·   VERSÃO: ${seal.version || 'v1.0'}`, W - 8, 15, { align: 'right' });

  // Canvas snapshot (Lighting Plot)
  const imgData = stage.toDataURL({ mimeType: 'image/png', quality: 1, pixelRatio: 3 });
  const mapMargin = 8;
  const mapTop = 22;
  const sealH = 22;
  const legendW = 65; // Side column for Legend
  const mapH = H - mapTop - sealH - 4;
  const mapW = W - mapMargin * 2 - legendW - 4;

  // Draw plot image
  doc.addImage(imgData, 'PNG', mapMargin, mapTop, mapW, mapH, undefined, 'FAST');

  // Map border
  doc.setDrawColor(...COLORS.darkBorder);
  doc.setLineWidth(0.4);
  doc.rect(mapMargin, mapTop, mapW, mapH);

  // ── EQUIPMENT LEGEND (RIGHT COLUMN OUTSIDE MAP) ──────────
  const legendX = mapMargin + mapW + 4;
  doc.setFillColor(...COLORS.surface);
  doc.rect(legendX, mapTop, legendW, mapH, 'F');
  doc.setDrawColor(...COLORS.darkBorder);
  doc.setLineWidth(0.4);
  doc.rect(legendX, mapTop, legendW, mapH);

  let legendY = mapTop + 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.accent);
  doc.text('LEGENDA DE SÍMBOLOS', legendX + 4, legendY);
  legendY += 4;

  doc.setDrawColor(...COLORS.accent);
  doc.setLineWidth(0.4);
  doc.line(legendX + 4, legendY, legendX + legendW - 4, legendY);
  legendY += 5;

  // Count fixtures
  const fixtureCount: Record<string, number> = {};
  elements
    .filter((el) => el.category !== 'architecture' && el.category !== 'annotation')
    .forEach((el) => {
      fixtureCount[el.type] = (fixtureCount[el.type] ?? 0) + 1;
    });

  Object.entries(fixtureCount).forEach(([type, count]) => {
    const def = getFixtureDef(type as FixtureType);
    const label = def?.description ?? type;
    const [r, g, b] = def?.colorHex ? hexToRGB(def.colorHex) : [239, 71, 50];

    doc.setFillColor(r, g, b);
    doc.rect(legendX + 4, legendY - 2.5, 4, 4, 'F');
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.2);
    doc.rect(legendX + 4, legendY - 2.5, 4, 4);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...COLORS.text);
    doc.text(`${label}`.slice(0, 22), legendX + 10, legendY + 0.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.accent);
    doc.text(`×${count}`, legendX + legendW - 5, legendY + 0.5, { align: 'right' });

    legendY += 5.5;
    if (legendY > mapTop + mapH - 10) return;
  });

  // ── TECHNICAL SEAL (BOTTOM BAR) ──────────────────────────
  const sealY = H - sealH;
  doc.setFillColor(...COLORS.surface);
  doc.rect(0, sealY, W, sealH, 'F');
  doc.setDrawColor(...COLORS.darkBorder);
  doc.setLineWidth(0.5);
  doc.line(0, sealY, W, sealY);

  const fields = [
    { label: 'ESPETÁCULO', value: seal.show || '—' },
    { label: 'ILUMINADOR', value: seal.designer || '—' },
    { label: 'OPERADOR', value: seal.operator || '—' },
    { label: 'TEATRO / LOCAL', value: seal.venue || '—' },
    { label: 'DATA', value: seal.date || dateStr },
    { label: 'VERSÃO', value: seal.version || 'v1.0' },
    { label: 'ESCALA', value: seal.scale || '1:50' },
    { label: 'COMPANHIA', value: seal.clientCompany || '—' },
  ];

  const colW = W / fields.length;
  fields.forEach((f, i) => {
    const x = i * colW + 4;

    if (i > 0) {
      doc.setDrawColor(...COLORS.border);
      doc.setLineWidth(0.2);
      doc.line(i * colW, sealY + 2, i * colW, H - 2);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.setTextColor(...COLORS.muted);
    doc.text(f.label, x, sealY + 7);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.text);
    doc.text(f.value || '—', x, sealY + 14, {
      maxWidth: colW - 6,
    });
  });

  // ── PAGE 2: LEGEND + PATCH TABLE ─────────────────────────
  doc.addPage();

  // White Background
  doc.setFillColor(...COLORS.bg);
  doc.rect(0, 0, W, H, 'F');

  // Header
  doc.setFillColor(...COLORS.surface);
  doc.rect(0, 0, W, 18, 'F');
  doc.setDrawColor(...COLORS.darkBorder);
  doc.setLineWidth(0.5);
  doc.line(0, 18, W, 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.accent);
  doc.text('TABELA DE PATCH DMX — LEGENDA DE EQUIPAMENTOS', 8, 11);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.text);
  doc.text(`${showName}  ·  DATA: ${dateStr}`, W - 8, 11, { align: 'right' });

  // ── LEGEND (left column) ─────────────────────────────────
  const page2LegendW = 75;
  const page2LegendX = 8;
  let page2LegendY = 24;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.accent);
  doc.text('LEGENDA DE SÍMBOLOS', page2LegendX, page2LegendY);
  page2LegendY += 5;

  Object.entries(fixtureCount).forEach(([type, count]) => {
    const def = getFixtureDef(type as FixtureType);
    const label = def?.description ?? type;
    const [r, g, b] = def?.colorHex ? hexToRGB(def.colorHex) : [239, 71, 50];

    doc.setFillColor(r, g, b);
    doc.rect(page2LegendX, page2LegendY - 2, 5, 4, 'F');
    doc.setDrawColor(15, 23, 42);
    doc.rect(page2LegendX, page2LegendY - 2, 5, 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.text);
    doc.text(`${label}`, page2LegendX + 7, page2LegendY + 1);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.accent);
    doc.text(`×${count}`, page2LegendX + page2LegendW - 10, page2LegendY + 1);

    page2LegendY += 6;
    if (page2LegendY > H - 30) return;
  });

  // ── PATCH TABLE (right side) ─────────────────────────────
  const tableX = page2LegendX + page2LegendW + 4;
  const tableW = W - tableX - 8;
  let tableY = 24;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.accent);
  doc.text('TABELA DE PATCH DMX', tableX, tableY);
  tableY += 5;

  const patchRows = generatePatchTable(elements);

  const cols = [
    { label: 'CH', w: 10 },
    { label: 'IDENTIFICADOR / NOME', w: 42 },
    { label: 'TIPO', w: 26 },
    { label: 'GEL', w: 14 },
    { label: 'UNI', w: 10 },
    { label: 'ADDR', w: 12 },
    { label: 'VOLT', w: 12 },
    { label: 'FASE', w: 10 },
    { label: 'W', w: 12 },
    { label: 'OBSERVAÇÕES', w: -1 },
  ];

  doc.setFillColor(...COLORS.surface);
  doc.rect(tableX, tableY - 3, tableW, 7, 'F');
  doc.setDrawColor(...COLORS.darkBorder);
  doc.rect(tableX, tableY - 3, tableW, 7);

  let cx = tableX + 2;
  cols.forEach((col) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...COLORS.text);
    doc.text(col.label, cx, tableY + 1);
    cx += col.w > 0 ? col.w : tableW - cx + tableX;
  });
  tableY += 7;

  patchRows.slice(0, 45).forEach((row, i) => {
    const el = elements.find((e) => e.label === row.label && e.type === row.type);
    const bg = i % 2 === 0 ? COLORS.bg : COLORS.surface;
    doc.setFillColor(...bg);
    doc.rect(tableX, tableY - 3, tableW, 6, 'F');

    cx = tableX + 2;
    const values = [
      row.channel || '—',
      el?.customName || row.label || row.type,
      row.type,
      row.gelatin,
      String(row.universe),
      String(row.address),
      el?.voltage || '220V',
      row.phase,
      String(row.wattage),
      el?.notes || row.notes || '',
    ];

    values.forEach((val, vi) => {
      const col = cols[vi];
      const hasConflict = elements.find(
        (el) => (el.channel ?? 0) === row.channel
      )?.dmx?.hasConflict;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      if (hasConflict && vi === 5) {
        doc.setTextColor(...COLORS.red);
      } else {
        doc.setTextColor(...COLORS.text);
      }
      doc.text(String(val).slice(0, 25), cx, tableY + 1);
      cx += col.w > 0 ? col.w : tableW - cx + tableX;
    });

    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.1);
    doc.line(tableX, tableY + 3, tableX + tableW, tableY + 3);

    tableY += 6;
    if (tableY > H - 15) return;
  });

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.muted);
  doc.text(
    `Gerado por Afina v2.0  ·  ${seal.show}  ·  ${seal.copyright || 'Todos os direitos reservados'}`,
    W / 2,
    H - 5,
    { align: 'center' }
  );

  // Save
  const safeShow = (seal.show || 'espetaculo').replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`${safeShow}_mapa_tecnico.pdf`);
}

function hexToRGB(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) || 0;
  const g = parseInt(clean.substring(2, 4), 16) || 0;
  const b = parseInt(clean.substring(4, 6), 16) || 0;
  return [r, g, b];
}
