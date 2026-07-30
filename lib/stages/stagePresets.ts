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
  color: '#0f172a',
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
  color: '#334155',
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
  { ...BASE_WALL, type: 'wall', x: 100, y: 100, label: 'PALCO PRINCIPAL', customProps: { width: 600, height: 380, fill: '#ffffff', stroke: '#0f172a', strokeWidth: 2.5 } },
  // Audience area
  { ...BASE_WALL, type: 'wall', x: 100, y: 510, label: 'PLATEIA', customProps: { width: 600, height: 260, fill: '#f1f5f9', stroke: '#64748b', strokeWidth: 1.5 } },
  // Proscenium arch (mouth of scene)
  { ...BASE_WALL, type: 'wall', x: 100, y: 476, label: 'BOCA DE CENA', customProps: { width: 600, height: 24, fill: '#e0f2fe', stroke: '#0284c7', strokeWidth: 2.5 } },
  // Left wing
  { ...BASE_WALL, type: 'wall', x: 40, y: 100, label: 'COXIA ESQ.', customProps: { width: 60, height: 380, fill: '#f8fafc', stroke: '#94a3b8', strokeWidth: 1, opacity: 0.85 } },
  // Right wing
  { ...BASE_WALL, type: 'wall', x: 700, y: 100, label: 'COXIA DIR.', customProps: { width: 60, height: 380, fill: '#f8fafc', stroke: '#94a3b8', strokeWidth: 1, opacity: 0.85 } },
  // Vara 1 (downstage)
  { ...BASE_BAR, type: 'lightingbar', x: 120, y: 150, label: 'Vara 1', customProps: { width: 560, height: 8 } },
  // Vara 2
  { ...BASE_BAR, type: 'lightingbar', x: 120, y: 230, label: 'Vara 2', customProps: { width: 560, height: 8 } },
  // Vara 3
  { ...BASE_BAR, type: 'lightingbar', x: 120, y: 310, label: 'Vara 3', customProps: { width: 560, height: 8 } },
  // Vara 4 (upstage)
  { ...BASE_BAR, type: 'lightingbar', x: 120, y: 390, label: 'Vara 4', customProps: { width: 560, height: 8 } },
];

// ── ARENA STAGE ──────────────────────────────────────────
const ARENA_STAGE_ELEMENTS: Omit<CanvasElement, 'id'>[] = [
  // Central stage
  { ...BASE_WALL, type: 'wall', x: 300, y: 250, label: 'PALCO ARENA (360°)', customProps: { width: 220, height: 220, fill: '#ffffff', stroke: '#0f172a', strokeWidth: 2.5 } },
  // Audience N
  { ...BASE_WALL, type: 'wall', x: 180, y: 70, label: 'PLATEIA NORTE', customProps: { width: 460, height: 160, fill: '#f1f5f9', stroke: '#64748b', strokeWidth: 1.5 } },
  // Audience S
  { ...BASE_WALL, type: 'wall', x: 180, y: 490, label: 'PLATEIA SUL', customProps: { width: 460, height: 160, fill: '#f1f5f9', stroke: '#64748b', strokeWidth: 1.5 } },
  // Audience W
  { ...BASE_WALL, type: 'wall', x: 30, y: 200, label: 'PLATEIA OESTE', customProps: { width: 160, height: 320, fill: '#f1f5f9', stroke: '#64748b', strokeWidth: 1.5 } },
  // Audience E
  { ...BASE_WALL, type: 'wall', x: 630, y: 200, label: 'PLATEIA LESTE', customProps: { width: 160, height: 320, fill: '#f1f5f9', stroke: '#64748b', strokeWidth: 1.5 } },
  // Overhead bar
  { ...BASE_BAR, type: 'lightingbar', x: 270, y: 350, label: 'Grid Central', customProps: { width: 280, height: 8 } },
];

// ── THRUST STAGE (Semi-Arena / Elizabethan) ────────────────
const THRUST_STAGE_ELEMENTS: Omit<CanvasElement, 'id'>[] = [
  // Backstage
  { ...BASE_WALL, type: 'wall', x: 150, y: 80, label: 'FUNDO DE CENA', customProps: { width: 500, height: 180, fill: '#f8fafc', stroke: '#64748b', strokeWidth: 1.5 } },
  // Thrust projection
  { ...BASE_WALL, type: 'wall', x: 250, y: 260, label: 'PALCO THRUST', customProps: { width: 300, height: 200, fill: '#ffffff', stroke: '#0f172a', strokeWidth: 2.5 } },
  // Audience Left
  { ...BASE_WALL, type: 'wall', x: 40, y: 260, label: 'PLATEIA ESQ.', customProps: { width: 200, height: 200, fill: '#f1f5f9', stroke: '#64748b', strokeWidth: 1.5 } },
  // Audience Right
  { ...BASE_WALL, type: 'wall', x: 560, y: 260, label: 'PLATEIA DIR.', customProps: { width: 200, height: 200, fill: '#f1f5f9', stroke: '#64748b', strokeWidth: 1.5 } },
  // Audience Front
  { ...BASE_WALL, type: 'wall', x: 250, y: 480, label: 'PLATEIA FRONTAL', customProps: { width: 300, height: 150, fill: '#f1f5f9', stroke: '#64748b', strokeWidth: 1.5 } },
  // Vara 1
  { ...BASE_BAR, type: 'lightingbar', x: 170, y: 140, label: 'Vara 1', customProps: { width: 460, height: 8 } },
  // Vara 2
  { ...BASE_BAR, type: 'lightingbar', x: 260, y: 310, label: 'Vara 2', customProps: { width: 280, height: 8 } },
];

// ── RUNWAY / PASSARELA ────────────────────────────────────
const RUNWAY_STAGE_ELEMENTS: Omit<CanvasElement, 'id'>[] = [
  // Main stage
  { ...BASE_WALL, type: 'wall', x: 300, y: 60, label: 'PALCO PRINCIPAL', customProps: { width: 200, height: 150, fill: '#ffffff', stroke: '#0f172a', strokeWidth: 2.5 } },
  // Runway
  { ...BASE_WALL, type: 'wall', x: 360, y: 210, label: 'PASSARELA', customProps: { width: 80, height: 360, fill: '#ffffff', stroke: '#0f172a', strokeWidth: 2.5 } },
  // Audience left
  { ...BASE_WALL, type: 'wall', x: 50, y: 200, label: 'PLATEIA ESQ.', customProps: { width: 300, height: 400, fill: '#f1f5f9', stroke: '#64748b', strokeWidth: 1.5 } },
  // Audience right
  { ...BASE_WALL, type: 'wall', x: 450, y: 200, label: 'PLATEIA DIR.', customProps: { width: 300, height: 400, fill: '#f1f5f9', stroke: '#64748b', strokeWidth: 1.5 } },
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
