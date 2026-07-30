// ============================================================
// AFINA v2.0 — CSV Export (Tabela de Patch)
// ============================================================

import type { CanvasElement } from '@/lib/types';
import { generatePatchTable } from '@/lib/dmx/patchEngine';
import type { TechnicalSeal } from '@/lib/types';

export function exportPatchCSV(elements: CanvasElement[], seal: TechnicalSeal) {
  const rows = generatePatchTable(elements);

  const header = [
    'Canal',
    'Identificador',
    'Aparelho/Tipo',
    'Gelatina/Filtro',
    'Universo DMX',
    'Endereço DMX',
    'Footprint',
    'Voltagem',
    'Fase Elétrica',
    'Wattagem (W)',
    'Observações',
  ];

  const lines: string[] = [
    `# Afina v2.0 — Tabela de Patch e Afinação`,
    `# Espetáculo: ${seal.show}`,
    `# Iluminador: ${seal.designer}`,
    `# Data: ${seal.date}`,
    ``,
    header.join(';'),
    ...rows.map((r) => {
      const el = elements.find((e) => e.label === r.label && e.type === r.type);
      return [
        r.channel || '',
        el?.customName || r.label || '',
        r.type,
        r.gelatin,
        r.universe,
        r.address,
        el?.dmx?.footprint ?? 1,
        el?.voltage || '220V',
        r.phase,
        r.wattage,
        el?.notes || r.notes || '',
      ].join(';');
    }),
  ];

  const csv = lines.join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${(seal.show || 'afina').replace(/\s+/g, '_')}_patch.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
