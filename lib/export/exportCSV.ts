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
    'Aparelho',
    'Tipo',
    'Posição/Vara',
    'Gelatina/Filtro',
    'Universo DMX',
    'Endereço DMX',
    'Footprint',
    'Fase Elétrica',
    'Wattagem (W)',
    'Observações',
  ];

  const lines: string[] = [
    `# Afina v2.0 — Tabela de Patch`,
    `# Espetáculo: ${seal.show}`,
    `# Iluminador: ${seal.designer}`,
    `# Data: ${seal.date}`,
    ``,
    header.join(';'),
    ...rows.map((r) =>
      [
        r.channel || '',
        r.label || '',
        r.type,
        r.position,
        r.gelatin,
        r.universe,
        r.address,
        elements.find((el) => el.label === r.label)?.dmx?.footprint ?? 1,
        r.phase,
        r.wattage,
        r.notes || '',
      ].join(';')
    ),
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
