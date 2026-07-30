// ============================================================
// AFINA v2.0 — PNG Export (300 DPI via Konva pixelRatio)
// ============================================================

interface KonvaStage {
  toDataURL: (config: {
    mimeType: string;
    quality: number;
    pixelRatio: number;
  }) => string;
}

/**
 * Exports the Konva stage as a high-resolution PNG (300 DPI equivalent).
 * pixelRatio: 3 = 3× screen resolution → ~300 DPI for 96 DPI screens.
 */
export function exportStageToPNG(
  stage: KonvaStage,
  filename = 'afina_mapa_de_luz.png'
) {
  const dataUrl = stage.toDataURL({
    mimeType: 'image/png',
    quality: 1,
    pixelRatio: 3, // 300 DPI
  });

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  link.click();
}
