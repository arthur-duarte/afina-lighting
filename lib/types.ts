// ============================================================
// AFINA v2.0 — Types & Interfaces
// ============================================================

export type FixtureCategory =
  | 'conventional'
  | 'led'
  | 'moving'
  | 'vintage'
  | 'effect'
  | 'rigging'
  | 'architecture'
  | 'annotation';

export type FixtureType =
  | 'ellipsoidal'
  | 'fresnel'
  | 'pc'
  | 'par64'
  | 'par38'
  | 'pinspot'
  | 'setlight'
  | 'svoboda'
  | 'minibruta'
  | 'hqi'
  | 'linestra'
  | 'other_conventional'
  | 'parled'
  | 'barled'
  | 'other_led'
  | 'moving_spot'
  | 'moving_beam'
  | 'moving_wash'
  | 'other_moving'
  | 'mirrorball'
  | 'uv'
  | 'strobe'
  | 'fogmachine'
  | 'other_effect'
  | 'lightingbar'
  | 'truss_q25'
  | 'truss_q30'
  | 'truss_q50'
  | 'tripod'
  | 'tower'
  | 'floor_base'
  | 'wall'
  | 'stage_polygon'
  | 'custom_stage'
  | 'scenery_rect'
  | 'scenery_circle'
  | 'scenery_platform'
  | 'scenery_curtain'
  | 'column'
  | 'text'
  | 'dimension'
  | 'arrow'
  | 'focus_marker';

export type ElectricalPhase = 'R' | 'S' | 'T' | 'unassigned';

export type LayerId =
  | 'layer_architecture'
  | 'layer_rigging'
  | 'layer_lighting'
  | 'layer_annotations';

export interface DMXConfig {
  universe: number;        // 1-32
  address: number;         // 1-512
  footprint: number;       // canais ocupados
  hasConflict?: boolean;
}

export interface FixtureElement {
  id: string;
  type: FixtureType;
  category: FixtureCategory;
  layerId: LayerId;

  // Posição e transformação
  x: number;
  y: number;
  rotation: number;       // graus
  scaleX: number;
  scaleY: number;

  // Aparência
  label: string;          // nome/número de canal
  color: string;          // cor do símbolo (gelatina)
  gelatin: string;        // ex: "R-27" ou "L-201"

  // Elétrico
  wattage: number;
  phase: ElectricalPhase;
  dimmerId?: string;

  // DMX
  dmx?: DMXConfig;

  // Físico
  angle?: number;         // ângulo de abertura (elipsoidal, etc.)
  channel?: number;       // canal na mesa de luz
  // Parâmetros estendidos
  customName?: string;    // nome personalizado ex: "Foco Principal Ator A"
  voltage?: string;       // voltagem ex: "220V", "110V", "Bivolt"
  notes?: string;         // observações técnicas de afinação

  // Visibilidade / lock
  locked: boolean;
  visible: boolean;
  showLabel?: boolean;     // Se true, exibe nome/número e DMX no canvas (default: false)

  // Props customizadas por tipo
  customProps?: Record<string, unknown>;
}

export type CanvasElement = FixtureElement;

export interface Layer {
  id: LayerId;
  label: string;
  visible: boolean;
  locked: boolean;
  color: string;
}

export interface TechnicalSeal {
  // Espetáculo
  show: string;            // Nome do espetáculo
  subtitle: string;        // Subtítulo / temporada
  director: string;        // Diretor(a) da peça

  // Autoria do mapa
  designer: string;        // Iluminador(a) / Designer de Luz
  designerEmail: string;   // E-mail profissional
  designerPhone: string;   // Telefone / WhatsApp
  designerCompany: string; // Empresa / Escritório / Freelancer

  // Equipe técnica
  operator: string;        // Operador(a) de luz
  technician: string;      // Técnico(a) responsável
  assistantDesigner: string; // Assistente de iluminação

  // Espaço
  venue: string;           // Teatro / Espaço cênico
  city: string;            // Cidade
  state: string;           // Estado (UF)

  // Produção
  clientCompany: string;   // Produtora / Companhia
  season: string;          // Temporada (ex: "Jan–Mar 2025")

  // Documento
  date: string;            // Data de criação/revisão
  version: string;         // Versão do mapa (ex: "1.3")
  scale: string;           // Escala (ex: "1:50")
  revision: string;        // Descrição da última revisão
  notes: string;           // Observações gerais

  // Identidade visual
  logoUrl: string;         // URL ou base64 do logo (opcional)
  copyright: string;       // Texto de copyright / crédito
}

export interface StagePreset {
  id: string;
  name: string;
  elements: Omit<CanvasElement, 'id'>[];
}

export type ToolMode =
  | 'select'
  | 'pan'
  | 'draw_wall'
  | 'draw_polygon'
  | 'insert_fixture'
  | 'dimension'
  | 'text';

export interface EditorState {
  // Canvas viewport
  stageX: number;
  stageY: number;
  stageScale: number;
  containerWidth: number;
  containerHeight: number;

  // Grid
  gridVisible: boolean;
  gridSize: number;           // mm (padrão: 500mm = 0.5m)
  gridPixelsPerMeter: number; // px por metro no canvas
  snapEnabled: boolean;

  // Ferramenta ativa
  activeTool: ToolMode;
  pendingFixtureType?: FixtureType;

  // Elementos do canvas
  elements: CanvasElement[];
  selectedIds: string[];

  // Camadas
  layers: Layer[];
  activeLayerId: LayerId;

  // Histórico
  history: CanvasElement[][];
  historyIndex: number;

  // UI state
  colorTheme: 'dark' | 'light' | 'backstage';
  backstageMode: boolean;
  showFocusCoverage: boolean;
  showFixtureLabels: boolean;
  showNewMapModal: boolean;
  layerPanelOpen: boolean;
  selectedTab: 'library' | 'layers' | 'patch' | 'legend';

  // Módulos
  technicalSeal: TechnicalSeal;

  // Patch
  universeCount: number;
}
