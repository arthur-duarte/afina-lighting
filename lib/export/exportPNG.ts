// ============================================================
// AFINA v2.0 — High-Resolution Technical PNG Export
// Pure White Background, Header (Show Name & Date), Plot, Legend & Seal
// ============================================================

import type { CanvasElement, TechnicalSeal, FixtureType } from '@/lib/types';
import { getFixtureDef, GELATIN_PRESETS } from '@/lib/fixtures/fixtureLibrary';

interface KonvaStage {
  toDataURL: (config: {
    mimeType: string;
    quality: number;
    pixelRatio: number;
  }) => string;
}

/**
 * Exports the complete technical lighting plot as a high-DPI PNG sheet (300 DPI equivalent)
 * with pure white background, Show Name, Date, Equipment Legend, and Technical Seal.
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
    // 2. Offscreen composite canvas (A3 proportion high-res 2400 x 1600 px)
    const exportCanvas = document.createElement('canvas');
    const width = 2400;
    const height = 1600;
    exportCanvas.width = width;
    exportCanvas.height = height;

    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    // ── PURE WHITE BACKGROUND ──
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // ── TOP HEADER BAND ──
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, 120);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 120);
    ctx.lineTo(width, 120);
    ctx.stroke();

    // Brand logo
    ctx.fillStyle = '#ef4732';
    ctx.fillRect(40, 30, 48, 48);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.fillText('A', 54, 64);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.fillText('AFINA LIGHTING PLOT', 104, 52);
    ctx.fillStyle = '#64748b';
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText('PROJETO E PLANTA DE ILUMINAÇÃO CÊNICA', 104, 76);

    // ── SHOW NAME & DATE (TOP RIGHT) ──
    const showName = (seal.show || 'NOVO ESPETÁCULO').toUpperCase();
    const dateStr = seal.date || new Date().toLocaleDateString('pt-BR');

    ctx.textAlign = 'right';
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 26px Inter, sans-serif';
    ctx.fillText(showName, width - 40, 52);

    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 16px "JetBrains Mono", monospace';
    ctx.fillText(`DATA: ${dateStr}   ·   VERSÃO: ${seal.version || 'v1.0'}`, width - 40, 80);
    ctx.textAlign = 'left';

    // ── DRAWING CANVAS PLOT (CENTER) ──
    const plotMarginLeft = 40;
    const plotMarginTop = 140;
    const legendWidth = 420;
    const sealHeight = 120;

    const plotWidth = width - plotMarginLeft - legendWidth - 60;
    const plotHeight = height - plotMarginTop - sealHeight - 40;

    // Outer border around plot
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.strokeRect(plotMarginLeft, plotMarginTop, plotWidth, plotHeight);

    // Draw stage plot image inside box with aspect-fit
    const imgAspect = img.width / img.height;
    const boxAspect = plotWidth / plotHeight;
    let drawW = plotWidth;
    let drawH = plotHeight;
    let drawX = plotMarginLeft;
    let drawY = plotMarginTop;

    if (imgAspect > boxAspect) {
      drawH = plotWidth / imgAspect;
      drawY = plotMarginTop + (plotHeight - drawH) / 2;
    } else {
      drawW = plotHeight * imgAspect;
      drawX = plotMarginLeft + (plotWidth - drawW) / 2;
    }

    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    // ── EQUIPMENT LEGEND (OUTSIDE MAP - RIGHT COLUMN) ──
    const legendX = plotMarginLeft + plotWidth + 24;
    const legendY = plotMarginTop;

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(legendX, legendY, legendWidth, plotHeight);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.strokeRect(legendX, legendY, legendWidth, plotHeight);

    // Legend Header
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillText('LEGENDA DE EQUIPAMENTOS', legendX + 20, legendY + 36);

    ctx.strokeStyle = '#ef4732';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(legendX + 20, legendY + 48);
    ctx.lineTo(legendX + legendWidth - 20, legendY + 48);
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

    let itemY = legendY + 80;
    fixtureMap.forEach((item) => {
      // Swatch color box
      ctx.fillStyle = item.color;
      ctx.fillRect(legendX + 20, itemY - 14, 20, 20);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(legendX + 20, itemY - 14, 20, 20);

      // Label text
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText(item.label, legendX + 50, itemY);

      // Count
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ef4732';
      ctx.font = 'bold 16px "JetBrains Mono", monospace';
      ctx.fillText(`×${item.count}`, legendX + legendWidth - 20, itemY);
      ctx.textAlign = 'left';

      itemY += 36;
    });

    // ── TECHNICAL SEAL (BOTTOM BAR) ──
    const sealY = height - sealHeight - 20;
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(40, sealY, width - 80, sealHeight);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.strokeRect(40, sealY, width - 80, sealHeight);

    const sealFields = [
      { label: 'ESPETÁCULO', val: seal.show || '—' },
      { label: 'ILUMINADOR', val: seal.designer || '—' },
      { label: 'OPERADOR', val: seal.operator || '—' },
      { label: 'TEATRO / LOCAL', val: seal.venue || '—' },
      { label: 'DATA', val: seal.date || dateStr },
      { label: 'VERSÃO', val: seal.version || 'v1.0' },
      { label: 'ESCALA', val: seal.scale || '1:50' },
      { label: 'COMPANHIA', val: seal.clientCompany || '—' },
    ];

    const colWidth = (width - 80) / sealFields.length;
    sealFields.forEach((f, idx) => {
      const colX = 40 + idx * colWidth;

      if (idx > 0) {
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(colX, sealY);
        ctx.lineTo(colX, sealY + sealHeight);
        ctx.stroke();
      }

      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText(f.label, colX + 12, sealY + 32);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 15px Inter, sans-serif';
      ctx.fillText(f.val, colX + 12, sealY + 70);
    });

    // Download PNG file
    const link = document.createElement('a');
    link.href = exportCanvas.toDataURL('image/png');
    const safeShow = (seal.show || 'espetaculo').replace(/[^a-zA-Z0-9_-]/g, '_');
    link.download = `${safeShow}_mapa_de_luz.png`;
    link.click();
  };
}
