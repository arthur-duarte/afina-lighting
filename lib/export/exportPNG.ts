// ============================================================
// AFINA v2.0 — High-Resolution Technical PNG Export
// Auto-Crops Elements, Removes Grid, 4 Clean Technical Rectangles
// ============================================================

import type { CanvasElement, TechnicalSeal } from '@/lib/types';
import { getFixtureDef } from '@/lib/fixtures/fixtureLibrary';
import { useEditorStore } from '@/lib/store/useEditorStore';

interface KonvaStage {
  x?: () => number;
  y?: () => number;
  scaleX?: () => number;
  toDataURL: (config: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    mimeType: string;
    quality: number;
    pixelRatio: number;
  }) => string;
}

export function exportStageToPNG(
  stage: KonvaStage,
  elements: CanvasElement[],
  seal: TechnicalSeal,
  filename = 'afina_mapa_de_luz.png'
) {
  const store = useEditorStore.getState();

  // Temporarily hide grid lines for export
  const prevGridVisible = store.gridVisible;
  useEditorStore.setState({ gridVisible: false });

  // Calculate bounding box of all elements on canvas
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  if (elements.length > 0) {
    elements.forEach((el) => {
      const w = (el.customProps?.width as number) || 40;
      const h = (el.customProps?.height as number) || 40;
      const left = el.x - (el.type === 'custom_stage' || el.type === 'stage_polygon' ? w / 2 : 0);
      const top = el.y - (el.type === 'custom_stage' || el.type === 'stage_polygon' ? h / 2 : 0);
      const right = left + w;
      const bottom = top + h;

      if (left < minX) minX = left;
      if (top < minY) minY = top;
      if (right > maxX) maxX = right;
      if (bottom > maxY) maxY = bottom;
    });
  } else {
    minX = -300; minY = -200; maxX = 300; maxY = 200;
  }

  const pad = 60;
  const worldX = minX - pad;
  const worldY = minY - pad;
  const worldW = Math.max(300, (maxX - minX) + pad * 2);
  const worldH = Math.max(200, (maxY - minY) + pad * 2);

  const stX = stage.x ? stage.x() : store.stageX;
  const stY = stage.y ? stage.y() : store.stageY;
  const scale = stage.scaleX ? stage.scaleX() : store.stageScale;

  const cropX = stX + worldX * scale;
  const cropY = stY + worldY * scale;
  const cropW = worldW * scale;
  const cropH = worldH * scale;

  // Snapshot centered strictly on elements area without grid
  const stageDataUrl = stage.toDataURL({
    x: cropX,
    y: cropY,
    width: cropW,
    height: cropH,
    mimeType: 'image/png',
    quality: 1,
    pixelRatio: 3,
  });

  // Restore grid state
  useEditorStore.setState({ gridVisible: prevGridVisible });

  const img = new Image();
  img.src = stageDataUrl;
  img.onload = () => {
    // Composite 4-box technical sheet (2400 x 1600 px)
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

    // ── RETÂNGULO 1: CABEÇALHO DO PROJETO ──
    const headerX = margin;
    const headerY = margin;
    const headerW = width - margin * 2;
    const headerH = 110;

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(headerX, headerY, headerW, headerH);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.strokeRect(headerX, headerY, headerW, headerH);

    // Logo
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

    // Title info
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

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillText('PLANTA DE ILUMINAÇÃO (ELEMENTOS CENTRALIZADOS)', plotX + 16, plotY + 24);

    // Draw plot image centered
    const innerPad = 20;
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

    // ── RETÂNGULO 3: LEGENDA DE EQUIPAMENTOS (DIREITA) ──
    const legendX = plotX + plotW + 20;
    const legendY = plotY;
    const legendH = plotH;

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(legendX, legendY, legendW, legendH);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.strokeRect(legendX, legendY, legendW, legendH);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillText('LEGENDA DE EQUIPAMENTOS', legendX + 20, legendY + 36);

    ctx.strokeStyle = '#ef4732';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(legendX + 20, legendY + 48);
    ctx.lineTo(legendX + legendW - 20, legendY + 48);
    ctx.stroke();

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
      ctx.fillStyle = item.color;
      ctx.fillRect(legendX + 20, itemY - 14, 22, 22);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(legendX + 20, itemY - 14, 22, 22);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText(item.label, legendX + 52, itemY + 2);

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

    const link = document.createElement('a');
    link.href = exportCanvas.toDataURL('image/png');
    const safeShow = (seal.show || 'espetaculo').replace(/[^a-zA-Z0-9_-]/g, '_');
    link.download = `${safeShow}_mapa_de_luz.png`;
    link.click();
  };
}
