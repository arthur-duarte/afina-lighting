'use client';

import { useEditorStore } from '@/lib/store/useEditorStore';
import { getFixtureDef, GELATIN_PRESETS } from '@/lib/fixtures/fixtureLibrary';
import type { FixtureType } from '@/lib/types';

interface LegendEntry {
  type: FixtureType;
  description: string;
  category: string;
  colorHex: string;
  icon: string;
  count: number;
}

interface GelatinEntry {
  code: string;
  name: string;
  color: string;
  count: number;
}

export function DynamicLegend() {
  const { elements, showFocusCoverage } = useEditorStore();

  // Build fixture legend
  const fixtureMap = new Map<string, LegendEntry>();
  const gelatinMap = new Map<string, GelatinEntry>();

  elements
    .filter(
      (el) =>
        el.category !== 'architecture' &&
        el.category !== 'annotation' &&
        el.visible
    )
    .forEach((el) => {
      // Fixtures
      const def = getFixtureDef(el.type);
      const existing = fixtureMap.get(el.type);
      if (existing) {
        existing.count++;
      } else {
        fixtureMap.set(el.type, {
          type: el.type,
          description: def?.description ?? el.type,
          category: el.category,
          colorHex: el.color || def?.colorHex || '#facc15',
          icon: def?.icon ?? '🔦',
          count: 1,
        });
      }

      // Gelatins
      if (el.gelatin && el.gelatin !== 'NC') {
        const gelDef = GELATIN_PRESETS.find((g) => g.code === el.gelatin);
        const existingGel = gelatinMap.get(el.gelatin);
        if (existingGel) {
          existingGel.count++;
        } else {
          gelatinMap.set(el.gelatin, {
            code: el.gelatin,
            name: gelDef?.name ?? el.gelatin,
            color: gelDef?.color ?? '#ffffff',
            count: 1,
          });
        }
      }
    });

  const fixtureEntries = [...fixtureMap.values()].sort((a, b) =>
    a.category.localeCompare(b.category)
  );
  const gelatinEntries = [...gelatinMap.values()].sort((a, b) =>
    a.code.localeCompare(b.code)
  );

  const totalFixtures = fixtureEntries.reduce((s, e) => s + e.count, 0);

  if (fixtureEntries.length === 0) {
    return (
      <div className="text-center text-[10px] text-white/20 py-4">
        Nenhum equipamento inserido
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Fixture legend */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="panel-label">Legenda de Equipamentos</span>
          <span className="ml-auto text-[10px] text-white/30 font-mono">
            {totalFixtures} un.
          </span>
        </div>
        <div className="space-y-1">
          {fixtureEntries.map((entry) => (
            <div
              key={entry.type}
              className="flex items-center gap-2 py-1 border-b border-editor-border/30 last:border-0"
            >
              {/* Color dot */}
              <div
                className="w-3 h-3 rounded-sm flex-shrink-0 border border-white/10"
                style={{ backgroundColor: entry.colorHex }}
              />
              {/* Icon */}
              <span className="text-sm leading-none">{entry.icon}</span>
              {/* Label */}
              <span className="text-[10px] text-white/70 flex-1 leading-tight">
                {entry.description}
              </span>
              {/* Category badge */}
              <span className="text-[9px] text-white/30 uppercase tracking-wide">
                {entry.category.slice(0, 3)}
              </span>
              {/* Count */}
              <span className="text-[11px] font-mono font-bold text-afina-400 min-w-[20px] text-right">
                ×{entry.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Gelatin legend */}
      {gelatinEntries.length > 0 && (
        <div>
          <div className="panel-label mb-2">Gelatinas / Filtros</div>
          <div className="flex flex-wrap gap-1.5">
            {gelatinEntries.map((g) => (
              <div
                key={g.code}
                className="flex items-center gap-1.5 px-2 py-1 rounded border border-editor-border bg-editor-raised"
                title={g.name}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full border border-white/20 flex-shrink-0"
                  style={{ backgroundColor: g.color }}
                />
                <span className="text-[10px] font-mono text-white/70">{g.code}</span>
                <span className="text-[9px] text-white/30">×{g.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Focus coverage notice */}
      {showFocusCoverage && (
        <div className="text-[10px] text-afina-400 flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-afina-500" />
          Cobertura de Foco ativa
        </div>
      )}
    </div>
  );
}
