import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { autoPatchSequential, detectDMXConflicts } from '@/lib/dmx/patchEngine';
import type {
  EditorState,
  CanvasElement,
  FixtureType,
  LayerId,
  Layer,
  TechnicalSeal,
  ToolMode,
} from '@/lib/types';

// ============================================================
// INITIAL STATE
// ============================================================

const defaultLayers: Layer[] = [
  {
    id: 'layer_architecture',
    label: '01. Arquitetura e Espaço',
    visible: true,
    locked: false,
    color: '#94a3b8',
  },
  {
    id: 'layer_rigging',
    label: '02. Rigging e Estruturas',
    visible: true,
    locked: false,
    color: '#fb923c',
  },
  {
    id: 'layer_lighting',
    label: '03. Iluminação',
    visible: true,
    locked: false,
    color: '#facc15',
  },
  {
    id: 'layer_annotations',
    label: '04. Cotas e Anotações',
    visible: true,
    locked: false,
    color: '#34d399',
  },
];

const defaultSeal: TechnicalSeal = {
  // Espetáculo
  show: 'Sem Título',
  subtitle: '',
  director: '',

  // Autoria do mapa
  designer: '',
  designerEmail: '',
  designerPhone: '',
  designerCompany: '',

  // Equipe técnica
  operator: '',
  technician: '',
  assistantDesigner: '',

  // Espaço
  venue: '',
  city: '',
  state: '',

  // Produção
  clientCompany: '',
  season: '',

  // Documento
  date: new Date().toLocaleDateString('pt-BR'),
  version: '1.0',
  scale: '1:50',
  revision: '',
  notes: '',

  // Identidade visual
  logoUrl: '',
  copyright: `© ${new Date().getFullYear()} — Afina v2.0`,
};

const initialState: EditorState = {
  stageX: 0,
  stageY: 0,
  stageScale: 1,
  containerWidth: 1000,
  containerHeight: 700,

  gridVisible: true,
  gridSize: 500,
  gridPixelsPerMeter: 50,
  snapEnabled: true,

  activeTool: 'select',
  pendingFixtureType: undefined,

  elements: [],
  selectedIds: [],

  layers: defaultLayers,
  activeLayerId: 'layer_lighting',

  history: [[]],
  historyIndex: 0,

  colorTheme: 'light',
  backstageMode: false,
  showFocusCoverage: false,
  showFixtureLabels: false,
  showNewMapModal: false,
  layerPanelOpen: false,
  selectedTab: 'library',

  technicalSeal: defaultSeal,
  universeCount: 4,
};

// ============================================================
// STORE INTERFACE
// ============================================================

interface EditorStore extends EditorState {
  // Canvas viewport
  setStagePosition: (x: number, y: number) => void;
  setStageScale: (scale: number) => void;
  setContainerDimensions: (w: number, h: number) => void;
  resetView: () => void;
  fitStageToScreen: (canvasW?: number, canvasH?: number) => void;

  // Grid & Tools
  toggleGrid: () => void;
  toggleSnap: () => void;
  setActiveTool: (tool: ToolMode, fixtureType?: FixtureType) => void;

  // Elements CRUD
  addElement: (element: Omit<CanvasElement, 'id'>) => string;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  removeElements: (ids: string[]) => void;
  duplicateElements: (ids: string[]) => void;
  clearCanvas: () => void;

  // Selection
  selectElement: (id: string, addToSelection?: boolean) => void;
  selectAll: () => void;
  clearSelection: () => void;

  // History (Undo/Redo)
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;

  // Layers
  toggleLayerVisibility: (id: LayerId) => void;
  toggleLayerLock: (id: LayerId) => void;
  setActiveLayer: (id: LayerId) => void;

  // UI State
  setColorTheme: (theme: 'dark' | 'light' | 'backstage') => void;
  toggleBackstageMode: () => void;
  toggleFocusCoverage: () => void;
  toggleFixtureLabels: () => void;
  setShowNewMapModal: (show: boolean) => void;
  toggleLayerPanel: () => void;
  setSelectedTab: (tab: 'library' | 'layers' | 'patch' | 'legend') => void;

  // Technical Seal
  updateSeal: (updates: Partial<TechnicalSeal>) => void;

  // Canvas operations
  groupElements: (ids: string[]) => void;
  rotateElements: (ids: string[], degrees: number) => void;
  bringToFront: (ids: string[]) => void;
  sendToBack: (ids: string[]) => void;

  // Snap helper
  snapToGrid: (value: number) => number;

  // DMX
  runAutoPatch: (ids: string[], universe: number, startAddress: number) => void;
  detectAndMarkConflicts: () => void;

  // Project persistence
  importProject: (data: { elements: CanvasElement[]; seal: TechnicalSeal }) => void;
  exportProjectData: () => { elements: CanvasElement[]; seal: TechnicalSeal };

  // Computed
  getSelectedElements: () => CanvasElement[];
  getTotalWattage: () => number;
  getAmperageAt: (voltage: 110 | 220) => number;
}

// ============================================================
// MAX HISTORY SNAPSHOTS
// ============================================================
const MAX_HISTORY = 50;

// ============================================================
// STORE IMPLEMENTATION
// ============================================================

export const useEditorStore = create<EditorStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...initialState,

      // ── VIEWPORT ────────────────────────────────────────────
      setStagePosition: (x, y) => set({ stageX: x, stageY: y }),
      setStageScale: (scale) => set({ stageScale: Math.max(0.05, Math.min(8, scale)) }),
      setContainerDimensions: (w, h) => set({ containerWidth: w, containerHeight: h }),
      resetView: () => {
        const { fitStageToScreen } = get();
        fitStageToScreen();
      },

      fitStageToScreen: (customW?, customH?) => {
        const { elements, containerWidth, containerHeight } = get();
        const canvasW = customW || containerWidth || 1000;
        const canvasH = customH || containerHeight || 700;

        if (elements.length === 0) {
          set({ stageX: 0, stageY: 0, stageScale: 1 });
          return;
        }

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        elements.forEach((el) => {
          const w = (el.customProps?.width as number) || (el.scaleX ? 40 * el.scaleX : 40);
          const h = (el.customProps?.height as number) || (el.scaleY ? 40 * el.scaleY : 40);

          const left = el.x - (el.type === 'custom_stage' || el.type === 'stage_polygon' ? w / 2 : 0);
          const top = el.y - (el.type === 'custom_stage' || el.type === 'stage_polygon' ? h / 2 : 0);
          const right = left + w;
          const bottom = top + h;

          if (left < minX) minX = left;
          if (top < minY) minY = top;
          if (right > maxX) maxX = right;
          if (bottom > maxY) maxY = bottom;
        });

        const contentW = Math.max(100, maxX - minX);
        const contentH = Math.max(100, maxY - minY);

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        const pad = 60;
        const availW = Math.max(200, canvasW - pad * 2);
        const availH = Math.max(200, canvasH - pad * 2);

        const scale = Math.max(0.3, Math.min(2.5, Math.min(availW / contentW, availH / contentH)));

        const stageX = canvasW / 2 - centerX * scale;
        const stageY = canvasH / 2 - centerY * scale;

        set({ stageScale: scale, stageX, stageY });
      },

      // ── GRID & TOOLS ─────────────────────────────────────────
      toggleGrid: () => set((s) => ({ gridVisible: !s.gridVisible })),
      toggleSnap: () => set((s) => ({ snapEnabled: !s.snapEnabled })),
      setActiveTool: (tool, fixtureType) =>
        set({ activeTool: tool, pendingFixtureType: fixtureType }),

      // ── SNAP HELPER ──────────────────────────────────────────
      snapToGrid: (value) => {
        const { snapEnabled, gridSize, gridPixelsPerMeter } = get();
        if (!snapEnabled) return value;
        const gridPx = (gridSize / 1000) * gridPixelsPerMeter;
        return Math.round(value / gridPx) * gridPx;
      },

      // ── ELEMENTS CRUD ────────────────────────────────────────
      addElement: (elementData) => {
        const id = uuidv4();
        const element: CanvasElement = { ...elementData, id };
        get().pushHistory();
        set((s) => ({ elements: [...s.elements, element] }));
        return id;
      },

      updateElement: (id, updates) => {
        set((s) => ({
          elements: s.elements.map((el) =>
            el.id === id ? { ...el, ...updates } : el
          ),
        }));
      },

      removeElements: (ids) => {
        get().pushHistory();
        set((s) => ({
          elements: s.elements.filter((el) => !ids.includes(el.id)),
          selectedIds: s.selectedIds.filter((id) => !ids.includes(id)),
        }));
      },

      duplicateElements: (ids) => {
        const { elements } = get();
        const toDuplicate = elements.filter((el) => ids.includes(el.id));
        const duplicated: CanvasElement[] = toDuplicate.map((el) => ({
          ...el,
          id: uuidv4(),
          x: el.x + 20,
          y: el.y + 20,
          label: el.label ? `${el.label} cópia` : '',
        }));
        get().pushHistory();
        set((s) => ({
          elements: [...s.elements, ...duplicated],
          selectedIds: duplicated.map((el) => el.id),
        }));
      },

      clearCanvas: () => {
        get().pushHistory();
        set({ elements: [], selectedIds: [] });
      },

      // ── SELECTION ────────────────────────────────────────────
      selectElement: (id, addToSelection = false) => {
        set((s) => {
          if (addToSelection) {
            const already = s.selectedIds.includes(id);
            return {
              selectedIds: already
                ? s.selectedIds.filter((i) => i !== id)
                : [...s.selectedIds, id],
            };
          }
          return { selectedIds: [id] };
        });
      },

      selectAll: () => {
        set((s) => ({ selectedIds: s.elements.map((el) => el.id) }));
      },

      clearSelection: () => set({ selectedIds: [] }),

      // ── HISTORY ──────────────────────────────────────────────
      pushHistory: () => {
        set((s) => {
          const newHistory = s.history.slice(0, s.historyIndex + 1);
          newHistory.push(JSON.parse(JSON.stringify(s.elements)));
          if (newHistory.length > MAX_HISTORY) newHistory.shift();
          return {
            history: newHistory,
            historyIndex: newHistory.length - 1,
          };
        });
      },

      undo: () => {
        set((s) => {
          if (s.historyIndex <= 0) return {};
          const newIndex = s.historyIndex - 1;
          return {
            elements: JSON.parse(JSON.stringify(s.history[newIndex])),
            historyIndex: newIndex,
            selectedIds: [],
          };
        });
      },

      redo: () => {
        set((s) => {
          if (s.historyIndex >= s.history.length - 1) return {};
          const newIndex = s.historyIndex + 1;
          return {
            elements: JSON.parse(JSON.stringify(s.history[newIndex])),
            historyIndex: newIndex,
            selectedIds: [],
          };
        });
      },

      // ── LAYERS ──────────────────────────────────────────────
      toggleLayerVisibility: (id) => {
        set((s) => ({
          layers: s.layers.map((l) =>
            l.id === id ? { ...l, visible: !l.visible } : l
          ),
        }));
      },

      toggleLayerLock: (id) => {
        set((s) => ({
          layers: s.layers.map((l) =>
            l.id === id ? { ...l, locked: !l.locked } : l
          ),
        }));
      },

      setActiveLayer: (id) => set({ activeLayerId: id }),

      // ── UI STATE ─────────────────────────────────────────────
      setColorTheme: (theme) => {
        set({ colorTheme: theme, backstageMode: theme === 'backstage' });
        if (typeof document !== 'undefined') {
          const html = document.documentElement;
          html.classList.remove('light-mode', 'dark-mode', 'backstage-mode');
          if (theme === 'dark')      html.classList.add('dark-mode');
          if (theme === 'light')     html.classList.add('light-mode');
          if (theme === 'backstage') html.classList.add('backstage-mode');
        }
      },

      toggleBackstageMode: () => {
        set((s) => {
          const next = !s.backstageMode;
          const theme = next ? 'backstage' : 'light';
          if (typeof document !== 'undefined') {
            const html = document.documentElement;
            html.classList.remove('light-mode', 'dark-mode', 'backstage-mode');
            if (next) html.classList.add('backstage-mode');
            else html.classList.add('light-mode');
          }
          return { backstageMode: next, colorTheme: theme };
        });
      },

      toggleFocusCoverage: () =>
        set((s) => ({ showFocusCoverage: !s.showFocusCoverage })),

      toggleFixtureLabels: () =>
        set((s) => ({ showFixtureLabels: !s.showFixtureLabels })),

      setShowNewMapModal: (show) => set({ showNewMapModal: show }),

      toggleLayerPanel: () =>
        set((s) => ({ layerPanelOpen: !s.layerPanelOpen })),

      setSelectedTab: (tab) => set({ selectedTab: tab }),

      // ── TECHNICAL SEAL ───────────────────────────────────────
      updateSeal: (updates) =>
        set((s) => ({ technicalSeal: { ...s.technicalSeal, ...updates } })),

      // ── CANVAS OPERATIONS ────────────────────────────────────────
      groupElements: (_ids) => {
        // Group logic - v2 roadmap
      },

      rotateElements: (ids, degrees) => {
        set((s) => ({
          elements: s.elements.map((el) =>
            ids.includes(el.id)
              ? { ...el, rotation: ((el.rotation + degrees) % 360 + 360) % 360 }
              : el
          ),
        }));
      },

      bringToFront: (ids) => {
        const { elements } = get();
        const targets = elements.filter((el) => ids.includes(el.id));
        const rest = elements.filter((el) => !ids.includes(el.id));
        get().pushHistory();
        set({ elements: [...rest, ...targets] });
      },

      sendToBack: (ids) => {
        const { elements } = get();
        const targets = elements.filter((el) => ids.includes(el.id));
        const rest = elements.filter((el) => !ids.includes(el.id));
        get().pushHistory();
        set({ elements: [...targets, ...rest] });
      },

      // ── DMX ──────────────────────────────────────────────────────
      runAutoPatch: (ids, universe, startAddress) => {
        const { elements } = get();
        const targets = elements.filter((el) => ids.includes(el.id) && el.dmx);
        const patches = autoPatchSequential(targets, universe, startAddress);
        get().pushHistory();
        set((s) => ({
          elements: s.elements.map((el) => {
            const patch = patches.get(el.id);
            return patch ? { ...el, dmx: patch } : el;
          }),
        }));
        // Immediately detect conflicts after patching
        get().detectAndMarkConflicts();
      },

      detectAndMarkConflicts: () => {
        const { elements } = get();
        const { conflictIds } = detectDMXConflicts(elements);
        set((s) => ({
          elements: s.elements.map((el) =>
            el.dmx
              ? { ...el, dmx: { ...el.dmx, hasConflict: conflictIds.has(el.id) } }
              : el
          ),
        }));
      },

      // ── PROJECT PERSISTENCE ───────────────────────────────────────
      importProject: (data) => {
        get().pushHistory();
        set({
          elements: data.elements,
          technicalSeal: data.seal,
          selectedIds: [],
        });
        get().detectAndMarkConflicts();
      },

      exportProjectData: () => {
        const { elements, technicalSeal } = get();
        return { elements, seal: technicalSeal };
      },

      // ── COMPUTED ─────────────────────────────────────────────
      getSelectedElements: () => {
        const { elements, selectedIds } = get();
        return elements.filter((el) => selectedIds.includes(el.id));
      },

      getTotalWattage: () => {
        return get().elements
          .filter((el) => el.wattage > 0)
          .reduce((sum, el) => sum + el.wattage, 0);
      },

      getAmperageAt: (voltage) => {
        const watts = get().getTotalWattage();
        return watts / voltage;
      },
    })),
    { name: 'afina-editor' }
  )
);
