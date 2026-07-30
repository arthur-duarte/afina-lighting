'use client';

import { useState } from 'react';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { generatePatchTable } from '@/lib/dmx/patchEngine';
import { calculatePhaseDistribution, isPhaseImbalanced } from '@/lib/dmx/patchEngine';
import { exportPatchCSV } from '@/lib/export/exportCSV';
import {
  Zap, AlertTriangle, CheckCircle2, DownloadIcon,
  RefreshCwIcon, FilterIcon,
} from 'lucide-react';

// ── UNIVERSE SELECTOR ─────────────────────────────────────
function UniverseSelector({
  value, onChange,
}: { value: number; onChange: (v: number) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="select-field text-xs"
    >
      {Array.from({ length: 32 }, (_, i) => i + 1).map((u) => (
        <option key={u} value={u}>Universo {u}</option>
      ))}
    </select>
  );
}

// ── PHASE DISTRIBUTION CARD ───────────────────────────────
function PhaseDistCard() {
  const { elements } = useEditorStore();
  const dist = calculatePhaseDistribution(elements);
  const imbalanced = isPhaseImbalanced(dist);

  const phases = [
    { key: 'R', label: 'Fase R', color: 'text-red-400', bg: 'bg-red-950/40' },
    { key: 'S', label: 'Fase S', color: 'text-yellow-400', bg: 'bg-yellow-950/40' },
    { key: 'T', label: 'Fase T', color: 'text-blue-400', bg: 'bg-blue-950/40' },
  ] as const;

  return (
    <div className="bg-editor-raised rounded-lg border border-editor-border p-3 mb-3">
      <div className="flex items-center gap-2 mb-2">
        <Zap size={12} className="text-yellow-400" />
        <span className="panel-label">Distribuição Trifásica</span>
        {imbalanced && (
          <span className="ml-auto flex items-center gap-1 text-orange-400 text-[10px]">
            <AlertTriangle size={10} />
            Desbalanceado
          </span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {phases.map((p) => {
          const d = dist[p.key];
          return (
            <div key={p.key} className={`rounded p-2 ${p.bg} border border-editor-border`}>
              <div className={`text-[10px] font-bold ${p.color} mb-1`}>{p.label}</div>
              <div className="font-mono text-xs text-white/80">{(d.totalWatts / 1000).toFixed(2)} kW</div>
              <div className="font-mono text-[10px] text-white/40">{d.elements.length} circ.</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── MAIN PATCH PANEL ─────────────────────────────────────
export function PatchPanel() {
  const { elements, selectedIds, runAutoPatch, detectAndMarkConflicts, technicalSeal } = useEditorStore();
  const [universe, setUniverse] = useState(1);
  const [startAddr, setStartAddr] = useState(1);
  const [filterUniverse, setFilterUniverse] = useState<number | 'all'>('all');
  const [showConflictsOnly, setShowConflictsOnly] = useState(false);

  const patchRows = generatePatchTable(elements);
  const hasConflicts = elements.some((el) => el.dmx?.hasConflict);

  const visibleRows = patchRows.filter((row) => {
    const el = elements.find((e) => e.label === row.label && e.channel === row.channel);
    if (filterUniverse !== 'all' && row.universe !== filterUniverse) return false;
    if (showConflictsOnly && !el?.dmx?.hasConflict) return false;
    return true;
  });

  const handleAutoPatch = () => {
    const ids = selectedIds.length > 0
      ? selectedIds
      : elements.filter((el) => el.dmx).map((el) => el.id);
    if (ids.length === 0) {
      alert('Nenhum aparelho com DMX encontrado no canvas.');
      return;
    }
    runAutoPatch(ids, universe, startAddr);
  };

  const handleDetect = () => {
    detectAndMarkConflicts();
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="panel-section flex-shrink-0">
        <span className="panel-label">Patch DMX</span>
        <span className="ml-auto text-[10px] text-white/30 font-mono">
          {patchRows.length} aparelhos
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3">
        {/* Auto-Patch Controls */}
        <div className="bg-editor-raised rounded-lg border border-editor-border p-3">
          <div className="panel-label mb-2">Endereçamento Automático</div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="text-[10px] text-white/40 mb-0.5 block">Universo</label>
              <UniverseSelector value={universe} onChange={setUniverse} />
            </div>
            <div>
              <label className="text-[10px] text-white/40 mb-0.5 block">Endereço inicial</label>
              <input
                type="number"
                value={startAddr}
                onChange={(e) => setStartAddr(Math.max(1, Number(e.target.value)))}
                className="input-field font-mono text-xs"
                min={1}
                max={512}
              />
            </div>
          </div>
          <p className="text-[10px] text-white/30 mb-2">
            {selectedIds.length > 0
              ? `${selectedIds.length} selecionados serão endereçados`
              : 'Todos os aparelhos com DMX serão endereçados'}
          </p>
          <button
            onClick={handleAutoPatch}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-afina-600 hover:bg-afina-500 text-white text-xs rounded-md font-medium transition-colors active:scale-95"
          >
            <RefreshCwIcon size={12} />
            Endereçar Sequencialmente
          </button>
        </div>

        {/* Conflict detection */}
        <div className="flex gap-2">
          <button
            onClick={handleDetect}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs rounded border transition-colors ${
              hasConflicts
                ? 'bg-red-950 border-red-700 text-red-300 animate-pulse'
                : 'bg-editor-raised border-editor-border text-white/60 hover:border-afina-500'
            }`}
          >
            {hasConflicts ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
            {hasConflicts ? 'Conflitos Detectados' : 'Verificar Conflitos'}
          </button>
          <button
            onClick={() => exportPatchCSV(elements, technicalSeal)}
            className="flex items-center gap-1.5 px-2 py-1.5 text-xs rounded border border-editor-border bg-editor-raised text-white/60 hover:border-afina-500 hover:text-white transition-colors"
            title="Exportar CSV"
          >
            <DownloadIcon size={12} />
            CSV
          </button>
        </div>

        {/* Phase distribution */}
        <PhaseDistCard />

        {/* Filters */}
        <div className="flex items-center gap-2">
          <FilterIcon size={11} className="text-white/30" />
          <select
            value={String(filterUniverse)}
            onChange={(e) => setFilterUniverse(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="select-field text-xs flex-1"
          >
            <option value="all">Todos os universos</option>
            {Array.from({ length: 32 }, (_, i) => i + 1).map((u) => (
              <option key={u} value={u}>Universo {u}</option>
            ))}
          </select>
          <label className="flex items-center gap-1 text-[10px] text-white/50 cursor-pointer">
            <input
              type="checkbox"
              checked={showConflictsOnly}
              onChange={(e) => setShowConflictsOnly(e.target.checked)}
              className="accent-red-500"
            />
            Só conflitos
          </label>
        </div>

        {/* Patch Table */}
        {visibleRows.length === 0 ? (
          <div className="text-center text-[11px] text-white/30 py-6">
            Nenhum aparelho endereçado.<br />
            Insira equipamentos no canvas e use o Auto-Patch.
          </div>
        ) : (
          <div className="rounded-lg overflow-hidden border border-editor-border">
            {/* Header */}
            <div className="grid text-[9px] font-bold text-white/40 uppercase tracking-wider px-2 py-1.5 bg-editor-raised border-b border-editor-border"
              style={{ gridTemplateColumns: '28px 1fr 36px 40px 40px 48px' }}>
              <span>CH</span>
              <span>Aparelho</span>
              <span>Gel</span>
              <span>Uni</span>
              <span>ADDR</span>
              <span>W</span>
            </div>
            {visibleRows.map((row, i) => {
              const el = elements.find((e) =>
                e.label === row.label && e.channel === row.channel
              );
              const conflict = el?.dmx?.hasConflict;
              return (
                <div
                  key={i}
                  className={`grid text-[10px] px-2 py-1 border-b border-editor-border/50 last:border-0 ${
                    conflict ? 'bg-red-950/30 animate-pulse' : i % 2 === 0 ? 'bg-transparent' : 'bg-editor-raised/30'
                  }`}
                  style={{ gridTemplateColumns: '28px 1fr 36px 40px 40px 48px' }}
                >
                  <span className="font-mono text-afina-400">{row.channel || '—'}</span>
                  <span className="text-white/70 truncate">{row.label || row.type}</span>
                  <span className="text-white/50 font-mono">{row.gelatin}</span>
                  <span className="font-mono text-white/40">{row.universe}</span>
                  <span className={`font-mono ${conflict ? 'text-red-400 font-bold' : 'text-white/60'}`}>
                    {row.address}
                    {conflict && <AlertTriangle size={8} className="inline ml-1 text-red-400" />}
                  </span>
                  <span className="font-mono text-yellow-400/70">{row.wattage}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
