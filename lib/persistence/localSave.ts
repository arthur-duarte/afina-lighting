// ============================================================
// AFINA v2.0 — Local Save (localStorage auto-save)
// ============================================================

import type { CanvasElement, TechnicalSeal } from '@/lib/types';

const STORAGE_KEY = 'afina_project_autosave';
const AUTOSAVE_INTERVAL_MS = 5000;

export interface ProjectData {
  elements: CanvasElement[];
  seal: TechnicalSeal;
  savedAt: string;
  version: string;
}

// Debounced auto-save
let _timer: ReturnType<typeof setTimeout> | null = null;

export function scheduleSave(data: { elements: CanvasElement[]; seal: TechnicalSeal }) {
  if (_timer) clearTimeout(_timer);
  _timer = setTimeout(() => {
    saveToLocalStorage(data);
  }, AUTOSAVE_INTERVAL_MS);
}

export function saveToLocalStorage(data: { elements: CanvasElement[]; seal: TechnicalSeal }) {
  try {
    const payload: ProjectData = {
      ...data,
      savedAt: new Date().toISOString(),
      version: '2.0',
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (e) {
    console.warn('[Afina] Auto-save failed:', e);
    return false;
  }
}

export function loadFromLocalStorage(): ProjectData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ProjectData;
  } catch {
    return null;
  }
}

export function clearLocalStorage() {
  localStorage.removeItem(STORAGE_KEY);
}

export function exportProjectJSON(
  data: { elements: CanvasElement[]; seal: TechnicalSeal },
  filename?: string
) {
  const payload: ProjectData = {
    ...data,
    savedAt: new Date().toISOString(),
    version: '2.0',
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename ?? `${(data.seal.show || 'afina').replace(/\s+/g, '_')}_afina.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importProjectJSON(
  file: File,
  callback: (data: ProjectData) => void
) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target?.result as string) as ProjectData;
      callback(parsed);
    } catch {
      alert('Arquivo inválido. Selecione um arquivo JSON exportado pelo Afina.');
    }
  };
  reader.readAsText(file);
}
