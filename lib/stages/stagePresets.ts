// ============================================================
// AFINA v2.0 — Stage Presets
// Conventional and non-conventional stage geometries
// ============================================================

import type { CanvasElement } from '@/lib/types';

interface StagePresetDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  elements: Omit<CanvasElement, 'id'>[];
}

const BASE_WALL = {
  category: 'architecture' as const,
  layerId: 'layer_architecture' as const,
  rotation: 0,
  scaleX: 1,
  scaleY: 1,
  label: '',
  color: '#475569',
  gelatin: 'NC',
  wattage: 0,
  phase: 'unassigned' as const,
  locked: false,
  visible: true,
};

// Shared defaults for lighting bars
const BASE_BAR = {
  category: 'rigging' as const,
  layerId: 'layer_rigging' as const,
  rotation: 0,
  scaleX: 1,
  scaleY: 1,
  label: '',
  color: '#94a3b8',
  gelatin: 'NC',
  wattage: 0,
  phase: 'unassigned' as const,
  locked: false,
  visible: true,
};

// ── ITALIAN STAGE ─────────────────────────────────────────
// Standard proscenium: 12m wide, 8m deep stage
const ITALIAN_STAGE_ELEMENTS: Omit<CanvasElement, 'id'>[] = [
  // Stage floor (main area)
  { ...BASE_WALL, type: 'wall', x: 100, y: 100, label: 'Palco', customProps: { width: 600, height: 400, fill: '#1e293b', stroke: '#475569', strokeWidth: 2 } },
  // Audience area
  { ...BASE_WALL, type: 'wall', x: 100, y: 520, label: 'Plateia', customProps: { width: 600, height: 280, fill: '#0f172a', stroke: '#334155', strokeWidth: 1 } },
  // Proscenium arch (mouth of scene)
  { ...BASE_WALL, type: 'wall', x: 100, y: 480, label: 'Boca de Cena', customProps: { width: 600, height: 20, fill: '#0f0f13', stroke: '#ef4732', strokeWidth: 2, dash: [0] } },
  // Left wing
  { ...BASE_WALL, type: 'wall', x: 40, y: 100, label: 'Coxia Esq.', customProps: { width: 60, height: 400, fill: '#0c1118', stroke: '#374151', strokeWidth: 1, opacity: 0.7 } },
  // Right wing
  { ...BASE_WALL, type: 'wall', x: 700, y: 100, label: 'Coxia Dir.', customProps: { width: 60, height: 400, fill: '#0c1118', stroke: '#374151', strokeWidth: 1, opacity: 0.7 } },
  // Vara 1 (downstage)
  { ...BASE_BAR, type: 'lightingbar', x: 120, y: 160, label: 'Vara 1', customProps: { width: 560, height: 8 } },
  // Vara 2
  { ...BASE_BAR, type: 'lightingbar', x: 120, y: 240, label: 'Vara 2', customProps: { width: 560, height: 8 } },
  // Vara 3
  { ...BASE_BAR, type: 'lightingbar', x: 120, y: 320, label: 'Vara 3', customProps: { width: 560, height: 8 } },
  // Vara 4 (upstage)
  { ...BASE_BAR, type: 'lightingbar', x: 120, y: 400, label: 'Vara 4', customProps: { width: 560, height: 8 } },
];

// ── ARENA STAGE ──────────────────────────────────────────
const ARENA_STAGE_ELEMENTS: Omit<CanvasElement, 'id'>[] = [
  // Central stage
  { ...BASE_WALL, type: 'wall', x: 300, y: 250, label: 'Palco Arena', customProps: { width: 200, height: 200, fill: '#1e293b', stroke: '#475569', strokeWidth: 2, isCircle: false } },
  // Audience N
  { ...BASE_WALL, type: 'wall', x: 200, y: 80, label: 'Plateia Norte', customProps: { width: 400, height: 150, fill: '#0f172a', stroke: '#334155', strokeWidth: 1 } },
  // Audience S
  { ...BASE_WALL, type: 'wall', x: 200, y: 470, label: 'Plateia Sul', customProps: { width: 400, height: 150, fill: '#0f172a', stroke: '#334155', strokeWidth: 1 } },
  // Audience W
  { ...BASE_WALL, type: 'wall', x: 40, y: 200, label: 'Plateia Oeste', customProps: { width: 150, height: 300, fill: '#0f172a', stroke: '#334155', strokeWidth: 1 } },
  // Audience E
  { ...BASE_WALL, type: 'wall', x: 610, y: 200, label: 'Plateia Leste', customProps: { width: 150, height: 300, fill: '#0f172a', stroke: '#334155', strokeWidth: 1 } },
  // Overhead bar (over center)
  { ...BASE_BAR, type: 'lightingbar', x: 280, y: 340, label: 'Grid Central', customProps: { width: 240, height: 8 } },
];

// ── THRUST STAGE (Semi-Arena / Elizabethan) ────────────────
const THRUST_STAGE_ELEMENTS: Omit<CanvasElement, 'id'>[] = [
  // Backstage
  { ...BASE_WALL, type: 'wall', x: 150, y: 80, label: 'Fundo de Cena', customProps: { width: 500, height: 180, fill: '#1e293b', stroke: '#475569', strokeWidth: 2 } },
  // Thrust projection
  { ...BASE_WALL, type: 'wall', x: 250, y: 260, label: 'Palco Thrust', customProps: { width: 300, height: 200, fill: '#1e293b', stroke: '#475569', strokeWidth: 2 } },
  // Audience Left
  { ...BASE_WALL, type: 'wall', x: 40, y: 260, label: 'Plateia Esq.', customProps: { width: 200, height: 200, fill: '#0f172a', stroke: '#334155', strokeWidth: 1 } },
  // Audience Right
  { ...BASE_WALL, type: 'wall', x: 560, y: 260, label: 'Plateia Dir.', customProps: { width: 200, height: 200, fill: '#0f172a', stroke: '#334155', strokeWidth: 1 } },
  // Audience Front
  { ...BASE_WALL, type: 'wall', x: 250, y: 480, label: 'Plateia Frontal', customProps: { width: 300, height: 150, fill: '#0f172a', stroke: '#334155', strokeWidth: 1 } },
  // Vara 1
  { ...BASE_BAR, type: 'lightingbar', x: 170, y: 140, label: 'Vara 1', customProps: { width: 460, height: 8 } },
  // Vara 2
  { ...BASE_BAR, type: 'lightingbar', x: 260, y: 310, label: 'Vara 2', customProps: { width: 280, height: 8 } },
];

// ── RUNWAY / PASSERELA ────────────────────────────────────
const RUNWAY_STAGE_ELEMENTS: Omit<CanvasElement, 'id'>[] = [
  // Main stage
  { ...BASE_WALL, type: 'wall', x: 300, y: 60, label: 'Palco Principal', customProps: { width: 200, height: 150, fill: '#1e293b', stroke: '#475569', strokeWidth: 2 } },
  // Runway
  { ...BASE_WALL, type: 'wall', x: 370, y: 210, label: 'Passarela', customProps: { width: 60, height: 360, fill: '#1e293b', stroke: '#475569', strokeWidth: 2 } },
  // Audience left
  { ...BASE_WALL, type: 'wall', x: 60, y: 200, label: 'Plateia Esq.', customProps: { width: 300, height: 400, fill: '#0f172a', stroke: '#334155', strokeWidth: 1 } },
  // Audience right
  { ...BASE_WALL, type: 'wall', x: 440, y: 200, label: 'Plateia Dir.', customProps: { width: 300, height: 400, fill: '#0f172a', stroke: '#334155', strokeWidth: 1 } },
  // Vara
  { ...BASE_BAR, type: 'lightingbar', x: 100, y: 100, label: 'Vara 1', customProps: { width: 600, height: 8 } },
];

export const STAGE_PRESETS: StagePresetDefinition[] = [
  {
    id: 'italian',
    name: 'Italiano / Proscênio',
    description: 'Palco frontal clássico com boca de cena, coxias e varas de luz',
    icon: 'custom_stage',
    elements: ITALIAN_STAGE_ELEMENTS,
  },
  {
    id: 'arena',
    name: 'Arena (360°)',
    description: 'Plateia ao redor de todo o palco',
    icon: 'scenery_circle',
    elements: ARENA_STAGE_ELEMENTS,
  },
  {
    id: 'thrust',
    name: 'Thrust / Semi-Arena',
    description: 'Palco avançado com plateia em 3 lados (formato U)',
    icon: 'scenery_platform',
    elements: THRUST_STAGE_ELEMENTS,
  },
  {
    id: 'runway',
    name: 'Passarela / Desfile',
    description: 'Palco estreito e longo com plateia em ambos os lados',
    icon: 'scenery_rect',
    elements: RUNWAY_STAGE_ELEMENTS,
  },
  {
    id: 'blank',
    name: 'Tela em Branco',
    description: 'Espaço livre para desenho livre / Site-Specific',
    icon: '📐',
    elements: [],
  },
];
