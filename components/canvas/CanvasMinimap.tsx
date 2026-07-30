'use client';

import { useEditorStore } from '@/lib/store/useEditorStore';
import { CompassIcon, Maximize2Icon } from 'lucide-react';

export function CanvasMinimap() {
  const store = useEditorStore();
  const { elements, stageX, stageY, stageScale, setStagePosition, resetView } = store;

  const mapWidth = 160;
  const mapHeight = 110;
  const virtualCanvasSize = 3000; // 3000px virtual canvas space

  // Mini scale
  const scale = mapWidth / virtualCanvasSize; // ~0.053

  // Current viewport rect box calculations
  const viewW = Math.min(mapWidth, (800 / (stageScale || 1)) * scale);
  const viewH = Math.min(mapHeight, (600 / (stageScale || 1)) * scale);

  const viewX = Math.max(0, Math.min(mapWidth - viewW, (-stageX / (stageScale || 1) + 1500) * scale));
  const viewY = Math.max(0, Math.min(mapHeight - viewH, (-stageY / (stageScale || 1) + 1500) * scale));

  const handleMinimapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert click position to virtual canvas coordinates
    const targetVirtualX = (clickX / mapWidth) * virtualCanvasSize - 1500;
    const targetVirtualY = (clickY / mapHeight) * virtualCanvasSize - 1500;

    // Pan stage to target position
    const newStageX = -targetVirtualX * (stageScale || 1);
    const newStageY = -targetVirtualY * (stageScale || 1);

    setStagePosition(newStageX, newStageY);
  };

  return (
    <div className="absolute bottom-4 left-4 z-20 bg-[#121218]/90 backdrop-blur-md border border-[#2a2a38] rounded-xl p-2 shadow-2xl flex flex-col gap-1.5 select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-afina-400">
          <CompassIcon size={12} /> Radar / Minimap
        </div>
        <button
          onClick={resetView}
          className="text-[9px] text-white/40 hover:text-white flex items-center gap-0.5 px-1 py-0.5 rounded hover:bg-white/10 transition-colors"
          title="Centralizar Visão (Reset Zoom/Pan)"
        >
          <Maximize2Icon size={10} /> Reset
        </button>
      </div>

      {/* Mini Radar Screen */}
      <div
        onClick={handleMinimapClick}
        className="relative w-[160px] h-[110px] bg-[#0a0a0f] border border-[#222230] rounded-lg overflow-hidden cursor-crosshair group"
      >
        {/* Grid lines in minimap */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px]" />

        {/* Center origin cross (+) */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10 pointer-events-none" />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10 pointer-events-none" />

        {/* Render mini elements */}
        {elements.map((el) => {
          const miniX = (el.x + 1500) * scale;
          const miniY = (el.y + 1500) * scale;
          const isSelected = store.selectedIds.includes(el.id);

          return (
            <div
              key={el.id}
              style={{
                left: `${miniX}px`,
                top: `${miniY}px`,
                backgroundColor: isSelected ? '#38bdf8' : (el.color || '#facc15'),
              }}
              className={`absolute w-1.5 h-1.5 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-sm ${
                isSelected ? 'ring-2 ring-afina-400 z-10' : 'opacity-80'
              }`}
              title={el.label || el.type}
            />
          );
        })}

        {/* Viewport Box Indicator */}
        <div
          style={{
            left: `${viewX}px`,
            top: `${viewY}px`,
            width: `${Math.max(16, viewW)}px`,
            height: `${Math.max(12, viewH)}px`,
          }}
          className="absolute border-2 border-afina-400 bg-afina-500/15 rounded pointer-events-none transition-all duration-75 shadow-lg shadow-afina-500/20"
        />
      </div>
    </div>
  );
}
