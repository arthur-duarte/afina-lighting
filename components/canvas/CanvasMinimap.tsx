'use client';

import { useEditorStore } from '@/lib/store/useEditorStore';

export function CanvasMinimap() {
  const store = useEditorStore();
  const { elements, stageX, stageY, stageScale, setStagePosition, resetView } = store;

  const mapWidth = 160;
  const mapHeight = 110;
  const virtualCanvasSize = 3000;

  const scale = mapWidth / virtualCanvasSize;

  const viewW = Math.min(mapWidth, (800 / (stageScale || 1)) * scale);
  const viewH = Math.min(mapHeight, (600 / (stageScale || 1)) * scale);

  const viewX = Math.max(0, Math.min(mapWidth - viewW, (-stageX / (stageScale || 1) + 1500) * scale));
  const viewY = Math.max(0, Math.min(mapHeight - viewH, (-stageY / (stageScale || 1) + 1500) * scale));

  const handleMinimapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const targetVirtualX = (clickX / mapWidth) * virtualCanvasSize - 1500;
    const targetVirtualY = (clickY / mapHeight) * virtualCanvasSize - 1500;
    setStagePosition(-targetVirtualX * (stageScale || 1), -targetVirtualY * (stageScale || 1));
  };

  return (
    <div
      className="absolute bottom-4 left-4 z-20 rounded-xl shadow-lg flex flex-col gap-1.5 select-none overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.95)',
        border: '1px solid #dde1ec',
        backdropFilter: 'blur(8px)',
        padding: '8px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-0.5">
        <div
          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
          style={{ color: '#ef4732' }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.5"/>
            <line x1="5" y1="1" x2="5" y2="9" stroke="currentColor" strokeWidth="1"/>
            <line x1="1" y1="5" x2="9" y2="5" stroke="currentColor" strokeWidth="1"/>
          </svg>
          Radar
        </div>
        <button
          onClick={resetView}
          className="text-[9px] px-1.5 py-0.5 rounded transition-colors"
          style={{ color: '#64748b', background: '#f0f2f7', border: '1px solid #dde1ec' }}
          title="Centralizar visão"
        >
          Reset
        </button>
      </div>

      {/* Mini radar screen */}
      <div
        onClick={handleMinimapClick}
        className="relative cursor-crosshair rounded-lg overflow-hidden"
        style={{
          width: `${mapWidth}px`,
          height: `${mapHeight}px`,
          background: '#f8f9fc',
          border: '1px solid #dde1ec',
          backgroundImage: 'linear-gradient(rgba(99,115,145,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(99,115,145,0.07) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      >
        {/* Center crosshair */}
        <div className="absolute top-1/2 left-0 right-0 pointer-events-none" style={{ height: '1px', background: 'rgba(0,0,0,0.08)' }} />
        <div className="absolute left-1/2 top-0 bottom-0 pointer-events-none" style={{ width: '1px', background: 'rgba(0,0,0,0.08)' }} />

        {/* Elements as dots */}
        {elements.map((el) => {
          const miniX = (el.x + 1500) * scale;
          const miniY = (el.y + 1500) * scale;
          const isSel = store.selectedIds.includes(el.id);
          return (
            <div
              key={el.id}
              style={{
                position: 'absolute',
                left: `${miniX}px`,
                top: `${miniY}px`,
                width: el.category === 'architecture' ? '6px' : '4px',
                height: el.category === 'architecture' ? '4px' : '4px',
                background: isSel ? '#2563eb' : (el.color || '#ef4732'),
                borderRadius: el.category === 'architecture' ? '1px' : '50%',
                transform: 'translate(-50%, -50%)',
                opacity: isSel ? 1 : 0.75,
                outline: isSel ? '1.5px solid #2563eb' : 'none',
              }}
              title={el.label || el.type}
            />
          );
        })}

        {/* Viewport box */}
        <div
          style={{
            position: 'absolute',
            left: `${viewX}px`,
            top: `${viewY}px`,
            width: `${Math.max(16, viewW)}px`,
            height: `${Math.max(12, viewH)}px`,
            border: '2px solid #ef4732',
            background: 'rgba(239,71,50,0.07)',
            borderRadius: '3px',
            pointerEvents: 'none',
            transition: 'all 75ms',
          }}
        />
      </div>
    </div>
  );
}
