// ============================================================
// AFINA v2.0 — PDF Export (jsPDF, multipágina A3/A4)
// ============================================================

import { jsPDF } from 'jspdf';
import type { CanvasElement, TechnicalSeal, FixtureType } from '@/lib/types';
import { generatePatchTable } from '@/lib/dmx/patchEngine';
import { getFixtureDef } from '@/lib/fixtures/fixtureLibrary';

interface KonvaStage {
  toDataURL: (config: { mimeType: string; quality: number; pixelRatio: number }) => string;
}

// Color palette
const COLORS = {
  bg: [15, 15, 20] as [number, number, number],
  surface: [22, 22, 30] as [number, number, number],
  border: [45, 45, 60] as [number, number, number],
  accent: [139, 92, 246] as [number, number, number],
  yellow: [250, 204, 21] as [number, number, number],
  text: [240, 240, 250] as [number, number, number],
  muted: [120, 120, 140] as [number, number, number],
  red: [239, 68, 68] as [number, number, number],
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

  // ── PAGE 1: LIGHTING MAP ──────────────────────────────────

  // Background
  doc.setFillColor(...COLORS.bg);
  doc.rect(0, 0, W, H, 'F');

  // Header band
  doc.setFillColor(...COLORS.surface);
  doc.rect(0, 0, W, 16, 'F');
  doc.setDrawColor(...COLORS.accent);
  doc.setLineWidth(0.5);
  doc.line(0, 16, W, 16);

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.text);
  doc.text('AFINA', 8, 10.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.muted);
  doc.text('Mapa de Luz — Design de Iluminação Cênica', 28, 10.5);

  // Show name (top right)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.text);
  doc.text(seal.show, W - 8, 10.5, { align: 'right' });

  // Canvas snapshot (Lighting Plot)
  const imgData = stage.toDataURL({ mimeType: 'image/png', quality: 0.98, pixelRatio: 3 });
  const mapMargin = 8;
  const mapTop = 20;
  const sealH = 22;
  const mapH = H - mapTop - sealH - 4;
  const mapW = W - mapMargin * 2;

  doc.addImage(imgData, 'PNG', mapMargin, mapTop, mapW, mapH, undefined, 'FAST');

  // Map border
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.rect(mapMargin, mapTop, mapW, mapH);

  // ── TECHNICAL SEAL (bottom bar) ──────────────────────────
  const sealY = H - sealH;
  doc.setFillColor(...COLORS.surface);
  doc.rect(0, sealY, W, sealH, 'F');
  doc.setDrawColor(...COLORS.accent);
  doc.setLineWidth(0.3);
  doc.line(0, sealY, W, sealY);

  const fields = [
    { label: 'ESPETÁCULO', value: seal.show },
    { label: 'ILUMINADOR', value: seal.designer },
    { label: 'OPERADOR', value: seal.operator },
    { label: 'TEATRO', value: seal.venue },
    { label: 'DATA', value: seal.date },
    { label: 'VERSÃO', value: seal.version },
    { label: 'ESCALA', value: seal.scale },
    { label: 'COMPANHIA', value: seal.clientCompany },
  ];

  const colW = W / fields.length;
  fields.forEach((f, i) => {
    const x = i * colW + 4;
    const divX = (i + 1) * colW;

    // Divider
    if (i > 0) {
      doc.setDrawColor(...COLORS.border);
      doc.setLineWidth(0.2);
      doc.line(i * colW, sealY + 2, i * colW, H - 2);
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(...COLORS.muted);
    doc.text(f.label, x, sealY + 8);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.text);
    doc.text(f.value || '—', x, sealY + 15, {
      maxWidth: colW - 8,
    });
  });

  // ── PAGE 2: LEGEND + PATCH TABLE ─────────────────────────
  doc.addPage();

  // Background
  doc.setFillColor(...COLORS.bg);
  doc.rect(0, 0, W, H, 'F');

  // Header
  doc.setFillColor(...COLORS.surface);
  doc.rect(0, 0, W, 16, 'F');
  doc.setDrawColor(...COLORS.accent);
  doc.line(0, 16, W, 16);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.text);
  doc.text('TABELA DE PATCH DMX — LEGENDA DE EQUIPAMENTOS', 8, 10.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.muted);
  doc.text(`${seal.show}  ·  ${seal.designer}  ·  ${seal.date}`, W - 8, 10.5, { align: 'right' });

  // ── LEGEND (left column) ─────────────────────────────────
  const legendW = 80;
  const legendX = 8;
  let legendY = 22;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.accent);
  doc.text('LEGENDA DE SÍMBOLOS', legendX, legendY);
  legendY += 5;

  // Count fixtures by type
  const fixtureCount: Record<string, number> = {};
  const gelatinSet: Set<string> = new Set();
  elements
    .filter((el) => el.category !== 'architecture' && el.category !== 'annotation')
    .forEach((el) => {
      fixtureCount[el.type] = (fixtureCount[el.type] ?? 0) + 1;
      if (el.gelatin && el.gelatin !== 'NC') gelatinSet.add(el.gelatin);
    });

  Object.entries(fixtureCount).forEach(([type, count]) => {
    const def = getFixtureDef(type as FixtureType);
    const label = def?.description ?? type;
    const [r, g, b] = def?.colorHex ? hexToRGB(def.colorHex) : [250, 204, 21];

    doc.setFillColor(r, g, b);
    doc.rect(legendX, legendY - 2, 5, 4, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.text);
    doc.text(`${label}`, legendX + 7, legendY + 1);
    doc.setTextColor(...COLORS.muted);
    doc.text(`×${count}`, legendX + legendW - 12, legendY + 1);

    legendY += 6;
    if (legendY > H - 30) return; // overflow guard
  });

  // Gelatinas
  legendY += 3;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.accent);
  doc.text('GELATINAS / FILTROS', legendX, legendY);
  legendY += 5;

  [...gelatinSet].forEach((gel) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.text);
    doc.text(gel, legendX, legendY);
    legendY += 5;
    if (legendY > H - 30) return;
  });

  // ── PATCH TABLE (right side) ─────────────────────────────
  const tableX = legendX + legendW + 4;
  const tableW = W - tableX - 8;
  let tableY = 22;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.accent);
  doc.text('TABELA DE PATCH', tableX, tableY);
  tableY += 5;

  const patchRows = generatePatchTable(elements);

  // Table header
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
    { label: 'OBSERVAÇÕES', w: -1 }, // fill remaining
  ];

  // Header background
  doc.setFillColor(...COLORS.surface);
  doc.rect(tableX, tableY - 3, tableW, 7, 'F');
  doc.setDrawColor(...COLORS.border);
  doc.rect(tableX, tableY - 3, tableW, 7);

  let cx = tableX + 2;
  cols.forEach((col) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...COLORS.muted);
    doc.text(col.label, cx, tableY + 1);
    cx += col.w > 0 ? col.w : tableW - cx + tableX;
  });
  tableY += 7;

  // Rows
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
    `Gerado por Afina v2.0  ·  ${seal.copyright}`,
    W / 2,
    H - 5,
    { align: 'center' }
  );

  // Save
  doc.save(`${(seal.show || 'afina').replace(/\s+/g, '_')}_tecnico.pdf`);
}

// Utility: hex color to RGB tuple
function hexToRGB(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return [r, g, b];
}
