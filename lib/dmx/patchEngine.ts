// ============================================================
// AFINA v2.0 — DMX Patch Engine
// ============================================================

import type { CanvasElement, DMXConfig } from '@/lib/types';

export interface ConflictReport {
  universe: number;
  address: number;
  conflictingIds: string[];
}

// ── AUTO-PATCH ──────────────────────────────────────────────
/**
 * Sequentially patches an array of elements starting from the given address.
 * Returns updated DMX configs keyed by element ID.
 */
export function autoPatchSequential(
  elements: CanvasElement[],
  universe: number,
  startAddress: number
): Map<string, DMXConfig> {
  const result = new Map<string, DMXConfig>();
  let addr = startAddress;

  for (const el of elements) {
    const footprint = el.dmx?.footprint ?? 1;
    if (addr + footprint - 1 > 512) {
      // Overflow: wrap to next universe (simplified — in v2 wrap properly)
      console.warn(`DMX overflow: element ${el.id} doesn't fit in universe ${universe} from address ${addr}`);
      break;
    }
    result.set(el.id, {
      universe,
      address: addr,
      footprint,
      hasConflict: false,
    });
    addr += footprint;
  }

  return result;
}

// ── CONFLICT DETECTION ─────────────────────────────────────
/**
 * Scans all elements for DMX address overlaps within the same universe.
 * Returns a list of conflict reports and a set of conflicting IDs.
 */
export function detectDMXConflicts(elements: CanvasElement[]): {
  conflicts: ConflictReport[];
  conflictIds: Set<string>;
} {
  const conflicts: ConflictReport[] = [];
  const conflictIds = new Set<string>();

  // Group elements by universe
  const byUniverse = new Map<number, CanvasElement[]>();
  for (const el of elements) {
    if (!el.dmx || el.dmx.footprint === 0) continue;
    const u = el.dmx.universe;
    if (!byUniverse.has(u)) byUniverse.set(u, []);
    byUniverse.get(u)!.push(el);
  }

  // Check each universe for overlaps
  for (const [universe, els] of byUniverse) {
    // Create address occupation map: addr -> [element ids]
    const addrMap = new Map<number, string[]>();

    for (const el of els) {
      const { address, footprint } = el.dmx!;
      for (let ch = address; ch < address + footprint; ch++) {
        if (!addrMap.has(ch)) addrMap.set(ch, []);
        addrMap.get(ch)!.push(el.id);
      }
    }

    // Find conflicts
    for (const [addr, ids] of addrMap) {
      if (ids.length > 1) {
        conflicts.push({ universe, address: addr, conflictingIds: ids });
        ids.forEach((id) => conflictIds.add(id));
      }
    }
  }

  return { conflicts, conflictIds };
}

// ── ELECTRICAL DISTRIBUTION ────────────────────────────────
export interface PhaseDistribution {
  R: { elements: string[]; totalWatts: number };
  S: { elements: string[]; totalWatts: number };
  T: { elements: string[]; totalWatts: number };
  unassigned: { elements: string[]; totalWatts: number };
}

export function calculatePhaseDistribution(elements: CanvasElement[]): PhaseDistribution {
  const dist: PhaseDistribution = {
    R: { elements: [], totalWatts: 0 },
    S: { elements: [], totalWatts: 0 },
    T: { elements: [], totalWatts: 0 },
    unassigned: { elements: [], totalWatts: 0 },
  };

  for (const el of elements) {
    const phase = el.phase ?? 'unassigned';
    dist[phase].elements.push(el.id);
    dist[phase].totalWatts += el.wattage ?? 0;
  }

  return dist;
}

export function isPhaseImbalanced(dist: PhaseDistribution, threshold = 0.2): boolean {
  const loads = [dist.R.totalWatts, dist.S.totalWatts, dist.T.totalWatts].filter((v) => v > 0);
  if (loads.length < 2) return false;
  const max = Math.max(...loads);
  const min = Math.min(...loads);
  return max > 0 && (max - min) / max > threshold;
}

// ── PATCH TABLE GENERATOR ──────────────────────────────────
export interface PatchTableRow {
  channel: number;
  label: string;
  type: string;
  position: string;
  gelatin: string;
  universe: number;
  address: number;
  phase: string;
  wattage: number;
  notes: string;
}

export function generatePatchTable(elements: CanvasElement[]): PatchTableRow[] {
  return elements
    .filter((el) => el.category === 'conventional' || el.category === 'led' || el.category === 'moving' || el.category === 'vintage' || el.category === 'effect')
    .map((el) => ({
      channel: el.channel ?? 0,
      label: el.label,
      type: el.type,
      position: el.customProps?.position as string ?? `(${Math.round(el.x)}, ${Math.round(el.y)})`,
      gelatin: el.gelatin ?? 'NC',
      universe: el.dmx?.universe ?? 1,
      address: el.dmx?.address ?? 0,
      phase: el.phase ?? 'unassigned',
      wattage: el.wattage ?? 0,
      notes: el.notes ?? '',
    }))
    .sort((a, b) => a.channel - b.channel || a.universe - b.universe || a.address - b.address);
}
