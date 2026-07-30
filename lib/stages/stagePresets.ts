// ============================================================
// AFINA v2.0 — Stage Presets
// Conventional and non-conventional stage geometries centered around (0,0)
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

// ── ITALIAN STAGE (Centered around 0,0) ───────────────────
// Total width ~740px, total depth ~660px
const ITALIAN_STAGE_ELEMENTS: Omit<CanvasElement, 'id'>[] = [
  // Stage floor (main area: 600x380)
  { ...BASE_WALL, type: 'wall', x: -300, y: -250, label: 'PALCO PRINCIPAL', customProps: { width: 600, height: 380, fill: '#ffffff', stroke: '#0f172a', strokeWidth: 2.5 } },
  // Audience area (600x240)
  { ...BASE_WALL, type: 'wall', x: -300, y: 160, label: 'PLATEIA', customProps: { width: 600, height: 240, fill: '#f1f5f9', stroke: '#64748b', strokeWidth: 1.5 } },
  // Proscenium arch / Boca de cena
  { ...BASE_WALL, type: 'wall', x: -300, y: 130, label: 'BOCA DE CENA', customProps: { width: 600, height: 24, fill: '#e0f2fe', stroke: '#0284c7', strokeWidth: 2.5 } },
  // Left wing
  { ...BASE_WALL, type: 'wall', x: -370, y: -250, label: 'COXIA ESQ.', customProps: { width: 60, height: 380, fill: '#f8fafc', stroke: '#94a3b8', strokeWidth: 1, opacity: 0.85 } },
  // Right wing
  { ...BASE_WALL, type: 'wall', x: 310, y: -250, label: 'COXIA DIR.', customProps: { width: 60, height: 380, fill: '#f8fafc', stroke: '#94a3b8', strokeWidth: 1, opacity: 0.85 } },
  // Varas de luz
  { ...BASE_BAR, type: 'lightingbar', x: -280, y: -200, label: 'Vara 1', customProps: { width: 560, height: 8 } },
  { ...BASE_BAR, type: 'lightingbar', x: -280, y: -110, label: 'Vara 2', customProps: { width: 560, height: 8 } },
  { ...BASE_BAR, type: 'lightingbar', x: -280, y: -20, label: 'Vara 3', customProps: { width: 560, height: 8 } },
  { ...BASE_BAR, type: 'lightingbar', x: -280, y: 70, label: 'Vara 4', customProps: { width: 560, height: 8 } },
];

// ── ARENA STAGE (Centered around 0,0) ────────────────────
const ARENA_STAGE_ELEMENTS: Omit<CanvasElement, 'id'>[] = [
  // Central stage (240x240)
  { ...BASE_WALL, type: 'wall', x: -120, y: -120, label: 'PALCO ARENA (360°)', customProps: { width: 240, height: 240, fill: '#ffffff', stroke: '#0f172a', strokeWidth: 2.5 } },
  // Audience N
  { ...BASE_WALL, type: 'wall', x: -240, y: -300, label: 'PLATEIA NORTE', customProps: { width: 480, height: 160, fill: '#f1f5f9', stroke: '#64748b', strokeWidth: 1.5 } },
  // Audience S
  { ...BASE_WALL, type: 'wall', x: -240, y: 140, label: 'PLATEIA SUL', customProps: { width: 480, height: 160, fill: '#f1f5f9', stroke: '#64748b', strokeWidth: 1.5 } },
  // Audience W
  { ...BASE_WALL, type: 'wall', x: -410, y: -160, label: 'PLATEIA OESTE', customProps: { width: 160, height: 320, fill: '#f1f5f9', stroke: '#64748b', strokeWidth: 1.5 } },
  // Audience E
  { ...BASE_WALL, type: 'wall', x: 250, y: -160, label: 'PLATEIA LESTE', customProps: { width: 160, height: 320, fill: '#f1f5f9', stroke: '#64748b', strokeWidth: 1.5 } },
  // Overhead bar
  { ...BASE_BAR, type: 'lightingbar', x: -140, y: 0, label: 'Grid Central', customProps: { width: 280, height: 8 } },
];

// ── THRUST STAGE (Centered around 0,0) ───────────────────
const THRUST_STAGE_ELEMENTS: Omit<CanvasElement, 'id'>[] = [
  // Backstage
  { ...BASE_WALL, type: 'wall', x: -250, y: -240, label: 'FUNDO DE CENA', customProps: { width: 500, height: 180, fill: '#f8fafc', stroke: '#64748b', strokeWidth: 1.5 } },
  // Thrust projection
  { ...BASE_WALL, type: 'wall', x: -150, y: -60, label: 'PALCO THRUST', customProps: { width: 300, height: 220, fill: '#ffffff', stroke: '#0f172a', strokeWidth: 2.5 } },
  // Audience Left
  { ...BASE_WALL, type: 'wall', x: -370, y: -60, label: 'PLATEIA ESQ.', customProps: { width: 200, height: 220, fill: '#f1f5f9', stroke: '#64748b', strokeWidth: 1.5 } },
  // Audience Right
  { ...BASE_WALL, type: 'wall', x: 170, y: -60, label: 'PLATEIA DIR.', customProps: { width: 200, height: 220, fill: '#f1f5f9', stroke: '#64748b', strokeWidth: 1.5 } },
  // Audience Front
  { ...BASE_WALL, type: 'wall', x: -150, y: 170, label: 'PLATEIA FRONTAL', customProps: { width: 300, height: 150, fill: '#f1f5f9', stroke: '#64748b', strokeWidth: 1.5 } },
  // Varas
  { ...BASE_BAR, type: 'lightingbar', x: -230, y: -180, label: 'Vara 1', customProps: { width: 460, height: 8 } },
  { ...BASE_BAR, type: 'lightingbar', x: -130, y: 20, label: 'Vara 2', customProps: { width: 260, height: 8 } },
];

// ── RUNWAY / PASSARELA (Centered around 0,0) ──────────────
const RUNWAY_STAGE_ELEMENTS: Omit<CanvasElement, 'id'>[] = [
  // Main stage
  { ...BASE_WALL, type: 'wall', x: -100, y: -260, label: 'PALCO PRINCIPAL', customProps: { width: 200, height: 150, fill: '#ffffff', stroke: '#0f172a', strokeWidth: 2.5 } },
  // Runway
  { ...BASE_WALL, type: 'wall', x: -40, y: -110, label: 'PASSARELA', customProps: { width: 80, height: 380, fill: '#ffffff', stroke: '#0f172a', strokeWidth: 2.5 } },
  // Audience left
  { ...BASE_WALL, type: 'wall', x: -360, y: -120, label: 'PLATEIA ESQ.', customProps: { width: 300, height: 400, fill: '#f1f5f9', stroke: '#64748b', strokeWidth: 1.5 } },
  // Audience right
  { ...BASE_WALL, type: 'wall', x: 60, y: -120, label: 'PLATEIA DIR.', customProps: { width: 300, height: 400, fill: '#f1f5f9', stroke: '#64748b', strokeWidth: 1.5 } },
  // Vara
  { ...BASE_BAR, type: 'lightingbar', x: -300, y: -200, label: 'Vara 1', customProps: { width: 600, height: 8 } },
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
