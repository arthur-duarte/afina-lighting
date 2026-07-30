'use client';

import { useEditorStore } from '@/lib/store/useEditorStore';
import { formatWatts, formatAmperes } from '@/lib/utils';
import { exportStageToPNG } from '@/lib/export/exportPNG';
import { exportTechnicalPDF } from '@/lib/export/exportPDF';
import { exportPatchCSV } from '@/lib/export/exportCSV';
import {
  exportProjectJSON,
  importProjectJSON,
  loadFromLocalStorage,
  saveToLocalStorage,
  scheduleSave,
} from '@/lib/persistence/localSave';
import type { ProjectData } from '@/lib/persistence/localSave';
import {
  ZapIcon, FileIcon, UndoIcon, RedoIcon, DownloadIcon,
  SaveIcon, LayersIcon, FolderOpenIcon, SunIcon, MoonIcon,
  EyeIcon, AlertTriangleIcon, Zap, ChevronDownIcon,
  UploadIcon, CloudIcon, CheckCircle2Icon,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

// Reference to the Konva stage (set from LightingCanvas)
// We use a global ref pattern to avoid prop drilling
declare global {
  interface Window { __afinaStageRef?: unknown; }
}

export function TopBar() {
  const {
    undo, redo, historyIndex, history,
    colorTheme, setColorTheme,
    backstageMode, toggleBackstageMode,
    showFocusCoverage, toggleFocusCoverage,
    setShowNewMapModal,
    technicalSeal,
    getTotalWattage, getAmperageAt,
    clearCanvas,
    elements,
    importProject,
    exportProjectData,
  } = useEditorStore();

  const [fileMenuOpen, setFileMenuOpen] = useState(false);
  const [editMenuOpen, setEditMenuOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [savedIndicator, setSavedIndicator] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  const totalWatts = getTotalWattage();
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Show save indicator briefly
  const showSaved = () => {
    setSavedIndicator(true);
    setTimeout(() => setSavedIndicator(false), 2000);
  };

  // Auto-save to localStorage when elements change
  useEffect(() => {
    if (elements.length === 0) return;
    scheduleSave({ elements, seal: technicalSeal });
  }, [elements, technicalSeal]);

  // Restore auto-save on mount
  useEffect(() => {
    const saved = loadFromLocalStorage();
    if (saved && saved.elements.length > 0) {
      const restore = confirm(
        `Restaurar projeto salvo automaticamente?\n"${saved.seal?.show ?? 'Sem título'}" (${
          new Date(saved.savedAt).toLocaleString('pt-BR')
        })`
      );
      if (restore) importProject({ elements: saved.elements, seal: saved.seal });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closeAll = () => {
    setFileMenuOpen(false);
    setEditMenuOpen(false);
    setExportMenuOpen(false);
  };

  // ── EXPORT HANDLERS ─────────────────────────────────────
  const handleExportPNG = () => {
    const stage = window.__afinaStageRef;
    if (!stage) { alert('Canvas não disponível. Tente novamente.'); return; }
    exportStageToPNG(
      stage as Parameters<typeof exportStageToPNG>[0],
      `${(technicalSeal.show || 'afina').replace(/\s+/g, '_')}_mapa.png`
    );
    closeAll();
  };

  const handleExportPDF = async () => {
    const stage = window.__afinaStageRef;
    if (!stage) { alert('Canvas não disponível. Tente novamente.'); return; }
    await exportTechnicalPDF(
      stage as Parameters<typeof exportTechnicalPDF>[0],
      elements,
      technicalSeal,
      'a3'
    );
    closeAll();
  };

  const handleExportCSV = () => {
    exportPatchCSV(elements, technicalSeal);
    closeAll();
  };

  const handleExportJSON = () => {
    const data = exportProjectData();
    exportProjectJSON(data);
    showSaved();
    closeAll();
  };

  const handleSaveLocal = () => {
    const data = exportProjectData();
    saveToLocalStorage(data);
    showSaved();
    closeAll();
  };

  const handleImportJSON = () => {
    importRef.current?.click();
    closeAll();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    importProjectJSON(file, (data: ProjectData) => {
      importProject({ elements: data.elements, seal: data.seal });
    });
    e.target.value = '';
  };

  return (
    <header className="editor-topbar flex items-center gap-1 px-3 bg-editor-surface border-b border-editor-border select-none z-50">
      {/* Hidden file input for JSON import */}
      <input
        ref={importRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Logo */}
      <div className="flex items-center gap-2 mr-3 pr-3 border-r border-editor-border">
        <div className="w-7 h-7 rounded-md bg-afina-500 flex items-center justify-center">
          <Zap size={14} className="text-white" strokeWidth={2.5} />
        </div>
        <span className="font-bold text-sm tracking-tight text-white">
          afina<span className="text-afina-400">.</span>
        </span>
        <span className="text-white/20 text-xs font-mono">v2.0</span>
      </div>

      {/* File Menu */}
      <div className="relative">
        <button
          className="menu-item text-xs px-2 py-1 rounded"
          onClick={() => { setFileMenuOpen(!fileMenuOpen); setEditMenuOpen(false); setExportMenuOpen(false); }}
        >
          <FileIcon size={13} />
          Arquivo
          <ChevronDownIcon size={11} className="text-white/40" />
        </button>
        {fileMenuOpen && (
          <div className="absolute top-full left-0 mt-1 w-52 bg-editor-raised border border-editor-border rounded-lg shadow-panel z-50 py-1 animate-fade-in">
            <button className="menu-item w-full text-xs" onClick={() => { setShowNewMapModal(true); closeAll(); }}>
              <FileIcon size={13} /> Novo Projeto / Novo Mapa
            </button>
            <button className="menu-item w-full text-xs" onClick={handleSaveLocal}>
              <SaveIcon size={13} />
              Salvar (Local)
              <span className="ml-auto kbd">Ctrl+S</span>
            </button>
            <button className="menu-item w-full text-xs text-white/40 cursor-not-allowed" disabled>
              <CloudIcon size={13} /> Salvar na Nuvem
              <span className="ml-auto text-[9px] text-white/20">em breve</span>
            </button>
            <div className="h-px bg-editor-border mx-2 my-1" />
            <button onClick={handleImportJSON} className="menu-item w-full text-xs">
              <UploadIcon size={13} /> Importar JSON
            </button>
            <button onClick={handleExportJSON} className="menu-item w-full text-xs">
              <DownloadIcon size={13} /> Exportar JSON
            </button>
          </div>
        )}
      </div>

      {/* Edit Menu */}
      <div className="relative">
        <button
          className="menu-item text-xs px-2 py-1 rounded"
          onClick={() => { setEditMenuOpen(!editMenuOpen); setFileMenuOpen(false); setExportMenuOpen(false); }}
        >
          Editar
          <ChevronDownIcon size={11} className="text-white/40" />
        </button>
        {editMenuOpen && (
          <div className="absolute top-full left-0 mt-1 w-52 bg-editor-raised border border-editor-border rounded-lg shadow-panel z-50 py-1 animate-fade-in">
            <button onClick={undo} disabled={!canUndo} className="menu-item w-full text-xs disabled:opacity-30">
              <UndoIcon size={13} /> Desfazer
              <span className="ml-auto kbd">Ctrl+Z</span>
            </button>
            <button onClick={redo} disabled={!canRedo} className="menu-item w-full text-xs disabled:opacity-30">
              <RedoIcon size={13} /> Refazer
              <span className="ml-auto kbd">Ctrl+Y</span>
            </button>
            <div className="h-px bg-editor-border mx-2 my-1" />
            <button
              onClick={() => { if (confirm('Limpar todo o canvas?')) clearCanvas(); closeAll(); }}
              className="menu-item w-full text-xs text-red-400 hover:text-red-300 hover:bg-red-950"
            >
              <AlertTriangleIcon size={13} /> Limpar Canvas
            </button>
          </div>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* ── POWER MODULE ──────────────────────── */}
      <div className="flex items-center gap-3 mr-2 px-3 py-1 bg-editor-raised rounded-lg border border-editor-border">
        <div className="flex items-center gap-1.5">
          <ZapIcon size={13} className="text-yellow-400" />
          <span className="font-mono text-xs text-yellow-300">
            {formatWatts(totalWatts)}
          </span>
        </div>
        <div className="w-px h-4 bg-editor-border" />
        <div className="flex flex-col items-end">
          <span className="font-mono text-[10px] text-white/50">
            {formatAmperes(totalWatts, 220)} <span className="text-white/30">220V</span>
          </span>
          <span className="font-mono text-[10px] text-white/50">
            {formatAmperes(totalWatts, 110)} <span className="text-white/30">110V</span>
          </span>
        </div>
      </div>

      {/* ── QUICK ACTIONS ─────────────────────── */}
      <div className="flex items-center gap-0.5 mr-1">
        <button
          onClick={undo}
          disabled={!canUndo}
          title="Desfazer (Ctrl+Z)"
          className="icon-btn disabled:opacity-30"
        >
          <UndoIcon size={15} />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          title="Refazer (Ctrl+Y)"
          className="icon-btn disabled:opacity-30"
        >
          <RedoIcon size={15} />
        </button>
      </div>

      <div className="w-px h-5 bg-editor-border mx-1" />

      {/* Focus Coverage */}
      <button
        onClick={toggleFocusCoverage}
        title="Mostrar Cobertura de Foco (C)"
        className={showFocusCoverage ? 'icon-btn-active' : 'icon-btn'}
      >
        <EyeIcon size={15} />
      </button>

      {/* Theme Toggles */}
      <div className="flex items-center gap-0.5 bg-editor-raised rounded-lg p-0.5 border border-editor-border">
        <button
          onClick={() => setColorTheme('dark')}
          title="Modo Escuro (Padrão Editor)"
          className={`icon-btn w-6 h-6 p-1 ${colorTheme === 'dark' ? 'icon-btn-active' : ''}`}
        >
          <MoonIcon size={13} />
        </button>
        <button
          onClick={() => setColorTheme('light')}
          title="Modo Claro (Diurno / Impressão)"
          className={`icon-btn w-6 h-6 p-1 ${colorTheme === 'light' ? 'icon-btn-active' : ''}`}
        >
          <SunIcon size={13} />
        </button>
        <button
          onClick={() => setColorTheme(colorTheme === 'backstage' ? 'dark' : 'backstage')}
          title="Modo Backstage / Vermelho Noturno (F11 / B)"
          className={`icon-btn w-6 h-6 p-1 ${colorTheme === 'backstage' ? 'bg-red-950 text-red-400 border border-red-800' : ''}`}
        >
          <ZapIcon size={13} className={colorTheme === 'backstage' ? 'text-red-400' : 'text-white/40'} />
        </button>
      </div>

      <div className="w-px h-5 bg-editor-border mx-1" />

      {/* Save indicator */}
      {savedIndicator && (
        <div className="flex items-center gap-1 text-green-400 text-[10px] mr-1 animate-fade-in">
          <CheckCircle2Icon size={12} />
          Salvo
        </div>
      )}

      {/* Export */}
      <div className="relative">
        <button
          onClick={() => { setExportMenuOpen(!exportMenuOpen); setFileMenuOpen(false); setEditMenuOpen(false); }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-afina-600 hover:bg-afina-500 text-white text-xs rounded-md font-medium transition-colors duration-150 active:scale-95"
        >
          <DownloadIcon size={13} />
          Exportar
          <ChevronDownIcon size={11} />
        </button>
        {exportMenuOpen && (
          <div className="absolute top-full right-0 mt-1 w-52 bg-editor-raised border border-editor-border rounded-lg shadow-panel z-50 py-1 animate-fade-in">
            <button onClick={handleExportPNG} className="menu-item w-full text-xs">
              <LayersIcon size={13} /> PNG (Alta Resolução)
              <span className="ml-auto text-[9px] text-white/30">300 DPI</span>
            </button>
            <button onClick={handleExportPDF} className="menu-item w-full text-xs">
              <FileIcon size={13} /> PDF Técnico (A3)
              <span className="ml-auto text-[9px] text-white/30">2 págs.</span>
            </button>
            <button onClick={handleExportCSV} className="menu-item w-full text-xs">
              <DownloadIcon size={13} /> Planilha CSV/Excel
            </button>
            <div className="h-px bg-editor-border mx-2 my-1" />
            <button onClick={handleExportJSON} className="menu-item w-full text-xs">
              <DownloadIcon size={13} /> Exportar JSON
            </button>
          </div>
        )}
      </div>

      {/* Profile placeholder */}
      <div className="ml-1 w-7 h-7 rounded-full bg-afina-700 border border-afina-500 flex items-center justify-center cursor-pointer hover:bg-afina-600 transition-colors">
        <span className="text-xs font-bold text-white">A</span>
      </div>

      {/* Click away */}
      {(fileMenuOpen || editMenuOpen || exportMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={closeAll}
        />
      )}
    </header>
  );
}
