// ============================================================
// AFINA v2.0 — Keyboard Shortcuts Hook
// ============================================================
'use client';

import { useEffect, useCallback } from 'react';
import { useEditorStore } from '@/lib/store/useEditorStore';

export function useKeyboardShortcuts() {
  const store = useEditorStore();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't capture if focused on input / textarea
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const key = e.key.toLowerCase();

      // ── UNDO / REDO ─────────────────────────────────────
      if (ctrl && !shift && key === 'z') { e.preventDefault(); store.undo(); return; }
      if (ctrl && (key === 'y' || (shift && key === 'z'))) { e.preventDefault(); store.redo(); return; }

      // ── COPY / PASTE ─────────────────────────────────────
      if (ctrl && key === 'c') {
        e.preventDefault();
        store.copyElements();
        return;
      }
      if (ctrl && key === 'v') {
        e.preventDefault();
        store.pasteElements();
        return;
      }

      // ── DUPLICATE ────────────────────────────────────────
      if (ctrl && key === 'd') {
        e.preventDefault();
        if (store.selectedIds.length > 0) store.duplicateElements(store.selectedIds);
        return;
      }

      // ── SELECT ALL ───────────────────────────────────────
      if (ctrl && key === 'a') { e.preventDefault(); store.selectAll(); return; }

      // ── DELETE ───────────────────────────────────────────
      if (key === 'delete' || key === 'backspace') {
        if (store.selectedIds.length > 0) {
          e.preventDefault();
          store.removeElements(store.selectedIds);
        }
        return;
      }

      // ── ESCAPE ───────────────────────────────────────────
      if (key === 'escape') {
        store.clearSelection();
        store.setActiveTool('select');
        return;
      }

      // ── ROTATE SELECTED ──────────────────────────────────
      if (key === 'r' && !ctrl) {
        e.preventDefault();
        if (store.selectedIds.length > 0) {
          store.rotateElements(store.selectedIds, shift ? 45 : 15);
        }
        return;
      }

      // ── PAN TOOL ─────────────────────────────────────────
      if (key === 'h') { store.setActiveTool('pan'); return; }

      // ── SELECT TOOL ──────────────────────────────────────
      if (key === 'v') { store.setActiveTool('select'); return; }

      // ── QUICK INSERT SHORTCUTS ────────────────────────────
      if (key === 'w' && !ctrl) { store.setActiveTool('insert_fixture', 'lightingbar'); return; }
      if (key === 'e' && !ctrl) { store.setActiveTool('insert_fixture', 'ellipsoidal'); return; }
      if (key === 'f' && !ctrl) { store.setActiveTool('insert_fixture', 'fresnel'); return; }
      if (key === 'p' && !ctrl) { store.setActiveTool('insert_fixture', 'par64'); return; }
      if (key === 'm' && !ctrl) { store.setActiveTool('insert_fixture', 'moving_spot'); return; }

      // ── GRID TOGGLE ──────────────────────────────────────
      if (key === 'g' && !ctrl) { e.preventDefault(); store.toggleGrid(); return; }

      // ── SNAP TOGGLE ──────────────────────────────────────
      if (key === 's' && !ctrl) { e.preventDefault(); store.toggleSnap(); return; }

      // ── LAYER PANEL ──────────────────────────────────────
      if (key === 'l' && !ctrl) { e.preventDefault(); store.toggleLayerPanel(); return; }

      // ── BACKSTAGE MODE (F11 or B) ─────────────────────────
      if (key === 'f11' || key === 'b') {
        e.preventDefault();
        store.toggleBackstageMode();
        return;
      }

      // ── FOCUS COVERAGE ───────────────────────────────────
      if (key === 'c' && !ctrl) { store.toggleFocusCoverage(); return; }

      // ── RESET VIEW ───────────────────────────────────────
      if (ctrl && key === '0') { e.preventDefault(); store.resetView(); return; }
    },
    [store]
  );

  // Space-held pan detection (handled separately in canvas)
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
