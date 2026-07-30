// ============================================================
// AFINA v2.0 — High-Resolution Technical PNG Export
// Structured into 3-4 Clean Technical Drawing Rectangles on a Pure White Sheet
// ============================================================

import type { CanvasElement, TechnicalSeal, FixtureType } from '@/lib/types';
import { getFixtureDef } from '@/lib/fixtures/fixtureLibrary';

interface KonvaStage {
  toDataURL: (config: {
    mimeType: string;
    quality: number;
    pixelRatio: number;
  }) => string;
}

/**
 * Exports the technical lighting plot as a structured 3-box technical drawing sheet (300 DPI)
 * on a pure white background with Show Name, Date, Equipment Legend, and Technical Seal.
 */
export function exportStageToPNG(
  stage: KonvaStage,
  elements: CanvasElement[],
  seal: TechnicalSeal,
  filename = 'afina_mapa_de_luz.png'
) {
  // 1. Capture high-res Konva stage snapshot
  const stageDataUrl = stage.toDataURL({
    mimeType: 'image/png',
    quality: 1,
    pixelRatio: 3, // 300 DPI sharp
  });

  const img = new Image();
  img.src = stageDataUrl;
  img.onload = () => {
    // 2. Offscreen composite canvas (A3 proportion 2400 x 1600 px)
    const exportCanvas = document.createElement('canvas');
    const width = 2400;
    const height = 1600;
    exportCanvas.width = width;
    exportCanvas.height = height;

    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    const margin = 32;

    // ── SHEET PURE WHITE BACKGROUND ──
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // ── RETÂNGULO 1: CABEÇALHO DO PROJETO E APP USADO (TOPO) ──
    const headerX = margin;
    const headerY = margin;
    const headerW = width - margin * 2;
    const headerH = 110;

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(headerX, headerY, headerW, headerH);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.strokeRect(headerX, headerY, headerW, headerH);

    // Brand logo + App info
    ctx.fillStyle = '#ef4732';
    ctx.fillRect(headerX + 20, headerY + 20, 44, 44);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px Inter, sans-serif';
    ctx.fillText('A', headerX + 33, headerY + 52);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.fillText('AFINA v2.0', headerX + 78, headerY + 44);
    ctx.fillStyle = '#64748b';
    ctx.font = '13px Inter, sans-serif';
    ctx.fillText('SOFTWARE DE ILUMINAÇÃO CÊNICA & MAPA DE LUZ 2D', headerX + 78, headerY + 68);

    // Show Title & Date info (Top Right of Header Box)
    const showName = (seal.show || 'NOVO ESPETÁCULO').toUpperCase();
    const dateStr = seal.date || new Date().toLocaleDateString('pt-BR');
    const designerName = seal.designer || 'Iluminador não informado';
    const venueName = seal.venue || 'Teatro Principal';

    ctx.textAlign = 'right';
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.fillText(showName, headerX + headerW - 24, headerY + 44);

    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 14px "JetBrains Mono", monospace';
    ctx.fillText(`DATA: ${dateStr}   ·   ILUMINADOR: ${designerName.toUpperCase()}   ·   LOCAL: ${venueName.toUpperCase()}`, headerX + headerW - 24, headerY + 72);
    ctx.textAlign = 'left';

    // ── RETÂNGULO 2: DESENHO DO MAPA DE LUZ (CENTRO ESQUERDA) ──
    const plotX = margin;
    const plotY = headerY + headerH + 20;
    const legendW = 460;
    const sealH = 110;

    const plotW = width - margin * 2 - legendW - 20;
    const plotH = height - plotY - sealH - margin - 20;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(plotX, plotY, plotW, plotH);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.strokeRect(plotX, plotY, plotW, plotH);

    // Title label inside plot box
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillText('PLANTA DE ILUMINAÇÃO (VISÃO GERAL DO PALCO)', plotX + 16, plotY + 24);

    // Draw stage plot image centered with padding
    const innerPad = 24;
    const boxW = plotW - innerPad * 2;
    const boxH = plotH - innerPad * 2 - 20;

    const imgAspect = img.width / img.height;
    const boxAspect = boxW / boxH;
    let drawW = boxW;
    let drawH = boxH;
    let drawX = plotX + innerPad;
    let drawY = plotY + innerPad + 16;

    if (imgAspect > boxAspect) {
      drawH = boxW / imgAspect;
      drawY = plotY + innerPad + 16 + (boxH - drawH) / 2;
    } else {
      drawW = boxH * imgAspect;
      drawX = plotX + innerPad + (boxW - drawW) / 2;
    }

    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    // ── RETÂNGULO 3: LEGENDA DE EQUIPAMENTOS & SIMBOLOGIA (DIREITA) ──
    const legendX = plotX + plotW + 20;
    const legendY = plotY;
    const legendH = plotH;

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(legendX, legendY, legendW, legendH);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.strokeRect(legendX, legendY, legendW, legendH);

    // Header inside Legend box
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillText('LEGENDA DE EQUIPAMENTOS', legendX + 20, legendY + 36);

    ctx.strokeStyle = '#ef4732';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(legendX + 20, legendY + 48);
    ctx.lineTo(legendX + legendW - 20, legendY + 48);
    ctx.stroke();

    // Count fixtures
    const fixtureMap = new Map<string, { label: string; color: string; count: number }>();
    elements
      .filter((el) => el.category !== 'architecture' && el.category !== 'annotation')
      .forEach((el) => {
        const def = getFixtureDef(el.type);
        const label = def?.description || el.type;
        const color = el.color || def?.colorHex || '#ef4732';
        const existing = fixtureMap.get(el.type);
        if (existing) {
          existing.count++;
        } else {
          fixtureMap.set(el.type, { label, color, count: 1 });
        }
      });

    let itemY = legendY + 84;
    fixtureMap.forEach((item) => {
      // Swatch color box
      ctx.fillStyle = item.color;
      ctx.fillRect(legendX + 20, itemY - 14, 22, 22);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(legendX + 20, itemY - 14, 22, 22);

      // Label text
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText(item.label, legendX + 52, itemY + 2);

      // Count
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ef4732';
      ctx.font = 'bold 16px "JetBrains Mono", monospace';
      ctx.fillText(`×${item.count}`, legendX + legendW - 20, itemY + 2);
      ctx.textAlign = 'left';

      itemY += 38;
    });

    // ── RETÂNGULO 4: SELO TÉCNICO DE RODAPÉ (CARIMBO PRANCHA) ──
    const sealY = height - sealH - margin;
    const sealX = margin;
    const sealW = width - margin * 2;

    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(sealX, sealY, sealW, sealH);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.strokeRect(sealX, sealY, sealW, sealH);

    const sealFields = [
      { label: 'ESPETÁCULO / PROJETO', val: seal.show || '—' },
      { label: 'ILUMINADOR / DESIGNER', val: seal.designer || '—' },
      { label: 'OPERADOR DE LUZ', val: seal.operator || '—' },
      { label: 'TEATRO / LOCAL', val: seal.venue || '—' },
      { label: 'DATA DA MONTAGEM', val: seal.date || dateStr },
      { label: 'VERSÃO DO PROJETO', val: seal.version || 'v1.0' },
      { label: 'ESCALA DE IMPRESSÃO', val: seal.scale || '1:50' },
      { label: 'COMPANHIA / APLICAÇÃO', val: `${seal.clientCompany || 'Afina v2.0'}` },
    ];

    const colWidth = sealW / sealFields.length;
    sealFields.forEach((f, idx) => {
      const colX = sealX + idx * colWidth;

      if (idx > 0) {
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(colX, sealY);
        ctx.lineTo(colX, sealY + sealH);
        ctx.stroke();
      }

      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.fillText(f.label, colX + 12, sealY + 28);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText(f.val, colX + 12, sealY + 68);
    });

    // Trigger PNG download
    const link = document.createElement('a');
    link.href = exportCanvas.toDataURL('image/png');
    const safeShow = (seal.show || 'espetaculo').replace(/[^a-zA-Z0-9_-]/g, '_');
    link.download = `${safeShow}_mapa_de_luz.png`;
    link.click();
  };
}
