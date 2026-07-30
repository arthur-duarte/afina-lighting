'use client';

import { useState } from 'react';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { FIXTURE_LIBRARY, CATEGORY_LABELS, getFixturesByCategory } from '@/lib/fixtures/fixtureLibrary';
import { STAGE_PRESETS } from '@/lib/stages/stagePresets';
import { PatchPanel } from './PatchPanel';
import { DynamicLegend } from './DynamicLegend';
import type { FixtureType } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import {
  ChevronDownIcon, ChevronRightIcon,
  Grid3x3Icon, PenToolIcon, TypeIcon,
  ZapIcon, LayersIcon, BoxIcon, ActivityIcon, ListIcon,
} from 'lucide-react';

// ── ACCORDION SECTION ─────────────────────────────────────
function AccordionSection({
  title, icon, children, defaultOpen = false,
}: {
  title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-editor-border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-editor-hover transition-colors text-left"
      >
        <span className="text-white/50">{icon}</span>
        <span className="text-xs font-semibold text-white/70 flex-1">{title}</span>
        {open
          ? <ChevronDownIcon size={12} className="text-white/30" />
          : <ChevronRightIcon size={12} className="text-white/30" />}
      </button>
      {open && <div className="pb-2">{children}</div>}
    </div>
  );
}

// ── FIXTURE DRAG CARD ─────────────────────────────────────
function FixtureCard({ type, label, icon, colorHex, description }: {
  type: FixtureType; label: string; icon: string; colorHex: string; description: string;
}) {
  const store = useEditorStore();

  const handleClick = () => {
    store.setActiveTool('insert_fixture', type);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('fixtureType', type);
    store.setActiveTool('insert_fixture', type);
  };

  return (
    <div
      className="fixture-card mx-2"
      draggable
      onDragStart={handleDragStart}
      onClick={handleClick}
      title={description}
    >
      <div
        className="fixture-icon text-sm"
        style={{ borderColor: `${colorHex}44`, color: colorHex }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-white/80 truncate">{label}</div>
        <div className="text-[10px] text-white/35 truncate">{description}</div>
      </div>
    </div>
  );
}

// ── STAGE PRESET CARD ─────────────────────────────────────
function StageCard({ preset }: { preset: (typeof STAGE_PRESETS)[number] }) {
  const { addElement, clearCanvas } = useEditorStore();

  const handleLoad = () => {
    if (!confirm(`Carregar preset "${preset.name}"? O canvas atual será substituído.`)) return;
    clearCanvas();
    preset.elements.forEach((el) => addElement({ ...el }));
  };

  return (
    <button
      onClick={handleLoad}
      className="w-full mx-2 my-0.5 flex items-center gap-2.5 px-2.5 py-2 rounded-md
                 text-left border border-transparent hover:border-editor-border hover:bg-editor-hover
                 transition-all duration-150"
    >
      <span className="text-lg leading-none">{preset.icon}</span>
      <div className="min-w-0">
        <div className="text-xs font-medium text-white/80 truncate">{preset.name}</div>
        <div className="text-[10px] text-white/35 truncate">{preset.description}</div>
      </div>
    </button>
  );
}

// ── LAYER PANEL ───────────────────────────────────────────
function LayerPanel() {
  const { layers, activeLayerId, toggleLayerVisibility, toggleLayerLock, setActiveLayer } = useEditorStore();

  return (
    <div className="px-2 py-1 space-y-0.5">
      {layers.map((layer) => (
        <div
          key={layer.id}
          onClick={() => setActiveLayer(layer.id)}
          className={`layer-item rounded-md cursor-pointer ${
            activeLayerId === layer.id ? 'bg-editor-active border-l-2' : ''
          }`}
          style={activeLayerId === layer.id ? { borderLeftColor: layer.color } : {}}
        >
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: layer.color }}
          />
          <span className="text-xs text-white/70 flex-1 truncate">{layer.label}</span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(layer.id); }}
              className="text-white/40 hover:text-white text-[10px] px-1"
              title={layer.visible ? 'Ocultar' : 'Exibir'}
            >
              {layer.visible ? '👁' : '○'}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); toggleLayerLock(layer.id); }}
              className="text-white/40 hover:text-white text-[10px] px-1"
              title={layer.locked ? 'Desbloquear' : 'Bloquear'}
            >
              {layer.locked ? '🔒' : '🔓'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── MAIN ASSET PANEL ──────────────────────────────────────
export function AssetPanel() {
  const { selectedTab, setSelectedTab } = useEditorStore();
  type Tab = 'library' | 'layers' | 'patch' | 'legend';

  const categories = ['conventional', 'led', 'moving', 'vintage', 'effect'];

  const tabs: { id: Tab; icon: React.ReactNode; label: string }[] = [
    { id: 'library', icon: <BoxIcon size={12} />, label: 'Biblioteca' },
    { id: 'layers', icon: <LayersIcon size={12} />, label: 'Camadas' },
    { id: 'patch', icon: <ActivityIcon size={12} />, label: 'Patch' },
    { id: 'legend', icon: <ListIcon size={12} />, label: 'Legenda' },
  ];

  return (
    <aside className="editor-assets panel flex flex-col overflow-hidden animate-slide-in-left">
      {/* Tab switcher */}
      <div className="flex border-b border-editor-border flex-shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
          onClick={() => setSelectedTab(tab.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
              selectedTab === tab.id
                ? 'text-white border-b-2 border-afina-500'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {selectedTab === 'library' && (
          <>
            {/* Stage Presets */}
            <AccordionSection title="Arquitetura & Palcos" icon={<Grid3x3Icon size={13} />} defaultOpen>
              <div className="space-y-0.5">
                {STAGE_PRESETS.map((preset) => (
                  <StageCard key={preset.id} preset={preset} />
                ))}
              </div>
              <div className="px-2 pt-1 pb-2">
                <button className="w-full flex items-center justify-center gap-1.5 py-1.5 border border-dashed border-editor-border rounded-md text-xs text-white/40 hover:text-white/70 hover:border-white/20 transition-colors">
                  <PenToolIcon size={12} /> Desenhar Polígono Livre
                </button>
              </div>
            </AccordionSection>

            {/* Rigging */}
            <AccordionSection title="Rigging & Estruturas" icon={<ZapIcon size={13} />} defaultOpen>
              <div className="space-y-0.5">
                {getFixturesByCategory('rigging').map((f) => (
                  <FixtureCard key={f.type} {...f} />
                ))}
              </div>
            </AccordionSection>

            {/* Fixture categories */}
            {categories.map((cat) => (
              <AccordionSection
                key={cat}
                title={CATEGORY_LABELS[cat]}
                icon={<ZapIcon size={13} />}
                defaultOpen={cat === 'conventional'}
              >
                <div className="space-y-0.5">
                  {getFixturesByCategory(cat).map((f) => (
                    <FixtureCard key={f.type} {...f} />
                  ))}
                </div>
              </AccordionSection>
            ))}

            {/* Annotations */}
            <AccordionSection title="Anotações & Formas" icon={<TypeIcon size={13} />}>
              <div className="px-2 space-y-0.5">
                {[
                  { label: 'Cota de Medida', icon: '↔', type: 'dimension' },
                  { label: 'Caixa de Texto', icon: 'T', type: 'text' },
                  { label: 'Seta', icon: '→', type: 'arrow' },
                  { label: 'Marcador de Foco', icon: '✕', type: 'focus_marker' },
                ].map((item) => (
                  <button key={item.type} className="fixture-card w-full text-left">
                    <div className="fixture-icon text-white/50 font-mono text-sm">{item.icon}</div>
                    <span className="text-xs text-white/70">{item.label}</span>
                  </button>
                ))}
              </div>
            </AccordionSection>
          </>
        )}
        {selectedTab === 'layers' && <LayerPanel />}
        {selectedTab === 'patch' && <PatchPanel />}
        {selectedTab === 'legend' && (
          <div className="px-3 py-3">
            <DynamicLegend />
          </div>
        )}
      </div>

      {/* Tool shortcuts hint */}
      <div className="flex-shrink-0 px-3 py-2 border-t border-editor-border bg-editor-raised">
        <p className="text-[10px] text-white/25 leading-relaxed">
          <span className="kbd">E</span> Elipsoidal &nbsp;
          <span className="kbd">F</span> Fresnel &nbsp;
          <span className="kbd">P</span> PAR &nbsp;
          <span className="kbd">M</span> Moving &nbsp;
          <span className="kbd">W</span> Vara
        </p>
      </div>
    </aside>
  );
}
