'use client';

import { useEditorStore } from '@/lib/store/useEditorStore';
import { GELATIN_PRESETS, getFixtureDef } from '@/lib/fixtures/fixtureLibrary';
import type { CanvasElement, ElectricalPhase } from '@/lib/types';
import { ZapIcon, AlertTriangleIcon, RotateCwIcon, CopyIcon, Trash2Icon } from 'lucide-react';

// ── FIELD ROW ─────────────────────────────────────────────
function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 py-1.5 border-b border-editor-border/50 last:border-0">
      <label className="text-[10px] text-white/40 w-20 flex-shrink-0 font-medium uppercase tracking-wide">
        {label}
      </label>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

// ── SINGLE ELEMENT INSPECTOR ──────────────────────────────
function SingleInspector({ el }: { el: CanvasElement }) {
  const { updateElement, removeElements, duplicateElements, rotateElements } = useEditorStore();
  const def = getFixtureDef(el.type);
  const hasConflict = el.dmx?.hasConflict;

  const update = (field: keyof CanvasElement, value: unknown) =>
    updateElement(el.id, { [field]: value });

  const updateDmx = (field: string, value: unknown) =>
    updateElement(el.id, { dmx: { ...el.dmx!, [field]: value } });

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="px-3 py-3 border-b border-editor-border flex-shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{def?.icon ?? '🔦'}</span>
          <div className="flex-1 min-w-0">
            <input
              value={el.label}
              onChange={(e) => update('label', e.target.value)}
              className="input-field text-sm font-semibold bg-transparent border-0 px-0 py-0 focus:ring-0"
              placeholder="Nome / Canal"
            />
            <div className="text-[10px] text-white/30 mt-0.5">{def?.description ?? el.type}</div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex gap-1 mt-2">
          <button
            onClick={() => rotateElements([el.id], 15)}
            className="icon-btn flex-1 text-[10px] flex flex-col items-center gap-0.5"
            title="Rotacionar +15° (R)"
          >
            <RotateCwIcon size={13} /> <span>+15°</span>
          </button>
          <button
            onClick={() => rotateElements([el.id], 45)}
            className="icon-btn flex-1 text-[10px] flex flex-col items-center gap-0.5"
          >
            <RotateCwIcon size={13} /> <span>+45°</span>
          </button>
          <button
            onClick={() => duplicateElements([el.id])}
            className="icon-btn flex-1 text-[10px] flex flex-col items-center gap-0.5"
            title="Duplicar (Ctrl+D)"
          >
            <CopyIcon size={13} /> <span>Copiar</span>
          </button>
          <button
            onClick={() => removeElements([el.id])}
            className="icon-btn flex-1 text-[10px] flex flex-col items-center gap-0.5 hover:text-red-400"
            title="Remover (Delete)"
          >
            <Trash2Icon size={13} /> <span>Remover</span>
          </button>
        </div>
      </div>

      <div className="px-3 py-2 flex-1 overflow-y-auto">
        {/* DMX Conflict Alert */}
        {hasConflict && (
          <div className="flex items-center gap-2 p-2 mb-2 bg-red-950 border border-red-700 rounded-md animate-pulse">
            <AlertTriangleIcon size={13} className="text-red-400 flex-shrink-0" />
            <span className="text-xs text-red-300">Conflito de endereço DMX!</span>
          </div>
        )}

        {/* ── POSIÇÃO ─── */}
        <div className="panel-label mb-2 mt-1">Posição</div>
        <div className="grid grid-cols-2 gap-1.5 mb-3">
          <div>
            <label className="text-[10px] text-white/40 mb-0.5 block">X (px)</label>
            <input
              type="number"
              value={Math.round(el.x)}
              onChange={(e) => update('x', Number(e.target.value))}
              className="input-field font-mono text-xs"
            />
          </div>
          <div>
            <label className="text-[10px] text-white/40 mb-0.5 block">Y (px)</label>
            <input
              type="number"
              value={Math.round(el.y)}
              onChange={(e) => update('y', Number(e.target.value))}
              className="input-field font-mono text-xs"
            />
          </div>
          <div>
            <label className="text-[10px] text-white/40 mb-0.5 block">Rotação (°)</label>
            <input
              type="number"
              value={Math.round(el.rotation)}
              onChange={(e) => update('rotation', Number(e.target.value))}
              className="input-field font-mono text-xs"
            />
          </div>
          {el.angle !== undefined && (
            <div>
              <label className="text-[10px] text-white/40 mb-0.5 block">Abertura (°)</label>
              <input
                type="number"
                value={el.angle}
                onChange={(e) => update('angle', Number(e.target.value))}
                className="input-field font-mono text-xs"
              />
            </div>
          )}
        </div>

        {/* ── CÊNICO ─── */}
        <div className="panel-label mb-2">Cênico</div>
        <FieldRow label="Canal">
          <input
            type="number"
            value={el.channel ?? ''}
            onChange={(e) => update('channel', Number(e.target.value))}
            className="input-field font-mono text-xs"
            placeholder="Canal"
            min={1}
          />
        </FieldRow>
        <FieldRow label="Gelatina">
          <select
            value={el.gelatin}
            onChange={(e) => update('gelatin', e.target.value)}
            className="select-field text-xs"
          >
            {GELATIN_PRESETS.map((g) => (
              <option key={g.code} value={g.code}>
                {g.code} — {g.name}
              </option>
            ))}
          </select>
        </FieldRow>
        <FieldRow label="Observ.">
          <input
            value={el.notes ?? ''}
            onChange={(e) => update('notes', e.target.value)}
            className="input-field text-xs"
            placeholder="Notas..."
          />
        </FieldRow>

        {/* ── ELÉTRICO ─── */}
        <div className="panel-label mb-2 mt-3">Elétrico</div>
        <FieldRow label="Wattagem">
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={el.wattage}
              onChange={(e) => update('wattage', Number(e.target.value))}
              className="input-field font-mono text-xs"
              step={100}
              min={0}
            />
            <ZapIcon size={12} className="text-yellow-400 flex-shrink-0" />
          </div>
        </FieldRow>
        <FieldRow label="Fase">
          <select
            value={el.phase}
            onChange={(e) => update('phase', e.target.value as ElectricalPhase)}
            className="select-field text-xs"
          >
            <option value="unassigned">Não atribuída</option>
            <option value="R">Fase R</option>
            <option value="S">Fase S</option>
            <option value="T">Fase T</option>
          </select>
        </FieldRow>

        {/* ── DMX ─── */}
        {(el.category === 'conventional' || el.category === 'led' || el.category === 'moving' || el.category === 'effect' || el.category === 'vintage') && el.dmx && (
          <>
            <div className="panel-label mb-2 mt-3">DMX</div>
            <FieldRow label="Universo">
              <input
                type="number"
                value={el.dmx.universe}
                onChange={(e) => updateDmx('universe', Number(e.target.value))}
                className="input-field font-mono text-xs"
                min={1} max={32}
              />
            </FieldRow>
            <FieldRow label="Endereço">
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={el.dmx.address}
                  onChange={(e) => updateDmx('address', Number(e.target.value))}
                  className={`input-field font-mono text-xs ${hasConflict ? 'border-red-600 bg-red-950' : ''}`}
                  min={1} max={512}
                />
                <span className={`badge-${hasConflict ? 'conflict' : 'dmx'}`}>
                  {el.dmx.address}–{el.dmx.address + el.dmx.footprint - 1}
                </span>
              </div>
            </FieldRow>
            <FieldRow label="Footprint">
              <input
                type="number"
                value={el.dmx.footprint}
                onChange={(e) => updateDmx('footprint', Number(e.target.value))}
                className="input-field font-mono text-xs"
                min={1} max={64}
              />
            </FieldRow>
          </>
        )}
      </div>
    </div>
  );
}

// ── MULTI-SELECTION INSPECTOR ─────────────────────────────
function MultiInspector({ els }: { els: CanvasElement[] }) {
  const { removeElements, duplicateElements, rotateElements } = useEditorStore();
  const ids = els.map((e) => e.id);
  const totalWatts = els.reduce((s, e) => s + (e.wattage ?? 0), 0);

  return (
    <div className="px-3 py-4">
      <div className="text-center mb-4">
        <div className="text-2xl font-bold text-white">{els.length}</div>
        <div className="text-xs text-white/40">elementos selecionados</div>
      </div>
      <div className="flex gap-1 mb-4">
        <button onClick={() => rotateElements(ids, 15)} className="icon-btn flex-1 text-xs flex flex-col items-center gap-0.5">
          <RotateCwIcon size={13} /> +15°
        </button>
        <button onClick={() => duplicateElements(ids)} className="icon-btn flex-1 text-xs flex flex-col items-center gap-0.5">
          <CopyIcon size={13} /> Copiar
        </button>
        <button onClick={() => removeElements(ids)} className="icon-btn flex-1 text-xs flex flex-col items-center gap-0.5 hover:text-red-400">
          <Trash2Icon size={13} /> Remover
        </button>
      </div>
      <div className="bg-editor-raised rounded-lg p-3 border border-editor-border text-xs">
        <div className="flex justify-between text-white/50 mb-1">
          <span>Carga total:</span>
          <span className="font-mono text-yellow-400">{totalWatts}W</span>
        </div>
        <div className="flex justify-between text-white/50">
          <span>@ 220V:</span>
          <span className="font-mono text-white/70">{(totalWatts / 220).toFixed(1)}A</span>
        </div>
      </div>
    </div>
  );
}

// ── EMPTY STATE ───────────────────────────────────────────
function EmptyInspector() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-editor-raised border border-editor-border flex items-center justify-center mb-3">
        <ZapIcon size={20} className="text-white/20" />
      </div>
      <p className="text-xs text-white/30 leading-relaxed">
        Selecione um elemento no canvas para editar suas propriedades
      </p>
      <div className="mt-4 space-y-1 text-left w-full">
        {[
          ['V', 'Seleção'],
          ['E', 'Elipsoidal'],
          ['F', 'Fresnel'],
          ['P', 'PAR 64'],
          ['M', 'Moving'],
        ].map(([key, label]) => (
          <div key={key} className="flex items-center gap-2">
            <span className="kbd">{key}</span>
            <span className="text-[10px] text-white/30">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MAIN INSPECTOR ────────────────────────────────────────
export function PropertyInspector() {
  const { selectedIds, elements } = useEditorStore();
  const selected = elements.filter((el) => selectedIds.includes(el.id));

  return (
    <aside className="editor-inspector panel flex flex-col overflow-hidden animate-slide-in-right">
      <div className="panel-section flex-shrink-0">
        <span className="panel-label">Inspetor de Propriedades</span>
      </div>
      <div className="flex-1 overflow-hidden">
        {selected.length === 0 && <EmptyInspector />}
        {selected.length === 1 && <SingleInspector el={selected[0]} />}
        {selected.length > 1 && <MultiInspector els={selected} />}
      </div>
    </aside>
  );
}
