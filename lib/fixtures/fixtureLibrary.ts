// ============================================================
// AFINA v2.0 — Fixture Library
// Complete catalog of theatrical lighting equipment
// ============================================================

import type { FixtureType, FixtureCategory, LayerId } from '@/lib/types';

export interface FixtureDefinition {
  type: FixtureType;
  category: FixtureCategory;
  label: string;
  icon: string;                  // emoji or SVG path key
  defaultWattage: number;
  defaultDmxFootprint: number;
  defaultAngle?: number;
  defaultLayerId: LayerId;
  shortcut?: string;
  description: string;
  colorHex: string;              // symbol color on canvas
}

export const FIXTURE_LIBRARY: FixtureDefinition[] = [
  // ── CONVENCIONAIS ─────────────────────────────────────────
  {
    type: 'ellipsoidal',
    category: 'conventional',
    label: 'Elipsoidal',
    icon: '🔦',
    defaultWattage: 750,
    defaultDmxFootprint: 1,
    defaultAngle: 26,
    defaultLayerId: 'layer_lighting',
    shortcut: 'E',
    description: 'Elipsoidal / Leko (19°/26°/36°/50°)',
    colorHex: '#facc15',
  },
  {
    type: 'fresnel',
    category: 'conventional',
    label: 'Fresnel',
    icon: '💡',
    defaultWattage: 1000,
    defaultDmxFootprint: 1,
    defaultLayerId: 'layer_lighting',
    shortcut: 'F',
    description: 'Fresnel (1kW/2kW/5kW) com Barn-door',
    colorHex: '#fb923c',
  },
  {
    type: 'pc',
    category: 'conventional',
    label: 'PC',
    icon: '💡',
    defaultWattage: 1000,
    defaultDmxFootprint: 1,
    defaultLayerId: 'layer_lighting',
    description: 'Plano Convexo (1kW/2kW)',
    colorHex: '#fde68a',
  },
  {
    type: 'par64',
    category: 'conventional',
    label: 'PAR 64',
    icon: '🔆',
    defaultWattage: 1000,
    defaultDmxFootprint: 1,
    defaultLayerId: 'layer_lighting',
    shortcut: 'P',
    description: 'PAR 64 (Foco 1, 2, 5, 6)',
    colorHex: '#fdba74',
  },
  {
    type: 'pinspot',
    category: 'conventional',
    label: 'Pinspot',
    icon: '📍',
    defaultWattage: 250,
    defaultDmxFootprint: 1,
    defaultLayerId: 'layer_lighting',
    description: 'Pinspot / PAR 36',
    colorHex: '#fef3c7',
  },

  // ── VINTAGE / LEGADO ─────────────────────────────────────
  {
    type: 'setlight',
    category: 'vintage',
    label: 'Set-Light',
    icon: '📦',
    defaultWattage: 500,
    defaultDmxFootprint: 1,
    defaultLayerId: 'layer_lighting',
    description: 'Set-Light / Box Light com lâmpada halógena',
    colorHex: '#d97706',
  },
  {
    type: 'svoboda',
    category: 'vintage',
    label: 'Svoboda',
    icon: '━',
    defaultWattage: 2000,
    defaultDmxFootprint: 1,
    defaultLayerId: 'layer_lighting',
    description: 'Rampa de Luz Svoboda (matriz em linha)',
    colorHex: '#92400e',
  },
  {
    type: 'minibruta',
    category: 'vintage',
    label: 'Minibruta',
    icon: '⊞',
    defaultWattage: 4000,
    defaultDmxFootprint: 1,
    defaultLayerId: 'layer_lighting',
    description: 'Minibruta / Audience Blinder (2, 4 ou 8 lâmpadas)',
    colorHex: '#78350f',
  },
  {
    type: 'hqi',
    category: 'vintage',
    label: 'Vapor Metálico',
    icon: '⬛',
    defaultWattage: 2000,
    defaultDmxFootprint: 1,
    defaultLayerId: 'layer_lighting',
    description: 'HQI / Vapor Metálico com reator',
    colorHex: '#7dd3fc',
  },
  {
    type: 'linestra',
    category: 'vintage',
    label: 'Linestra',
    icon: '—',
    defaultWattage: 500,
    defaultDmxFootprint: 1,
    defaultLayerId: 'layer_lighting',
    description: 'Linestra / Lâmpada Edison tubular',
    colorHex: '#fef9c3',
  },

  // ── LED ───────────────────────────────────────────────────
  {
    type: 'parled',
    category: 'led',
    label: 'PAR LED',
    icon: '🔵',
    defaultWattage: 60,
    defaultDmxFootprint: 8,
    defaultLayerId: 'layer_lighting',
    description: 'PAR LED (RGBW/RGBA)',
    colorHex: '#60a5fa',
  },
  {
    type: 'barled',
    category: 'led',
    label: 'Barra LED',
    icon: '▬',
    defaultWattage: 120,
    defaultDmxFootprint: 12,
    defaultLayerId: 'layer_lighting',
    description: 'Barra LED / Ribalta Digital segmentada',
    colorHex: '#818cf8',
  },

  // ── MOVING LIGHTS ─────────────────────────────────────────
  {
    type: 'moving_spot',
    category: 'moving',
    label: 'Moving Spot',
    icon: '🌀',
    defaultWattage: 350,
    defaultDmxFootprint: 20,
    defaultLayerId: 'layer_lighting',
    shortcut: 'M',
    description: 'Moving Light — Spot com gobo e prisma',
    colorHex: '#a78bfa',
  },
  {
    type: 'moving_beam',
    category: 'moving',
    label: 'Moving Beam',
    icon: '🌀',
    defaultWattage: 350,
    defaultDmxFootprint: 16,
    defaultLayerId: 'layer_lighting',
    description: 'Moving Light — Beam colimado',
    colorHex: '#c4b5fd',
  },
  {
    type: 'moving_wash',
    category: 'moving',
    label: 'Moving Wash',
    icon: '🌀',
    defaultWattage: 350,
    defaultDmxFootprint: 18,
    defaultLayerId: 'layer_lighting',
    description: 'Moving Light — Wash LED',
    colorHex: '#ddd6fe',
  },

  // ── EFEITOS ──────────────────────────────────────────────
  {
    type: 'mirrorball',
    category: 'effect',
    label: 'Globo de Espelhos',
    icon: '🔮',
    defaultWattage: 0,
    defaultDmxFootprint: 0,
    defaultLayerId: 'layer_rigging',
    description: 'Globo de Espelhos (Mirror Ball)',
    colorHex: '#e2e8f0',
  },
  {
    type: 'uv',
    category: 'effect',
    label: 'Luz Negra (UV)',
    icon: '🟣',
    defaultWattage: 300,
    defaultDmxFootprint: 1,
    defaultLayerId: 'layer_lighting',
    description: 'Luz Negra UV / Blacklight',
    colorHex: '#7c3aed',
  },
  {
    type: 'strobe',
    category: 'effect',
    label: 'Strobo',
    icon: '⚡',
    defaultWattage: 400,
    defaultDmxFootprint: 4,
    defaultLayerId: 'layer_lighting',
    description: 'Strobo Xenon / Strobo LED',
    colorHex: '#f1f5f9',
  },
  {
    type: 'fogmachine',
    category: 'effect',
    label: 'Máq. de Fumaça',
    icon: '☁️',
    defaultWattage: 1500,
    defaultDmxFootprint: 2,
    defaultLayerId: 'layer_lighting',
    description: 'Máquina de Fumaça / Haze',
    colorHex: '#94a3b8',
  },

  // ── RIGGING ──────────────────────────────────────────────
  {
    type: 'lightingbar',
    category: 'rigging',
    label: 'Vara de Luz',
    icon: '━',
    defaultWattage: 0,
    defaultDmxFootprint: 0,
    defaultLayerId: 'layer_rigging',
    shortcut: 'W',
    description: 'Vara de Luz horizontal',
    colorHex: '#94a3b8',
  },
  {
    type: 'truss_q25',
    category: 'rigging',
    label: 'Box Truss Q25',
    icon: '▣',
    defaultWattage: 0,
    defaultDmxFootprint: 0,
    defaultLayerId: 'layer_rigging',
    description: 'Box Truss Q25 (25cm)',
    colorHex: '#64748b',
  },
  {
    type: 'truss_q30',
    category: 'rigging',
    label: 'Box Truss Q30',
    icon: '▣',
    defaultWattage: 0,
    defaultDmxFootprint: 0,
    defaultLayerId: 'layer_rigging',
    description: 'Box Truss Q30 (30cm)',
    colorHex: '#64748b',
  },
  {
    type: 'truss_q50',
    category: 'rigging',
    label: 'Box Truss Q50',
    icon: '▣',
    defaultWattage: 0,
    defaultDmxFootprint: 0,
    defaultLayerId: 'layer_rigging',
    description: 'Box Truss Q50 (50cm)',
    colorHex: '#475569',
  },
];

// ── CATEGORY LABELS ────────────────────────────────────────
export const CATEGORY_LABELS: Record<string, string> = {
  conventional: 'Convencionais',
  led: 'LED',
  moving: 'Moving Lights',
  vintage: 'Vintage / Legado',
  effect: 'Efeitos & Atmosfera',
  rigging: 'Rigging & Estruturas',
  architecture: 'Arquitetura & Palcos',
  annotation: 'Anotações & Formas',
};

// ── GELATIN PRESETS ────────────────────────────────────────
export const GELATIN_PRESETS = [
  { code: 'R-02', name: 'Bastard Amber', color: '#f5e6c8' },
  { code: 'R-04', name: 'Medium Bastard Amber', color: '#f5d49a' },
  { code: 'R-09', name: 'Pale Amber Gold', color: '#f5c842' },
  { code: 'R-14', name: 'Medium Straw', color: '#f5e642' },
  { code: 'R-19', name: 'Fire', color: '#f57c42' },
  { code: 'R-20', name: 'Medium Amber', color: '#f5a242' },
  { code: 'R-21', name: 'Gold Amber', color: '#f5821e' },
  { code: 'R-24', name: 'Scarlet', color: '#f54236' },
  { code: 'R-26', name: 'Light Red', color: '#f56b6b' },
  { code: 'R-27', name: 'Medium Red', color: '#e03030' },
  { code: 'R-33', name: 'No Color Pink', color: '#f5c4c4' },
  { code: 'R-36', name: 'Medium Pink', color: '#f5a0c8' },
  { code: 'R-46', name: 'Magenta', color: '#c84096' },
  { code: 'R-68', name: 'Sky Blue', color: '#6ab4f5' },
  { code: 'R-72', name: 'Azure Blue', color: '#4282f5' },
  { code: 'R-74', name: 'Night Blue', color: '#2832c8' },
  { code: 'R-80', name: 'Primary Blue', color: '#1428c8' },
  { code: 'R-119', name: 'Dark Blue', color: '#0d1e82' },
  { code: 'R-312', name: 'Canary', color: '#f5f542' },
  { code: 'R-393', name: 'Emerald Green', color: '#42c878' },
  { code: 'L-201', name: 'Full CT Blue', color: '#b4c8f5' },
  { code: 'L-202', name: 'Half CT Blue', color: '#c8dcf5' },
  { code: 'L-204', name: 'Full CT Orange', color: '#f5a042' },
  { code: 'NC', name: 'Sem Gelatina', color: 'transparent' },
];

// ── HELPER FUNCTIONS ───────────────────────────────────────
export function getFixtureDef(type: FixtureType): FixtureDefinition | undefined {
  return FIXTURE_LIBRARY.find((f) => f.type === type);
}

export function getFixturesByCategory(category: string): FixtureDefinition[] {
  return FIXTURE_LIBRARY.filter((f) => f.category === category);
}
