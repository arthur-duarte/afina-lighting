'use client';

import { useState, useRef, useCallback } from 'react';
import { useEditorStore } from '@/lib/store/useEditorStore';

export function CanvasMinimap() {
  const store = useEditorStore();
  const { elements, stageX, stageY, stageScale, setStagePosition, resetView, selectedIds } = store;

  const [isOpen, setIsOpen] = useState(true);

  // Radar size specs
  const mapW = 180;
  const mapH = 120;
  const virtualCanvasSize = 3000; // total virtual world space width & height (-1500 to +1500)

  const scale = mapW / virtualCanvasSize; // scale ratio to map world space to pixels

  // Calculate visible screen viewport box in minimap space
  const screenW = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const screenH = typeof window !== 'undefined' ? window.innerHeight : 800;

  const viewW = Math.max(20, Math.min(mapW, (screenW / (stageScale || 1)) * scale));
  const viewH = Math.max(16, Math.min(mapH, (screenH / (stageScale || 1)) * scale));

  // Convert stage pan offset to minimap coordinates
  // stageX = -worldX * stageScale  =>  worldX = -stageX / stageScale
  const worldCenterX = -stageX / (stageScale || 1);
  const worldCenterY = -stageY / (stageScale || 1);

  // Map world center (0,0 is at center of virtual canvas = +1500)
  const viewX = Math.max(0, Math.min(mapW - viewW, (worldCenterX + 1500) * scale - viewW / 2));
  const viewY = Math.max(0, Math.min(mapH - viewH, (worldCenterY + 1500) * scale - viewH / 2));

  const isDraggingRef = useRef(false);

  const updatePanFromMinimap = useCallback((clientX: number, clientY: number, containerRect: DOMRect) => {
    const clickX = Math.max(0, Math.min(mapW, clientX - containerRect.left));
    const clickY = Math.max(0, Math.min(mapH, clientY - containerRect.top));

    // Convert minimap pixel position to world coordinates
    const targetWorldX = (clickX / mapW) * virtualCanvasSize - 1500;
    const targetWorldY = (clickY / mapH) * virtualCanvasSize - 1500;

    // Convert world coordinates to Stage pan offset
    setStagePosition(-targetWorldX * (stageScale || 1), -targetWorldY * (stageScale || 1));
  }, [stageScale, setStagePosition]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    const rect = e.currentTarget.getBoundingClientRect();
    updatePanFromMinimap(e.clientX, e.clientY, rect);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    updatePanFromMinimap(e.clientX, e.clientY, rect);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="absolute bottom-3 left-3 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold select-none shadow-md transition-all active:scale-95"
        style={{
          background: '#ffffff',
          color: '#0f172a',
          border: '1px solid #cbd5e1',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}
        title="Exibir Radar de Navegação"
      >
        <span className="text-afina-500">📍</span> Radar
      </button>
    );
  }

  return (
    <div
      className="absolute bottom-3 left-3 z-30 rounded-xl select-none overflow-hidden shadow-lg transition-all animate-scale-in"
      style={{
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        boxShadow: '0 8px 24px rgba(15,23,42,0.12), 0 2px 6px rgba(0,0,0,0.04)',
        padding: '8px',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-1.5 mb-1 border-b border-slate-200">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-afina-500 animate-pulse" />
          <span className="text-[10px] font-bold tracking-wider uppercase text-slate-700 font-mono">
            Radar Nav
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={resetView}
            className="text-[9px] px-1.5 py-0.5 rounded font-mono font-medium transition-colors hover:bg-slate-100 text-slate-500 border border-slate-200"
            title="Centralizar Visão no Palco"
          >
            Reset
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-[10px] w-5 h-5 flex items-center justify-center rounded transition-colors hover:bg-slate-100 text-slate-400 hover:text-slate-700"
            title="Esconder Radar"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Mini Radar Map Canvas */}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative cursor-crosshair rounded-lg overflow-hidden border border-slate-200"
        style={{
          width: `${mapW}px`,
          height: `${mapH}px`,
          backgroundColor: '#f8fafc',
          backgroundImage: 'radial-gradient(rgba(148,163,184,0.2) 1px, transparent 1px)',
          backgroundSize: '12px 12px',
        }}
      >
        {/* Center Crosshair lines */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-200 pointer-events-none" />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 pointer-events-none" />

        {/* Render elements as mini dots / boxes */}
        {elements.map((el) => {
          const miniX = (el.x + 1500) * scale;
          const miniY = (el.y + 1500) * scale;
          const isSelected = selectedIds.includes(el.id);

          const isArch = el.category === 'architecture' || el.type === 'wall' || el.type === 'custom_stage';
          const dotSize = isArch ? 6 : 4;

          return (
            <div
              key={el.id}
              style={{
                position: 'absolute',
                left: `${miniX}px`,
                top: `${miniY}px`,
                width: `${dotSize}px`,
                height: `${dotSize}px`,
                backgroundColor: isSelected ? '#2563eb' : (isArch ? '#0f172a' : (el.color || '#ef4732')),
                borderRadius: isArch ? '1px' : '50%',
                transform: 'translate(-50%, -50%)',
                opacity: isSelected ? 1 : 0.8,
                outline: isSelected ? '2px solid #2563eb' : 'none',
                boxShadow: isSelected ? '0 0 4px #2563eb' : 'none',
              }}
            />
          );
        })}

        {/* Viewport Indicator Rectangle */}
        <div
          style={{
            position: 'absolute',
            left: `${viewX}px`,
            top: `${viewY}px`,
            width: `${viewW}px`,
            height: `${viewH}px`,
            border: '2px solid #ef4732',
            backgroundColor: 'rgba(239,71,50,0.12)',
            borderRadius: '2px',
            pointerEvents: 'none',
            boxShadow: '0 0 6px rgba(239,71,50,0.25)',
          }}
        />
      </div>
    </div>
  );
}
